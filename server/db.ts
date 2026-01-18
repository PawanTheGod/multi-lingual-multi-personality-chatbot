import 'dotenv/config';
import * as schema from "../shared/schema.js";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL must be set. Did you forget to provision a database?");
}

const isNeon = process.env.DATABASE_URL && /neon\.tech|neondb\.net/.test(process.env.DATABASE_URL);

let pool: any;
let db: any;

if (process.env.DATABASE_URL) {
  if (isNeon) {
    // Configure Neon to use WebSockets
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } else {
    // Fallback for standard Postgres (local dev)
    // We can't statically import 'pg' if we want to be fully serverless-clean, 
    // but since we're bundling, it matches the old behavior but cleaner.
    // However, for Vercel, we primarily care about the Neon path being fast.
    const { Pool: PgPool } = require('pg');
    const { drizzle: drizzlePg } = require('drizzle-orm/node-postgres');

    pool = new PgPool({ connectionString: process.env.DATABASE_URL });
    db = drizzlePg(pool, { schema });
  }
}

export { pool, db };