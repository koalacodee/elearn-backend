import { Injectable } from '@nestjs/common';
import { UnitWithStatus } from '../domain/unit.entity';
import { UnitRepository } from '../domain/repositories/unit.repository';
import { UnitProgressRepository } from '../domain/repositories/unit-progress.repository';

@Injectable()
export class ListUnitsUseCase {
  constructor(
    private readonly units: UnitRepository,
    private readonly progress: UnitProgressRepository,
  ) {}

  async execute(userId: string): Promise<UnitWithStatus[]> {
    const all = await this.units.listOrdered();
    if (all.length === 0) return [];

    const firstUnitId = all[0].id;
    const progressList = await this.progress.listForUser(userId);
    const byUnit = new Map(progressList.map((p) => [p.unitId, p]));

    return all.map((unit) => {
      const p = byUnit.get(unit.id);
      let status: UnitWithStatus['status'] = 'locked';
      if (p?.passedAt) status = 'passed';
      else if (p?.unlockedAt) status = 'unlocked';
      else if (unit.id === firstUnitId) status = 'unlocked';
      return { ...unit, status };
    });
  }
}
