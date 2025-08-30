export class GameSession {
  sessionId: string = '';
  hostUserId: string = '';
  createdOnUtc: string = '';
  createdOnEpoch: number = 0;
  status: 'INITIAL' | 'ACTIVE' | 'COMPLETED' = 'INITIAL';
  fizzMultiple = 3;
  buzzMultiple = 5;
  isRandomQuestion = false;
  maxRandomValue = -1;
  timeLimitSeconds = 5;

  create(hostUserId: string, fizzMultiple: number, buzzMultiple: number,
         isRandomQuestion: boolean, maxRandomValue: number, timeLimitSeconds: number): GameSession {
    const currentTime = new Date();
    this.sessionId = currentTime.getTime().toString(26).toUpperCase();
    this.hostUserId = hostUserId;
    this.createdOnUtc = currentTime.toISOString();
    this.createdOnEpoch = currentTime.getTime();
    this.fizzMultiple = fizzMultiple;
    this.buzzMultiple = buzzMultiple;
    this.isRandomQuestion = isRandomQuestion;
    this.maxRandomValue = maxRandomValue;
    this.timeLimitSeconds = timeLimitSeconds;
    return this;
  }

}
