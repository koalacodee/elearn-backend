import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitRepository } from '../domain/repositories/unit.repository';

@Injectable()
export class DeleteUnitUseCase {
  constructor(private readonly units: UnitRepository) {}

  async execute(id: string): Promise<void> {
    const ok = await this.units.delete(id);
    if (!ok) throw new NotFoundException('unit_not_found');
  }
}
