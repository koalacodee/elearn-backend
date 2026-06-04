import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { Quiz } from '../domain/quiz.entity';
import { QuizRepository } from '../domain/repositories/quiz.repository';

export interface CreateQuizInput {
  unitId: string;
  title: string;
  description?: string | null;
  isMandatory: boolean;
  timeLimitSec: number;
  passThresholdPct?: number;
}

@Injectable()
export class CreateQuizUseCase {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly units: UnitRepository,
  ) {}

  async execute(input: CreateQuizInput): Promise<Quiz> {
    if (input.timeLimitSec <= 0)
      throw new BadRequestException('time_limit_must_be_positive');
    if (input.passThresholdPct !== undefined) {
      if (input.passThresholdPct < 0 || input.passThresholdPct > 100) {
        throw new BadRequestException('pass_threshold_out_of_range');
      }
    }

    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new NotFoundException('unit_not_found');

    if (input.isMandatory) {
      const existing = await this.quizzes.findMandatoryForUnit(input.unitId);
      if (existing) {
        throw new ConflictException('unit_already_has_mandatory_quiz');
      }
    }

    return this.quizzes.create(input);
  }
}
