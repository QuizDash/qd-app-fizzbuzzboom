import {Container} from 'inversify';
import TYPES from '../../../../infrastructure/types';
import {IDynamoDBClient} from '../../../../infrastructure/interfaces/dynamodb-client.interface';
import {GameSessionRepository} from '../../../../infrastructure/persistence/game-session-repository';
import {IGameSessionRepository} from '../../../../infrastructure/interfaces/game-session-repository.interface';
import {DynamoDBClient} from '../../../../infrastructure/adapters/dynamodb-client';
import {IEventBridgeClient} from '../../../../infrastructure/interfaces/eventbridge-client.interface';
import {EventBridgeClient} from '../../../../infrastructure/adapters/eventbridge-client';
import {IParticipantConnectService} from '../../../../domain/interfaces/participant-connect-service.interface';
import {ParticipantConnectService} from '../../../../domain/services/participant-connect-service';
import {WsClient} from '../../../../infrastructure/adapters/ws-client';
import {IWsClient} from '../../../../infrastructure/interfaces/ws-client.interface';

const container = new Container();

container.bind<IWsClient>(TYPES.IWsClient).to(WsClient).inSingletonScope();
container.bind<IParticipantConnectService>(TYPES.IParticipantConnectService).to(ParticipantConnectService).inSingletonScope();
container.bind<IGameSessionRepository>(TYPES.IGameSessionRepository).to(GameSessionRepository).inSingletonScope();
container.bind<IEventBridgeClient>(TYPES.IEventBridgeClient).to(EventBridgeClient).inSingletonScope();
container.bind<string>(TYPES.GameSessionTableName).toConstantValue(process.env.SESSION_TABLE_NAME || '');
container.bind<string>(TYPES.GameSessionUsersTableName).toConstantValue(process.env.SESSION_PARTICIPANT_TABLE_NAME || '');
container.bind<IDynamoDBClient>(TYPES.IDynamoDBClient).to(DynamoDBClient).inSingletonScope();
container.bind<string>(TYPES.WsApiBaseUrl).toConstantValue(process.env.WS_API_URL || '');

export default container;
