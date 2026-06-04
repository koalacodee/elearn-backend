import { index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';
import { quizzes } from './quizzes';

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    question: text('question').notNull(),
    choices: jsonb('choices').$type<string[]>().notNull(),
    correctChoice: integer('correct_choice').notNull(),
    grade: integer('grade').notNull().default(1),
    orderIndex: integer('order_index').notNull(),
  },
  (table) => [index('quiz_questions_quiz_id_idx').on(table.quizId)],
);
