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
