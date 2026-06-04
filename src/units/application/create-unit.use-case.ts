import { Injectable } from '@nestjs/common';
import { Unit } from '../domain/unit.entity';
import { UnitRepository } from '../domain/repositories/unit.repository';

export interface CreateUnitInput {
  title: string;
  description?: string | null;
  orderIndex?: number;
}

@Injectable()
export class CreateUnitUseCase {
  constructor(private readonly units: UnitRepository) {}

  async execute(input: CreateUnitInput): Promise<Unit> {
    const orderIndex =
      input.orderIndex ?? ((await this.units.maxOrderIndex()) ?? -1) + 1;
    return this.units.create({
      title: input.title,
      description: input.description ?? null,
      orderIndex,
    });
  }
}
