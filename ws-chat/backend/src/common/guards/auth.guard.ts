import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authGuard = new Elysia({ name: "auth.guard" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "rahasia",
    }),
  )
  .derive(async ({ jwt, headers }) => {
    const authorization = headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    let user = null;

    if (token) {
      const payload = await jwt.verify(token);
      if (payload) {
        user = payload as { id: number; username: string };
      }
    }

    return { user }; 
  })

  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        message:
          "Unauthorized: Akses ditolak. Token tidak valid.",
      };
    }
  });
