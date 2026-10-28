import Logo from '../components/Logo.tsx';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { buildSubjects, checkBelongs, getSubjectKey } from '../lib/subjects.js';
import { buildSourceTypes } from '../lib/sourceTypes.js';
import { LANES } from '../lib/lanes.js';
import Select from '../components/Select.jsx';
import styles from './Report.module.css';

const list = d => (Array.isArray(d) ? d : d?.items ?? d?.data ?? []);
const when = r => r.checkedAt || r.checked_at || r.analyzed_at;
const day = d => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const longDay = d => d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const share = (n, d) => (d > 0 ? Math.round((n / d) * 100) : null);
const byDate = rows => [...rows].sort((a, b) => new Date(when(b)) - new Date(when(a)));
const engineName = e => ({ gemini: 'Gemini', chatgpt: 'ChatGPT', perplexity: 'Perplexity', google_ai: 'Google AI', aio: 'Google AI Overviews', ai_overviews: 'Google AI Overviews', claude: 'Claude', copilot: 'Copilot' }[e] || (e ? e[0].toUpperCase() + e.slice(1) : 'Gemini'));

const PILLARS = [
  ['ai_readability', 'AI Readability'],
  ['digital_authority', 'Digital Authority'],
  ['conversion_readiness', 'Conversion Readiness'],
  ['rag_readiness', 'Easy to Quote'],
  ['product_discoverability', 'Product Discoverability'],
  ['local_presence', 'Local Presence'],
];
const pillarLabel = k => PILLARS.find(p => p[0] === k)?.[1] || k;
const STRONG = 75;

// A consulting-style assessment of one brand, website or piece: an action
// title, three findings, a scorecard, two exhibits, prioritized
// recommendations and an appendix. Laid out to print or save as a PDF.
export default function Report() {
  const { user, userLane } = useApp();
  const [data, setData] = useState(null);
  const [key, setKey] = useState(getSubjectKey());

  useEffect(() => {
    const safe = p => p.then(({ data }) => data).catch(() => null);
    Promise.all([
      safe(api.history({ limit: 200 })),
      safe(api.citationHistory({ limit: 100, engine: 'all' })),
      safe(api.brandVisHistory()),
      safe(api.sovHistory()),
    ]).then(([h, c, b, s]) => setData({ history: list(h), citations: list(c), brand: list(b), sov: list(s) }));
  }, []);

  const subjects = useMemo(() => (data ? buildSubjects(data.history, userLane) : []), [data, userLane]);
  const subject = subjects.find(s => s.key === key) || subjects[0] || null;

  const view = useMemo(() => {
    if (!data || !subject) return null;
    const mine = r => checkBelongs(r, subject);
    const runs = byDate(data.history.filter(h => {
      if (subject.type === 'site') return !h.repo && h.url && h.url.toLowerCase().includes(subject.website);
      return subject.latestId === h.id || (h.series_id != null && data.history.find(x => x.id === subject.latestId)?.series_id === h.series_id);
    }));
    const latest = runs[0] || data.history.find(h => h.id === subject.latestId) || null;
    const citations = byDate(data.citations.filter(mine));
    const brand = byDate(data.brand.filter(mine));
    const sov = byDate(data.sov.filter(mine));

    const yes = citations.filter(c => c.mentioned === true || c.cited).length;
    const recommendedPct = share(yes, citations.length);
    const mentionedPct = share(brand.filter(r => (r.mentionStatus || r.mention_status) === 'mentioned').length, brand.length);
    const sovPct = sov.find(r => r.sharePercent != null)?.sharePercent ?? null;

    const pillars = latest ? PILLARS.map(([k, label]) => ({ key: k, label, score: latest[k] })).filter(p => typeof p.score === 'number' && p.score > 0) : [];
    const weakest = [...pillars].sort((a, b) => a.score - b.score)[0] || null;

    const counts = new Map();
    let own = 0;
    for (const c of citations) {
      const seen = new Set();
      for (const s of c.sources || []) {
        const d = String(s.domain || '').toLowerCase().replace(/^www\./, '');
        if (!d || seen.has(d)) continue;
        seen.add(d);
        if (subject.website && (d === subject.website || d.endsWith(`.${subject.website}`))) { own += 1; continue; }
        const e = counts.get(d) || { domain: d, queryCount: 0, avgRank: 0 };
        e.queryCount += 1;
        counts.set(d, e);
      }
    }
    const sources = buildSourceTypes([...counts.values()], own ? { queryCount: own } : null);

    const recs = (latest?.recommendations || [])
      .map(r => (typeof r === 'string' ? { pillar: null, text: r } : r))
      .filter(r => r?.text)
      .sort((a, b) => (latest?.[a.pillar] ?? 101) - (latest?.[b.pillar] ?? 101))
      .slice(0, 5);

    // The action title: the one sentence a reader should leave with.
    const name = subject.name;
    const gap = weakest ? `; the biggest gap is ${weakest.label}` : '';
    const title = citations.length
      ? `${name} is recommended in ${yes} of ${citations.length} AI answers${gap}`
      : latest ? `${name} scores ${latest.overall_score}/100 for AI readiness${gap}`
      : `${name} has not been assessed yet`;

    const findings = [];
    if (citations.length) findings.push(recommendedPct >= 50
      ? `AI already names or cites ${name} in ${recommendedPct}% of the answers checked. The task is to hold that position as answers refresh.`
      : `AI names or cites ${name} in ${recommendedPct}% of the answers checked, so most customers asking AI are pointed elsewhere.`);
    if (weakest) findings.push(weakest.score < STRONG
      ? `${weakest.label} scores ${weakest.score}/100, the lowest of ${pillars.length} pillars and below the ${STRONG} we consider strong. It is where fixes will move the overall score most.`
      : `Every pillar scores ${STRONG} or above; ${weakest.label} is the lowest at ${weakest.score}/100.`);
    if (sources.types[0]) findings.push(`${sources.types[0].label} supply ${Math.round(sources.types[0].share * 100)}% of the sources AI uses for these questions (e.g. ${sources.types[0].domains.slice(0, 2).map(d => d.domain).join(', ')}). ${sources.types[0].action}`);
    else if (!citations.length) findings.push('No AI answers have been checked yet. Run a citation check to see whether AI recommends you and which sites it trusts instead.');

    return { latest, runs, citations, brand, sov, yes, recommendedPct, mentionedPct, sovPct, pillars, sources, recs, title, findings };
  }, [data, subject]);

  const lane = LANES.find(l => l.id === userLane)?.label;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Link to="/dashboard" className={styles.back}><ArrowLeft size={14} /> Dashboard</Link>
        <div className={styles.toolbarRight}>
          {subjects.length > 0 && (
            <Select className={styles.siteSelect} value={subject?.key || ''} onChange={setKey} ariaLabel="What the report covers"
              options={subjects.map(s => ({ value: s.key, label: s.name }))} />
          )}
          <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!view}>
            <Printer size={14} /> Print or save as PDF
          </button>
        </div>
      </div>

      <article className={`${styles.paper} printArea`}>
        <header className={styles.cover}>
          <div className={styles.kicker}><Logo size={20} /> <span>AI visibility assessment</span></div>
          <h1 className={styles.coverTitle}>{subject?.name || 'Your business'}</h1>
          <p className={styles.coverMeta}>
            {[lane, subject?.website, `Prepared ${longDay(new Date())}`, user?.email ? `for ${user.email}` : null].filter(Boolean).join('  ·  ')}
          </p>
        </header>

        {!data ? <p className={styles.empty}>Loading your results…</p>
        : !view ? <p className={styles.empty}>Analyze a website or a piece of content first; the report is built from it.</p>
        : (
          <>
            <section className={styles.summary}>
              <div className={styles.label}>Executive summary</div>
              <h2 className={styles.actionTitle}>{view.title}.</h2>
              <ol className={styles.findings}>
                {view.findings.map((f, i) => <li key={i}>{f}</li>)}
              </ol>
            </section>

            <section className={styles.scorecard}>
              <Kpi label="AI readiness" value={view.latest ? view.latest.overall_score : '—'} unit={view.latest ? '/100' : ''} note={view.latest ? `Latest analysis, ${day(view.latest.analyzed_at)}` : 'No analysis yet'} />
              <Kpi label="Recommended by AI" value={view.recommendedPct ?? '—'} unit={view.recommendedPct != null ? '%' : ''} note={view.citations.length ? `${view.yes} of ${view.citations.length} answers` : 'No answers checked'} />
              <Kpi label="Brand mentioned" value={view.mentionedPct ?? '—'} unit={view.mentionedPct != null ? '%' : ''} note={view.brand.length ? `${view.brand.length} sentiment checks` : 'Not checked'} />
              <Kpi label="Share of voice" value={view.sovPct ?? '—'} unit={view.sovPct != null ? '%' : ''} note={view.sovPct != null ? 'vs. competitors, latest' : 'Not checked'} />
            </section>

            {view.pillars.length > 0 && (
              <Exhibit n={1} title={`Pillar scores: ${view.pillars.filter(p => p.score < STRONG).length ? `${view.pillars.filter(p => p.score < STRONG).length} of ${view.pillars.length} pillars sit below ${STRONG}` : `all ${view.pillars.length} pillars are at ${STRONG} or above`}`}
                source={`Source: rain OS analysis of ${view.latest.url || view.latest.title || subject.name}, ${day(view.latest.analyzed_at)}. Dashed line marks ${STRONG}, the threshold we treat as strong.`}>
                <div className={styles.bars}>
                  {[...view.pillars].sort((a, b) => b.score - a.score).map(p => (
                    <div key={p.key} className={styles.barRow}>
                      <span className={styles.barLabel}>{p.label}</span>
                      <span className={styles.barTrack}>
                        <span className={styles.barFill} data-weak={p.score < STRONG ? '1' : '0'} style={{ width: `${p.score}%` }} />
                        <span className={styles.barMark} style={{ left: `${STRONG}%` }} />
                      </span>
                      <span className={styles.barValue}>{p.score}</span>
                    </div>
                  ))}
                </div>
              </Exhibit>
            )}

            {view.sources.total > 0 && (
              <Exhibit n={2} title={`Where AI gets its answers: ${view.sources.types[0].label.toLowerCase()} lead${view.sources.ownCitations ? `, your own site supplies ${Math.round(view.sources.ownShare * 100)}%` : ', your own site is not among them'}`}
                source={`Source: sources cited in ${view.citations.length} AI answers checked by rain OS (${[...new Set(view.citations.map(c => engineName(c.engine)))].join(', ')}). Share of all sources cited.`}>
                <div className={styles.bars}>
                  {view.sources.ownCitations > 0 && (
                    <div className={styles.barRow}>
                      <span className={styles.barLabel}><strong>Your site</strong></span>
                      <span className={styles.barTrack}><span className={styles.barFill} data-own="1" style={{ width: `${Math.round(view.sources.ownShare * 100)}%` }} /></span>
                      <span className={styles.barValue}>{Math.round(view.sources.ownShare * 100)}%</span>
                    </div>
                  )}
                  {view.sources.types.slice(0, 5).map(t => (
                    <div key={t.id} className={styles.barRow}>
                      <span className={styles.barLabel}>{t.label}<small>{t.domains.slice(0, 3).map(d => d.domain).join(', ')}</small></span>
                      <span className={styles.barTrack}><span className={styles.barFill} style={{ width: `${Math.round(t.share * 100)}%` }} /></span>
                      <span className={styles.barValue}>{Math.round(t.share * 100)}%</span>
                    </div>
                  ))}
                </div>
              </Exhibit>
            )}

            {view.recs.length > 0 && (
              <section className={styles.section}>
                <div className={styles.label}>Recommendations</div>
                <h2 className={styles.sectionTitle}>Priority actions, weakest pillar first</h2>
                <ol className={styles.recs}>
                  {view.recs.map((r, i) => (
                    <li key={i}>
                      <span className={styles.recNum}>{i + 1}</span>
                      <div>
                        <p className={styles.recText}>{r.text}</p>
                        {r.pillar && <p className={styles.recTag}>{pillarLabel(r.pillar)}{typeof view.latest?.[r.pillar] === 'number' ? ` · currently ${view.latest[r.pillar]}/100` : ''}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className={`${styles.section} ${styles.appendix}`}>
              <div className={styles.label}>Appendix</div>
              <Table title="A. AI answers checked" empty="No AI answers checked yet."
                head={['Question', 'AI', 'Named', 'Cited', 'Date']}
                rows={view.citations.slice(0, 20).map(c => [c.topic, engineName(c.engine), c.mentioned == null ? '—' : c.mentioned ? 'Yes' : 'No', c.cited ? 'Yes' : 'No', day(when(c))])} />
              <Table title="B. Analyses" empty="No analyses yet."
                head={['Page or piece', 'Score', 'Date']}
                rows={view.runs.slice(0, 10).map(r => [r.title || r.url || 'Untitled', r.overall_score ?? '—', day(r.analyzed_at)])} />
            </section>

            <footer className={styles.foot}>
              <strong>Methodology.</strong> AI readiness scores come from rain OS's analysis of the page or content against the signals AI engines use to choose sources, weighted for the {lane || 'selected'} lane. "Recommended" counts answers that name the brand or cite its website. AI answers vary between runs and change over time, so read single checks as a snapshot and trends as the signal.
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

function Kpi({ label, value, unit, note }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}<span>{unit}</span></div>
      <div className={styles.kpiNote}>{note}</div>
    </div>
  );
}

function Exhibit({ n, title, source, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.label}>Exhibit {n}</div>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
      <p className={styles.source}>{source}</p>
    </section>
  );
}

function Table({ title, head, rows, empty }) {
  return (
    <div className={styles.tableBlock}>
      <h3 className={styles.tableTitle}>{title}</h3>
      {rows.length === 0 ? <p className={styles.empty}>{empty}</p> : (
        <table className={styles.table}>
          <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
