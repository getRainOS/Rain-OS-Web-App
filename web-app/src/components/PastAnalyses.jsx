import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const typeOf = item => (item.repo ? 'repo' : item.url ? 'url' : 'content');
const day = d => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', color: 'var(--text)', textDecoration: 'none', fontSize: 13.5 };
const dim = { color: 'var(--text-dim)', whiteSpace: 'nowrap' };
const tabStyle = active => ({
  background: 'none', border: 'none', padding: '4px 0', marginRight: 16, cursor: 'pointer', fontSize: 13,
  color: active ? 'var(--text)' : 'var(--text-dim)', fontWeight: active ? 600 : 400,
  borderBottom: active ? '2px solid var(--text)' : '2px solid transparent',
});

// The Library on each tool's page: saved analyses of one kind (one row per
// piece, with how many times it was analyzed), and for content, Drafts set
// aside with "Start a new piece".
export default function PastAnalyses({ kind, title = 'Library', refreshKey, drafts = [], onOpenDraft, onDeleteDraft }) {
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('analyses');
  useEffect(() => {
    api.history({ limit: 100 })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        // Newest first, so the first row of each piece is its latest analysis.
        const pieces = new Map();
        for (const i of list.filter(x => typeOf(x) === kind)) {
          const key = i.series_id ?? i.id;
          const p = pieces.get(key);
          if (p) p.count += 1; else pieces.set(key, { ...i, count: 1 });
        }
        setItems([...pieces.values()].slice(0, 10));
      })
      .catch(() => setItems([]));
  }, [kind, refreshKey]);

  const hasDrafts = kind === 'content' && drafts.length > 0;
  if ((!items || items.length === 0) && !hasDrafts) return null;
  const showing = hasDrafts && (tab === 'drafts' || !items?.length) ? 'drafts' : 'analyses';
  const openHref = i => (kind === 'content' ? `/analyze/${i.id}` : `/history?tab=analyses&type=${kind}&open=${i.id}`);

  return (
    <section className="card" style={{ padding: '18px 20px', marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
        <Link to={`/history?tab=analyses&type=${kind}`} style={{ fontSize: 13, color: 'var(--text-dim)' }}>See all in History →</Link>
      </div>
      {hasDrafts && (
        <div style={{ marginTop: 10 }} role="tablist">
          <button role="tab" aria-selected={showing === 'analyses'} style={tabStyle(showing === 'analyses')} onClick={() => setTab('analyses')}>Analyses</button>
          <button role="tab" aria-selected={showing === 'drafts'} style={tabStyle(showing === 'drafts')} onClick={() => setTab('drafts')}>Drafts ({drafts.length})</button>
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
        {showing === 'analyses' && (items || []).map(i => (
          <li key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
            <Link to={openHref(i)} style={rowStyle}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title || i.url || i.repo || 'Untitled analysis'}</span>
              <span style={dim}>
                {typeof i.overall_score === 'number' ? `${i.overall_score}/100 · ` : ''}{i.count > 1 ? `${i.count} analyses · ` : ''}{day(i.analyzed_at || i.created_at)}
              </span>
            </Link>
          </li>
        ))}
        {showing === 'drafts' && drafts.map(d => (
          <li key={d.id} style={{ borderTop: '1px solid var(--border)', ...rowStyle }}>
            <button onClick={() => onOpenDraft?.(d)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {d.title || d.content.slice(0, 60)}
            </button>
            <span style={dim}>
              Not analyzed · {day(d.savedAt)}
              <button onClick={() => onDeleteDraft?.(d)} aria-label="Delete draft" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: 10 }}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
      {hasDrafts && showing === 'drafts' && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '8px 0 0' }}>Drafts are kept in this browser.</p>
      )}
    </section>
  );
}
