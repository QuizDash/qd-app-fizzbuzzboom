import {IParticipantConnectService} from '../interfaces/participant-connect-service.interface';
import {inject, injectable} from 'inversify';
import {IGameSessionRepository} from '../../infrastructure/interfaces/game-session-repository.interface';
import TYPES from '../../infrastructure/types';
import {GameSessionParticipant} from '../entities/game-session-participant';
import {IWsClient} from '../../infrastructure/interfaces/ws-client.interface';

@injectable()
/**
 * ParticipantConnectService
 */
export class ParticipantConnectService implements IParticipantConnectService {

  private repo: IGameSessionRepository;
  private wsClient: IWsClient;
  private wsApiBaseUrl: string;

  constructor(@inject(TYPES.IWsClient) wsClient: IWsClient,
              @inject(TYPES.IGameSessionRepository) repo: IGameSessionRepository,
              @inject(TYPES.WsApiBaseUrl) wsApiBaseUrl) {
    this.wsClient = wsClient;
    this.repo = repo;
    this.wsApiBaseUrl = wsApiBaseUrl;
  }

  async publishParticipantConnected(participant: GameSessionParticipant) {
    const sessionId = participant.sessionId;
    console.info(`Getting participants for session ${sessionId}`);

    const headers = {
      "Content-Type": "application/json"
    }

    const participants = await this.repo.querySessionParticipants(sessionId);
    console.info('Participants:', JSON.stringify(participants));
    const calls: any[] = [];
    for(let i = 0; i< participants.length; i++) {
      const eventBody = {
        event: "participantConnected",
        content: {
          userId: participant.participantId,
          nickname: participant.participantId
        }
      };
      const url = `https://${this.wsApiBaseUrl}/fbb/@connections/${participants[i].connectionId}`
      calls.push(this.wsClient.post(url, eventBody,
        headers));
    }
    try {
      const results = await Promise.all(calls);

      const failedConns: any = []
      for(let i = 0; i < results.length; i++) {
        const res = results[i];
        if(res.status != 200) {
          const s = {status: res.status, statusText: res.statusText,
            config: {url: res.config.url, data: res.config.data}};

          failedConns.push(s);
        }
      }
      console.debug('Failed client invocations:', failedConns);

      const countsMap = new Map();
      for (const res of results) {
        countsMap.set(res.status, (countsMap.get(res.status) || 0) + 1);
      }
      console.info('Completed, client invocation status counts:', countsMap);
    }
    catch(e: any) {
      console.error(e.message);
    }

  }
}
