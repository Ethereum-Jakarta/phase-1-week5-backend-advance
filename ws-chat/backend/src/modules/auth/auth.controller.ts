import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { AuthPayloadSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export const authController = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "rahasia-cadangan",
    }),
  )
  // Endpoint: POST /auth/register
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await AuthService.register(body);
        set.status = 201;
        return {
          status: "success",
          message: "Registrasi berhasil",
          data: user,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          status: "error",
          message: error.message,
        };
      }
    },
    {
      body: AuthPayloadSchema,
    },
  )
  // Endpoint: POST /auth/login
  .post(
    "/login",
    async ({ body, set, jwt }) => {
      const user = await AuthService.login(body);

      if (!user) {
        set.status = 401;
        return {
          status: "error",
          message: "Username atau password salah",
        };
      }

      const token = await jwt.sign({
        id: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      });

      return {
        status: "success",
        message: "Login berhasil",
        token: token,
        data: user,
      };
    },
    {
      body: AuthPayloadSchema,
    },
  );
