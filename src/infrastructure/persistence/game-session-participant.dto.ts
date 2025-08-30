export interface GameSessionParticipantDto {
  sessionId: string;
  participantId: string;
  status: 'HOST' | 'PENDING' | 'ACTIVE' | 'WON' | 'LOST';
  connectionId: string;
  createdOnUtc: string;
  createdOnEpoch: number;
  ttl: number;
}
