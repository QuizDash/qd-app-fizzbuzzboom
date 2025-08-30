import 'reflect-metadata';
import {IToxicityCheckClient} from "../../../../infrastructure/interfaces/toxicitycheck-client.interface";
import TYPES from "../../../../infrastructure/types";
import container from "./container";
import {GameSession} from "../../../../domain/entities/game-session";
import {IGameSessionRepository} from "../../../../infrastructure/interfaces/game-session-repository.interface";

console.info('Lambda is cold-starting.');

const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);
const toxicityCheckSvc = container.get<IToxicityCheckClient>(TYPES.IToxicityCheckClient);
const TOXICITY_THRESHOLD = 0.2;

exports.handler = async (event) => {
  console.log('Authorizer event:', JSON.stringify(event, null, 2));

  try {
    // Extract query parameters from the event
    const queryStringParameters = event.queryStringParameters || {};
    const gameSessionId = queryStringParameters.session_id;
    const nickname = queryStringParameters.nickname;

    // Validate  parameters
    if (!gameSessionId) {
      throw new Error('Missing session_id parameter');
    }

    if (!nickname) {
      throw new Error('Missing nickname parameter');
    }

    console.debug("SessionId:", gameSessionId);
    console.debug("Nickname:", nickname);

    let session: GameSession;

    session = await repo.getSession(gameSessionId);
    if(session?.status != 'INITIAL') {
      console.warn(`Games session id is not valid, having status: ${session?.status}`);
      throw new Error('Game session id not valid');
    }
    console.debug("session:", JSON.stringify(session));

    const checkNameResponse = await toxicityCheckSvc.detectToxicity(nickname);
    const resultList = checkNameResponse.ResultList;

    const toxicLabel = resultList
      .flatMap(r => r.Labels)
      .find(label => label.Score > TOXICITY_THRESHOLD);

    if (toxicLabel) {
      console.warn(`Nickname ${nickname} has failed checks, with label:`, JSON.stringify(toxicLabel));
      throw new Error("Nickname has failed checks, please enter another");
    }

    // Return policy allowing the connection
    return generatePolicy('user', 'Allow', event.methodArn, {
      userId: 'user123', // You can add context data here
      tokenValidated: true
    });

  } catch (error: any) {
    console.error('Authorization failed:', error.message);
    // Return policy denying the connection
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function generatePolicy(principalId, effect, resource, context = {}) {
  const authResponse: any = {
    principalId: principalId
  };

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    };
    authResponse.policyDocument = policyDocument;
  }

  // Add context data that will be available in your WebSocket handlers
  if (Object.keys(context).length > 0) {
    authResponse.context = context;
  }
  return authResponse;
}

