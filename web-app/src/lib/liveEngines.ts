import { useEffect, useState } from 'react';

// The AI engines rain OS checks right now, from the backend. Marketing copy
// reads this, so an engine is named only once it's live (e.g. AI Overviews
// appears by itself when DataForSEO is connected). The fallback is what's
// live today, shown until the request returns.
const FALLBACK = ['ChatGPT', 'Gemini'];
const ORDER = ['chatgpt', 'gemini', 'ai_overviews', 'ai_mode', 'perplexity', 'claude', 'copilot'];
let cache: string[] | null = null;

export function useLiveEngines(): string[] {
  const [names, setNames] = useState<string[]>(cache ?? FALLBACK);
  useEffect(() => {
    if (cache) return;
    let off = false;
    fetch('https://api.getrainos.com/api/public/engines')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const list = Array.isArray(d?.engines) ? d.engines : [];
        if (!list.length || off) return;
        const rank = (id: string) => (ORDER.indexOf(id) + 1 || 99);
        cache = [...list].sort((a: any, b: any) => rank(a.id) - rank(b.id)).map((e: any) => String(e.name));
        setNames(cache);
      })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  return names;
}

// ["ChatGPT", "Gemini", "Perplexity"] → "ChatGPT, Gemini and Perplexity"
export const joinNames = (n: string[]) =>
  n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
