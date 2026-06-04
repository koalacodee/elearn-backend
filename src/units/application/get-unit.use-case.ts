import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Unit } from '../domain/unit.entity';
import { UnitRepository } from '../domain/repositories/unit.repository';
import { IsUnitUnlockedUseCase } from './is-unit-unlocked.use-case';

@Injectable()
export class GetUnitUseCase {
  constructor(
    private readonly units: UnitRepository,
    private readonly isUnlocked: IsUnitUnlockedUseCase,
  ) {}

  async executeForStudent(userId: string, unitId: string): Promise<Unit> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    const allowed = await this.isUnlocked.execute(userId, unitId);
    if (!allowed) throw new ForbiddenException('unit_locked');
    return unit;
  }

  async executeForAdmin(unitId: string): Promise<Unit> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    return unit;
  }
}
