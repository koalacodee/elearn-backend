import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { words } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { Word } from '../domain/word.entity';
import {
  CreateWordInput,
  UpdateWordInput,
  WordRepository,
} from '../domain/repositories/word.repository';

type WordRow = typeof words.$inferSelect;

@Injectable()
export class DrizzleWordRepository extends WordRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateWordInput): Promise<Word> {
    const [row] = await this.drizzle.db.insert(words).values(input).returning();
    return this.toEntity(row);
  }

  async createMany(inputs: CreateWordInput[]): Promise<Word[]> {
    if (inputs.length === 0) return [];
    const rows = await this.drizzle.db.insert(words).values(inputs).returning();
    return rows.map((r) => this.toEntity(r));
  }

  async update(id: string, input: UpdateWordInput): Promise<Word | null> {
    if (Object.keys(input).length === 0) {
      return this.findById(id);
    }
    const [row] = await this.drizzle.db
      .update(words)
      .set(input)
      .where(eq(words.id, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.drizzle.db
      .delete(words)
      .where(eq(words.id, id))
      .returning({ id: words.id });
    return deleted.length > 0;
  }

  async findById(id: string): Promise<Word | null> {
    const row = await this.drizzle.db.query.words.findFirst({
      where: eq(words.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async listByUnit(unitId: string): Promise<Word[]> {
    const rows = await this.drizzle.db
      .select()
      .from(words)
      .where(eq(words.unitId, unitId))
      .orderBy(asc(words.createdAt));
    return rows.map((r) => this.toEntity(r));
  }

  private toEntity(row: WordRow): Word {
    return {
      id: row.id,
      unitId: row.unitId,
      word: row.word,
      arabicTranslation: row.arabicTranslation,
      sentence: row.sentence,
      arabicSentence: row.arabicSentence,
      createdAt: row.createdAt,
    };
  }
}
