// api/history.ts — GET /api/history, DELETE /api/history/:id
import express from 'express';
import {
  findUserByApiKey,
  getAnalysesByUser,
  deleteAnalysis,
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

  try {
    const items = await getAnalysesByUser(user.id, limit ?? 50);
    return res.status(200).json({ success: true, data: items, items });
  } catch (error) {
    console.error('History list error:', error);
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
