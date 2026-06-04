import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../domain/repositories/unit.repository';
import { UnitProgressRepository } from '../domain/repositories/unit-progress.repository';

@Injectable()
export class UnlockNextUnitUseCase {
  constructor(
    private readonly units: UnitRepository,
    private readonly progress: UnitProgressRepository,
  ) {}

  async execute(userId: string, currentUnitId: string): Promise<void> {
    const current = await this.units.findById(currentUnitId);
    if (!current) return;

    await this.progress.markPassed(userId, current.id);

    const next = await this.units.findNextByOrder(current.orderIndex);
    if (next) {
      await this.progress.upsertUnlocked(userId, next.id);
    }
  }
}
