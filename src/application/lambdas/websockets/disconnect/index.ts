import 'reflect-metadata';
import container from '../connect/container';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import TYPES from '../../../../infrastructure/types';
import {IEventBridgeClient} from '../../../../infrastructure/interfaces/eventbridge-client.interface';
import {PutEventsCommandInput} from '@aws-sdk/client-eventbridge';
import {GameSessionParticipant} from '../../../../domain/entities/game-session-participant';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";

console.info('Lambda is cold-starting.');

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  const eventBusArn = process.env.EVENT_BUS_ARN || '';

  const connectionId = event.requestContext.connectionId;
  console.info('Disconnecting: ' + connectionId);

  const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);

  let p: GameSessionParticipant
  try {
    p = await repo.deleteSessionParticipant(connectionId);
  }
  catch(e: any) {
    return HttpUtils.buildJsonResponse(400, {message: e.message});
  }

  const ebSvc = container.get<IEventBridgeClient>(TYPES.IEventBridgeClient);

  //const eventBusArn = process.env.EVENT_BUS_ARN || '';
  console.log(typeof repo);

  const params: PutEventsCommandInput = {
    Entries: [{
      Source: 'qd-app-fizzbuzzboom.WsDisconnectHandler',
      Detail: JSON.stringify(p),
      DetailType: 'ParticipantDisconnected',
      EventBusName: eventBusArn || '',
    }],
  };

  await ebSvc.send(params);
  const response = HttpUtils.buildJsonResponse(200, {message: 'success'});
  console.info('Exiting handler');
  return response;

}

