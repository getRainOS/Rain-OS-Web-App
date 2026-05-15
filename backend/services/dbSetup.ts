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

-- Citation Monitor history (additive)
CREATE TABLE IF NOT EXISTS citation_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  topic_key TEXT NOT NULL,
  url TEXT,
  cited BOOLEAN NOT NULL,
  alignment_score INTEGER NOT NULL,
  sources JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  summary TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citation_checks_user_topic
  ON citation_checks(user_id, topic_key, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_citation_checks_user_checked_at
  ON citation_checks(user_id, checked_at DESC);

-- Content analysis history (additive)
CREATE TABLE IF NOT EXISTS content_analyses (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  overall_score NUMERIC,
  ai_readability NUMERIC,
  digital_authority NUMERIC,
  conversion_readiness NUMERIC,
  product_discoverability NUMERIC,
  summary TEXT,
  result_json JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_analyzed_at
  ON content_analyses(user_id, analyzed_at DESC);

-- Share of Voice history (additive)
CREATE TABLE IF NOT EXISTS sov_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  topic TEXT NOT NULL,
  url TEXT,
  overall_sov INTEGER NOT NULL,
  cited_count INTEGER NOT NULL DEFAULT 0,
  model_results JSONB NOT NULL,
  top_competitors JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  ai_volume_label TEXT NOT NULL DEFAULT 'Medium',
  ai_volume_estimate TEXT NOT NULL DEFAULT '',
  summary TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sov_checks_user_checked_at
  ON sov_checks(user_id, checked_at DESC);

-- Brand Visibility / Sentiment history (additive)
CREATE TABLE IF NOT EXISTS brand_visibility_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  topic TEXT NOT NULL,
  url TEXT,
  visibility_score INTEGER NOT NULL DEFAULT 0,
  mention_status TEXT NOT NULL DEFAULT 'not_mentioned',
  mention_position INTEGER,
  sentiment TEXT NOT NULL DEFAULT 'not_applicable',
  sentiment_explanation TEXT,
  answer_excerpt TEXT,
  sources JSONB NOT NULL DEFAULT '[]',
  competitors JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_vis_checks_user_checked_at
  ON brand_visibility_checks(user_id, checked_at DESC);
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
