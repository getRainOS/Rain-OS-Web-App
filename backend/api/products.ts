// api/products.ts — product fact sheets.
//   GET    /api/products          → { items: [{ id, facts, completeness, schema }] }
//   POST   /api/products          → save { id?, facts }
//   DELETE /api/products/:id
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { listProductFacts, saveProductFacts, deleteProductFacts, type ProductFactSheet } from '../services/productFactService';
import { cleanFacts, factsCompleteness, factsToSchema } from '../services/productFacts';
import type { ApiError } from '../types';

async function authUser(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

const view = (s: ProductFactSheet) => ({ ...s, completeness: factsCompleteness(s.facts), schema: factsToSchema(s.facts) });

export async function listHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  return res.status(200).json({ success: true, items: (await listProductFacts(user.id)).map(view) });
}

export async function saveHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const facts = cleanFacts(req.body?.facts);
  if (facts.name.length < 2) return res.status(400).json({ error: 'bad_request', message: 'Give the product a name.' } as ApiError);
  const id = Number(req.body?.id);
  const saved = await saveProductFacts(user.id, facts, Number.isInteger(id) && id > 0 ? id : null);
  if (!saved) return res.status(404).json({ error: 'not_found', message: 'Product not found' } as ApiError);
  return res.status(200).json({ success: true, item: view(saved) });
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const ok = await deleteProductFacts(user.id, Number(req.params.id));
  return ok ? res.status(200).json({ success: true }) : res.status(404).json({ error: 'not_found', message: 'Product not found' } as ApiError);
}
