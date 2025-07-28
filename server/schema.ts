import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const flashcardSets = pgTable('flashcard_sets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  flashcards: jsonb('flashcards').notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
