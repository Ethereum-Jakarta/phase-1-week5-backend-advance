import { Hono } from "hono";
import { createUser, findUserByEmail } from "../models/userModel";
import { hashPassword, comparePassword } from "../utils/hash";
import jwt from "jsonwebtoken";

const app = new Hono();

app.post("/register", async (c) => {
  const { name, email, password } = await c.req.json();

  
  const existingUser = await findUserByEmail(email);
  if (existingUser) return c.json({ error: "User already exists" }, 400);

  
  const hashedPassword = await hashPassword(password);

  
  await createUser({ name, email, password: hashedPassword });

  return c.json({ message: "User registered successfully" });
});

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await findUserByEmail(email);
  if (!user) return c.json({ error: "Invalid email or password" }, 401);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return c.json({ error: "Invalid email or password" }, 401);

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return c.json({ token });
});

export default app;
