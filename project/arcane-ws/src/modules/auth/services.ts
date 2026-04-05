import { eq } from "drizzle-orm";
import type { drizzleDB } from "../../db";
import { usersTable } from "../../db/schemas";
import { ResponseError } from "../../errors/customError";
import {
  type RegisterType,
  type LoginType,
  type JwtSigner,
  RegisterResponseDto,
  LoginResponseDto,
} from "./model";

export class AuthServices {
  constructor(private db: drizzleDB | any) {}

  private async validateCredential(request: LoginType["reqBody"]) {
    const user = await this.db.query.usersTable.findFirst({
      where: (users: any, { eq }: { eq: any }) =>
        eq(users.email, request.email),
    });

    const isValid =
      user && (await Bun.password.verify(request.password, user.password!));

    if (!isValid) {
      throw new ResponseError(401, "Invalid Credentials");
    }

    return user;
  }

  public async ensureRefreshTokenIsExist(token: string) {
    const result = await this.db.query.usersTable.findFirst({
      where: (users: any, { eq }: { eq: any }) => eq(users.token, token),
    });
    if (!result) {
      throw new ResponseError(401, "Invalid Credentials");
    }
  }

  public async register(request: RegisterType["reqBody"]) {
    const hashedPassword = await Bun.password.hash(request.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    request["password"] = hashedPassword;
    const [user] = await this.db.insert(usersTable).values(request).returning();

    return new RegisterResponseDto(user!);
  }

  public async login(
    request: LoginType["reqBody"],
    accessJwt: JwtSigner,
    refreshJwt: JwtSigner,
  ) {
    const validUser = await this.validateCredential(request);
    const payload = { id: validUser.id, username: validUser.username };

    const accessToken = await accessJwt.sign(payload);
    const refreshToken = await refreshJwt.sign(payload);

    await this.db
      .update(usersTable)
      .set({ token: refreshToken })
      .where(eq(usersTable.email, request.email));

    return new LoginResponseDto({ accessToken, refreshToken });
  }

  public async deleteSession(userId: string) {
    await this.db
      .update(usersTable)
      .set({ token: null, lastSeen: new Date() })
      .where(eq(usersTable.id, userId));
  }

  public async newRefreshToken(
    payload: { id: string; username: string },
    accessJwt: JwtSigner,
  ) {
    const accessToken = await accessJwt.sign(payload);
    return { accessToken };
  }
}
