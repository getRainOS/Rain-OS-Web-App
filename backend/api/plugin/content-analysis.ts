import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { getOrComputeAiReadinessAnalysis } from '../../services/aiReadiness/analysisService';
import type { ApiError } from '../../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
};

/**
 * GET /api/plugin/content/:contentId/analysis
 * Returns: { scores: { readability, structure, freshness, citation, visibility }, recommendations: AIRecommendation[] }
 * This endpoint is consumed by the WP plugin proxy route /backend-analysis/:postId
 */
export default async function handler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }

  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const contentId = String(req.params.contentId || '').trim();
  if (!contentId) return res.status(204).send();

  try {
    const analysis = await getOrComputeAiReadinessAnalysis(contentId);
    if (!analysis) return res.status(204).send();

    return res.status(200).json(analysis);
  } catch (e) {
    console.error('[plugin/content/:contentId/analysis] error', e);
    return res.status(500).json({ error: 'internal_server_error', message: 'Failed to fetch analysis' } as ApiError);
  }
}
