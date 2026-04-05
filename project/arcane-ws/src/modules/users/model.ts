import { t } from "elysia";
import { baseUser } from "../auth/model";
import type { UnwrapSchema } from "elysia";

export const updateUser = {
  reqBody: t.Pick(baseUser, ["username", "email"]),
};

export type updateUserType = {
  [K in keyof typeof updateUser]: UnwrapSchema<(typeof updateUser)[K]>;
};
