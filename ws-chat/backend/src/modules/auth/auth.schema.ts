import { t } from "elysia";


export const AuthPayloadSchema = t.Object({
  username: t.String({
    minLength: 3,
    error: "Username minimal 3 karakter",
  }),
  password: t.String({
    minLength: 6,
    error: "Password minimal 6 karakter",
  }),
});

export type AuthPayload = typeof AuthPayloadSchema.static;
