import { t, Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { ResponseError } from "../errors/customError";
import { AuthServices } from "../modules/auth/services";
import { db } from "../db";

const Auth = new AuthServices(db);

export const authCore = new Elysia({ name: "auth.core" })
  .use(
    jwt({
      name: "accessJwt",
      secret: process.env.ACCESS_SECRET!,
      exp: process.env.ACCESS_DURATION!,
      schema: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    }),
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: process.env.REFRESH_SECRET!,
      exp: process.env.REFRESH_DURATION!,
      schema: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    }),
  );

export const verifyAccess = new Elysia()
  .use(authCore)
  .derive({ as: "scoped" }, async ({ headers, accessJwt }) => {
    const auth = headers.authorization;

    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      throw new ResponseError(401, "Access token is required");
    }

    const payload = await accessJwt.verify(token);

    if (!payload) {
      throw new ResponseError(401, "Invalid access token");
    }

    return {
      user: { id: payload.id, username: payload.username },
    };
  });
// WARNING: SECURITY ISSUE IMPLEMENT CHECK TOKEN TO DATABASE!
export const verifyRefresh = new Elysia()
  .use(authCore)
  .derive({ as: "scoped" }, async ({ cookie: { refresh }, refreshJwt }) => {
    const token = refresh?.value as string;

    if (!token) {
      throw new ResponseError(401, "Refresh token is required");
    }

    const payload = await refreshJwt.verify(token);

    if (!payload) {
      throw new ResponseError(401, "Invalid refresh token");
    }

    await Auth.ensureRefreshTokenIsExist(token);

    return {
      refreshUser: { id: payload.id, username: payload.username },
    };
  });
