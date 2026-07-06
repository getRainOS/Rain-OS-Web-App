import express from 'express';
import { findUserByApiKey, incrementUserUsage } from '../services/dbService';
import {
  analyzeContent,
  generateDescription,
  generateTitles,
  rewriteSentence,
  summarizeContent,
} from '../services/geminiService';
import type { User, ApiError } from '../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
};

export default async function handler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }

  const user: User | null = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  if (user.subscriptionStatus !== 'active') {
    return res.status(402).json({ error: 'payment_required', message: 'Active subscription required' } as ApiError);
  }

  try {
    if (user.usage.count >= user.usage.limit) {
      return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly analysis limit exceeded' } as ApiError);
    }

    const { action = 'full_analysis', content, industry, sentence, title, module } = req.body as any;
    const analysisModule: 'general' | 'product_sellers' | 'developers' | 'local_business' =
      module === 'product_sellers' || module === 'developers' || module === 'local_business' ? module : 'general';
    let result: any;

    switch (action) {
      case 'full_analysis':
        // industry is optional; default it
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        result = await analyzeContent(content, industry || 'General / Other', analysisModule);
        break;

      case 'suggest_titles':
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
                {
          const out = await generateTitles(content);
          const titles = Array.isArray((out as any)?.titles) ? (out as any).titles : [];
          result = {
            titles: titles.map((t: string, idx: number) => ({
              text: t,
              score: Math.max(60, 92 - idx * 3),
            })),
          };
        }
        break;

      case 'generate_description': // existing clients
            if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        {
          const out = await generateDescription(content);
          result = { meta_description: (out as any)?.description || '' };
        }
        break;

      case 'summarize_content': // existing clients
            if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        {
          const out = await summarizeContent(content);
          result = { summary: (out as any)?.summary || '' };
        }
        break;

      case 'rewrite_sentence': // existing clients
            if (!sentence) {
              const fallback = typeof content === 'string' ? content : '';
          if (!fallback) {
            return res.status(400).json({ error: 'bad_request', message: 'sentence required' } as ApiError);
          }
          const out = await rewriteSentence(fallback);
          result = { rewritten: (out as any)?.rewritten || '' };
          break;
        }
        {
          const out = await rewriteSentence(sentence);
          result = { rewritten: (out as any)?.rewritten || '' };
        }
        break;

      default:
        return res.status(400).json({ error: 'bad_request', message: `Invalid action: ${action}` } as ApiError);
    }

    const updatedUser = await incrementUserUsage(user.id);
    if (updatedUser) {
      res.setHeader('X-Usage-Info', JSON.stringify(updatedUser.usage));
    }

    return res.status(200).json({ success: true, data: result, ...result });

  } catch (error) {
    console.error(`Analyze Error [${(req.body as any)?.action}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}
