import 'dotenv/config';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Decide driver based on DATABASE_URL. Use Neon serverless driver only for Neon URLs.
const isNeon = process.env.DATABASE_URL && /neon\.tech|neondb\.net/.test(process.env.DATABASE_URL);

let pool: any = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  if (isNeon) {
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = (await import('ws')).default;
    const { drizzle } = await import('drizzle-orm/neon-serverless');

    neonConfig.webSocketConstructor = ws as any;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } else {
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
}

export { pool, db };