/**
 * HttpUtils; provides helper functions for building http responses
 */
export class HttpUtils {
  /**
   * getSecurityHeaders
   * @description Set Content Security Policy and CORS headers in HTTP response
   * @return {any}
   */
  static getSecurityHeaders(): any {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Max-Age': 86400,
      'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
    };
    return headers;
  }

  /**
   * Build and return a JSON response with CSP and CORS headers
   * @param {number} statusCode statusCode
   * @param {object} body as JSON object
   * @param {object} headers
   * @return {object}
   */
  static buildJsonResponse(statusCode: number, body: object, headers?: object): object {
    if (!headers) {
      headers = {};
    }
    const secHeaders = HttpUtils.getSecurityHeaders();
    const combinedHeaders = {
      ...headers,
      ...secHeaders,
    };

    const response = {
      'statusCode': statusCode,
      'body': JSON.stringify(body),
      'headers': combinedHeaders,
      'isBase64Encoded': false,
    };
    return response;
  }
}
