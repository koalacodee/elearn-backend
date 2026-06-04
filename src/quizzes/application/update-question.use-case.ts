import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizQuestion } from '../domain/quiz-question.entity';
import {
  QuestionRepository,
  UpdateQuestionInput,
} from '../domain/repositories/question.repository';

@Injectable()
export class UpdateQuestionUseCase {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(id: string, input: UpdateQuestionInput): Promise<QuizQuestion> {
    const existing = await this.questions.findById(id);
    if (!existing) throw new NotFoundException('question_not_found');

    const choices = input.choices ?? existing.choices;
    const correctChoice = input.correctChoice ?? existing.correctChoice;

    if (input.choices !== undefined || input.correctChoice !== undefined) {
      if (!Array.isArray(choices) || choices.length < 2) {
        throw new BadRequestException('choices_must_have_at_least_two');
      }
      if (
        !Number.isInteger(correctChoice) ||
        correctChoice < 0 ||
        correctChoice >= choices.length
      ) {
        throw new BadRequestException('correct_choice_out_of_range');
      }
    }
    if (
      input.grade !== undefined &&
      (!Number.isInteger(input.grade) || input.grade <= 0)
    ) {
      throw new BadRequestException('grade_must_be_positive_integer');
    }

    const updated = await this.questions.update(id, input);
    if (!updated) throw new NotFoundException('question_not_found');
    return updated;
  }
}
