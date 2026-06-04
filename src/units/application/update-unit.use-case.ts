import { Injectable, NotFoundException } from '@nestjs/common';
import { Unit } from '../domain/unit.entity';
import { UnitRepository } from '../domain/repositories/unit.repository';

export interface UpdateUnitInput {
  id: string;
  title?: string;
  description?: string | null;
  orderIndex?: number;
}

@Injectable()
export class UpdateUnitUseCase {
  constructor(private readonly units: UnitRepository) {}

  async execute(input: UpdateUnitInput): Promise<Unit> {
    const { id, ...patch } = input;
    const updated = await this.units.update(id, patch);
    if (!updated) throw new NotFoundException('unit_not_found');
    return updated;
  }
}
