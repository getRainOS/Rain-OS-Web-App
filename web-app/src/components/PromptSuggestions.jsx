import { useState } from 'react';
import { Sparkles, ArrowRight, CalendarClock, Check } from 'lucide-react';
import { api } from '../api/client.js';
import CheckProgress from './CheckProgress.jsx';
import { getMySite } from '../lib/mySite.js';
import styles from './PromptSuggestions.module.css';

const INTENT_LABEL = { discover: 'Discover', compare: 'Compare', decide: 'Decide', learn: 'Learn' };

export default function PromptSuggestions({ url, lane, tracking, onUse, renderUse, title = 'Not sure what to ask?' }) {
  const [site, setSite] = useState(url || getMySite());
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [tracked, setTracked] = useState({});

  const isLocal = lane === 'local_business';

  async function handleSuggest(e) {
    e.preventDefault();
    if (!site.trim() && !description.trim()) {
      setError('Add your website or a short description of your business.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.suggestPrompts({
        url: site.trim() || undefined,
        description: description.trim() || undefined,
        location: isLocal ? (location.trim() || undefined) : undefined,
        lane,
      });
      setItems(data?.suggestions || []);
    } catch (err) {
      setError(err.message || 'Could not get suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(q) {
    try {
      await tracking.track({ name: q.length > 60 ? `${q.slice(0, 57)}…` : q, topic: q, url: site.trim() || undefined });
      setTracked(t => ({ ...t, [q]: true }));
    } catch (err) {
      setError(err.message || 'Could not start tracking.');
    }
  }

  const canTrack = (tracking?.cap ?? 0) > 0;

  return (
    <div className={`card ${styles.panel}`}>
      <div className={styles.head}>
        <span className={styles.iconWrap}><Sparkles size={15} aria-hidden="true" /></span>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.sub}>We'll suggest the questions your customers are likely asking AI. Free, and it doesn't use your analyses.</p>
        </div>
      </div>

      <form onSubmit={handleSuggest} className={styles.form}>
        <label className={styles.label} htmlFor="ps-site">Your website</label>
        <input
          id="ps-site"
          className={styles.input}
          type="text"
          inputMode="url"
          spellCheck={false}
          placeholder="yourdomain.com"
          value={site}
          onChange={e => setSite(e.target.value)}
        />
        <label className={styles.label} htmlFor="ps-desc">What you do <span className={styles.optional}>(optional, helps a lot)</span></label>
        <input
          id="ps-desc"
          className={styles.input}
          type="text"
          maxLength={500}
          placeholder={isLocal ? 'e.g. Family-run roofing and gutter repair' : 'e.g. Scheduling software for small clinics'}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {isLocal && (
          <>
            <label className={styles.label} htmlFor="ps-loc">Where you work <span className={styles.optional}>(optional)</span></label>
            <input
              id="ps-loc"
              className={styles.input}
              type="text"
              maxLength={120}
              placeholder="e.g. Austin, TX"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </>
        )}
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Thinking…</> : <>Suggest questions</>}
        </button>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {loading && (
        <CheckProgress
          compact
          title="Finding questions"
          skeleton="list"
          steps={[
            { label: site.trim() && !description.trim() ? 'Looking up your site on Google' : 'Reading what you do', ms: 4000 },
            { label: 'Thinking like your customers' },
          ]}
        />
      )}

      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map(s => (
            <li key={s.question} className={styles.item}>
              <div className={styles.itemMain}>
                <span className={styles.intent}>{INTENT_LABEL[s.intent] || 'Discover'}</span>
                <span className={styles.question}>{s.question}</span>
              </div>
              <div className={styles.actions}>
                {renderUse ? renderUse(s.question, site.trim()) : (
                  <button type="button" className={styles.useBtn} onClick={() => onUse(s.question, site.trim())}>
                    Use <ArrowRight size={13} aria-hidden="true" />
                  </button>
                )}
                {canTrack && (tracked[s.question] || tracking.isTracked(s.question) ? (
                  <span className={styles.trackedNote}><Check size={13} aria-hidden="true" /> Tracking</span>
                ) : (
                  <button type="button" className={styles.trackBtn} onClick={() => handleTrack(s.question)} title="Track weekly">
                    <CalendarClock size={13} aria-hidden="true" /> Track
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
