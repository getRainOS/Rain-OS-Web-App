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

const addGithubColumnsQuery = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_login TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_github_token TEXT;
`;

// Durable OAuth state store — shared across all instances, TTL enforced via expires_at.
const createOAuthStatesQuery = `
CREATE TABLE IF NOT EXISTS oauth_states (
  nonce TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
`;

export const setupDatabase = async () => {
  try {
    await pool.query(createTableQuery);
    await pool.query(addGithubColumnsQuery);
    await pool.query(createOAuthStatesQuery);
    console.log('Database table "users" is ready.');
  } catch (error) {
    console.error('Error setting up database table:', error);
    process.exit(1);
  }
};