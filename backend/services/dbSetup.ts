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
  name TEXT,
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
-- Additive migration for existing deployments (idempotent)
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS name TEXT;

-- Content analysis history (additive)
CREATE TABLE IF NOT EXISTS content_analyses (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  repo TEXT,
  overall_score NUMERIC,
  ai_readability NUMERIC,
  digital_authority NUMERIC,
  conversion_readiness NUMERIC,
  product_discoverability NUMERIC,
  rag_readiness NUMERIC,
  local_presence NUMERIC,
  summary TEXT,
  result_json JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Additive migration for existing deployments (idempotent)
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS rag_readiness NUMERIC;
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS lane TEXT;
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS repo TEXT;
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS local_presence NUMERIC;
-- Re-analyses of the same piece share a series_id (the first run's id), so
-- the dashboard can trend one piece instead of blending unrelated ones.
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS series_id BIGINT;
-- Hash of (content, module, industry, content type) so an unchanged piece can reuse its last result.
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_content_analyses_hash ON content_analyses(user_id, content_hash);

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_analyzed_at
  ON content_analyses(user_id, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_lane
  ON content_analyses(user_id, lane);

-- Share of Voice history (additive)
CREATE TABLE IF NOT EXISTS sov_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
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
-- Additive migration for existing deployments (idempotent)
ALTER TABLE sov_checks ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE sov_checks ADD COLUMN IF NOT EXISTS brand_shares JSONB NOT NULL DEFAULT '[]';
ALTER TABLE sov_checks ADD COLUMN IF NOT EXISTS share_percent INTEGER;

-- Brand Visibility / Sentiment history (additive)
CREATE TABLE IF NOT EXISTS brand_visibility_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
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
-- Additive migration for existing deployments (idempotent)
ALTER TABLE brand_visibility_checks ADD COLUMN IF NOT EXISTS name TEXT;
`;

const addGithubColumnsQuery = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_login TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_github_token TEXT;
`;

// Email confirmation (additive). DEFAULT true so existing users aren't retroactively
// locked out — createUser() explicitly sets false for new email/password signups only.
const addEmailConfirmationColumnsQuery = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
`;

// Display name (additive). Nullable — populated from the OAuth provider's
// profile on Google sign-in, or set by the user in Settings. Falls back to
// an email-derived guess in the UI when absent.
const addNameColumnQuery = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
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
-- Additive migration for existing deployments (idempotent). Lets GitHub
-- Connect return the user to the page they started from (e.g. URL Scanner,
-- Repo Analysis) instead of always landing on /repo-analysis.
ALTER TABLE oauth_states ADD COLUMN IF NOT EXISTS return_to TEXT;
`;

// Shared, global cache of domain -> inferred HQ country (Gemini-classified,
// not per-user). country_name is NULL when Gemini couldn't confidently place
// the domain — still cached, so we never re-ask about the same domain twice.
const createDomainCountriesQuery = `
CREATE TABLE IF NOT EXISTS domain_countries (
  domain TEXT PRIMARY KEY,
  country_name TEXT,
  country_iso TEXT,
  country_flag TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Weekly citation tracking (additive)
const createTrackedQueriesQuery = `
CREATE TABLE IF NOT EXISTS tracked_queries (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_key TEXT NOT NULL,
  url TEXT,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_cited BOOLEAN,
  pending_cited BOOLEAN,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  paused_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic_key)
);
CREATE INDEX IF NOT EXISTS idx_tracked_queries_due
  ON tracked_queries(next_run_at) WHERE paused_reason IS NULL;
CREATE INDEX IF NOT EXISTS idx_tracked_queries_user ON tracked_queries(user_id);
ALTER TABLE tracked_queries ADD COLUMN IF NOT EXISTS pending_cited BOOLEAN;
-- Without a website there is nothing to match sources against, so every check
-- would report "not cited". Pause those until a website is added.
UPDATE tracked_queries SET paused_reason = 'no_site' WHERE url IS NULL AND paused_reason IS NULL;

ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS tracked_query_id BIGINT
  REFERENCES tracked_queries(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_citation_checks_tracked
  ON citation_checks(tracked_query_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_citation_checks_source_checked_at
  ON citation_checks(source, checked_at);

ALTER TABLE users ADD COLUMN IF NOT EXISTS citation_alerts BOOLEAN NOT NULL DEFAULT TRUE;
-- Two-letter US state the user is in, for location-aware ChatGPT checks.
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_state TEXT;

-- Which AI engine produced each visibility check. Everything so far ran on
-- Gemini with Google Search; ChatGPT and Claude will write their own ids.
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS engine TEXT NOT NULL DEFAULT 'gemini';
ALTER TABLE brand_visibility_checks ADD COLUMN IF NOT EXISTS engine TEXT NOT NULL DEFAULT 'gemini';
ALTER TABLE sov_checks ADD COLUMN IF NOT EXISTS engine TEXT NOT NULL DEFAULT 'gemini';
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE tracked_queries ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE tracked_queries ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE tracked_queries ADD COLUMN IF NOT EXISTS engine_state JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS lane TEXT;
ALTER TABLE brand_visibility_checks ADD COLUMN IF NOT EXISTS lane TEXT;
ALTER TABLE sov_checks ADD COLUMN IF NOT EXISTS lane TEXT;

-- Daily count of Gemini calls that used Google Search grounding, by feature.
CREATE TABLE IF NOT EXISTS grounded_calls_daily (
  day DATE NOT NULL,
  kind TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind)
);

-- Which brand names belong to which website, so the dashboard can show every
-- result for a site even when the brand name differs from the domain.
CREATE TABLE IF NOT EXISTS brand_site_links (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_key TEXT NOT NULL,
  brand TEXT NOT NULL,
  site TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, brand_key, site)
);

-- A brand can belong to several sites. Tables made with the earlier
-- (user_id, brand_key) key are widened once.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'brand_site_links_pkey'
      AND conrelid = 'brand_site_links'::regclass
      AND array_length(conkey, 1) = 2
  ) THEN
    ALTER TABLE brand_site_links DROP CONSTRAINT brand_site_links_pkey;
    ALTER TABLE brand_site_links ADD PRIMARY KEY (user_id, brand_key, site);
  END IF;
END $$;
`;

export const setupDatabase = async () => {
  try {
    await pool.query(createTableQuery);
    await pool.query(addGithubColumnsQuery);
    await pool.query(addEmailConfirmationColumnsQuery);
    await pool.query(addNameColumnQuery);
    await pool.query(createOAuthStatesQuery);
    await pool.query(createDomainCountriesQuery);
    await pool.query(createTrackedQueriesQuery);
    console.log('Database table "users" is ready.');
  } catch (error) {
    console.error('Error setting up database table:', error);
    process.exit(1);
  }
};
