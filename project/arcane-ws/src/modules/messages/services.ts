import type { drizzleDB } from "../../db";
import { messagesTable } from "../../db/schemas";
import { eq } from "drizzle-orm";
import { conversationsTable } from "../../db/schemas";

type storeMessageRequest = {
  content: string;
  status: string;
  conversationId: string;
  senderId: string;
};

export class MessagesServices {
  constructor(private db: drizzleDB | any) {}

  public async getMessages(conversationId: string) {
    const message = await this.db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId));

    return message;
  }

  public async storeMessage(request: storeMessageRequest) {
    const message = await this.db
      .insert(messagesTable)
      .values(request)
      .returning();

    await this.db
      .update(conversationsTable)
      .set({
        lastMessage: request.content,
        lastMessageSent: new Date(),
      })
      .where(eq(conversationsTable.id, request.conversationId));

    return message;
  }

  public async editMessages(message: { content: string }, messageId: string) {
    const [updatedMessage] = await this.db
      .update(messagesTable)
      .set(message)
      .where(eq(messagesTable.id, messageId))
      .returning();

    return updatedMessage;
  }

  public async deleteMessage(messageId: string) {
    const [updatedMessage] = await this.db
      .update(messagesTable)
      .set({ content: " ", status: "deleted" })
      .where(eq(messagesTable.id, messageId))
      .returning();

    return updatedMessage;
  }
}
