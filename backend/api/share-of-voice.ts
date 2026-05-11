// api/share-of-voice.ts — POST /api/sov  · GET /api/sov  · DELETE /api/sov
import express from 'express';
import { findUserByApiKey, incrementUserUsage } from '../services/dbService';
import { runShareOfVoice } from '../services/shareOfVoiceService';
import { pool } from '../services/db';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

async function authUser(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

/* ── POST /api/sov ────────────────────────────────────────────────────────── */
export async function sovHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;

  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly limit reached. Upgrade to continue.' } as ApiError);
  }

  const { brand, topic, url } = req.body as { brand?: string; topic?: string; url?: string };

  if (!brand || typeof brand !== 'string' || brand.trim().length < 2) {
    return res.status(400).json({ error: 'bad_request', message: 'brand is required (min 2 characters)' } as ApiError);
  }
  if (brand.length > 200) {
    return res.status(400).json({ error: 'bad_request', message: 'brand too long (max 200 chars)' } as ApiError);
  }
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({ error: 'bad_request', message: 'topic is required (min 3 characters)' } as ApiError);
  }
  if (topic.length > 300) {
    return res.status(400).json({ error: 'bad_request', message: 'topic too long (max 300 chars)' } as ApiError);
  }

  let normalisedUrl: string | null = null;
  if (url && typeof url === 'string' && url.trim()) {
    let c = url.trim();
    if (!/^https?:\/\//i.test(c)) c = 'https://' + c;
    try { new URL(c); normalisedUrl = c; }
    catch { return res.status(400).json({ error: 'bad_request', message: 'url is malformed' } as ApiError); }
  }

  try {
    const result = await runShareOfVoice(brand.trim(), topic.trim(), normalisedUrl);

    // Persist to DB
    await pool.query(
      `INSERT INTO sov_checks (user_id, brand, topic, url, overall_sov, cited_count, model_results, top_competitors, recommendations, ai_volume_label, ai_volume_estimate, summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        user.id,
        result.brand,
        result.topic,
        result.url,
        result.overallSov,
        result.citedCount,
        JSON.stringify(result.modelResults),
        JSON.stringify(result.topCompetitors),
        JSON.stringify(result.recommendations),
        result.aiVolumeLabel,
        result.aiVolumeEstimate,
        result.summary,
      ]
    );

    const updated = await incrementUserUsage(user.id);
    if (updated) res.setHeader('X-Usage-Info', JSON.stringify(updated.usage));

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('SOV error:', err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

/* ── GET /api/sov ─────────────────────────────────────────────────────────── */
export async function sovHistoryHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const rows = await pool.query(
    `SELECT * FROM sov_checks WHERE user_id = $1 ORDER BY checked_at DESC LIMIT $2`,
    [user.id, limit]
  );

  const items = rows.rows.map((r: any) => ({
    id:               Number(r.id),
    brand:            r.brand,
    topic:            r.topic,
    url:              r.url,
    overallSov:       r.overall_sov,
    citedCount:       r.cited_count,
    modelResults:     typeof r.model_results === 'string' ? JSON.parse(r.model_results) : r.model_results,
    topCompetitors:   typeof r.top_competitors === 'string' ? JSON.parse(r.top_competitors) : r.top_competitors,
    recommendations:  typeof r.recommendations === 'string' ? JSON.parse(r.recommendations) : r.recommendations,
    aiVolumeLabel:    r.ai_volume_label,
    aiVolumeEstimate: r.ai_volume_estimate,
    summary:          r.summary,
    checkedAt:        r.checked_at instanceof Date ? r.checked_at.toISOString() : r.checked_at,
  }));

  return res.status(200).json({ success: true, data: items });
}

/* ── DELETE /api/sov ─────────────────────────────────────────────────────── */
export async function sovDeleteHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;

  const result = await pool.query(
    `DELETE FROM sov_checks WHERE user_id = $1`,
    [user.id]
  );
  return res.status(200).json({ success: true, deleted: result.rowCount || 0 });
}
