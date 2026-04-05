import { t } from "elysia";
import { createInsertSchema } from "drizzle-typebox";
import { usersTable } from "../../db/schemas";
import type { UnwrapSchema } from "elysia";

export class RegisterResponseDto<T extends RegisterType["resBody"]["data"]> {
  id: string | undefined;
  username: string;
  email: string;
  createdAt: Date | null | undefined;
  constructor(data: T) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.createdAt = data.createdAt;
  }
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  constructor(data: { accessToken: string; refreshToken: string }) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }
}

export const baseUser = createInsertSchema(usersTable, {
  email: t.String({ format: "email", minLength: 5, maxLength: 255 }),
  username: t.String({ minLength: 3, maxLength: 10 }),
  password: t.String({ minLength: 6, maxLength: 100 }),
});

export const registerModel = {
  reqBody: t.Pick(baseUser, ["username", "password", "email"]),
  resBody: t.Object({
    succes: t.Boolean(),
    message: t.String(),
    data: t.Pick(baseUser, ["id", "username", "email", "createdAt"]),
  }),
  resInvalid: t.Literal("invalid type field input"),
};

export type RegisterType = {
  [K in keyof typeof registerModel]: UnwrapSchema<(typeof registerModel)[K]>;
};

export const loginModel = {
  reqBody: t.Pick(baseUser, ["email", "password"]),
  resBody: t.Pick(baseUser, ["id", "username", "email"]),
  resToken: t.String({ minLength: 10 }),
  resInvalid: t.Literal("invalid type field input"),
};

export type LoginType = {
  [K in keyof typeof loginModel]: UnwrapSchema<(typeof loginModel)[K]>;
};

export interface JwtSigner {
  sign(payload: object): Promise<string>;
}
