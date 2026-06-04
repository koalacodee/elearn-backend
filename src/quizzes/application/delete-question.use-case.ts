import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../domain/repositories/question.repository';

@Injectable()
export class DeleteQuestionUseCase {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(id: string): Promise<void> {
    const ok = await this.questions.delete(id);
    if (!ok) throw new NotFoundException('question_not_found');
  }
}
