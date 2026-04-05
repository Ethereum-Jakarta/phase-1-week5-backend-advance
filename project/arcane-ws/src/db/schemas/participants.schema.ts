import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { conversationsTable } from "./conversations.schema";
import { usersTable } from "./user.schema";

export const participantsTable = pgTable("participants", {
  conversationId: uuid()
    .notNull()
    .references(() => conversationsTable.id),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
});

export const participantsRelations = relations(
  participantsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [participantsTable.userId],
      references: [usersTable.id],
    }),
    conversation: one(conversationsTable, {
      fields: [participantsTable.conversationId],
      references: [conversationsTable.id],
    }),
  }),
);
