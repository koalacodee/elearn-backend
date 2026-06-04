import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'helpers/uuidv7';
import { units } from './units';

export const words = pgTable(
  'words',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    word: text('word').notNull(),
    arabicTranslation: text('arabic_translation').notNull(),
    sentence: text('sentence').notNull(),
    arabicSentence: text('arabic_sentence').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('words_unit_id_idx').on(table.unitId)],
);
