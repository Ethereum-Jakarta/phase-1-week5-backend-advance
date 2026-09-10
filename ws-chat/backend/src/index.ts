import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { authController } from "./modules/auth";
// import { messagesWS } from "./modules/messages/messages.ws";

const app = new Elysia()
  .use(cors())
  .group("/api/v1", (app) => app.use(authController).use(authController))
  // .use(messagesWS)
  .listen(3000);

console.log(
  `🚀 Server berjalan di http://${app.server?.hostname}:${app.server?.port}`,
);

