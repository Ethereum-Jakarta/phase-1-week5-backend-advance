// src/models/schema.ts
import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'LOAN_DUE', 'BOOK_RETURNED', etc.
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // 'PENDING', 'SENT', 'FAILED'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: 'notification_service'
  }
})