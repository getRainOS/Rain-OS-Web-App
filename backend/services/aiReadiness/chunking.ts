import crypto from 'crypto';
import type { NormalizedChunk } from '../../types';

const stripTags = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

const makeId = (t: string, idx: number) =>
  crypto.createHash('sha1').update(`${idx}:${t}`).digest('hex').slice(0, 12);

export function normalizeToChunks(text: string, html?: string): NormalizedChunk[] {
  const chunks: NormalizedChunk[] = [];
  let index = 0;

  // Prefer HTML parsing by regex blocks (cheap & deterministic)
  if (html && typeof html === 'string' && html.includes('<')) {
    const re = /<(h[1-6]|p|li|ul|ol|table)[^>]*>([\s\S]*?)<\/\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const tag = (m[1] || '').toLowerCase();
      const inner = stripTags(m[2] || '');
      if (!inner) continue;

      if (tag.startsWith('h')) {
        const level = parseInt(tag.slice(1), 10);
        chunks.push({
          chunkId: makeId(inner, index),
          type: 'heading',
          text: inner,
          wordCount: wordCount(inner),
          headingLevel: Number.isFinite(level) ? level : undefined,
          index,
        });
        index++;
        continue;
      }

      if (tag === 'p') {
        chunks.push({
          chunkId: makeId(inner, index),
          type: 'paragraph',
          text: inner,
          wordCount: wordCount(inner),
          index,
        });
        index++;
        continue;
      }

      if (tag === 'li' || tag === 'ul' || tag === 'ol') {
        chunks.push({
          chunkId: makeId(inner, index),
          type: 'list',
          text: inner,
          wordCount: wordCount(inner),
          index,
        });
        index++;
        continue;
      }

      if (tag === 'table') {
        chunks.push({
          chunkId: makeId(inner, index),
          type: 'table',
          text: inner,
          wordCount: wordCount(inner),
          index,
        });
        index++;
      }
    }
  }

  // Fallback to plain text chunking
  const plain = (html ? stripTags(html) : text || '').trim();
  if (!chunks.length && plain) {
    const parts = plain.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    for (const p of parts) {
      chunks.push({
        chunkId: makeId(p, index),
        type: 'paragraph',
        text: p,
        wordCount: wordCount(p),
        index,
      });
      index++;
    }
  }

  return chunks;
}
