import { Unit } from '../unit.entity';

export interface CreateUnitInput {
  title: string;
  description?: string | null;
  orderIndex: number;
}

export interface UpdateUnitInput {
  title?: string;
  description?: string | null;
  orderIndex?: number;
}

export abstract class UnitRepository {
  abstract create(input: CreateUnitInput): Promise<Unit>;
  abstract update(id: string, input: UpdateUnitInput): Promise<Unit | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract findById(id: string): Promise<Unit | null>;
  abstract listOrdered(): Promise<Unit[]>;
  abstract findNextByOrder(orderIndex: number): Promise<Unit | null>;
  abstract maxOrderIndex(): Promise<number | null>;
}
