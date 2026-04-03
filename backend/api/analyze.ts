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

/**
 * WordPress plugin expects:
 * {
 *   success: true,
 *   data: {
 *     overall_score, ai_readability, digital_authority, conversion_readiness,
 *     sub_scores: { semanticClarity, readabilityScore, ... },
 *     recommendations: [{ title, description, icon, color }]
 *   }
 * }
 *
 * We keep backward-compatibility by ALSO returning the original "result" at top-level,
 * so any existing consumers reading raw fields still work.
 */
const SUBSCORE_KEY_MAP: Record<string, string> = {
  'Semantic Clarity': 'semanticClarity',
  'Readability': 'readabilityScore',
  'Readability Score': 'readabilityScore',
  'Logical Structure': 'logicalStructure',
  'Entity Recognition': 'entityRecognition',
  'Citation Readiness': 'citationReadiness',
  'Schema Extraction': 'schemaExtraction',
  'AEO Alignment': 'aeoAlignment',
  'QA-format Detection': 'qaFormat',
  'QA Format Detection': 'qaFormat',
  'Descriptive Metadata': 'metadataAudit',
  'Metadata Audit': 'metadataAudit',
};

const toWpRecommendationObjects = (recs: unknown): Array<{ title: string; description: string; icon: string; color: string }> => {
  if (!Array.isArray(recs)) return [];
  const first = recs[0] as any;
  if (first && typeof first === 'object' && ('title' in first || 'description' in first)) {
    return recs as any;
  }
  return (recs as any[]).map((r) => ({
    title: 'Recommendation',
    description: String(r),
    icon: '💡',
    color: '#22d3ee',
  }));
};

const normalizeAnalyzeResultForWP = (result: any) => {
  const overallScore = typeof result?.overallScore === 'number' ? result.overallScore : (result?.overall_score ?? 0);
  const pillar = result?.pillarScores || result?.pillar_scores || {};
  const subScoresArr: Array<{ category: string; score: number }> = Array.isArray(result?.subScores) ? result.subScores : [];

  const sub_scores: Record<string, number> = {};
  for (const s of subScoresArr) {
    const key = SUBSCORE_KEY_MAP[s.category] || null;
    if (key) sub_scores[key] = typeof s.score === 'number' ? s.score : 0;
  }

  const defaults = [
    'semanticClarity', 'readabilityScore', 'logicalStructure', 'entityRecognition', 'citationReadiness',
    'schemaExtraction', 'aeoAlignment', 'qaFormat', 'metadataAudit',
  ];
  for (const k of defaults) if (typeof sub_scores[k] !== 'number') sub_scores[k] = 0;

  const wp = {
    overall_score: overallScore,
    ai_readability: typeof pillar?.aiReadability === 'number' ? pillar.aiReadability : (result?.ai_readability ?? 0),
    digital_authority: typeof pillar?.digitalAuthority === 'number' ? pillar.digitalAuthority : (result?.digital_authority ?? 0),
    conversion_readiness: typeof pillar?.conversionReadiness === 'number' ? pillar.conversionReadiness : (result?.conversion_readiness ?? 0),
    sub_scores,
    recommendations: toWpRecommendationObjects(result?.recommendations),
    authorship: result?.authorship || result?.authorship_data || undefined,
  };
  return wp;
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

    const { action = 'full_analysis', content, industry, sentence, title } = req.body as any;
    let result: any;

    switch (action) {
      case 'full_analysis':
        // WP plugin does NOT send "industry". Default it without breaking other clients.
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        result = await analyzeContent(content, industry || 'General / Other');
        break;

      case 'suggest_titles':
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        // WP plugin expects: { titles: [{ text, score }] }
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
      case 'generate_meta': // WP plugin quick-action alias
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        {
          const out = await generateDescription(content);
          result = { meta_description: (out as any)?.description || '' };
        }
        break;

      case 'summarize_content': // existing clients
      case 'summarize': // WP plugin quick-action alias
        if (!content) {
          return res.status(400).json({ error: 'bad_request', message: 'content required' } as ApiError);
        }
        {
          const out = await summarizeContent(content);
          result = { summary: (out as any)?.summary || '' };
        }
        break;

      case 'rewrite_sentence': // existing clients
      case 'rewrite': // WP plugin quick-action alias
        if (!sentence) {
          // WP plugin may send "content" for rewrite selection fallback.
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

    // WordPress expects { success, data }. We provide BOTH wrapped + raw fields (backward compatible).
    if (action === 'full_analysis') {
      const wp = normalizeAnalyzeResultForWP(result);
      return res.status(200).json({ success: true, data: wp, ...wp, raw: result });
    }
    return res.status(200).json({ success: true, data: result, ...result });

  } catch (error) {
    console.error(`Analyze Error [${(req.body as any)?.action}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}
