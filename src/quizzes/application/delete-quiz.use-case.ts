import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizRepository } from '../domain/repositories/quiz.repository';

@Injectable()
export class DeleteQuizUseCase {
  constructor(private readonly quizzes: QuizRepository) {}

  async execute(id: string): Promise<void> {
    const ok = await this.quizzes.delete(id);
    if (!ok) throw new NotFoundException('quiz_not_found');
  }
}
