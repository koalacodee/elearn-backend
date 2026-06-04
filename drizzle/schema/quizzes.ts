import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';
import { units } from './units';

export const quizzes = pgTable(
  'quizzes',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    isMandatory: boolean('is_mandatory').notNull().default(false),
    timeLimitSec: integer('time_limit_sec').notNull(),
    passThresholdPct: integer('pass_threshold_pct').notNull().default(60),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('quizzes_mandatory_per_unit_idx')
      .on(table.unitId)
      .where(sql`${table.isMandatory} = true`),
  ],
);
