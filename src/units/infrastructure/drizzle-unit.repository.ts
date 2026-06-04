import { Injectable } from '@nestjs/common';
import { asc, eq, gt } from 'drizzle-orm';
import { units } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { Unit } from '../domain/unit.entity';
import {
  CreateUnitInput,
  UnitRepository,
  UpdateUnitInput,
} from '../domain/repositories/unit.repository';

type UnitRow = typeof units.$inferSelect;

@Injectable()
export class DrizzleUnitRepository extends UnitRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateUnitInput): Promise<Unit> {
    const [row] = await this.drizzle.db
      .insert(units)
      .values({
        title: input.title,
        description: input.description ?? null,
        orderIndex: input.orderIndex,
      })
      .returning();
    return this.toEntity(row);
  }

  async update(id: string, input: UpdateUnitInput): Promise<Unit | null> {
    const updates: Partial<UnitRow> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined)
      updates.description = input.description;
    if (input.orderIndex !== undefined) updates.orderIndex = input.orderIndex;
    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }
    const [row] = await this.drizzle.db
      .update(units)
      .set(updates)
      .where(eq(units.id, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.drizzle.db
      .delete(units)
      .where(eq(units.id, id))
      .returning({ id: units.id });
    return deleted.length > 0;
  }

  async findById(id: string): Promise<Unit | null> {
    const row = await this.drizzle.db.query.units.findFirst({
      where: eq(units.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async listOrdered(): Promise<Unit[]> {
    const rows = await this.drizzle.db
      .select()
      .from(units)
      .orderBy(asc(units.orderIndex));
    return rows.map((row) => this.toEntity(row));
  }

  async findNextByOrder(orderIndex: number): Promise<Unit | null> {
    const row = await this.drizzle.db.query.units.findFirst({
      where: gt(units.orderIndex, orderIndex),
      orderBy: asc(units.orderIndex),
    });
    return row ? this.toEntity(row) : null;
  }

  async maxOrderIndex(): Promise<number | null> {
    const row = await this.drizzle.db.query.units.findFirst({
      orderBy: (u, { desc }) => desc(u.orderIndex),
    });
    return row?.orderIndex ?? null;
  }

  private toEntity(row: UnitRow): Unit {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      orderIndex: row.orderIndex,
      createdAt: row.createdAt,
    };
  }
}
