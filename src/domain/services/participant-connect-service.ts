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
      const result = await Promise.all(calls);
      console.debug('Result', result);
      console.debug('Completed');
    }
    catch(e: any) {
      console.error(e.message);
    }

  }
}
