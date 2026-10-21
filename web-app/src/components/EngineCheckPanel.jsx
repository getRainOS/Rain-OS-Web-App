import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, ExternalLink, RotateCw } from 'lucide-react';
import { api } from '../api/client.js';
import CheckProgress from './CheckProgress.jsx';
import { locationLabel } from '../lib/usStates.js';
import styles from './EngineCheckPanel.module.css';

const POLL_MS = 4000;

function ago(iso) {
  if (!iso) return '';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  return `${h} hour${h === 1 ? '' : 's'} ago`;
}

// The same question on another engine (ChatGPT via cloro). It starts with the
// Gemini check, runs in the background (25-70s), and fills in when ready.
// Leaving the page doesn't stop it: the result is saved to History.
export default function EngineCheckPanel({ engine = 'chatgpt', label = 'ChatGPT', run, usesLocation = true }) {
  const [state, setState] = useState({ status: 'idle' });
  const [fresh, setFresh] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!run) return undefined;
    let cancelled = false;
    clearTimeout(pollRef.current);
    setState({ status: 'running' });
    const poll = id => {
      pollRef.current = setTimeout(async () => {
        try {
          const { data } = await api.pollEngineCheck(id);
          if (cancelled) return;
          if (data.status === 'running') return poll(id);
          setState(data.status === 'done' ? { status: 'done', result: data.result } : { status: 'failed', message: data.message });
        } catch (err) {
          if (!cancelled) setState({ status: 'failed', message: err.message || 'Lost track of the check. Its result will appear in History.' });
        }
      }, POLL_MS);
    };
    api.startEngineCheck({ engine, topic: run.topic, url: run.url, name: run.name, country: run.country, state: run.state ?? null, fresh: fresh > 0 })
      .then(({ data }) => {
        if (cancelled) return;
        if (data.status === 'done') setState({ status: 'done', result: data.result, reused: !!data.reused });
        else poll(data.jobId);
      })
      .catch(err => { if (!cancelled) setState({ status: 'failed', message: err.message || `${label} check failed.` }); });
    return () => { cancelled = true; clearTimeout(pollRef.current); };
  }, [run, fresh, engine, label]);

  if (!run || state.status === 'idle') return null;
  const r = state.result;
  const rank = r && r.citedSourceIndex != null ? r.citedSourceIndex + 1 : null;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>{label}</h3>
          <p className={styles.sub}>
            The same question asked on {label}{usesLocation && locationLabel(run.country, run.state) ? `, as someone in ${locationLabel(run.country, run.state)} would see it` : ''}.
          </p>
        </div>
        {state.status === 'done' && (
          r?.answerShown === false
            ? <span className={styles.muted}>No AI answer shown</span>
            : r?.url
            ? <span className={rank ? styles.good : styles.bad}>{rank ? <><CheckCircle2 size={12} /> Cited · source {rank}</> : <><AlertCircle size={12} /> Not cited</>}</span>
            : <span className={styles.muted}>No website given</span>
        )}
      </div>

      {state.status === 'running' && (
        <>
          <CheckProgress
            title={`Asking ${label}`}
            skeleton="sources"
            steps={[
              { label: `Asking ${label} your question`, ms: 6000 },
              { label: 'Waiting for its full answer', ms: 18000 },
              { label: 'Reading the sources it cited' },
            ]}
          />
          <p className={styles.note}>This takes about 30 seconds. You can leave this page; the result is saved to History.</p>
        </>
      )}

      {state.status === 'failed' && <p className={styles.error}>{state.message}</p>}

      {state.status === 'done' && r && (
        <>
          {r.summary && <p className={styles.summary}>{r.summary}</p>}
          {r.sources?.length > 0 && (
            <ol className={styles.sources}>
              {r.sources.slice(0, 8).map((s, i) => (
                <li key={s.url || i} className={rank === i + 1 ? styles.mine : ''}>
                  <span className={styles.num}>{i + 1}</span>
                  <span className={styles.domain}>{s.domain}</span>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${s.domain}`}><ExternalLink size={12} /></a>}
                </li>
              ))}
            </ol>
          )}
          <div className={styles.foot}>
            <span>{state.reused ? `From your check ${ago(r.checkedAt)}.` : 'Checked just now.'}</span>
            {state.reused && (
              <button type="button" className={styles.again} onClick={() => setFresh(f => f + 1)}>
                <RotateCw size={12} /> Check again
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
