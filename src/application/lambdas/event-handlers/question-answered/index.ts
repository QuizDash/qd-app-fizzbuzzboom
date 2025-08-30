import 'reflect-metadata';
import {EventBridgeEvent} from 'aws-lambda';
import TYPES from '../../../../infrastructure/types';
import container from './container';
import {GameSessionService} from '../../../../domain/services/game-session-service.';

console.info('Lambda is cold-starting.');

const svc = container.get<GameSessionService>(TYPES.IGameSessionService);

exports.handler = async (event: EventBridgeEvent<any, any>, context) => {
  console.info('Entered handler');
  console.debug('Event payload:', JSON.stringify(event));

  const request = event.detail;
  console.debug('Event detail:', JSON.stringify(request));

  await svc.publishQuestionAnswered(request.sessionId, request.questionValue, request.participantId,
    request.isCorrect, request.answer);
  const response = JSON.stringify({message: 'Success'});
  return response;

}

