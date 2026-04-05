import { alias } from "drizzle-orm/pg-core";
import type { drizzleDB } from "../../db";
import { conversationsTable, usersTable } from "../../db/schemas";
import { participantsTable } from "../../db/schemas";
import { messagesTable } from "../../db/schemas";
import { eq, and, exists, ne, desc } from "drizzle-orm";

export class ConversationServices {
  constructor(private db: drizzleDB | any) {}

  private async checkIfDuplicatePrivateConversation(
    userId: string,
    partnerId: string,
  ) {
    const existingChat = await this.db
      .select({ id: conversationsTable.id })
      .from(conversationsTable)
      .innerJoin(
        participantsTable,
        eq(conversationsTable.id, participantsTable.conversationId),
      )
      .where(
        and(
          eq(conversationsTable.type, "private"),
          eq(participantsTable.userId, partnerId),
          exists(
            this.db
              .select()
              .from(participantsTable)
              .where(
                and(
                  eq(participantsTable.conversationId, conversationsTable.id),
                  eq(participantsTable.userId, userId),
                ),
              ),
          ),
        ),
      )
      .limit(1);

    if (existingChat.length > 0) {
      return existingChat[0].id;
    } else {
      return false;
    }
  }

  public async getConversationList(userId: string) {
    const partnerParticipants = alias(participantsTable, "partnerParticipants");
    const conversationList = await this.db
      .select({
        username: usersTable.username,
        lastSeen: usersTable.lastSeen,
        lastMessage: conversationsTable.lastMessage,
        lastMessageSent: conversationsTable.lastMessageSent,
        conversationId: conversationsTable.id,
      })
      .from(conversationsTable)
      .innerJoin(
        participantsTable,
        eq(conversationsTable.id, participantsTable.conversationId),
      )
      .innerJoin(
        partnerParticipants,
        and(
          eq(conversationsTable.id, partnerParticipants.conversationId),
          ne(partnerParticipants.userId, userId),
        ),
      )
      .innerJoin(usersTable, eq(partnerParticipants.userId, usersTable.id))
      .where(eq(participantsTable.userId, userId))
      .orderBy(desc(conversationsTable.lastMessageSent));

    return conversationList;
  }

  public async newPrivateConversation(
    userId: string,
    partnerId: string,
    message: string,
  ) {
    const conversationId = await this.checkIfDuplicatePrivateConversation(
      userId,
      partnerId,
    );

    let finalConversationId: string;

    if (conversationId) {
      const [msg] = await this.db
        .insert(messagesTable)
        .values({
          conversationId,
          senderId: userId,
          content: message,
          status: "sent",
        })
        .returning();

      await this.db
        .update(conversationsTable)
        .set({
          lastMessage: message,
          lastMessageSent: new Date(),
        })
        .where(eq(conversationsTable.id, conversationId));

      finalConversationId = conversationId;
    } else {
      const result = await this.db.transaction(async (tx: any) => {
        const [conv] = await tx
          .insert(conversationsTable)
          .values({
            type: "private",
            lastMessage: message,
            lastMessageSent: new Date(),
          })
          .returning();

        await tx.insert(participantsTable).values([
          { conversationId: conv.id, userId },
          { conversationId: conv.id, userId: partnerId },
        ]);

        await tx.insert(messagesTable).values({
          conversationId: conv.id,
          senderId: userId,
          content: message,
          status: "sent",
        });

        return conv.id;
      });

      finalConversationId = result;
    }

    // 🔥 ambil ulang data dengan shape lengkap
    const [conversation] = await this.getConversationList(userId).then((list) =>
      list.filter((c: any) => c.conversationId === finalConversationId),
    );

    return conversation;
  }

  public async newGroupConversation() {}
}
