import {injectable} from 'inversify';
import {IWsClient} from '../interfaces/ws-client.interface';
import axios from "axios";
import { aws4Interceptor } from "aws4-axios";
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureHTTPsGlobal(require('https'));
AWSXRay.captureHTTPsGlobal(require('http'));

const WS_REQUEST_TIMEOUT = 3000;

@injectable()
/**
 * RestApiClient
 */
export class WsClient implements IWsClient {

  private static readonly interceptor = aws4Interceptor({
    region: "ap-southeast-2",
    service: "execute-api",
  });

  private client = axios.create();

  constructor() {
    this.client.interceptors.request.use(WsClient.interceptor);
  }

  /**
   * post
   * @param {string} endpointUrl
   * @param {any} body
   * @param {any} headers
   * @return {any}
   */
  async post (endpointUrl: string, body: any, headers: any) {
    console.info(`Calling: ${endpointUrl}`);

    const axiosRequestConfig = {
      timeout: Number(WS_REQUEST_TIMEOUT),
      headers: headers,
      validateStatus: function(status) {
        return true;
      },
    };
    return this.client.post(endpointUrl, body, axiosRequestConfig);
  };
}
