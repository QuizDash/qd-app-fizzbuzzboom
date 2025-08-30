export class GameSessionParticipant {
  sessionId: string;
  participantId: string;
  status: 'HOST' | 'PENDING' | 'ACTIVE' | 'WON' | 'LOST';
  connectionId: string;
  createdOnUtc: string;
  createdOnEpoch: number;

  constructor(sessionId: string, participantId: string, connectionId: string,
              status: 'HOST' | 'PENDING' | 'ACTIVE' | 'WON' | 'LOST') {
    const currentTime = new Date();
    this.sessionId = sessionId;
    this.participantId = participantId;
    this.connectionId = connectionId;
    this.createdOnUtc = currentTime.toISOString();
    this.createdOnEpoch = currentTime.getTime();
    this.status = status;
  }
}
