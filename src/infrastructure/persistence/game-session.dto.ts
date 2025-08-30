export interface GameSessionDto {
  sessionId: string;
  hostUserId: string;
  createdOnUtc: string;
  createdOnEpoch: number;
  status: "INITIAL" | "ACTIVE" | "COMPLETED";
  ttl: number,
  fizzMultiple: number;
  buzzMultiple: number;
  isRandomQuestion: boolean;
  maxRandomValue: number;
  timeLimitSeconds: number;
}
