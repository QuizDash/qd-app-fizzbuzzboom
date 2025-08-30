import {Container} from 'inversify';
import TYPES from '../../../../infrastructure/types';
import {IDynamoDBClient} from '../../../../infrastructure/interfaces/dynamodb-client.interface';
import {GameSessionRepository} from '../../../../infrastructure/persistence/game-session-repository';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import {DynamoDBClient} from '../../../../infrastructure/adapters/dynamodb-client';
import {IEventBridgeClient} from '../../../../infrastructure/interfaces/eventbridge-client.interface';
import {EventBridgeClient} from '../../../../infrastructure/adapters/eventbridge-client';
import {IToxicityCheckClient} from "../../../../infrastructure/interfaces/toxicitycheck-client.interface";
import {ToxicityCheckClient} from "../../../../infrastructure/adapters/toxicitycheck-client";

const container = new Container();

container.bind<IGameSessionRepository>(TYPES.IGameSessionRepository).to(GameSessionRepository).inSingletonScope();
container.bind<IEventBridgeClient>(TYPES.IEventBridgeClient).to(EventBridgeClient).inSingletonScope();
container.bind<string>(TYPES.GameSessionTableName).toConstantValue(process.env.SESSION_TABLE_NAME || '');
container.bind<string>(TYPES.GameSessionUsersTableName).toConstantValue(process.env.SESSION_PARTICIPANT_TABLE_NAME || '');
container.bind<IDynamoDBClient>(TYPES.IDynamoDBClient).to(DynamoDBClient).inSingletonScope();
container.bind<IToxicityCheckClient>(TYPES.IToxicityCheckClient).to(ToxicityCheckClient).inSingletonScope();

export default container;
