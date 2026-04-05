import Elysia from "elysia";
import { db } from "../../db";
import { AuthServices } from "./services";
import {
  authCore,
  verifyRefresh,
  verifyAccess,
} from "../../plugin/auth.plugin";
import { registerModel, loginModel } from "./model";

const auth = new AuthServices(db);

export const authController = new Elysia({ prefix: "/auth" })
  .use(authCore)
  .post(
    "/register",
    async ({ body, set }) => {
      const users = await auth.register(body);
      set.status = 201;
      return { succes: true, message: "User Created", data: users };
    },
    {
      body: registerModel.reqBody,
      response: registerModel.resBody,
    },
  )
  .post(
    "/login",
    async ({ body, accessJwt, refreshJwt, set, cookie: { refresh } }) => {
      const { accessToken, refreshToken } = await auth.login(
        body,
        accessJwt,
        refreshJwt,
      );

      refresh?.set({
        value: refreshToken,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 3 * 86400,
      });
      set.status = 200;
      return { succes: true, data: { token: accessToken } };
    },
    {
      body: loginModel.reqBody,
    },
  )
  .group("/session", (app) =>
    app
      .use(verifyRefresh)
      .post("/logout", async ({ refreshUser, set, cookie: { refresh } }) => {
        await auth.deleteSession(refreshUser.id);

        refresh?.set({
          value: " ",
          maxAge: 0,
          path: "/",
        });

        set.status = 200;
        return { succes: true, data: null };
      })
      .post("/refresh", async ({ refreshUser, accessJwt, set }) => {
        const { accessToken } = await auth.newRefreshToken(
          refreshUser,
          accessJwt,
        );
        set.status = 200;
        return { succes: true, data: { token: accessToken } };
      }),
  )
  .use(verifyAccess)
  .get("/me", ({ user }) => {
    return { succes: true, data: user };
  });
