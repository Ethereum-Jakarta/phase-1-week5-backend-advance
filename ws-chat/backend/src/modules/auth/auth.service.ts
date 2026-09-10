import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import type { AuthPayload } from "./auth.schema";

export class AuthService {
  static async register(data: AuthPayload) {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existingUsers.length > 0) {
      throw new Error("Username sudah digunakan. Silakan pilih yang lain.");
    }

    const hashedPassword = await Bun.password.hash(data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: data.username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      });

    return newUser;
  }

  static async login(data: AuthPayload) {
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    const user = foundUsers[0];
    if (!user) throw new Error("Username atau password salah");

    // Verifikasi password hash
    const isMatch = await Bun.password.verify(data.password, user.password);
    if (!isMatch) throw new Error("Username atau password salah");

    return user;
  }
}
