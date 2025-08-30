import {IGameSessionService} from '../interfaces/game-session-service.interface';
import {inject, injectable} from 'inversify';
import TYPES from '../../infrastructure/types';
import {IWsClient} from '../../infrastructure/interfaces/ws-client.interface';
import {IGameSessionRepository} from '../../infrastructure/interfaces/game-session-repository.interface';
import {PutEventsCommandInput} from '@aws-sdk/client-eventbridge';
import {IEventBridgeClient} from '../../infrastructure/interfaces/eventbridge-client.interface';

@injectable()
export class GameSessionService implements IGameSessionService {

  private repo: IGameSessionRepository;
  private wsClient: IWsClient;
  private wsApiBaseUrl: string;
  private ebClient: IEventBridgeClient;
  private eventBusArn: string;

  constructor(@inject(TYPES.IEventBridgeClient) ebClient: IEventBridgeClient,
              @inject(TYPES.FbtEventBusArn) eventBusArn: string,
              @inject(TYPES.IGameSessionRepository) repo: IGameSessionRepository,
              @inject(TYPES.WsApiBaseUrl) wsApiBaseUrl,
              @inject(TYPES.IWsClient) wsClient: IWsClient) {
    this.ebClient = ebClient;
    this.wsClient = wsClient;
    this.repo = repo;
    this.wsApiBaseUrl = wsApiBaseUrl;
    this.eventBusArn= eventBusArn;
  }

  async postQuestion(sessionId: string, questionValue: number) {
    console.info(`Entered postQuestion for question: ${questionValue}, session: ${sessionId}`);

    const headers = {
      "Content-Type": "application/json"
    }

    // Update session to active
    await this.repo.setSessionStatus(sessionId,'ACTIVE');

    const participants = await this.repo.querySessionParticipants(sessionId);
    const activeParticipants = participants.filter(x=>x.status == 'ACTIVE');
    console.info('Participants:', JSON.stringify(participants));

    const calls: any[] = [];
    if(participants.length > 0) {
      const targetParticipant = activeParticipants[this.getRandomInt(activeParticipants.length)];
      if(!targetParticipant) {
        // TODO: There are no more participants in game; this should have already finished though.
        throw new Error('There are no more active participants left in the game')
      }

      for(let i = 0; i< participants.length; i++) {
        const body = {
          event: "question",
          content: {
            question: questionValue,
            targetUser: {
              sessionId: targetParticipant.sessionId,
              participantId: targetParticipant.participantId,
              participantNickname: targetParticipant.participantId,
              connectionId: targetParticipant.connectionId
            }
          }
        }

        const url = `https://${this.wsApiBaseUrl}/fbb/@connections/${participants[i].connectionId}`
        // console.debug(`Sending ws request to: ${url}`, body);
        calls.push(this.wsClient.post(url, body,
          headers));
      }
      try {
        const results = await Promise.all(calls);
        for(let i = 0; i < results.length; i++) {
          const result = results[i];
          console.debug(`PostQuestion Result ${i}:`, {status: result['status'], statusText: result['statusText']});
        }

        console.debug('Completed');
      }
      catch(e: any) {
        console.error('Caught error when invoking WS calls to participants: ' + e.message, e);
      }
    }
  }

  async checkAnswer(sessionId: string, participantId: string, questionValue: number,
                    answer: 'PASS' | 'FIZZ' | 'BUZZ' | 'FIZZBUZZ'): Promise<boolean> {
    console.info(`Entered postQuestion for question: ${questionValue}, session: ${sessionId}`);

    const session = await this.repo.getSession(sessionId);
    console.info('Session:', JSON.stringify(session));

    const fizzMultiple = session.fizzMultiple;
    const buzzMultiple = session.buzzMultiple;

    let isCorrect = false;
    switch(answer) {
      case 'FIZZ':
        if(questionValue % fizzMultiple == 0 && questionValue % buzzMultiple != 0) {
          isCorrect = true;
        }
        break;
      case 'BUZZ':
        if(questionValue % fizzMultiple != 0 && questionValue % buzzMultiple == 0) {
          isCorrect = true;
        }
        break;
      case 'FIZZBUZZ':
        if(questionValue % fizzMultiple == 0 && questionValue % buzzMultiple == 0) {
          isCorrect = true;
        }
        break;
      case 'PASS':
        if(questionValue % fizzMultiple != 0 && questionValue % buzzMultiple != 0) {
          isCorrect = true;
        }
        break;
    }
    await this.setQuestionAnswered(sessionId, participantId, questionValue, isCorrect, answer);
    return isCorrect;
  }

  private async setQuestionAnswered(sessionId: string, participantId: string, questionValue: number,
                                    isCorrect: boolean, answer: 'PASS' | 'FIZZ' | 'BUZZ' | 'FIZZBUZZ') {
    let questionAnswered = {
      sessionId: sessionId,
      participantId: participantId,
      questionValue: questionValue,
      isCorrect: isCorrect,
      answer: answer
    }

    const params: PutEventsCommandInput = {
      Entries: [{
        Source: 'qd-app-fizzbuzzboom.GameSessionService',
        Detail: JSON.stringify(questionAnswered),
        DetailType: 'QuestionAnswered',
        EventBusName: this.eventBusArn || '',
      }],
    };
    console.log('Publishing questionAnswered', questionAnswered);
    await this.ebClient.send(params);
  }

  private getRandomInt(max): number {
    return Math.floor(Math.random() * max);
  }

  async publishQuestionAnswered(sessionId: string, questionValue: number, participantId: string,
                                isCorrect: boolean, answer: 'PASS' | 'FIZZ' | 'BUZZ' | 'FIZZBUZZ' ) {
    const self = this;
    console.info(`Entered publishQuestionAnswered for questionValue ${questionValue}, participant: ${participantId}`);

    const headers = {
      "Content-Type": "application/json"
    }

    if(!isCorrect) {
      await this.repo.updateSessionParticipantStatus(sessionId, participantId, 'LOST' );
    }

    const participants = await this.repo.querySessionParticipants(sessionId);
    console.info('Participants:', JSON.stringify(participants));
    const calls: any[] = [];
    for(let i = 0; i< participants.length; i++) {
      const participant = participants[i];
      const url = `https://${this.wsApiBaseUrl}/fbb/@connections/${participants[i].connectionId}`
      const eventBody = {
        event: "questionAnswered",
        content: {
          userId: participant.participantId,
          nickname: participantId,
          questionValue: questionValue,
          isCorrect: isCorrect,
          answer: answer
        }
      };
      calls.push(this.wsClient.post(url, eventBody, headers));
    }
    try {
      const result = await Promise.all(calls);
      console.debug('Result', result);
      console.debug('Completed');
    }
    catch(e: any) {
      console.error(e.message);
    }

    const activeParticipants = participants.filter(x=>x.status == 'ACTIVE');
    // Is there 1 person remaining as a winner?
    if(activeParticipants.length == 1) {
      await self.repo.setSessionStatus(sessionId, 'COMPLETED');
      const calls: any[] = [];
      for(let i = 0; i< participants.length; i++) {
        const participant = participants[i];
        const url = `https://${this.wsApiBaseUrl}/fbb/@connections/${participants[i].connectionId}`
        const eventBody = {
          event: "gameWon",
          content: {
            userId: participant.participantId,
            nickname: participant.participantId,
            winnerUserId: activeParticipants[0].participantId,
            winnerNickname: activeParticipants[0].participantId,
          }
        };
        calls.push(this.wsClient.post(url, eventBody, headers));
      }
      try {
        const result = await Promise.all(calls);
        console.debug('Won Result', result);
        console.debug('Game won');
      }
      catch(e: any) {
        console.error(e.message);
      }
    }

  }

}
