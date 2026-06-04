import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { quizAttempts } from './quiz-attempts';
import { quizQuestions } from './quiz-questions';

export const quizAttemptAnswers = pgTable(
  'quiz_attempt_answers',
  {
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => quizAttempts.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => quizQuestions.id, { onDelete: 'cascade' }),
    chosenIndex: integer('chosen_index'),
  },
  (table) => [
    primaryKey({ columns: [table.attemptId, table.questionId] }),
  ],
);
