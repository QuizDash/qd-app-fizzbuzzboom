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

  readonly SESSIONID_LENGTH = 8;

  create(hostUserId: string, fizzMultiple: number, buzzMultiple: number,
         isRandomQuestion: boolean, maxRandomValue: number, timeLimitSeconds: number): GameSession {
    const currentTime = new Date();
    this.sessionId = GameSession.generateUniqueId(currentTime.getTime(), this.SESSIONID_LENGTH);
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

  private static generateUniqueId(time: number, strLen: number): string {
    // Base36 gives [0-9a-z] encoding
    const timePart = time.toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);

    // Combine and trim/pad to x chars
    const uniqueString = (timePart + randomPart).substring(0, strLen);

    return uniqueString.toUpperCase();
  }

}
