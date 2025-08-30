// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure Neon to work in serverless environments
neonConfig.fetchConnectionCache = true;

// Create the SQL client with Neon
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance with Drizzle
export const db = drizzle(sql, { schema });