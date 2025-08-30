import 'reflect-metadata';
import {IClaims} from '../../../viewmodels/claims.viewmodel';
import container from './container';
import TYPES from '../../../../infrastructure/types';
import {IGameSessionService} from '../../../../domain/interfaces/game-session-service.interface';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";

console.info('Lambda is cold-starting.');

const svc = container.get<IGameSessionService>(TYPES.IGameSessionService);

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  if (!event.requestContext || !event.requestContext.authorizer) {
    return HttpUtils.buildJsonResponse(400, {message: 'Missing authorizer'});
  }

  const userClaims: IClaims = event.requestContext.authorizer.claims;
  console.debug('Received userClaims:', userClaims);

  const body = JSON.parse(event.body);

  await svc.postQuestion(body.sessionId, body.questionValue);

  const response = HttpUtils.buildJsonResponse(200, {});
  console.info('Exiting handler');
  return response;

}

