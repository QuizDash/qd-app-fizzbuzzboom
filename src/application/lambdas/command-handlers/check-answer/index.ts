import 'reflect-metadata';
import container from './container';
import TYPES from '../../../../infrastructure/types';
import {IGameSessionService} from '../../../../domain/interfaces/game-session-service.interface';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";

console.info('Lambda is cold-starting.');
const svc = container.get<IGameSessionService>(TYPES.IGameSessionService);

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  const body = JSON.parse(event.body);

  const isCorrect = await svc.checkAnswer(body.sessionId, body.nickname, body.questionValue, body.answer);
  const response = HttpUtils.buildJsonResponse(200, {IsCorrect: isCorrect});
  console.info('Exiting handler');
  return response;

}

