import 'reflect-metadata';
import {IClaims} from '../../../viewmodels/claims.viewmodel';
import {GameSession} from '../../../../domain/entities/game-session';
import container from './container';
import TYPES from '../../../../infrastructure/types';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";

console.info('Lambda is cold-starting.');

const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  if (!event.requestContext || !event.requestContext.authorizer) {
    return HttpUtils.buildJsonResponse(400, {message: 'Missing authorizer'});
  }

  const userClaims: IClaims = event.requestContext.authorizer.claims;
  console.debug('Received userClaims:', userClaims);

  const body = JSON.parse(event.body);
  console.debug('Body', body);

  const newSession = new GameSession().create(userClaims.sub, body.fizzMultiple, body.buzzMultiple,
    body.isRandom, body.maxRandomValue, body.timeLimitSeconds);

  await repo.createSession(newSession);

  const response = HttpUtils.buildJsonResponse(201, {sessionId: newSession.sessionId});
  console.info('Exiting handler');
  return response;
}

