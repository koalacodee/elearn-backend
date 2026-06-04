import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';

export const userRole = pgEnum('user_role', ['STUDENT', 'ADMIN']);

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('STUDENT'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
