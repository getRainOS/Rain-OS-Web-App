import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { groupPieces } from '../lib/analysisSeries.js';
import { domainOf } from '../lib/opportunities.js';
import Select from '../components/Select.jsx';
import styles from './Report.module.css';

const list = d => (Array.isArray(d) ? d : d?.items ?? d?.data ?? []);
const when = r => r.checkedAt || r.checked_at || r.analyzed_at;
const day = d => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const pct = (n, d) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '—');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const PILLARS = [
  ['ai_readability', 'AI Readability'],
  ['digital_authority', 'Authority'],
  ['conversion_readiness', 'Conversion'],
  ['rag_readiness', 'RAG'],
];

// A one-page summary of everything saved, laid out for printing or saving
// as a PDF from the browser's print dialog.
export default function Report() {
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [site, setSite] = useState('');

  useEffect(() => {
    const safe = p => p.then(({ data }) => data).catch(() => null);
    Promise.all([
      safe(api.history({ limit: 100 })),
      safe(api.citationHistory({ limit: 100, engine: 'all' })),
      safe(api.brandVisHistory()),
      safe(api.sovHistory()),
      safe(api.brandLinks()),
    ]).then(([h, c, b, s, l]) => setData({
      history: list(h), citations: list(c), brand: list(b), sov: list(s), links: l?.links ?? [],
    }));
  }, []);

  const sites = useMemo(() => {
    if (!data) return [];
    const all = [...data.history, ...data.citations, ...data.brand, ...data.sov].map(r => domainOf(r.url)).filter(Boolean);
    return [...new Set(all)].sort();
  }, [data]);

  const view = useMemo(() => {
    if (!data) return null;
    const onSite = r => !site || domainOf(r.url) === site
      || (!!r.brand && data.links.some(l => l.site === site && squash(l.brand) === squash(r.brand)));
    const byDate = rows => [...rows].sort((a, b) => new Date(when(b)) - new Date(when(a)));
    const pieces = groupPieces(data.history.filter(h => !site || (!h.repo && domainOf(h.url) === site)));
    const citations = byDate(data.citations.filter(onSite));
    const brand = byDate(data.brand.filter(onSite));
    const sov = byDate(data.sov.filter(onSite));
    const scores = pieces.map(p => p.latest.overall_score).filter(n => typeof n === 'number');
    const mentioned = brand.filter(r => (r.mentionStatus || r.mention_status) === 'mentioned').length;
    return {
      pieces, citations, brand, sov,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      citedRate: pct(citations.filter(c => c.cited).length, citations.length),
      mentionRate: pct(mentioned, brand.length),
      share: sov.find(r => r.sharePercent != null)?.sharePercent,
    };
  }, [data, site]);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Link to="/dashboard" className={styles.back}><ArrowLeft size={14} /> Dashboard</Link>
        <div className={styles.toolbarRight}>
          {sites.length > 0 && (
            <Select
              className={styles.siteSelect}
              value={site}
              onChange={setSite}
              ariaLabel="Website the report covers"
              options={[{ value: '', label: 'All websites' }, ...sites.map(s => ({ value: s, label: s }))]}
            />
          )}
          <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!view}>
            <Printer size={14} /> Print or save as PDF
          </button>
        </div>
      </div>

      <article className={`${styles.paper} printArea`}>
        <header className={styles.head}>
          <div>
            <div className={styles.brand}>rain OS</div>
            <h1 className={styles.title}>AI visibility report</h1>
            <p className={styles.meta}>
              {site || 'All websites'} · {day(new Date())}{user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>
        </header>

        {!view ? (
          <p className={styles.empty}>Loading your results…</p>
        ) : (
          <>
            <section className={styles.kpis}>
              <Kpi label="Average content score" value={view.avgScore != null ? `${view.avgScore}/100` : '—'} note={plural(view.pieces.length, 'piece')} />
              <Kpi label="Cited by AI" value={view.citedRate} note={plural(view.citations.length, 'citation check')} />
              <Kpi label="Brand mentioned" value={view.mentionRate} note={plural(view.brand.length, 'sentiment check')} />
              <Kpi label="Share of Voice" value={view.share != null ? `${view.share}%` : '—'} note="latest check with competitors" />
            </section>

            <Table
              title="Content and pages"
              empty="No analyses yet."
              head={['Piece', ...PILLARS.map(p => p[1]), 'Overall', 'Last run']}
              rows={view.pieces.slice(0, 15).map(p => [
                p.name, ...PILLARS.map(([k]) => p.latest[k] ?? '—'), p.latest.overall_score ?? '—', day(p.latest.analyzed_at),
              ])}
            />
            <Table
              title="Citation checks"
              empty="No citation checks yet."
              head={['Question', 'Website', 'AI', 'Cited', 'Date']}
              rows={view.citations.slice(0, 15).map(c => [c.topic, domainOf(c.url) || '—', c.engine === 'chatgpt' ? 'ChatGPT' : 'Gemini', c.cited ? 'Yes' : 'No', day(when(c))])}
            />
            <Table
              title="Brand sentiment"
              empty="No brand sentiment checks yet."
              head={['Brand', 'Question', 'Mentioned', 'Sentiment', 'Date']}
              rows={view.brand.slice(0, 10).map(r => [
                r.brand, r.topic, (r.mentionStatus || r.mention_status) === 'mentioned' ? 'Yes' : 'No', r.sentiment || '—', day(when(r)),
              ])}
            />
            <Table
              title="Share of Voice"
              empty="No Share of Voice checks yet."
              head={['Brand', 'Question', 'Share', 'Top competitor', 'Date']}
              rows={view.sov.slice(0, 10).map(r => {
                const rival = (r.brandShares || []).find(b => !b.isYou);
                return [r.brand, r.topic, r.sharePercent != null ? `${r.sharePercent}%` : '—', rival ? `${rival.brand} (${rival.sharePercent}%)` : '—', day(when(r))];
              })}
            />
            <footer className={styles.foot}>
              Generated by rain OS. Visibility checks run on Gemini with Google Search; AI answers vary between runs, so treat single checks as a reading, not a verdict.
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

function Kpi({ label, value, note }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiNote}>{note}</div>
    </div>
  );
}

function Table({ title, head, rows, empty }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <table className={styles.table}>
          <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      )}
    </section>
  );
}
