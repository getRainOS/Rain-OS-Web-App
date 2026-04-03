// services/dbSetup.ts
import { pool } from './db';
// Fix: Import process to get correct types for process.exit
import process from 'process';

const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  hashed_password TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  hashed_api_key TEXT UNIQUE NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_price_id TEXT,
  subscription_status TEXT NOT NULL,
  usage JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Readiness / plugin cache (additive)
CREATE TABLE IF NOT EXISTS ai_content_profiles (
  content_id TEXT PRIMARY KEY,
  profile_data JSONB NOT NULL,
  fingerprint JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_content_profiles_updated_at ON ai_content_profiles(updated_at);
`;

export const setupDatabase = async () => {
  try {
    await pool.query(createTableQuery);
    console.log('Database table "users" is ready.');
  } catch (error) {
    console.error('Error setting up database table:', error);
    process.exit(1);
  }
};