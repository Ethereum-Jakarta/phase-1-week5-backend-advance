import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authController } from "./modules/auth";
import { conversationController } from "./modules/conversation";
import { errorGlobalPlugin } from "./plugin/error.plugin";
import { wsApp } from "./modules/websocket";
import { messageController } from "./modules/messages";
import { userController } from "./modules/users";

const app = new Elysia({ prefix: "v1" })
  .use(
    cors({
      origin: "http://localhost:3001",
      credentials: true,
    }),
  )
  .use(errorGlobalPlugin)
  .get("/", () => "hello")
  .use(authController)
  .use(userController)
  .use(conversationController)
  .use(messageController)
  .use(wsApp)
  .listen(5000);

console.log(`🚀 Server running at http://localhost:5000/v1`);
console.log(`📚 Swagger documentation at http://localhost:5000/v1/swagger`);
console.log(`🔌 WebSocket endpoint at ws://localhost:5000/v1/ws`);

export default app;
