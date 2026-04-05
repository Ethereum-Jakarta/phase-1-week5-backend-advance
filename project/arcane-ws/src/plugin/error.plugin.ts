import Elysia from "elysia";
import { ResponseError } from "../errors/customError";

export const errorGlobalPlugin = new Elysia()
  .error({ myError: ResponseError })
  .onError({ as: "global" }, ({ code, error, set }) => {
    switch (code) {
      case "myError":
        set.status = error.statusCode;
        return {
          success: false,
          message: error.message,
          errors: error.details,
        };

      case "VALIDATION":
        return {
          success: false,
          message: "Validation Error",
          errors: error.all.map((e) => ({
            field: e.path.slice(1),
            detail: e.summary,
          })),
        };

      case "NOT_FOUND":
        set.status = error.status;
        return { success: false, message: error.message };

      default:
        set.status = 500;
        return { success: false, message: "Internal Server Error" };
    }
  });
