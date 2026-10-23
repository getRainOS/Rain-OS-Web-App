// One real run of "Fix all for me": score, rewrite against the listed fixes,
// and print which fixes the rewrite actually fixed. Usage: tsx scripts/fix-eval.ts <file> <content type> [lane]
import { readFileSync } from 'fs';
import { analyzeContent } from '../services/geminiService';
import { pillarRewrite } from '../services/pillarRewrite';

(async () => {
  const [file, contentType = 'Social Post', lane = 'general'] = process.argv.slice(2);
  const text = readFileSync(file, 'utf8');
  const before = await analyzeContent(text, 'General / Other', lane as any, contentType);
  const fixes = before.recommendations.map((r: any) => ({ ...r }));
  console.log(`BEFORE ${before.overallScore}`, before.pillarScores);
  fixes.forEach((f: any) => console.log(`  [${f.source}] ${f.pillar} ${f.sub || f.metric || ''}: ${f.text}`));
  const r = await pillarRewrite(text, lane, { contentType, baseline: before as any, fixes });
  console.log(`\nAFTER ${r.after.overall} (passes ${r.passes}), words ${text.split(/\s+/).length} -> ${r.rewritten.split(/\s+/).length}, chars ${text.length} -> ${r.rewritten.length}`);
  r.after.pillars.forEach(p => console.log(`  ${p.label}: ${r.before.pillars.find(b => b.key === p.key)?.score} -> ${p.score}`));
  const byId = Object.fromEntries(fixes.map((f: any) => [f.id, f]));
  console.log(`UNVERIFIED: ${r.unverified.join(" | ") || "none"}`);
  console.log(`\nFIXED ${r.fixes.filter(x => x.done).length} of ${r.fixes.length}`);
  r.fixes.forEach(x => console.log(`  ${x.done ? 'DONE ' : x.done === false ? 'OPEN ' : '???? '} ${byId[x.id]?.sub || byId[x.id]?.metric}${x.now ? ` (now ${x.now})` : ''}`));
  console.log('\nREWRITE:\n' + r.rewritten);
})().catch(e => { console.error('FAILED:', e?.status || '', e?.message || e); process.exit(1); });
