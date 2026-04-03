import { getAiContentProfile, upsertAiContentProfile } from '../dbService';
import type { AIRecommendation, AIReadinessScores, NormalizedChunk, NormalizationFingerprint } from '../../types';
import { normalizeToChunks } from './chunking';
import { generateFingerprint } from './fingerprint';
import { generateAllRecommendations } from './recommendations';
import { computeAiReadinessScores } from './scores';

const VERSION = '1.0.0';

export async function upsertAiContentProfileFromNormalize(input: {
  contentId: string;
  text?: string;
  html?: string;
  canonicalUrl?: string;
  lastModified?: string;
  outboundLinks?: string[];
}) {
  const chunks: NormalizedChunk[] = normalizeToChunks(input.text || '', input.html);
  const headings = chunks.filter((c) => c.type === 'heading').map((c) => c.text);
  const paragraphs = chunks.filter((c) => c.type === 'paragraph').map((c) => c.text);
  const outboundLinks = Array.isArray(input.outboundLinks) ? input.outboundLinks : [];

  const fingerprint: NormalizationFingerprint = generateFingerprint({
    headings,
    paragraphs,
    outboundLinks,
    lastModified: input.lastModified,
  });

  const scores: AIReadinessScores = computeAiReadinessScores({ chunks, lastModified: input.lastModified, outboundLinks });
  const recommendations: AIRecommendation[] = generateAllRecommendations({ chunks, lastModified: input.lastModified });

  const profileData = {
    contentId: input.contentId,
    canonicalUrl: input.canonicalUrl,
    lastModified: input.lastModified,
    scores,
    recommendations,
    version: VERSION,
    timestamp: new Date().toISOString(),
    chunks,
  };

  await upsertAiContentProfile(input.contentId, profileData, fingerprint);
}

export async function getOrComputeAiReadinessAnalysis(contentId: string): Promise<null | {
  scores: AIReadinessScores;
  recommendations: AIRecommendation[];
  version: string;
  timestamp: string;
}> {
  const cached = await getAiContentProfile(contentId);
  if (!cached?.profile_data) return null;

  const pd = cached.profile_data as any;
  const scores: AIReadinessScores | undefined = pd?.scores;
  const recommendations: AIRecommendation[] = Array.isArray(pd?.recommendations) ? pd.recommendations : [];
  return {
    scores: scores || { readability: 0, structure: 0, freshness: 0, citation: 0, visibility: 0 },
    recommendations,
    version: String(pd?.version || VERSION),
    timestamp: String(pd?.timestamp || new Date().toISOString()),
  };
}

export async function getAiReadinessDiagnostics(contentId: string): Promise<any | null> {
  const cached = await getAiContentProfile(contentId);
  if (!cached?.profile_data) return null;
  const pd = cached.profile_data as any;
  return {
    contentId,
    version: String(pd?.version || VERSION),
    timestamp: String(pd?.timestamp || new Date().toISOString()),
    chunkCount: Array.isArray(pd?.chunks) ? pd.chunks.length : 0,
    hasRecommendations: Array.isArray(pd?.recommendations) && pd.recommendations.length > 0,
  };
}
