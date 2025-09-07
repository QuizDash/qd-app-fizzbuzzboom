import 'reflect-metadata';
import container from './container';
import TYPES from '../../../../infrastructure/types';
import {HttpUtils} from "../../../../infrastructure/utils/http-utils";
import {IGameSessionRepository} from "../../../../infrastructure/interfaces/game-session-repository.interface";
import {IToxicityCheckClient} from "../../../../infrastructure/interfaces/toxicitycheck-client.interface";
import {GameSessionParticipant} from "../../../../domain/entities/game-session-participant";

console.info('Lambda is cold-starting.');
const repo = container.get<IGameSessionRepository>(TYPES.IGameSessionRepository);

const toxicityCheckSvc = container.get<IToxicityCheckClient>(TYPES.IToxicityCheckClient);
const TOXICITY_THRESHOLD = process.env.TOXICITY_THRESHOLD || "0.2";

exports.handler = async (event, context) => {
  console.info('Entered handler');
  console.debug('request content:', event);

  const body = JSON.parse(event.body);

  const sessionId = body.sessionId;
  const nickname = body.nickname;

  const existingParticipant = await repo.getSessionParticipant(sessionId, nickname);

  if(existingParticipant) {
    return HttpUtils.buildJsonResponse(400, {message: "Nickname already exists"});
  }

  const startTime = Date.now();
  const toxicityCheckResult = await toxicityCheckSvc.detectToxicity(nickname);
  const endTime = Date.now();
  const resultList = toxicityCheckResult.ResultList;
  console.debug(`CheckName: ${nickname} result:`, JSON.stringify(resultList));
  console.debug(`ToxicityCheck execution time: ${endTime - startTime} ms`)

  const toxicLabel = resultList
    .flatMap(r => r.Labels)
    .find(label => label.Score > Number(TOXICITY_THRESHOLD));

  if (toxicLabel) {
    console.warn(`Nickname ${nickname} has failed checks, with label:`, JSON.stringify(toxicLabel));
    return HttpUtils.buildJsonResponse(400, { message: "Nickname is not allowed, please enter another" });
  }

  const sessionParticipant = new GameSessionParticipant(sessionId, nickname,
    'PENDING', 'PENDING');
  await repo.addSessionParticipant(sessionParticipant);
  const response = HttpUtils.buildJsonResponse(200, {message: 'Reserved session participant'});
  console.info('Exiting handler');
  return response;

}

