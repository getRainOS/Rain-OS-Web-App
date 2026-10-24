import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import styles from './AdminUsage.module.css';

const KIND_LABELS = {
  citation: 'Citation checks', brand_sentiment: 'Brand Sentiment', share_of_voice: 'Share of Voice',
  improve_question: 'Improve a Question', question_suggestions: 'Question suggestions', world_map: 'World map',
};

// Staff-only: grounded Gemini calls per day against the free allowance.
export default function AdminUsage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.groundingUsage().then(({ data }) => setData(data)).catch(err => setError(err.message || 'Could not load usage.'));
  }, []);

  if (error) return <div><PageHeader title="Usage" /><p className={styles.note}>{error}</p></div>;
  if (!data) return <div><PageHeader title="Usage" /><span className="spinner" /></div>;

  const days = data.days || [];
  const kinds = [...new Set(days.flatMap(d => Object.keys(d.kinds)))];
  const today = days[0];
  const monthPaid = days.reduce((n, d) => n + d.estCostUsd, 0);
  const peak = days.reduce((m, d) => Math.max(m, d.total), 0);

  return (
    <div className={styles.page}>
      <PageHeader title="Usage" subtitle="Gemini calls that use Google Search, per day. Only rain OS staff can see this page." />
      <div className={styles.kpis}>
        <Kpi label="Today" value={today ? today.total.toLocaleString() : '0'} note={`of ${data.freePerDay.toLocaleString()} free a day`} />
        <Kpi label="Busiest day (30 days)" value={peak.toLocaleString()} note={peak > data.freePerDay ? 'over the free allowance' : `${Math.round((peak / data.freePerDay) * 100)}% of the free allowance`} />
        <Kpi label="Estimated search cost (30 days)" value={`$${monthPaid.toFixed(2)}`} note={`$${data.usdPer1000} per 1,000 beyond the free allowance`} />
      </div>
      {days.length === 0 ? (
        <p className={styles.note}>No grounded calls recorded yet. Counting started with this release.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Day (UTC)</th>{kinds.map(k => <th key={k}>{KIND_LABELS[k] || k}</th>)}<th>Total</th><th>Free used</th><th>Est. cost</th></tr>
            </thead>
            <tbody>
              {days.map(d => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  {kinds.map(k => <td key={k}>{d.kinds[k] || 0}</td>)}
                  <td><strong>{d.total}</strong></td>
                  <td>
                    <span className={styles.bar}><span style={{ width: `${Math.min((d.total / data.freePerDay) * 100, 100)}%` }} data-over={d.total > data.freePerDay || undefined} /></span>
                    {Math.round((d.total / data.freePerDay) * 100)}%
                  </td>
                  <td>{d.estCostUsd > 0 ? `$${d.estCostUsd.toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={styles.note}>
        The allowance and price are the published figures for Gemini 2.5 grounding as we last checked them. Google bills by its own day
        boundary and can change prices, so treat the cost as an estimate and confirm it in Google Cloud billing. Content scoring does not use Google Search and is not counted here.
      </p>
      <TestAccountReset />
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

const TEST_EMAIL = 'support@getrainos.com';
const LANE_LABELS = { local_business: 'Local business', product_sellers: 'Online sellers', vibe_coders: 'Vibe coders', developers: 'Developers', general: 'General' };

// Staff-only: clears the test account (keeping Bright Smile Dental) and
// analyzes a set of real public sites per lane.
function TestAccountReset() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.testAccount().then(({ data }) => setInfo(data)).catch(err => setError(err.message || 'Could not load the test account.'));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!info?.job?.running) return undefined;
    const t = setTimeout(load, 5000);
    return () => clearTimeout(t);
  }, [info]);

  const start = async () => {
    setBusy(true); setError('');
    try { await api.resetTestAccount(confirm); setConfirm(''); await load(); }
    catch (err) { setError(err.message || 'Could not start the reset.'); }
    finally { setBusy(false); }
  };

  const job = info?.job;
  const seeds = job?.seeds?.length ? job.seeds : info?.preview?.seeds || [];
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>Test account ({TEST_EMAIL})</h2>
      <p className={styles.note}>Removes every result and brand on this account except Bright Smile Dental, then analyzes the URLs, pasted content and GitHub repos below in their lanes. Repos need GitHub connected on this account.</p>
      {error && <p className={styles.note}>{error}</p>}
      {!info ? <span className="spinner" /> : (
        <>
          <table className={styles.table}>
            <thead><tr><th>Table</th><th>Will remove</th><th>Will keep</th></tr></thead>
            <tbody>{info.preview.counts.map(c => <tr key={c.table}><td>{c.table}</td><td>{c.remove}</td><td>{c.keep}</td></tr>)}</tbody>
          </table>
          <table className={styles.table} style={{ marginTop: 16 }}>
            <thead><tr><th>Lane</th><th>Type</th><th>Brand</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>{seeds.map(s => (
              <tr key={s.url}>
                <td>{LANE_LABELS[s.lane] || s.lane}</td><td>{s.kind === 'content' ? 'Content' : s.kind === 'repo' ? 'Repo' : 'URL'}</td><td>{s.brand}</td><td>{s.kind === 'content' ? s.title : s.url}</td>
                <td>{!s.status ? '—' : s.status === 'done' ? `Done${s.score != null ? ` · ${s.score}` : ''}` : s.status === 'failed' ? `Failed: ${s.error || 'unknown error'}` : s.status === 'running' ? 'Analyzing…' : 'Waiting'}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <input className="input" style={{ maxWidth: 320 }} placeholder={`Type ${TEST_EMAIL} to confirm`} value={confirm} onChange={e => setConfirm(e.target.value)} disabled={job?.running} />
            <button type="button" className="btn btn-primary" disabled={busy || job?.running || confirm.trim() !== TEST_EMAIL} onClick={start}>
              {job?.running ? 'Seeding…' : 'Clean & seed'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
