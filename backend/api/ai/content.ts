import express from 'express';
import { getOrComputeAiReadinessAnalysis } from '../../services/aiReadiness/analysisService';

/**
 * GET /ai/content/:contentId
 * Returns cached scores (and minimal metadata).
 */
export default async function handler(req: express.Request, res: express.Response) {
  const contentId = String(req.params.contentId || '').trim();
  if (!contentId) return res.status(204).send();

  const analysis = await getOrComputeAiReadinessAnalysis(contentId);
  if (!analysis) return res.status(204).send();

  return res.status(200).json({
    contentId,
    scores: analysis.scores,
    version: analysis.version,
    timestamp: analysis.timestamp,
  });
}
