import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizAttempt } from '../domain/quiz-attempt.entity';
import { AttemptRepository } from '../domain/repositories/attempt.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';

@Injectable()
export class ListMyAttemptsUseCase {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly quizzes: QuizRepository,
  ) {}

  async execute(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');
    return this.attempts.listForUserAndQuiz(userId, quizId);
  }
}
