// api/brand-links.ts — GET/PUT/DELETE /api/brand-links
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { listBrandLinks, saveBrandLink, deleteBrandLink } from '../services/brandLinkService';
import { normalizeSite, brandKey } from '../services/brandLinkKeys';
import type { ApiError } from '../types';

async function authUser(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

const cleanBrand = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 120) : '');

export async function listHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  return res.status(200).json({ success: true, links: await listBrandLinks(user.id) });
}

export async function saveHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const brand = cleanBrand(req.body?.brand);
  const site = normalizeSite(String(req.body?.site ?? ''));
  if (!brandKey(brand) || !site) {
    return res.status(400).json({ error: 'bad_request', message: 'Add a brand name and a website like example.com.' } as ApiError);
  }
  await saveBrandLink(user.id, brand, site);
  return res.status(200).json({ success: true, links: await listBrandLinks(user.id) });
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const brand = cleanBrand(req.body?.brand ?? req.query.brand);
  if (!brandKey(brand)) return res.status(400).json({ error: 'bad_request', message: 'Which brand?' } as ApiError);
  await deleteBrandLink(user.id, brand);
  return res.status(200).json({ success: true, links: await listBrandLinks(user.id) });
}
