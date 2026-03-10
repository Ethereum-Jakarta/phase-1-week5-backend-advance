import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.headers.get("Authorization");
  if (!authHeader) return c.json({ error: "Authorization header missing" }, 401);

  const token = authHeader.split(" ")[1];
  if (!token) return c.json({ error: "Token missing" }, 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    c.set("user", payload);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
