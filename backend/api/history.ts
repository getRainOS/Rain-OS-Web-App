// api/history.ts — GET /api/history, DELETE /api/history/:id
import express from 'express';
import {
  findUserByApiKey,
  getAnalysesByUser, getAnalysesCountByUser, getAnalysisById,
  deleteAnalysis, setAnalysisBrand,
} from '../services/dbService';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

export async function listHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN;
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : undefined;
  const lane = typeof req.query.lane === 'string' ? req.query.lane : undefined;

  try {
    const items = await getAnalysesByUser(user.id, limit ?? 50, lane);
    const totalCount = await getAnalysesCountByUser(user.id, lane);
    return res.status(200).json({ success: true, data: items, items, totalCount });
  } catch (error) {
    console.error('History list error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

export async function getByIdHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const idRaw = req.params.id;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  }

  try {
    const item = await getAnalysisById(user.id, id);
    if (!item) {
      return res.status(404).json({ error: 'not_found', message: 'Analysis not found' } as ApiError);
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('History getById error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const idRaw = req.params.id;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  }

  try {
    const deleted = await deleteAnalysis(user.id, id);
    if (!deleted) {
      return res.status(404).json({ error: 'not_found', message: 'Analysis not found' } as ApiError);
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analysis delete error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

// POST /api/history/:id/brand — { brand } sets (or, empty, clears) the brand
// name monitoring tools use for this analysis.
export async function setBrandHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'API key missing or invalid' } as ApiError);
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'bad_request', message: 'Invalid id' } as ApiError);
  const brand = typeof req.body?.brand === 'string' ? req.body.brand.trim().slice(0, 120) || null : null;
  const ok = await setAnalysisBrand(user.id, id, brand);
  if (!ok) return res.status(404).json({ error: 'not_found', message: 'Analysis not found' } as ApiError);
  return res.json({ success: true, brand });
}
