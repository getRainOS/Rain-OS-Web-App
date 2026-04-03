import express from 'express';
import { getAiReadinessDiagnostics } from '../../services/aiReadiness/analysisService';

/**
 * GET /ai/diagnostics/:contentId
 * Keep deterministic and low cost.
 */
export default async function handler(req: express.Request, res: express.Response) {
  const contentId = String(req.params.contentId || '').trim();
  if (!contentId) return res.status(204).send();

  const diagnostics = await getAiReadinessDiagnostics(contentId);
  if (!diagnostics) return res.status(204).send();

  return res.status(200).json(diagnostics);
}
