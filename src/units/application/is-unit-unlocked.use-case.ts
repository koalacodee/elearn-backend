import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../domain/repositories/unit.repository';
import { UnitProgressRepository } from '../domain/repositories/unit-progress.repository';

@Injectable()
export class IsUnitUnlockedUseCase {
  constructor(
    private readonly units: UnitRepository,
    private readonly progress: UnitProgressRepository,
  ) {}

  async execute(userId: string, unitId: string): Promise<boolean> {
    const existing = await this.progress.find(userId, unitId);
    if (existing) return true;

    const all = await this.units.listOrdered();
    if (all.length === 0) return false;
    return all[0].id === unitId;
  }
}
