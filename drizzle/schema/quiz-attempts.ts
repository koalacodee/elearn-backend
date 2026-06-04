import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';
import { quizzes } from './quizzes';
import { users } from './users';

export const quizAttemptStatus = pgEnum('quiz_attempt_status', [
  'in_progress',
  'submitted',
  'expired',
]);

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    scoreEarned: integer('score_earned'),
    scoreTotal: integer('score_total'),
    percentage: integer('percentage'),
    passed: boolean('passed'),
    status: quizAttemptStatus('status').notNull().default('in_progress'),
  },
  (table) => [index('quiz_attempts_user_quiz_idx').on(table.userId, table.quizId)],
);
