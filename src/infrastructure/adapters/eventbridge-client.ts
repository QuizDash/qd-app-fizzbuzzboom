import {PutEventsCommand, PutEventsCommandInput, PutEventsCommandOutput} from '@aws-sdk/client-eventbridge';
import {IEventBridgeClient} from '../interfaces/eventbridge-client.interface';
import {EventBridgeClient as EbClient} from '@aws-sdk/client-eventbridge';
import {injectable} from 'inversify';

const AWSXRay = require('aws-xray-sdk-core');

const ebClient = new EbClient({});
AWSXRay.captureAWSv3Client(ebClient);

@injectable()
/**
 * EventBridgeClient
 */
export class EventBridgeClient implements IEventBridgeClient {
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
