import 'reflect-metadata';
import {EventBridgeEvent} from 'aws-lambda';
import TYPES from '../../../../infrastructure/types';
import {IParticipantConnectService} from '../../../../domain/interfaces/participant-connect-service.interface';
import container from './container';

console.info('Lambda is cold-starting.');
const svc = container.get<IParticipantConnectService>(TYPES.IParticipantConnectService);

exports.handler = async (event: EventBridgeEvent<any, any>, context) => {
  console.info('Entered handler');
  console.debug('Event payload:', JSON.stringify(event));

  const request = event.detail;
  console.debug('Event detail:', JSON.stringify(request));

  await svc.publishParticipantConnected(request);
  const response = JSON.stringify({message: 'Success'});
  return response;

}

