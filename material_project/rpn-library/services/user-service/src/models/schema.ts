// src/models/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

// Define schema name
const schema = 'public'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    ...table,
    schema: schema
  }
})