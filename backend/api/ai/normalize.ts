import express from 'express';
import { upsertAiContentProfileFromNormalize } from '../../services/aiReadiness/analysisService';
import type { ApiError } from '../../types';

/**
 * POST /ai/normalize
 * Body (plugin sends): { contentId: string, text?: string, html?: string, canonicalUrl?: string, lastModified?: string, outboundLinks?: string[] }
 */
export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { contentId, text, html, canonicalUrl, lastModified, outboundLinks } = (req.body || {}) as any;

    if (!contentId || (!text && !html)) {
      return res.status(400).json({ error: 'bad_request', message: 'contentId and text/html required' } as ApiError);
    }

    await upsertAiContentProfileFromNormalize({
      contentId: String(contentId),
      text: typeof text === 'string' ? text : undefined,
      html: typeof html === 'string' ? html : undefined,
      canonicalUrl: typeof canonicalUrl === 'string' ? canonicalUrl : undefined,
      lastModified: typeof lastModified === 'string' ? lastModified : undefined,
      outboundLinks: Array.isArray(outboundLinks) ? outboundLinks.map(String) : undefined,
    });

    return res.status(202).json({
      ok: true,
      contentId,
      message: 'Normalization accepted',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[ai/normalize] error', e);
    return res.status(500).json({ error: 'internal_server_error', message: 'Normalize failed' } as ApiError);
  }
}
