import { pgTable, varchar, timestamp, uuid, integer, unique } from 'drizzle-orm/pg-core';

export const seats  = pgTable('seats', {
  id: uuid('id').defaultRandom().primaryKey(),
  movieScheduleId: varchar('movieScheduleId').notNull(),
  seatCode: varchar('seat_code', { length: 3 }).notNull(),  // Hanya A1-G15 yang valid
  status: varchar().default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    uniqueSeat: unique().on(table.movieScheduleId, table.seatCode) // ✅ UNIQUE constraint
  };
});

export type Seats  = typeof seats .$inferSelect;