import {inject, injectable} from 'inversify';
import TYPES from '../types';
import {IDynamoDBClient} from '../interfaces/dynamodb-client.interface';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {GameSession} from '../../domain/entities/game-session';
import {GameSessionDto} from './game-session.dto';
import {IGameSessionRepository} from '../interfaces/game-session-repository.interface';
import {GameSessionParticipant} from '../../domain/entities/game-session-participant';
import {GameSessionParticipantDto} from './game-session-participant.dto';
const util = require('util');

@injectable()
/**
 * OrderRepository
 */
export class GameSessionRepository implements IGameSessionRepository {
  private ddbClient: IDynamoDBClient;
  private readonly gameSessionTableName: string;
  private readonly gameSessionUsersTableName: string;
  private static readonly EXPIRY_DAYS = 2;

  /**
   * constructor
   * @param {IDynamoDBClient} ddbClient
   * @param {string} orderTableName
   */
  constructor(@inject(TYPES.IDynamoDBClient) ddbClient: IDynamoDBClient,
              @inject(TYPES.GameSessionTableName) gameSessionTableName: string,
              @inject(TYPES.GameSessionUsersTableName) gameSessionUsersTableName: string) {
    this.ddbClient = ddbClient;
    this.gameSessionTableName = gameSessionTableName;
    this.gameSessionUsersTableName = gameSessionUsersTableName;
  }

  /**
   * create
   * @param {GameSession} o
   */
  async createSession(o: GameSession): Promise<GameSession> {
    console.info('Entered GameSessionRepository.createSession');
    const dto = GameSessionRepository.toDto(o);
    const params: DocumentClient.PutItemInput = {
      TableName: this.gameSessionTableName,
      Item: dto,
      ReturnValues: 'ALL_OLD',
    };

    const res = await this.ddbClient.put(params);
    console.debug(util.inspect(res));
    console.info('Exiting GameSessionRepository.createSession');
    return o;
  }

  async setSessionStatus(sessionId: string, status: 'ACTIVE' | 'COMPLETED'): Promise<any> {
    console.info('Entered GameSessionRepository.setSessionStatus');

    const params: DocumentClient.UpdateItemInput = {
      TableName: this.gameSessionTableName,
      Key: {
        sessionId: sessionId,
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {"#status": "status"},
      ExpressionAttributeValues: {":status": status},
      ReturnValues: 'ALL_OLD',
    };

    const res = await this.ddbClient.update(params);
    console.debug(util.inspect(res));
    console.info('Exiting GameSessionRepository.setSessionStatus');
    return;
  }

  /**
   * getSession
   * @param {GameSession} o
   */
  async getSession(sessionId: string): Promise<GameSession> {
    console.info(`Entered GameSessionRepository.getSession for sessionId: ${sessionId}`);
    const params: DocumentClient.GetItemInput = {
      TableName: this.gameSessionTableName,
      Key: {
        sessionId: sessionId.toUpperCase()
      },
    };

    try {
      const res = await this.ddbClient.get(params);
      console.log(util.inspect(res));
      if(res.Item) {
        const x: GameSessionDto = <GameSessionDto>res.Item
        const result = GameSessionRepository.toGameSession(x);
        return result;
      }
      throw new Error('Item not found');
    } catch(e: any) {
      console.error(e.message);
      throw e;
    }
  }

  /**
   * getSession
   * @param {GameSession} o
   */
  async querySessionParticipants(sessionId: string): Promise<GameSessionParticipant[]> {
    console.info('Entered GameSessionRepository.getSession');
    const params: DocumentClient.QueryInput = {
      TableName: this.gameSessionUsersTableName,
      KeyConditionExpression: 'sessionId = :sessionId',
      ExpressionAttributeValues: {
        ':sessionId': sessionId.toUpperCase()
      }
    };

    try {
      const res = await this.ddbClient.query(params);
      console.debug(util.inspect(res));
      const sessionParticipants: GameSessionParticipant[] = GameSessionRepository.mapGameSessionParticipants(res.Items)
      return sessionParticipants;
    } catch(e: any) {
      console.error(e.message);
      throw e;
    }
    console.error('Exiting querySessionParticipants');
  }

  /**
   *
   * @param {string} sessionId
   * @param {string} participantId
   */
  async getSessionParticipant(sessionId: string, participantId: string): Promise<GameSessionParticipant | null> {
    console.info('Entered GameSessionRepository.getSession');
    const params: DocumentClient.GetItemInput = {
      TableName: this.gameSessionUsersTableName,
      Key: {sessionId: sessionId.toUpperCase(), participantId: participantId},
    };

    try {
      const res = await this.ddbClient.get(params);
      console.log(util.inspect(res));
      if(res.Item) {
        console.debug(util.inspect(res.Item));
        return GameSessionRepository.toGameSessionParticipant(res.Item as GameSessionParticipantDto);
      }

      return null;
    } catch(e: any) {
      console.error(e.message);
      throw e;
    }
  }

  /**
   * addSessionParticipant
   * @param {GameSessionParticipant} p
   */
  async addSessionParticipant(p: GameSessionParticipant): Promise<void> {
    console.info('Entered GameSessionRepository.addSessionParticipant');
    const dto = GameSessionRepository.toGameSessionParticipantDto(p);

    const params: DocumentClient.PutItemInput = {
      TableName: this.gameSessionUsersTableName,
      Item: dto,
      /*
      ConditionExpression: 'sessionId <> :sessionId AND participantId <> :participantId AND #status <> :status',
      ExpressionAttributeNames: {
        "#status": "status"   // status is a reserved word - fixing this here
      },
      ExpressionAttributeValues: {
        ":sessionId" :dto.sessionId,
        ":participantId": dto.participantId,
        ":status": dto.status,
      },*/
      ReturnValues: 'ALL_OLD',
    };

    const res = await this.ddbClient.put(params);
    console.debug(util.inspect(res));
    console.info('Exiting GameSessionRepository.addSessionParticipant');
  }


  /**
   * updateSessionParticipantStatus
   * @param {string} sessionId
   * @param {string} participantId
   * @param {string} status
   */
  async updateSessionParticipantStatus(sessionId: string, participantId: string, status: string): Promise<void> {
    console.info('Entered GameSessionRepository.updateSessionParticipantStatus');

    const params: DocumentClient.UpdateItemInput = {
      TableName: this.gameSessionUsersTableName,
      Key: {
        sessionId: sessionId.toUpperCase(),
        participantId: participantId
      },
      UpdateExpression: 'set #Status = :s',
      ExpressionAttributeValues: {
        ':s': status
      },
      ExpressionAttributeNames: {
        '#Status': "status" //NB status is a ddb keyword hence why we're not using directly here
      }
    };

    const res = await this.ddbClient.update(params);
    console.debug(util.inspect(res));
    console.info('Exiting GameSessionRepository.updateSessionParticipantStatus');
  }


  /**
   * create
   * @param {GameSessionParticipant} p
   */
  async deleteSessionParticipant(connectionId: string): Promise<GameSessionParticipant> {
    console.info('Entered GameSessionRepository.deleteSessionParticipant');

    const scanParams: DocumentClient.ScanInput = {
      TableName: this.gameSessionUsersTableName,
      FilterExpression: 'connectionId = :connectionId',
      ExpressionAttributeValues: {
        ':connectionId': connectionId
      }
    };

    const res = await this.ddbClient.scan(scanParams);

    if(res && res.Items && res.Count == 1 && res.Items[0]) {
      const rec: GameSessionParticipantDto = <GameSessionParticipantDto>res.Items[0];
      const participant = GameSessionRepository.toGameSessionParticipant(rec);

      const params: DocumentClient.DeleteItemInput = {
        TableName: this.gameSessionUsersTableName,
        Key: {
          sessionId: rec.sessionId.toUpperCase(),
          participantId: rec.participantId
        }
      };

      await this.ddbClient.delete(params);
      console.info('Exiting GameSessionRepository.deleteSessionParticipant');
      return participant;
    } else {
      throw new Error('Participant could not be deleted');
    }

  }

  /**
   * toDto
   * @param {GameSession} o
   * @return {GameSessionDto}
   */
  static toDto(o: GameSession): GameSessionDto {
    const createdDate = new Date(o.createdOnEpoch);

    const d: GameSessionDto = {
      sessionId: o.sessionId,
      hostUserId: o.hostUserId,
      createdOnUtc: o.createdOnUtc,
      createdOnEpoch: o.createdOnEpoch,
      status: o.status,
      ttl: createdDate.setDate(createdDate.getDate() + GameSessionRepository.EXPIRY_DAYS),
      fizzMultiple: o.fizzMultiple,
      buzzMultiple: o.buzzMultiple,
      isRandomQuestion: o.isRandomQuestion,
      maxRandomValue: o.maxRandomValue,
      timeLimitSeconds: o.timeLimitSeconds
    };
    return d;
  }

  /**
   * toGameSession
   * @param {GameSessionDto} d
   * @return {GameSession}
   */
  static toGameSession(d: GameSessionDto): GameSession {
    const e = new GameSession();
    e.sessionId = d.sessionId;
    e.hostUserId = d.hostUserId;
    e.createdOnUtc = d.createdOnUtc;
    e.createdOnEpoch = d.createdOnEpoch;
    e.status = d.status;
    e.fizzMultiple = d.fizzMultiple;
    e.buzzMultiple = d.buzzMultiple;
    e.isRandomQuestion = d.isRandomQuestion;
    e.maxRandomValue = d.maxRandomValue;
    e.timeLimitSeconds = d.timeLimitSeconds;
    return e;
  }

  /**
   * toDto
   * @param {GameSession} o
   * @return {GameSessionDto}
   */
  static toGameSessionParticipantDto(o: GameSessionParticipant): GameSessionParticipantDto {
    const createdDate = new Date(o.createdOnEpoch);
    const d: GameSessionParticipantDto = {
      sessionId: o.sessionId,
      participantId: o.participantId,
      status: o.status,
      connectionId: o.connectionId,
      createdOnUtc: o.createdOnUtc,
      createdOnEpoch: o.createdOnEpoch,
      ttl: createdDate.setDate(createdDate.getDate() + GameSessionRepository.EXPIRY_DAYS)
    };
    return d;
  }

  static toGameSessionParticipant(o: GameSessionParticipantDto): GameSessionParticipant {
    const d: GameSessionParticipant = {
      sessionId: o.sessionId,
      participantId: o.participantId,
      status: o.status,
      connectionId: o.connectionId,
      createdOnUtc: o.createdOnUtc,
      createdOnEpoch: o.createdOnEpoch
    };
    return d;
  }

  static mapGameSessionParticipants(d: any): GameSessionParticipant[] {
    const result = d.map(GameSessionRepository.toGameSessionParticipant);
    return result;
  }
}
