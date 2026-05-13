// api/url-scan.ts — Fetch a URL, score with Gemini + Cheerio HTML analysis.
import express from 'express';
import { findUserByApiKey, incrementUserUsage } from '../services/dbService';
import { analyzeContent } from '../services/geminiService';
import { scanUrlForTechnicalSignals } from '../services/urlScanService';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

function applyTechnicalAdjustments(base: number, signals: Record<string, any>): number {
  let adj = 0;
  if (signals.hasSchemaMarkup) adj += 4;
  if (signals.hasFaqSchema) adj += 3;
  if (signals.hasSemanticHtml) adj += 2;
  if (signals.hasMetaDescription) adj += 2;
  if (signals.hasCanonicalTag) adj += 1;
  if (signals.hasOpenGraphTags) adj += 1;
  if (signals.hasLlmsTxt) adj += 3;
  if (signals.hasProperHeadingHierarchy) adj += 2;
  if (signals.hasViewportMeta) adj += 1;
  if (signals.hasTwitterCards) adj += 1;
  if (signals.isJsRendered) adj -= 8;
  if (!signals.hasMetaDescription) adj -= 3;
  if (!signals.hasSemanticHtml) adj -= 2;
  if (!signals.isIndexable) adj -= 5;
  if (signals.missingAltTextRatio > 0.5) adj -= 3;
  if (!signals.hasDescriptiveAnchors) adj -= 1;
  if (!signals.isWordCountSufficient) adj -= 2;
  return Math.max(0, Math.min(100, Math.round(base + adj)));
}

export default async function handler(req: express.Request, res: express.Response) {
  // ─── Auth & usage checks ──────────────────────────────────────────────────
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }
  if (user.subscriptionStatus !== 'active') {
    return res.status(402).json({ error: 'payment_required', message: 'Active subscription required' } as ApiError);
  }
  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly limit reached. Upgrade to continue.' } as ApiError);
  }

  // ─── Input validation ─────────────────────────────────────────────────────
  const { url, industry, module } = req.body as { url?: string; industry?: string; module?: string };
  const analysisModule: 'general' | 'product_sellers' | 'developers' | 'local_business' =
    module === 'product_sellers' || module === 'developers' || module === 'local_business' ? module : 'general';
  if (!url) {
    return res.status(400).json({ error: 'bad_request', message: 'url is required' } as ApiError);
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: 'bad_request',
      message: 'Invalid URL — must start with http:// or https://',
    } as ApiError);
  }

  try {
    // ─── Fetch the target URL with 15s timeout ──────────────────────────────
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    let rawHtml: string;
    try {
      const r = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'RainOS-Scanner/1.0 (+https://getrainos.com)' },
      });
      clearTimeout(timeout);
      if (!r.ok) {
        return res.status(422).json({
          error: 'fetch_failed',
          message: `Server returned HTTP ${r.status}`,
        } as ApiError);
      }
      rawHtml = await r.text();
    } catch (e: any) {
      clearTimeout(timeout);
      const msg = e?.name === 'AbortError'
        ? 'URL timed out (15s limit).'
        : `Could not reach URL: ${e?.message}`;
      return res.status(422).json({ error: 'fetch_failed', message: msg } as ApiError);
    }

    // ─── Cheerio technical analysis (zero API cost) ─────────────────────────
    const scan = await scanUrlForTechnicalSignals(rawHtml, url);

    if (!scan.extractedText || scan.extractedText.trim().length < 50) {
      return res.status(422).json({
        error: 'insufficient_content',
        message: 'Not enough readable text. Page may require JavaScript to render.',
      } as ApiError);
    }

    // ─── Gemini scoring on extracted text ────────────────────────────────────
    const gemini = await analyzeContent(scan.extractedText, industry || 'General / Other', analysisModule);

    // ─── Adjust score with technical signals ─────────────────────────────────
    const adjustedScore = applyTechnicalAdjustments(gemini.overallScore, scan.signals);

    const result = {
      ...gemini,
      overallScore: adjustedScore,
      // flat signals object — kept for isJsRendered check
      technical_signals: scan.signals,
      // display-ready signals array — rendered in the UI
      signals: scan.displaySignals,
      technical_recommendations: scan.recommendations,
      url_scanned: url,
      scan_timestamp: new Date().toISOString(),
    };

    // ─── Increment usage ────────────────────────────────────────────────────
    const updated = await incrementUserUsage(user.id);
    if (updated) res.setHeader('X-Usage-Info', JSON.stringify(updated.usage));

    return res.status(200).json({ success: true, data: result, ...result, raw: gemini });
  } catch (error) {
    console.error('URL scan error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}
