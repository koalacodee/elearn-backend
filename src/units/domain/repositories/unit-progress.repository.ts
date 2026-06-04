import { UserUnitProgress } from '../user-unit-progress.entity';

export abstract class UnitProgressRepository {
  abstract listForUser(userId: string): Promise<UserUnitProgress[]>;
  abstract find(
    userId: string,
    unitId: string,
  ): Promise<UserUnitProgress | null>;
  abstract upsertUnlocked(
    userId: string,
    unitId: string,
  ): Promise<UserUnitProgress>;
  abstract markPassed(userId: string, unitId: string): Promise<void>;
}
