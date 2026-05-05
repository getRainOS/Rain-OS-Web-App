// services/dbService.ts
// This service interacts with the PostgreSQL database.

// Fix: Import Buffer to make it available in this module.
import { Buffer } from 'buffer';
import type { User, SubscriptionStatus } from '../types';
import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'crypto';
import { pool } from './db';

// --- Crypto Helpers ---
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET || ENCRYPTION_SECRET.length !== 32) {
    throw new Error('ENCRYPTION_SECRET environment variable must be set and be 32 characters long.');
}
const secretKey = Buffer.from(ENCRYPTION_SECRET, 'utf8');

const encrypt = (text: string): string => {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text: string): string => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv(ALGORITHM, secretKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

export const hash = (data: string) => createHash('sha256').update(data).digest('hex');

// --- DB to Application Mapper ---
const mapRowToUser = (row: any): User => {
    if (!row) return null as any;
    return {
        id: row.id,
        email: row.email,
        googleId: row.google_id,
        githubId: row.github_id,
        githubLogin: row.github_login,
        hashedPassword: row.hashed_password,
        passwordResetToken: row.password_reset_token,
        passwordResetExpires: row.password_reset_expires,
        apiKey: decrypt(row.encrypted_api_key),
        hashedApiKey: row.hashed_api_key,
        stripeCustomerId: row.stripe_customer_id,
        stripePriceId: row.stripe_price_id,
        subscriptionStatus: row.subscription_status,
        usage: row.usage,
        createdAt: row.created_at,
    };
};


// --- User Management ---

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const findUserById = async (id: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const findUserByApiKey = async (apiKey: string): Promise<User | null> => {
    const apiKeyHash = hash(apiKey);
    const res = await pool.query('SELECT * FROM users WHERE hashed_api_key = $1', [apiKeyHash]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const findUserByStripeCustomerId = async (stripeCustomerId: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE stripe_customer_id = $1', [stripeCustomerId]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const findUserByGoogleId = async (googleId: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const findUserByGithubId = async (githubId: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE github_id = $1', [githubId]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const saveGithubAuth = async (userId: string, githubId: string, githubLogin: string, plainToken: string): Promise<User | null> => {
    const encryptedToken = encrypt(plainToken);
    const res = await pool.query(
        'UPDATE users SET github_id = $1, github_login = $2, encrypted_github_token = $3 WHERE id = $4 RETURNING *',
        [githubId, githubLogin, encryptedToken, userId]
    );
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const getUserGithubToken = async (userId: string): Promise<string | null> => {
    const res = await pool.query('SELECT encrypted_github_token FROM users WHERE id = $1', [userId]);
    if (!res.rows[0]?.encrypted_github_token) return null;
    return decrypt(res.rows[0].encrypted_github_token);
};

export const disconnectGithub = async (userId: string): Promise<void> => {
    await pool.query(
        'UPDATE users SET github_id = NULL, github_login = NULL, encrypted_github_token = NULL WHERE id = $1',
        [userId]
    );
};

export const findUserByPasswordResetToken = async (hashedToken: string): Promise<User | null> => {
    const res = await pool.query(
        'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [hashedToken]
    );
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const createUser = async (email: string, password?: string, googleId?: string): Promise<User> => {
    if (await findUserByEmail(email)) {
        throw new Error('User already exists');
    }

    const id = `user_${randomBytes(16).toString('hex')}`;
    const apiKey = `rain_os_key_${randomBytes(24).toString('hex')}`;
    const hashedApiKey = hash(apiKey);
    const encryptedApiKey = encrypt(apiKey);

    const newUser: Omit<User, 'apiKey' | 'createdAt'> & { encryptedApiKey: string, hashedPassword?: string } = {
        id,
        email: email.toLowerCase(),
        googleId,
        hashedApiKey,
        encryptedApiKey,
        subscriptionStatus: 'active',
        usage: { count: 0, limit: 5 },
    };
    if (password) {
        newUser.hashedPassword = hash(password);
    }

    const query = `
        INSERT INTO users (id, email, google_id, hashed_password, hashed_api_key, encrypted_api_key, subscription_status, usage)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        newUser.id, newUser.email, newUser.googleId, newUser.hashedPassword,
        newUser.hashedApiKey, newUser.encryptedApiKey, newUser.subscriptionStatus,
        JSON.stringify(newUser.usage)
    ];

    const res = await pool.query(query, values);
    return mapRowToUser(res.rows[0]);
};

export const updateUser = async (userId: string, updates: Partial<Pick<User, 'googleId' | 'hashedPassword' | 'passwordResetToken' | 'passwordResetExpires'>>): Promise<User | null> => {
    const setClauses: string[] = [];
    const values: any[] = [userId];

    if (updates.googleId !== undefined) {
        values.push(updates.googleId);
        setClauses.push(`google_id = $${values.length}`);
    }
    if (updates.hashedPassword !== undefined) {
        values.push(updates.hashedPassword);
        setClauses.push(`hashed_password = $${values.length}`);
    }
    if (updates.passwordResetToken !== undefined) {
        values.push(updates.passwordResetToken);
        setClauses.push(`password_reset_token = $${values.length}`);
    }
    if (updates.passwordResetExpires !== undefined) {
        values.push(updates.passwordResetExpires);
        setClauses.push(`password_reset_expires = $${values.length}`);
    }
    
    if (setClauses.length === 0) {
        return findUserById(userId);
    }

    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};


export const regenerateUserApiKey = async (userId: string): Promise<User | null> => {
    const newApiKey = `rain_os_key_${randomBytes(24).toString('hex')}`;
    const newHashedApiKey = hash(newApiKey);
    const newEncryptedApiKey = encrypt(newApiKey);

    const query = `
        UPDATE users
        SET hashed_api_key = $1, encrypted_api_key = $2
        WHERE id = $3
        RETURNING *
    `;
    const res = await pool.query(query, [newHashedApiKey, newEncryptedApiKey, userId]);
    
    // mapRowToUser will decrypt the key correctly, returning the new raw key.
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

// --- Subscription Management ---

export const updateUserSubscription = async (
    userId: string,
    updates: {
        stripeCustomerId?: string;
        subscriptionStatus?: SubscriptionStatus;
        stripePriceId?: string | null;
        usageLimit?: number;
    }
): Promise<User | null> => {
    const setClauses: string[] = [];
    const values: any[] = [userId];

    if (updates.stripeCustomerId !== undefined) {
        values.push(updates.stripeCustomerId);
        setClauses.push(`stripe_customer_id = $${values.length}`);
    }
    if (updates.subscriptionStatus !== undefined) {
        values.push(updates.subscriptionStatus);
        setClauses.push(`subscription_status = $${values.length}`);
    }
    if (updates.stripePriceId !== undefined) {
        values.push(updates.stripePriceId);
        setClauses.push(`stripe_price_id = $${values.length}`);
    }
    if (updates.usageLimit !== undefined) {
        values.push(updates.usageLimit);
        // Use jsonb_set to update a nested value in the JSONB column
        setClauses.push(`usage = jsonb_set(usage, '{limit}', $${values.length}::jsonb)`);
    }

    if (setClauses.length === 0) {
        return findUserById(userId);
    }
    
    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, values);
    console.log(`Updated user ${userId} subscription. Status: ${res.rows[0]?.subscription_status}, Limit: ${res.rows[0]?.usage.limit}`);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

// --- Usage Management ---

export const incrementUserUsage = async (userId: string): Promise<User | null> => {
    const query = `
        UPDATE users
        SET usage = jsonb_set(usage, '{count}', ((usage->>'count')::int + 1)::text::jsonb)
        WHERE id = $1
        RETURNING *
    `;
    const res = await pool.query(query, [userId]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
};

export const resetUserUsage = async (userId: string): Promise<void> => {
    await pool.query("UPDATE users SET usage = jsonb_set(usage, '{count}', '0') WHERE id = $1", [userId]);
    console.log(`Reset usage for user ${userId}.`);
};

export const resetAllUsersUsage = async (): Promise<number> => {
    const res = await pool.query("UPDATE users SET usage = jsonb_set(usage, '{count}', '0')");
    const count = res.rowCount || 0;
    console.log(`Reset usage for all ${count} users.`);
    return count;
};

// --------------------------
// AI content profile cache (additive)
// --------------------------

export const upsertAiContentProfile = async (contentId: string, profileData: any, fingerprint?: any): Promise<void> => {
  await pool.query(
    `INSERT INTO ai_content_profiles (content_id, profile_data, fingerprint, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (content_id)
     DO UPDATE SET profile_data = $2, fingerprint = COALESCE($3, ai_content_profiles.fingerprint), updated_at = NOW()`,
    [contentId, JSON.stringify(profileData), fingerprint ? JSON.stringify(fingerprint) : null]
  );
};

export const getAiContentProfile = async (contentId: string): Promise<{ profile_data: any; fingerprint: any } | null> => {
  const res = await pool.query('SELECT profile_data, fingerprint FROM ai_content_profiles WHERE content_id = $1', [contentId]);
  if (!res.rows[0]) return null;
  return {
    profile_data: res.rows[0].profile_data,
    fingerprint: res.rows[0].fingerprint,
  };
};

// --------------------------
// Citation Monitor history
// --------------------------

export interface CitationCheckRecord {
  id: number;
  topic: string;
  url: string | null;
  cited: boolean;
  alignmentScore: number;
  sources: any[];
  recommendations: string[];
  summary: string | null;
  checkedAt: string;
}

const mapCitationRow = (row: any): CitationCheckRecord => ({
  id: Number(row.id),
  topic: row.topic,
  url: row.url,
  cited: row.cited,
  alignmentScore: row.alignment_score,
  sources: Array.isArray(row.sources) ? row.sources : [],
  recommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
  summary: row.summary,
  checkedAt: row.checked_at instanceof Date ? row.checked_at.toISOString() : row.checked_at,
});

export const normaliseTopicKey = (topic: string): string =>
  topic.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 500);

export const saveCitationCheck = async (
  userId: string,
  data: {
    topic: string;
    url: string | null;
    cited: boolean;
    alignmentScore: number;
    sources: any[];
    recommendations: string[];
    summary?: string;
  }
): Promise<CitationCheckRecord | null> => {
  const topicKey = normaliseTopicKey(data.topic);
  const res = await pool.query(
    `INSERT INTO citation_checks
       (user_id, topic, topic_key, url, cited, alignment_score, sources, recommendations, summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      userId,
      data.topic,
      topicKey,
      data.url,
      data.cited,
      Math.max(0, Math.min(100, Math.round(data.alignmentScore))),
      JSON.stringify(data.sources || []),
      JSON.stringify(data.recommendations || []),
      data.summary || null,
    ]
  );
  return res.rows[0] ? mapCitationRow(res.rows[0]) : null;
};

export const getCitationChecksByTopic = async (
  userId: string,
  topic: string,
  limit = 20
): Promise<CitationCheckRecord[]> => {
  const topicKey = normaliseTopicKey(topic);
  const res = await pool.query(
    `SELECT * FROM citation_checks
     WHERE user_id = $1 AND topic_key = $2
     ORDER BY checked_at DESC
     LIMIT $3`,
    [userId, topicKey, limit]
  );
  return res.rows.map(mapCitationRow);
};

export const getCitationChecksByUser = async (
  userId: string,
  limit = 50
): Promise<CitationCheckRecord[]> => {
  const res = await pool.query(
    `SELECT * FROM citation_checks
     WHERE user_id = $1
     ORDER BY checked_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map(mapCitationRow);
};

export const deleteCitationCheck = async (
  userId: string,
  id: number
): Promise<boolean> => {
  const res = await pool.query(
    `DELETE FROM citation_checks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (res.rowCount || 0) > 0;
};

export const deleteCitationChecksByUser = async (
  userId: string,
  opts: { topicKey?: string } = {}
): Promise<number> => {
  let res;
  if (opts.topicKey) {
    const key = normaliseTopicKey(opts.topicKey);
    res = await pool.query(
      `DELETE FROM citation_checks WHERE user_id = $1 AND topic_key = $2`,
      [userId, key]
    );
  } else {
    res = await pool.query(
      `DELETE FROM citation_checks WHERE user_id = $1`,
      [userId]
    );
  }
  return res.rowCount || 0;
};

// --------------------------
// Content analysis history
// --------------------------

export interface AnalysisRecord {
  id: number;
  title: string | null;
  url: string | null;
  overall_score: number | null;
  ai_readability: number | null;
  digital_authority: number | null;
  conversion_readiness: number | null;
  product_discoverability: number | null;
  summary: string | null;
  analyzed_at: string;
}

const mapAnalysisRow = (row: any): AnalysisRecord => ({
  id: Number(row.id),
  title: row.title ?? null,
  url: row.url ?? null,
  overall_score: row.overall_score !== null ? Number(row.overall_score) : null,
  ai_readability: row.ai_readability !== null ? Number(row.ai_readability) : null,
  digital_authority: row.digital_authority !== null ? Number(row.digital_authority) : null,
  conversion_readiness: row.conversion_readiness !== null ? Number(row.conversion_readiness) : null,
  product_discoverability: row.product_discoverability !== null ? Number(row.product_discoverability) : null,
  summary: row.summary ?? null,
  analyzed_at: row.analyzed_at instanceof Date ? row.analyzed_at.toISOString() : row.analyzed_at,
});

export const saveAnalysis = async (
  userId: string,
  data: {
    title?: string | null;
    url?: string | null;
    overall_score?: number | null;
    ai_readability?: number | null;
    digital_authority?: number | null;
    conversion_readiness?: number | null;
    product_discoverability?: number | null;
    summary?: string | null;
    result_json?: any;
  }
): Promise<AnalysisRecord | null> => {
  const res = await pool.query(
    `INSERT INTO content_analyses
       (user_id, title, url, overall_score, ai_readability, digital_authority,
        conversion_readiness, product_discoverability, summary, result_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      userId,
      data.title ?? null,
      data.url ?? null,
      data.overall_score ?? null,
      data.ai_readability ?? null,
      data.digital_authority ?? null,
      data.conversion_readiness ?? null,
      data.product_discoverability ?? null,
      data.summary ?? null,
      data.result_json ? JSON.stringify(data.result_json) : null,
    ]
  );
  return res.rows[0] ? mapAnalysisRow(res.rows[0]) : null;
};

export const getAnalysesByUser = async (
  userId: string,
  limit = 50
): Promise<AnalysisRecord[]> => {
  const res = await pool.query(
    `SELECT id, title, url, overall_score, ai_readability, digital_authority,
            conversion_readiness, product_discoverability, summary, analyzed_at
     FROM content_analyses
     WHERE user_id = $1
     ORDER BY analyzed_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map(mapAnalysisRow);
};

export const deleteAnalysis = async (
  userId: string,
  id: number
): Promise<boolean> => {
  const res = await pool.query(
    `DELETE FROM content_analyses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (res.rowCount || 0) > 0;
};