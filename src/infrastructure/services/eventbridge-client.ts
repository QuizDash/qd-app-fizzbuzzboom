import * as AWSXRay from 'aws-xray-sdk-core';

import {PutEventsCommand, PutEventsCommandInput, PutEventsCommandOutput} from '@aws-sdk/client-eventbridge';
import {EventBridgeClient as EbClient} from '@aws-sdk/client-eventbridge';
import {injectable} from 'inversify';
import {IEventBridgeClient} from '../interfaces/eventbridge-client.interface';

const ebClient = new EbClient({});
AWSXRay.captureAWSv3Client(ebClient);

@injectable()
/**
 * EventBridgeClient
 */
export class EventbridgeService implements IEventBridgeClient {

  /**
   *
   * @param {PutEventsCommandInput} params
   */
  async send(params: PutEventsCommandInput): Promise<PutEventsCommandOutput> {
    console.info('Entered EventBridgeClient.send()');
    const data = await ebClient.send(new PutEventsCommand(params));
    return data;
  }
}
