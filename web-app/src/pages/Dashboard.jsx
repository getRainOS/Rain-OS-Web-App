import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../App.jsx';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import styles from './Dashboard.module.css';

const PILLAR_COLORS = {
  ai_readability:        '#06b6d4',
  digital_authority:     '#22c55e',
  conversion_readiness:  '#a855f7',
  product_discoverability: '#f97316',
};

const PILLAR_LABELS = {
  ai_readability:        'AI Readability',
  digital_authority:     'Digital Authority',
  conversion_readiness:  'Conversion Readiness',
  product_discoverability: 'Product Discoverability',
};

function scoreClass(s) {
  if (s >= 75) return styles.scoreGood;
  if (s >= 50) return styles.scoreOk;
  return styles.scorePoor;
}

export default function Dashboard() {
  const { user } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.history({ limit: 30 })
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const totalAnalyses = history.length;
  const avgScore = totalAnalyses > 0
    ? Math.round(history.reduce((s, h) => s + (h.overall_score ?? 0), 0) / totalAnalyses)
    : 0;

  const pillarAvgs = Object.keys(PILLAR_LABELS).map(key => ({
    key,
    label: PILLAR_LABELS[key],
    value: totalAnalyses > 0
      ? Math.round(history.reduce((s, h) => s + (h[key] ?? 0), 0) / totalAnalyses)
      : 0,
    color: PILLAR_COLORS[key],
  }));

  const chartHistory = [...history]
    .slice(-14)
    .reverse()
    .map((h, i) => ({
      name: i + 1,
      score: h.overall_score ?? 0,
      date: h.analyzed_at ? new Date(h.analyzed_at).toLocaleDateString() : '',
    }));

  const pillarBarData = pillarAvgs.map(p => ({
    name: p.label.split(' ')[0],
    value: p.value,
    color: p.color,
  }));

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Monitor your content's AI readability performance</p>
        </div>
        <Link to="/analyze" className="btn btn-primary">
          + New Analysis
        </Link>
      </div>

      <div className={styles.kpis}>
        <KpiCard
          label="Total Analyses"
          value={loading ? '—' : totalAnalyses}
          sub="All time"
          color="var(--cyan)"
        />
        <KpiCard
          label="Average Score"
          value={loading ? '—' : `${avgScore}%`}
          sub="Last 30 analyses"
          color="var(--green)"
          valueClass={!loading ? scoreClass(avgScore) : ''}
        />
        <KpiCard
          label="API Usage"
          value={user ? `${user.usage?.count ?? 0} / ${user.usage?.limit ?? 100}` : '—'}
          sub="This billing cycle"
          color="var(--purple)"
        />
        <KpiCard
          label="Plan"
          value={user?.subscriptionStatus === 'active' ? 'Active' : 'Free'}
          sub="Current subscription"
          color="var(--orange)"
        />
      </div>

      <div className={styles.charts}>
        <div className="card">
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Performance History</h2>
            <span className={styles.chartSub}>Last 14 analyses</span>
          </div>
          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : chartHistory.length === 0 ? (
            <div className={styles.chartEmpty}>
              <p>No analyses yet. <Link to="/analyze" className={styles.link}>Run your first analysis</Link></p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartHistory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(v) => [`${v}%`, 'Score']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ''}
                />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Pillar Breakdown</h2>
            <span className={styles.chartSub}>Average scores</span>
          </div>
          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : totalAnalyses === 0 ? (
            <div className={styles.chartEmpty}><p>No data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pillarBarData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pillarBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Recent Analyses</h2>
          <Link to="/history" className={styles.link}>View all →</Link>
        </div>
        {loading ? (
          <div className={styles.chartEmpty}><span className="spinner" /></div>
        ) : history.length === 0 ? (
          <div className={styles.chartEmpty}>
            <p>No analyses yet. <Link to="/analyze" className={styles.link}>Get started</Link></p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title / URL</th>
                  <th>Overall</th>
                  <th>AI Read.</th>
                  <th>Authority</th>
                  <th>Conversion</th>
                  <th>Discoverability</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((item, i) => (
                  <tr key={i}>
                    <td className={styles.tdTitle}>{item.title || item.url || '—'}</td>
                    <td><ScoreBadge value={item.overall_score} /></td>
                    <td><ScoreBadge value={item.ai_readability} color="var(--cyan)" /></td>
                    <td><ScoreBadge value={item.digital_authority} color="var(--green)" /></td>
                    <td><ScoreBadge value={item.conversion_readiness} color="var(--purple)" /></td>
                    <td><ScoreBadge value={item.product_discoverability} color="var(--orange)" /></td>
                    <td className={styles.tdDate}>{item.analyzed_at ? new Date(item.analyzed_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color, valueClass }) {
  return (
    <div className={`card ${styles.kpiCard}`} style={{ '--pillar-color': color }}>
      <div className={`${styles.kpiValue} ${valueClass || ''}`}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiSub}>{sub}</div>
      <div className={styles.kpiBar} />
    </div>
  );
}

function ScoreBadge({ value, color }) {
  if (value === undefined || value === null) return <span className={styles.scoreDash}>—</span>;
  const v = Math.round(value);
  const c = color || (v >= 75 ? 'var(--green)' : v >= 50 ? 'var(--yellow)' : 'var(--red)');
  return (
    <span className={styles.scoreBadge} style={{ color: c, borderColor: c }}>
      {v}
    </span>
  );
}
