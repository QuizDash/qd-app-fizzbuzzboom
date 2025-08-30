import 'reflect-metadata';
import container from './container';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import TYPES from '../../../../infrastructure/types';
import {GameSessionParticipant} from '../../../../domain/entities/game-session-participant';
import {PutEventsCommandInput} from '@aws-sdk/client-eventbridge';
import {IEventBridgeClient} from '../../../../infrastructure/interfaces/eventbridge-client.interface';
import {GameSession} from '../../../../domain/entities/game-session';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";

console.info('Lambda is cold-starting.');

const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);
const ebSvc = container.get<IEventBridgeClient>(TYPES.IEventBridgeClient);

exports.handler = async (event: any) => {
  console.info('Entered handler');
  console.debug('request content:', JSON.stringify(event));


  const eventBusArn = process.env.EVENT_BUS_ARN || '';
  console.log(typeof repo);

  if (!event.queryStringParameters || !event.queryStringParameters.session_id) {
    return HttpUtils.buildJsonResponse(400, {message: 'Missing game session id'});
  }

  if (!event.queryStringParameters || !event.queryStringParameters.nickname) {
    return HttpUtils.buildJsonResponse(400, {message: 'Missing user nickname'});
  }

  const gameSessionId = event.queryStringParameters.session_id;
  console.log("SessionId:", gameSessionId);

  const nickname = event.queryStringParameters.nickname;
  console.log("Nickname:", nickname);

  let session: GameSession;
  try {
    session = await repo.getSession(gameSessionId);
    if(session?.status != 'INITIAL') {
      console.warn(`Games session id is not valid, having status: ${session?.status}`);
      return HttpUtils.buildJsonResponse(400, {message: 'Game session id not valid'});
    }
    console.log("session:", JSON.stringify(session));
  } catch(e: any) {
    return HttpUtils.buildJsonResponse(400, {message: 'Game session id not found or is expired'});
  }

  let status: 'HOST' | 'PENDING' | 'ACTIVE' | 'WON' | 'LOST' = 'ACTIVE';
  if(nickname == 'Host') {
    status = 'HOST';
  }

  // Update session oarticipant record. TODO we may want to harden this later
  const sessionParticipant = new GameSessionParticipant(gameSessionId, nickname,
    event.requestContext.connectionId, status);
  await repo.addSessionParticipant(sessionParticipant);

  const params: PutEventsCommandInput = {
    Entries: [{
      Source: 'qd-app-fizzbuzzboom.WsConnectHandler',
      Detail: JSON.stringify(sessionParticipant),
      DetailType: 'ParticipantConnected',
      EventBusName: eventBusArn || '',
    }],
  };

  await ebSvc.send(params);

  const response = {statusCode: 200}
  console.info('Exiting handler');
  return response;

}

