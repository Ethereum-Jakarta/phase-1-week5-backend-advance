import { pgTable, varchar, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

// Theaters Schema
export const theaters = pgTable('theaters', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  totalScreens: integer('total_screens').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Theaters = typeof theaters.$inferSelect;