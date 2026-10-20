// api/tracked-queries.ts — manage weekly citation tracking.
import express from 'express';
import { findUserByApiKey, setCitationAlerts } from '../services/dbService';
import {
  listTrackedQueries,
  createTrackedQuery,
  setTrackedQueryPaused,
  deleteTrackedQuery,
  planTrackingCap,
  enforcePlanCap,
  TrackingError,
  NO_SITE_MESSAGE,
} from '../services/trackedQueryService';
import { normaliseLocation } from '../services/engines/location';
import type { ApiError, User } from '../types';

async function authUser(req: express.Request, res: express.Response): Promise<User | null> {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) {
    res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
    return null;
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
    return null;
  }
  return user;
}

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

const TRACKING_STATUS: Record<TrackingError['code'], number> = {
  plan_required: 402,
  cap_reached: 409,
  duplicate: 409,
  not_found: 404,
  no_site: 400,
};

function sendError(res: express.Response, err: unknown, where: string) {
  if (err instanceof TrackingError) {
    return res.status(TRACKING_STATUS[err.code]).json({ error: err.code, message: err.message } as ApiError);
  }
  console.error(`Tracked queries ${where} error:`, err);
  return res.status(500).json({ error: 'internal_server_error', message: 'Something went wrong. Try again.' } as ApiError);
}

export async function listHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  try {
    const cap = planTrackingCap(user);
    await enforcePlanCap(user.id, cap);
    const items = await listTrackedQueries(user.id);
    return res.status(200).json({ success: true, items, cap, alertsEnabled: user.citationAlerts !== false });
  } catch (err) {
    return sendError(res, err, 'list');
  }
}

export async function createHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const { name, topic, url, lastCited, checkId } = req.body as {
    name?: unknown; topic?: unknown; url?: unknown; lastCited?: unknown; checkId?: unknown;
  };
  if (typeof name !== 'string' || !name.trim() || name.length > 120) {
    return res.status(400).json({ error: 'bad_request', message: 'name is required (max 120 characters)' } as ApiError);
  }
  if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 500) {
    return res.status(400).json({ error: 'bad_request', message: 'topic is required (3 to 500 characters)' } as ApiError);
  }
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'no_site', message: NO_SITE_MESSAGE } as ApiError);
  }
  let normalisedUrl: string | null = null;
  if (typeof url === 'string' && url.trim()) {
    let candidate = url.trim();
    if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
    try {
      new URL(candidate);
      normalisedUrl = candidate;
    } catch {
      return res.status(400).json({ error: 'bad_request', message: 'url is malformed' } as ApiError);
    }
  }
  try {
    const item = await createTrackedQuery(user, {
      name: name.trim(),
      topic: topic.trim(),
      url: normalisedUrl,
      lastCited: typeof lastCited === 'boolean' ? lastCited : null,
      checkId: typeof checkId === 'number' && checkId > 0 ? checkId : null,
      ...(typeof req.body?.country === 'string' ? normaliseLocation(req.body.country, req.body.state ?? null) : {}),
    });
    return res.status(201).json({ success: true, item });
  } catch (err) {
    return sendError(res, err, 'create');
  }
}

export async function updateHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  const { paused } = req.body as { paused?: unknown };
  if (typeof paused !== 'boolean') {
    return res.status(400).json({ error: 'bad_request', message: 'paused must be true or false' } as ApiError);
  }
  try {
    await setTrackedQueryPaused(user, id, paused);
    return res.status(200).json({ success: true });
  } catch (err) {
    return sendError(res, err, 'update');
  }
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  try {
    const deleted = await deleteTrackedQuery(user.id, id);
    if (!deleted) return res.status(404).json({ error: 'not_found', message: 'Tracked query not found.' } as ApiError);
    return res.status(200).json({ success: true });
  } catch (err) {
    return sendError(res, err, 'delete');
  }
}

export async function alertsHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const { enabled } = req.body as { enabled?: unknown };
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'bad_request', message: 'enabled must be true or false' } as ApiError);
  }
  try {
    await setCitationAlerts(user.id, enabled);
    return res.status(200).json({ success: true, alertsEnabled: enabled });
  } catch (err) {
    return sendError(res, err, 'alerts');
  }
}
