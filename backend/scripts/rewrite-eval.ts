// Runs real content through the live pipeline: score → rubric rewrite (with
// its own scoring and second pass) → score the original again, to check that
// scores repeat. Needs GEMINI_API_KEY. Prints numbers only, no secrets.
//   npx tsx scripts/rewrite-eval.ts [module] [file ...]
// Defaults: module "general", every file in scripts/rewrite-samples.
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { analyzeContent } from '../services/geminiService';
import { pillarRewrite } from '../services/pillarRewrite';
import { wordCount } from '../services/geminiService';

async function main() {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) throw new Error('Set GEMINI_API_KEY first.');
  const [module = 'general', ...files] = process.argv.slice(2);
  const dir = join(__dirname, 'rewrite-samples');
  const paths = files.length ? files : readdirSync(dir).map(f => join(dir, f));
  for (const p of paths) {
    const text = readFileSync(p, 'utf8');
    const t0 = Date.now();
    const before = await analyzeContent(text, 'General / Other', module as any);
    const again = await analyzeContent(text, 'General / Other', module as any);
    const r = await pillarRewrite(text, module, { baseline: before });
    console.log(`\n== ${basename(p)} (${module}) — ${Math.round((Date.now() - t0) / 1000)}s`);
    console.log(`  original scored twice: ${before.overallScore} and ${again.overallScore} (repeatability)`);
    console.log(`  rewrite: ${r.before.overall} -> ${r.after.overall} in ${r.passes} pass(es); words ${wordCount(text)} -> ${wordCount(r.rewritten)}`);
    for (const pl of r.after.pillars) {
      const b = r.before.pillars.find(x => x.key === pl.key)?.score;
      console.log(`    ${pl.label.padEnd(24)} ${b} -> ${pl.score}`);
    }
    console.log(`  owner to-dos (${r.needsYou.length}): ${r.needsYou.map(n => n.item).join('; ') || 'none'}`);
    console.log(`  FAQ items: ${r.faq.length}; measured: ${r.signals.filter(s => s.better === true).map(s => s.label).join(', ')}`);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
