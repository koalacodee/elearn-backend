import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { quizAttempts, quizAttemptAnswers } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { QuizAttempt, QuizAttemptAnswer } from '../domain/quiz-attempt.entity';
import {
  AttemptRepository,
  CreateAttemptInput,
  FinalizeAttemptInput,
} from '../domain/repositories/attempt.repository';

type AttemptRow = typeof quizAttempts.$inferSelect;
type AnswerRow = typeof quizAttemptAnswers.$inferSelect;

@Injectable()
export class DrizzleAttemptRepository extends AttemptRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateAttemptInput): Promise<QuizAttempt> {
    const [row] = await this.drizzle.db
      .insert(quizAttempts)
      .values({
        quizId: input.quizId,
        userId: input.userId,
        startedAt: input.startedAt,
        deadlineAt: input.deadlineAt,
        status: 'in_progress',
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    const row = await this.drizzle.db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async findOpenForUser(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null> {
    const row = await this.drizzle.db.query.quizAttempts.findFirst({
      where: and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.status, 'in_progress'),
      ),
      orderBy: desc(quizAttempts.startedAt),
    });
    return row ? this.toEntity(row) : null;
  }

  async listForUserAndQuiz(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    const rows = await this.drizzle.db
      .select()
      .from(quizAttempts)
      .where(
        and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)),
      )
      .orderBy(desc(quizAttempts.startedAt));
    return rows.map((r) => this.toEntity(r));
  }

  async findBestForUserAndQuiz(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null> {
    const rows = await this.drizzle.db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.quizId, quizId),
          eq(quizAttempts.status, 'submitted'),
        ),
      );
    if (rows.length === 0) return null;
    let best = rows[0];
    for (const r of rows) {
      if ((r.percentage ?? 0) > (best.percentage ?? 0)) best = r;
    }
    return this.toEntity(best);
  }

  async finalize(input: FinalizeAttemptInput): Promise<QuizAttempt> {
    const [row] = await this.drizzle.db
      .update(quizAttempts)
      .set({
        submittedAt: input.submittedAt,
        scoreEarned: input.scoreEarned,
        scoreTotal: input.scoreTotal,
        percentage: input.percentage,
        passed: input.passed,
        status: input.status,
      })
      .where(eq(quizAttempts.id, input.id))
      .returning();

    if (input.answers.length > 0) {
      await this.drizzle.db
        .delete(quizAttemptAnswers)
        .where(eq(quizAttemptAnswers.attemptId, input.id));
      await this.drizzle.db.insert(quizAttemptAnswers).values(
        input.answers.map((a) => ({
          attemptId: input.id,
          questionId: a.questionId,
          chosenIndex: a.chosenIndex,
        })),
      );
    }

    return this.toEntity(row);
  }

  async listAnswers(attemptId: string): Promise<QuizAttemptAnswer[]> {
    const rows = await this.drizzle.db
      .select()
      .from(quizAttemptAnswers)
      .where(eq(quizAttemptAnswers.attemptId, attemptId));
    return rows.map((r) => this.toAnswer(r));
  }

  private toEntity(row: AttemptRow): QuizAttempt {
    return {
      id: row.id,
      quizId: row.quizId,
      userId: row.userId,
      startedAt: row.startedAt,
      deadlineAt: row.deadlineAt,
      submittedAt: row.submittedAt,
      scoreEarned: row.scoreEarned,
      scoreTotal: row.scoreTotal,
      percentage: row.percentage,
      passed: row.passed,
      status: row.status,
    };
  }

  private toAnswer(row: AnswerRow): QuizAttemptAnswer {
    return {
      attemptId: row.attemptId,
      questionId: row.questionId,
      chosenIndex: row.chosenIndex,
    };
  }
}
