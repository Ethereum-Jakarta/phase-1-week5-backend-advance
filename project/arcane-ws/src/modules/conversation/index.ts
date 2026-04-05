import Elysia from "elysia";
import { db } from "../../db";
import { ConversationServices } from "./services";
import { verifyAccess } from "../../plugin/auth.plugin";
import { t } from "elysia";

const conversation = new ConversationServices(db);

export const conversationController = new Elysia()
  .use(verifyAccess)
  .get("/conversations", async ({ user, set }) => {
    const conversationList = await conversation.getConversationList(user.id);
    set.status = 200;
    return {
      succes: true,
      message: "Conversation Retrieved",
      data: conversationList,
    };
  })
  .post(
    "/conversations/private",
    async ({ body, set, user }) => {
      const message = await conversation.newPrivateConversation(
        user.id,
        body.partnerId,
        body.message,
      );
      set.status = 201;
      return { succes: true, message: "Conversation Created", data: message };
    },
    {
      body: t.Object({
        partnerId: t.String(),
        message: t.String(),
      }),
    },
  )
  .post("/conversations/group", async () => {}, {
    body: t.Object({
      name: t.String(),
      message: t.String(),
    }),
  });
