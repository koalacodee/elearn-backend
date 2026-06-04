import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { quizzes } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { Quiz } from '../domain/quiz.entity';
import {
  CreateQuizInput,
  QuizRepository,
  UpdateQuizInput,
} from '../domain/repositories/quiz.repository';

type QuizRow = typeof quizzes.$inferSelect;

@Injectable()
export class DrizzleQuizRepository extends QuizRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateQuizInput): Promise<Quiz> {
    const [row] = await this.drizzle.db
      .insert(quizzes)
      .values({
        unitId: input.unitId,
        title: input.title,
        description: input.description ?? null,
        isMandatory: input.isMandatory,
        timeLimitSec: input.timeLimitSec,
        passThresholdPct: input.passThresholdPct ?? 60,
      })
      .returning();
    return this.toEntity(row);
  }

  async update(id: string, input: UpdateQuizInput): Promise<Quiz | null> {
    const updates: Partial<QuizRow> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined)
      updates.description = input.description;
    if (input.isMandatory !== undefined)
      updates.isMandatory = input.isMandatory;
    if (input.timeLimitSec !== undefined)
      updates.timeLimitSec = input.timeLimitSec;
    if (input.passThresholdPct !== undefined)
      updates.passThresholdPct = input.passThresholdPct;
    if (Object.keys(updates).length === 0) return this.findById(id);
    const [row] = await this.drizzle.db
      .update(quizzes)
      .set(updates)
      .where(eq(quizzes.id, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.drizzle.db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning({ id: quizzes.id });
    return deleted.length > 0;
  }

  async findById(id: string): Promise<Quiz | null> {
    const row = await this.drizzle.db.query.quizzes.findFirst({
      where: eq(quizzes.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async listByUnit(unitId: string): Promise<Quiz[]> {
    const rows = await this.drizzle.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.unitId, unitId))
      .orderBy(asc(quizzes.createdAt));
    return rows.map((r) => this.toEntity(r));
  }

  async findMandatoryForUnit(unitId: string): Promise<Quiz | null> {
    const row = await this.drizzle.db.query.quizzes.findFirst({
      where: and(eq(quizzes.unitId, unitId), eq(quizzes.isMandatory, true)),
    });
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: QuizRow): Quiz {
    return {
      id: row.id,
      unitId: row.unitId,
      title: row.title,
      description: row.description,
      isMandatory: row.isMandatory,
      timeLimitSec: row.timeLimitSec,
      passThresholdPct: row.passThresholdPct,
      createdAt: row.createdAt,
    };
  }
}
