import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import * as schema from "./schemas";

const connectionString = process.env.DATABASE_URL!;

export const getDb = () => {
  if (process.env.NODE_ENV === "production") {
    const client = neon(connectionString);
    return drizzleNeon(client, { schema });
  } else {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  }
};

export const db = getDb();

export type drizzleDB = typeof db;
