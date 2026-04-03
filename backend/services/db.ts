// services/db.ts
import pg from 'pg';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
