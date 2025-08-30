import { pgTable, varchar, timestamp, uuid, unique, decimal } from 'drizzle-orm/pg-core';

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id').notNull(),
  scheduleId: varchar('schedule_id').notNull(),
  seatId: varchar('seat_id').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
}, (table) => {
  return {
    uniqueSeat: unique().on(table.userId, table.scheduleId, table.seatId) // ✅ UNIQUE constraint
  };
});
export type Tickets = typeof tickets.$inferSelect;