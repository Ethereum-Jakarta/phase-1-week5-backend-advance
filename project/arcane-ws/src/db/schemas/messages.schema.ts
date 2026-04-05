import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { conversationsTable } from "./conversations.schema";
import { relations } from "drizzle-orm";

export const statusEnum = pgEnum("status", [
  "sent",
  "read",
  "delivered",
  "edited",
  "deleted",
]);

export const messagesTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  content: text(),
  status: statusEnum(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
  conversationId: uuid()
    .notNull()
    .references(() => conversationsTable.id),
  senderId: uuid()
    .notNull()
    .references(() => usersTable.id),
});

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  conversation: one(conversationsTable, {
    fields: [messagesTable.conversationId],
    references: [conversationsTable.id],
  }),
  user: one(usersTable, {
    fields: [messagesTable.senderId],
    references: [usersTable.id],
  }),
}));
