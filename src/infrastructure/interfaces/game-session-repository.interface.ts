import {GameSession} from '../../domain/entities/game-session';
import {GameSessionParticipant} from '../../domain/entities/game-session-participant';

export interface IGameSessionRepository {
  createSession(s: GameSession): Promise<GameSession>;
  setSessionStatus(sessionId: string, status: 'ACTIVE' | 'COMPLETED'): Promise<any>;
  getSession(sessionId: string): Promise<GameSession>;
  querySessionParticipants(sessionId: string): Promise<GameSessionParticipant[]>
  getSessionParticipant(sessionId: string, participantId: string): Promise<GameSessionParticipant | null>;
  addSessionParticipant(p: GameSessionParticipant): Promise<void>;
  updateSessionParticipantStatus(sessionId: string, participantId: string, status: string): Promise<void>;
  deleteSessionParticipant(connectionId: string): Promise<GameSessionParticipant>;
}
