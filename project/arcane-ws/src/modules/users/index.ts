import Elysia from "elysia";
import { updateUser } from "./model";
import { verifyAccess } from "../../plugin/auth.plugin";
import { UserServices } from "./services";
import { db } from "../../db";

const userServices = new UserServices(db);

export const userController = new Elysia()
  .use(verifyAccess)
  .get("/users", async ({ user: { id }, set }) => {
    const user = await userServices.getUserByUserId(id);
    set.status = 200;
    return {
      succes: true,
      message: "User Retrieved",
      data: user,
    };
  })
  .patch(
    "/users",
    async ({ body, user: { id }, set }) => {
      const user = await userServices.updateUser(body, id);
      set.status = 201;
      return {
        succes: true,
        message: "Update user success",
        data: user,
      };
    },
    { body: updateUser.reqBody },
  )
  .delete("/users", async ({ user: { id } }) => {
    await userServices.deleteUser(id);
    return {
      succes: true,
      message: "Delete user success",
    };
  });
