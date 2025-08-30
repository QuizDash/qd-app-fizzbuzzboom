export interface IGameSessionService {
  postQuestion(sessionId: string, questionValue: number);
  checkAnswer(sessionId: string, participantId: string, questionValue: number,
              answer: 'PASS' | 'FIZZ' | 'BUZZ' | 'FIZZBUZZ'): Promise<boolean>;
  publishQuestionAnswered(sessionId: string, questionValue: number, participantId: string,
                          isCorrect: boolean, answer: 'PASS' | 'FIZZ' | 'BUZZ' | 'FIZZBUZZ');
}