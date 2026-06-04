import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { userUnitProgress } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { UserUnitProgress } from '../domain/user-unit-progress.entity';
import { UnitProgressRepository } from '../domain/repositories/unit-progress.repository';

type ProgressRow = typeof userUnitProgress.$inferSelect;

@Injectable()
export class DrizzleUnitProgressRepository extends UnitProgressRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async listForUser(userId: string): Promise<UserUnitProgress[]> {
    const rows = await this.drizzle.db
      .select()
      .from(userUnitProgress)
      .where(eq(userUnitProgress.userId, userId));
    return rows.map((row) => this.toEntity(row));
  }

  async find(userId: string, unitId: string): Promise<UserUnitProgress | null> {
    const row = await this.drizzle.db.query.userUnitProgress.findFirst({
      where: and(
        eq(userUnitProgress.userId, userId),
        eq(userUnitProgress.unitId, unitId),
      ),
    });
    return row ? this.toEntity(row) : null;
  }

  async upsertUnlocked(
    userId: string,
    unitId: string,
  ): Promise<UserUnitProgress> {
    const now = new Date();
    const [row] = await this.drizzle.db
      .insert(userUnitProgress)
      .values({ userId, unitId, unlockedAt: now })
      .onConflictDoNothing({
        target: [userUnitProgress.userId, userUnitProgress.unitId],
      })
      .returning();
    if (row) return this.toEntity(row);
    const existing = await this.find(userId, unitId);
    if (!existing) {
      throw new Error('failed_to_upsert_progress');
    }
    return existing;
  }

  async markPassed(userId: string, unitId: string): Promise<void> {
    const now = new Date();
    await this.drizzle.db
      .insert(userUnitProgress)
      .values({ userId, unitId, unlockedAt: now, passedAt: now })
      .onConflictDoUpdate({
        target: [userUnitProgress.userId, userUnitProgress.unitId],
        set: { passedAt: now },
      });
  }

  private toEntity(row: ProgressRow): UserUnitProgress {
    return {
      userId: row.userId,
      unitId: row.unitId,
      unlockedAt: row.unlockedAt,
      passedAt: row.passedAt,
    };
  }
}
