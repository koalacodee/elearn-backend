import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsUnitUnlockedUseCase } from '../../units/application/is-unit-unlocked.use-case';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { Quiz } from '../domain/quiz.entity';
import { QuizRepository } from '../domain/repositories/quiz.repository';

@Injectable()
export class ListQuizzesForUnitUseCase {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly units: UnitRepository,
    private readonly isUnlocked: IsUnitUnlockedUseCase,
  ) {}

  async executeForAdmin(unitId: string): Promise<Quiz[]> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    return this.quizzes.listByUnit(unitId);
  }

  async executeForStudent(userId: string, unitId: string): Promise<Quiz[]> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    const allowed = await this.isUnlocked.execute(userId, unitId);
    if (!allowed) throw new ForbiddenException('unit_locked');
    return this.quizzes.listByUnit(unitId);
  }
}
