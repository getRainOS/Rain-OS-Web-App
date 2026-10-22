// api/products.ts — product fact sheets.
//   GET    /api/products          → { items: [{ id, facts, completeness, schema }] }
//   POST   /api/products          → save { id?, facts }
//   DELETE /api/products/:id
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { listProductFacts, getProductFacts, saveProductFacts, deleteProductFacts, getStoreDefaults, saveStoreDefaults, upsertImported, type ProductFactSheet } from '../services/productFactService';
import { importShopifyStore, importProductPage, ImportError } from '../services/productImport';
import { draftProductFacts } from '../services/geminiService';
import { createDailyLimiter } from '../services/dailyLimiter';
import { cleanFacts, cleanDefaults, factsCompleteness, factsToSchema, verifiedFacts, type StoreDefaults } from '../services/productFacts';
import type { ApiError } from '../types';

async function authUser(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

// Completeness and schema count only verified facts (drafts excluded) plus
// store defaults, so the numbers match what the rewrite will actually use.
const view = (s: ProductFactSheet, d: StoreDefaults) => {
  const v = verifiedFacts(s.facts, d);
  return { ...s, completeness: factsCompleteness(v), schema: factsToSchema(v) };
};
const takeDraftSlot = createDailyLimiter(200);
const sendImportError = (res: express.Response, err: unknown, what: string) => {
  if (err instanceof ImportError) return res.status(err.status).json({ error: 'import_failed', message: err.message } as ApiError);
  console.error(`${what} failed:`, err);
  return res.status(500).json({ error: 'internal_error', message: 'The import failed. Please try again.' } as ApiError);
};

export async function listHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const d = await getStoreDefaults(user.id);
  return res.status(200).json({ success: true, items: (await listProductFacts(user.id)).map(s => view(s, d)), defaults: d });
}

export async function saveHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const facts = cleanFacts(req.body?.facts);
  if (facts.name.length < 2) return res.status(400).json({ error: 'bad_request', message: 'Give the product a name.' } as ApiError);
  const id = Number(req.body?.id);
  const saved = await saveProductFacts(user.id, facts, Number.isInteger(id) && id > 0 ? id : null);
  if (!saved) return res.status(404).json({ error: 'not_found', message: 'Product not found' } as ApiError);
  return res.status(200).json({ success: true, item: view(saved, await getStoreDefaults(user.id)) });
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const ok = await deleteProductFacts(user.id, Number(req.params.id));
  return ok ? res.status(200).json({ success: true }) : res.status(404).json({ error: 'not_found', message: 'Product not found' } as ApiError);
}

export async function defaultsHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  return res.status(200).json({ success: true, defaults: await saveStoreDefaults(user.id, cleanDefaults(req.body?.defaults)) });
}

// POST /api/products/import-store { storeUrl } — every product from a Shopify store.
export async function importStoreHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  try {
    const { origin, products } = await importShopifyStore(String(req.body?.storeUrl || ''));
    const counts = await upsertImported(user.id, products);
    return res.status(200).json({ success: true, store: origin, found: products.length, ...counts });
  } catch (err) {
    return sendImportError(res, err, 'Store import');
  }
}

// POST /api/products/import-page { url } — one product from its page.
export async function importPageHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  try {
    const facts = await importProductPage(String(req.body?.url || ''));
    await upsertImported(user.id, [facts]);
    const d = await getStoreDefaults(user.id);
    const item = (await listProductFacts(user.id)).find(x => x.facts.url.toLowerCase() === facts.url.toLowerCase());
    return res.status(200).json({ success: true, item: item ? view(item, d) : null });
  } catch (err) {
    return sendImportError(res, err, 'Page import');
  }
}

// POST /api/products/:id/draft — AI drafts for empty judgement fields, from the
// product's own description, marked as drafts until the owner confirms them.
export async function draftHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const sheet = await getProductFacts(user.id, Number(req.params.id));
  if (!sheet) return res.status(404).json({ error: 'not_found', message: 'Product not found' } as ApiError);
  if (sheet.facts.sourceText.length < 40) {
    return res.status(422).json({ error: 'no_description', message: 'This product has no description to draft from. Import it from the store or its page first, or fill the fields in yourself.' } as ApiError);
  }
  if (!takeDraftSlot(user.id)) return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have drafted 200 products today. Try again tomorrow.' } as ApiError);
  try {
    const drafted = await draftProductFacts({ name: sheet.facts.name, brand: sheet.facts.brand, sourceText: sheet.facts.sourceText });
    const facts: any = { ...sheet.facts };
    const newDrafts = new Set(sheet.facts.drafts);
    for (const [k, v] of Object.entries(drafted)) if (!facts[k]) { facts[k] = v; newDrafts.add(k); }
    facts.drafts = Array.from(newDrafts);
    const saved = await saveProductFacts(user.id, cleanFacts(facts), sheet.id);
    return res.status(200).json({ success: true, item: saved ? view(saved, await getStoreDefaults(user.id)) : null, drafted: Object.keys(drafted).filter(k => newDrafts.has(k)) });
  } catch (err) {
    console.error('Product draft failed:', err);
    return res.status(502).json({ error: 'draft_failed', message: 'The AI draft failed. Please try again.' } as ApiError);
  }
}
