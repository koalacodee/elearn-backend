import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { IsUnitUnlockedUseCase } from '../../units/application/is-unit-unlocked.use-case';
import { ForbiddenException } from '@nestjs/common';
import { Word } from '../domain/word.entity';
import { WordRepository } from '../domain/repositories/word.repository';

@Injectable()
export class ListWordsUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly units: UnitRepository,
    private readonly isUnlocked: IsUnitUnlockedUseCase,
  ) {}

  async executeForAdmin(unitId: string): Promise<Word[]> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    return this.words.listByUnit(unitId);
  }

  async executeForStudent(userId: string, unitId: string): Promise<Word[]> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    const allowed = await this.isUnlocked.execute(userId, unitId);
    if (!allowed) throw new ForbiddenException('unit_locked');
    return this.words.listByUnit(unitId);
  }
}
