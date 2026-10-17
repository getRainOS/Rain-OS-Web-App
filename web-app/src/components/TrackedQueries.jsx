import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Pause, Play, Trash2, Lock, Check } from 'lucide-react';
import { api } from '../api/client.js';
import { isSharedPlatform } from '../lib/sharedPlatforms.js';
import { siteFromUrl } from '../lib/fullCheck.js';
import styles from './TrackedQueries.module.css';

// Tracking compares cited sources to your own site, so it needs one that is
// really yours: not blank, and not a page on a shared site like Facebook or Yelp.
export function trackableSite(url) {
  const d = url ? siteFromUrl(url) : '';
  return !!d && !isSharedPlatform(d);
}

export function useTrackedQueries() {
  const [items, setItems] = useState([]);
  const [cap, setCap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.trackedQueries();
      setItems(data?.items ?? []);
      setCap(typeof data?.cap === 'number' ? data.cap : 0);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load tracked questions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const track = useCallback(async (body) => {
    await api.trackQuery(body);
    await refresh();
  }, [refresh]);

  const isTracked = useCallback(
    (topic) => !!topic && items.some(i => i.topic.trim().toLowerCase() === topic.trim().toLowerCase()),
    [items]
  );

  return { items, cap, loading, error, setError, refresh, track, isTracked };
}

export function TrackWeeklyButton({ tracking, result }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  if (!result?.topic || tracking.cap === null) return null;

  if (tracking.cap === 0) {
    return (
      <Link to="/upgrade" className={styles.trackLocked}>
        <Lock size={13} aria-hidden="true" /> Track weekly on Pro
      </Link>
    );
  }
  if (tracking.isTracked(result.topic)) {
    return (
      <span className={styles.trackDone}>
        <Check size={13} aria-hidden="true" /> Tracked weekly
      </span>
    );
  }
  if (!trackableSite(result.url)) {
    return (
      <span className={styles.trackMsg}>
        Weekly tracking needs your own website. Add one above and run the check again.
      </span>
    );
  }
  async function onClick() {
    setBusy(true);
    setMsg('');
    try {
      await tracking.track({
        name: result.name,
        topic: result.topic,
        url: result.url,
        lastCited: !!result.cited,
        checkId: result.checkId || undefined,
      });
    } catch (err) {
      setMsg(err.message || 'Could not start tracking.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className={styles.trackWrap}>
      <button type="button" className={styles.trackBtn} onClick={onClick} disabled={busy}>
        <CalendarClock size={14} aria-hidden="true" />
        {busy ? 'Adding…' : 'Track weekly'}
      </button>
      {msg && <span className={styles.trackMsg} role="alert">{msg}</span>}
    </span>
  );
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function statusFor(item) {
  if (item.pausedReason === 'failures') return { label: 'Paused after errors', tone: 'warn' };
  if (item.pausedReason === 'plan_limit') return { label: 'Over plan limit', tone: 'warn' };
  if (item.pausedReason === 'user') return { label: 'Paused', tone: 'muted' };
  if (item.pausedReason === 'no_site') return { label: 'Needs your website', tone: 'warn' };
  if (item.pendingCited !== null && item.pendingCited !== undefined) {
    return { label: item.pendingCited ? 'Cited? confirming' : 'Not cited? confirming', tone: 'warn' };
  }
  if (item.lastCited === true) return { label: 'Cited', tone: 'good' };
  if (item.lastCited === false) return { label: 'Not cited', tone: 'bad' };
  return { label: 'Baseline check pending', tone: 'muted' };
}

function History({ history }) {
  if (!history.length) return <span className={styles.historyEmpty}>No weekly results yet</span>;
  return (
    <span className={styles.history} aria-label={`${history.filter(h => h.cited).length} of ${history.length} checks cited`}>
      {history.map((h, i) => (
        <span
          key={i}
          className={h.cited ? styles.dotCited : styles.dotNot}
          title={`${formatDate(h.checkedAt)}: ${h.cited ? 'cited' : 'not cited'}`}
        />
      ))}
    </span>
  );
}

export default function TrackedQueriesPanel({ tracking }) {
  const { items, cap, loading, error, setError, refresh } = tracking;
  const [pendingId, setPendingId] = useState(null);

  async function act(id, fn) {
    setPendingId(id);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err.message || 'That did not work. Try again.');
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return null;

  const activeCount = items.filter(i => !i.pausedReason || i.pausedReason === 'user').length;

  return (
    <section className={styles.panel} aria-labelledby="tracked-heading">
      <div className={styles.head}>
        <h3 id="tracked-heading" className={styles.title}>
          <CalendarClock size={14} aria-hidden="true" /> Tracked weekly
        </h3>
        {cap > 0 && <span className={styles.capNote}>{activeCount} of {cap} used</span>}
      </div>

      {cap === 0 ? (
        <div className={styles.locked}>
          <p>rain OS can re-run your most important questions every week and email you when Gemini starts or stops citing you. Weekly tracking is included with Pro and Business.</p>
          <Link to="/upgrade" className={styles.upgradeLink}>See plans</Link>
        </div>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Run a check, then choose <strong>Track weekly</strong> on the result. We re-check it every week and email you when two checks in a row agree your citation status changed.</p>
      ) : (
        <ul className={styles.list}>
          {items.map(item => {
            const status = statusFor(item);
            const paused = !!item.pausedReason;
            const noSite = item.pausedReason === 'no_site';
            return (
              <li key={item.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowName}>{item.name}</span>
                  {item.topic.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                    <span className={styles.rowTopic}>{item.topic}</span>
                  )}
                </div>
                <span className={`${styles.status} ${styles[status.tone]}`}>{status.label}</span>
                <History history={item.history} />
                <span className={styles.next}>
                  {item.pausedReason === 'no_site'
                    ? 'Add a website to resume'
                    : paused ? '—'
                    : `Next check ${formatDate(item.nextRunAt)}${item.lastCited === null ? ' (sets baseline)' : item.pendingCited !== null && item.pendingCited !== undefined ? ' (confirms change)' : ''}`}
                </span>
                <span className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    disabled={pendingId === item.id || noSite}
                    onClick={() => act(item.id, () => api.setTrackedQueryPaused(item.id, !paused))}
                    aria-label={paused ? `Resume ${item.name}` : `Pause ${item.name}`}
                    title={paused ? 'Resume' : 'Pause'}
                  >
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    disabled={pendingId === item.id}
                    onClick={() => act(item.id, () => api.deleteTrackedQuery(item.id))}
                    aria-label={`Stop tracking ${item.name}`}
                    title="Stop tracking"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}
