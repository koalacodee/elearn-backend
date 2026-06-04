import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { quizQuestions } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { QuizQuestion } from '../domain/quiz-question.entity';
import {
  CreateQuestionInput,
  QuestionRepository,
  UpdateQuestionInput,
} from '../domain/repositories/question.repository';

type QuestionRow = typeof quizQuestions.$inferSelect;

@Injectable()
export class DrizzleQuestionRepository extends QuestionRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateQuestionInput): Promise<QuizQuestion> {
    const [row] = await this.drizzle.db
      .insert(quizQuestions)
      .values(input)
      .returning();
    return this.toEntity(row);
  }

  async createMany(inputs: CreateQuestionInput[]): Promise<QuizQuestion[]> {
    if (inputs.length === 0) return [];
    const rows = await this.drizzle.db
      .insert(quizQuestions)
      .values(inputs)
      .returning();
    return rows.map((r) => this.toEntity(r));
  }

  async update(
    id: string,
    input: UpdateQuestionInput,
  ): Promise<QuizQuestion | null> {
    if (Object.keys(input).length === 0) return this.findById(id);
    const [row] = await this.drizzle.db
      .update(quizQuestions)
      .set(input)
      .where(eq(quizQuestions.id, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.drizzle.db
      .delete(quizQuestions)
      .where(eq(quizQuestions.id, id))
      .returning({ id: quizQuestions.id });
    return deleted.length > 0;
  }

  async findById(id: string): Promise<QuizQuestion | null> {
    const row = await this.drizzle.db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async listByQuiz(quizId: string): Promise<QuizQuestion[]> {
    const rows = await this.drizzle.db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.orderIndex));
    return rows.map((r) => this.toEntity(r));
  }

  async maxOrderIndex(quizId: string): Promise<number | null> {
    const row = await this.drizzle.db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.quizId, quizId),
      orderBy: (q, { desc }) => desc(q.orderIndex),
    });
    return row?.orderIndex ?? null;
  }

  private toEntity(row: QuestionRow): QuizQuestion {
    return {
      id: row.id,
      quizId: row.quizId,
      question: row.question,
      choices: row.choices,
      correctChoice: row.correctChoice,
      grade: row.grade,
      orderIndex: row.orderIndex,
    };
  }
}
