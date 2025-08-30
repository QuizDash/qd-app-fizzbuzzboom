const TYPES = {
  IParticipantConnectService: Symbol('IParticipantConnectService'),
  IGameSessionRepository: Symbol('IGameSessionRepository'),
  IGameSessionService: Symbol('IGameSessionService'),
  IDynamoDBClient: Symbol('IDynamoDBClient'),
  IRestApiClient: Symbol('IRestApiClient'),
  IToxicityCheckClient: Symbol('IToxicityCheckClient'),
  IWsClient: Symbol('IWsClient'),
  IEventBridgeClient: Symbol('IEventBridgeClient'),
  GameSessionTableName: Symbol('GameSessionTableName'),
  GameSessionUsersTableName: Symbol('GameSessionUsersTableName'),
  FbtEventBusArn: Symbol('FbtEventBusArn'),
  WsApiBaseUrl: Symbol('WsApiBaseUrl')
};

export default TYPES;
