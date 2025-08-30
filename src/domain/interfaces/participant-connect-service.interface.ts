import {GameSessionParticipant} from '../entities/game-session-participant';

export interface IParticipantConnectService {
  publishParticipantConnected(participant: GameSessionParticipant);
}