// Run once DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD are set, before setting
// DATAFORSEO_VERIFIED=true:
//   npx tsx scripts/dataforseo-verify.ts "best wedding cake bakery in austin" sweetco.com <out-dir>
// Asks each DataForSEO engine once, saves the raw responses to <out-dir> for
// comparison with __tests__/fixtures/dataforseo, and prints what the parser
// read. Prints no credentials. Costs a few cents in DataForSEO credit.
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { buildTask, parseDataforseo, type DfsEngine } from '../services/engines/dataforseo';

const PATHS: Record<DfsEngine, string> = {
  ai_overviews: '/serp/google/organic/live/advanced',
  ai_mode: '/serp/google/ai_mode/live/advanced',
  perplexity: '/ai_optimization/perplexity/llm_responses/live',
  claude: '/ai_optimization/claude/llm_responses/live',
};

async function main() {
  const [question = 'best wedding cake bakery in austin', site = '', outDir = '.'] = process.argv.slice(2);
  const { DATAFORSEO_LOGIN: login, DATAFORSEO_PASSWORD: password } = process.env;
  if (!login || !password) throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD first.');
  mkdirSync(outDir, { recursive: true });
  for (const engine of Object.keys(PATHS) as DfsEngine[]) {
    const res = await fetch(`https://api.dataforseo.com/v3${PATHS[engine]}`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([buildTask(engine, question, 'US', 'TX')]),
    });
    const json: any = await res.json().catch(() => ({}));
    writeFileSync(join(outDir, `${engine}.json`), JSON.stringify(json, null, 2));
    const a = parseDataforseo(engine, json);
    const task = json?.tasks?.[0];
    console.log(`${engine}: http ${res.status}, status ${json?.status_code}/${task?.status_code} ${task?.status_message ?? ''}`);
    console.log(`  answer shown: ${a.present}, sources: ${a.sources.length}, text chars: ${a.text.length}, cost: ${a.cost}`);
    console.log(`  domains: ${a.sources.map(s => s.domain).slice(0, 8).join(', ')}${site && a.sources.some(s => s.domain.includes(site)) ? `  (includes ${site})` : ''}`);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
