import {
  pgTable,
  varchar,
  text,
  uuid,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { messagesTable } from "./messages.schema";
import { relations } from "drizzle-orm";
import { participantsTable } from "./participants.schema";

export const typeEnum = pgEnum("type", ["private", "group"]);

export const conversationsTable = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar(),
  type: typeEnum(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  lastMessage: text(),
  lastMessageSent: timestamp({ withTimezone: true }),
});

export const conversationsRelations = relations(
  conversationsTable,
  ({ many }) => ({
    participants: many(participantsTable),
    messages: many(messagesTable),
  }),
);
