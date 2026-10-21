import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const typeOf = item => (item.repo ? 'repo' : item.url ? 'url' : 'content');
const day = d => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

// The last few saved analyses of one kind (content, url or repo), shown on
// that tool's page. Each opens in History; "See all" lists every one.
export default function PastAnalyses({ kind, title = 'Past analyses', refreshKey }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.history({ limit: 100 })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setItems(list.filter(i => typeOf(i) === kind).slice(0, 8));
      })
      .catch(() => setItems([]));
  }, [kind, refreshKey]);

  if (!items || items.length === 0) return null;
  return (
    <section className="card" style={{ padding: '18px 20px', marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
        <Link to={`/history?tab=analyses&type=${kind}`} style={{ fontSize: 13, color: 'var(--text-dim)' }}>See all in History →</Link>
      </div>
      <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
        {items.map(i => (
          <li key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
            <Link to={`/history?tab=analyses&type=${kind}&open=${i.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', color: 'var(--text)', textDecoration: 'none', fontSize: 13.5 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title || i.url || i.repo || 'Untitled analysis'}</span>
              <span style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                {typeof i.overall_score === 'number' ? `${i.overall_score}/100 · ` : ''}{day(i.analyzed_at || i.created_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
