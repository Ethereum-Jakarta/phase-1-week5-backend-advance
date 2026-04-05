import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages.schema";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 10 }).notNull(),
  password: varchar().notNull(),
  email: varchar().unique().notNull(),
  lastSeen: timestamp(),
  token: varchar().unique(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  messages: many(messagesTable),
}));
