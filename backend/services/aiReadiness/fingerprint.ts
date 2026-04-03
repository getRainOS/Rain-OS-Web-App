import crypto from 'crypto';
import type { NormalizationFingerprint } from '../../types';

const hash = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

export function generateFingerprint(input: {
  headings: string[];
  paragraphs: string[];
  outboundLinks: string[];
  lastModified?: string;
}): NormalizationFingerprint {
  return {
    structureHash: hash(input.headings.join('|') + input.paragraphs.length),
    outboundLinksHash: hash(input.outboundLinks.join('|')),
    freshnessHash: hash(input.lastModified || ''),
  };
}
