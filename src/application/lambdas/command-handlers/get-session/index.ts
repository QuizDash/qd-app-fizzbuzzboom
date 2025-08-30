import 'reflect-metadata';
import container from './container';
import TYPES from '../../../../infrastructure/types';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";
import {InvalidDataError} from "../../../../domain/entities/invalid-data-error";

console.info('Lambda is cold-starting.');

const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  if (!event.pathParameters) {
    throw new InvalidDataError('Path parameters are not provided');
  }

  const params = event.pathParameters;
  if (!params.id) {
    throw new InvalidDataError('SessionId parameter has not been provided');
  }

  try {
    const result = await repo.getSession(params.id);
    console.log(result);
    return HttpUtils.buildJsonResponse(200, result);
  } catch(e: any) {
    return HttpUtils.buildJsonResponse(400, {message: 'Session not found'});
  }

}

