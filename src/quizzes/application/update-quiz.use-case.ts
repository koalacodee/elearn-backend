import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Quiz } from '../domain/quiz.entity';
import {
  QuizRepository,
  UpdateQuizInput,
} from '../domain/repositories/quiz.repository';

@Injectable()
export class UpdateQuizUseCase {
  constructor(private readonly quizzes: QuizRepository) {}

  async execute(id: string, input: UpdateQuizInput): Promise<Quiz> {
    if (input.timeLimitSec !== undefined && input.timeLimitSec <= 0) {
      throw new BadRequestException('time_limit_must_be_positive');
    }
    if (
      input.passThresholdPct !== undefined &&
      (input.passThresholdPct < 0 || input.passThresholdPct > 100)
    ) {
      throw new BadRequestException('pass_threshold_out_of_range');
    }

    const existing = await this.quizzes.findById(id);
    if (!existing) throw new NotFoundException('quiz_not_found');

    if (input.isMandatory === true && !existing.isMandatory) {
      const other = await this.quizzes.findMandatoryForUnit(existing.unitId);
      if (other && other.id !== id) {
        throw new ConflictException('unit_already_has_mandatory_quiz');
      }
    }

    const updated = await this.quizzes.update(id, input);
    if (!updated) throw new NotFoundException('quiz_not_found');
    return updated;
  }
}
