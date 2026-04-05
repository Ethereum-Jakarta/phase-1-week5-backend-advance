import { eq } from "drizzle-orm";
import type { drizzleDB } from "../../db";
import type { updateUserType } from "./model";
import { usersTable } from "../../db/schemas";

export class UserServices {
  constructor(public db: drizzleDB) {}
  public async getUserByUserId(userId: string) {
    const user = await this.db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    return user;
  }
  public async updateUser(request: updateUserType["reqBody"], userId: string) {
    const [user] = await this.db
      .update(usersTable)
      .set(request)
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }
  public async deleteUser(userId: string) {
    await this.db.delete(usersTable).where(eq(usersTable.id, userId));
  }
}
