import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';

export const units = pgTable('units', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
