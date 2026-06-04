import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { units } from './units';
import { users } from './users';

export const userUnitProgress = pgTable(
  'user_unit_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull(),
    passedAt: timestamp('passed_at', { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.unitId] })],
);
