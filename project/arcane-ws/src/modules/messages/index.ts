import Elysia, { t } from "elysia";
import { verifyAccess } from "../../plugin/auth.plugin";
import { MessagesServices } from "./services";
import { db } from "../../db";

const messagesServices = new MessagesServices(db);

export const messageController = new Elysia()
  .use(verifyAccess)
  .get(
    "/messages/:conversationId",
    async ({ set, params: { conversationId } }) => {
      const messagesList = await messagesServices.getMessages(conversationId);
      set.status = 200;
      return {
        succes: true,
        message: "Messages Retrieved",
        data: messagesList,
      };
    },
  )
  .post(
    "/messages/",
    async ({ set, body }) => {
      const message = await messagesServices.storeMessage(body);
      set.status = 201;
      return {
        succes: true,
        message: "Sent messages success",
        data: message,
      };
    },
    {
      body: t.Object({
        content: t.String(),
        status: t.UnionEnum(["sent", "read", "delivered", "edited", "deleted"]),
        conversationId: t.String(),
        senderId: t.String(),
      }),
    },
  )
  .patch(
    "/messages/:messageId",
    async ({ set, params: { messageId }, body }) => {
      const message = await messagesServices.editMessages(body, messageId);
      set.status = 200;
      return {
        succes: true,
        message: "Messages update success",
        data: message,
      };
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    },
  )
  .delete("/messages/:messageId", async ({ set, params: { messageId } }) => {
    const message = await messagesServices.deleteMessage(messageId);
    set.status = 200;
    return {
      succes: true,
      message: "Messages update success",
      data: message,
    };
  });
