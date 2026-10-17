import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Check, CalendarClock, PenLine, X } from 'lucide-react';
import { api } from '../api/client.js';
import CheckProgress from './CheckProgress.jsx';
import { getMySite } from '../lib/mySite.js';
import { trackableSite } from './TrackedQueries.jsx';
import base from './PromptSuggestions.module.css';
import styles from './TopicPlanner.module.css';

const PROFILE_KEY = 'rain_os_topic_profile';
const STEP_TITLES = ['What field do you write about?', 'Narrow it down', 'Who is it for, and what angle?'];
const INTENT_LABEL = { discover: 'Discover', compare: 'Compare', decide: 'Decide', learn: 'Learn' };
const MAX_STEPS = 3;

function readProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    return Array.isArray(p) ? p.filter(x => typeof x === 'string' && x.trim()).slice(0, MAX_STEPS) : [];
  } catch { return []; }
}
function saveProfile(path) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(path)); } catch { /* not remembered */ }
}

// Narrow a field to a topic in up to three taps, then get the questions
// readers ask AI about it, ready to track, check or write for.
export default function TopicPlanner({ lane, tracking, renderCheck }) {
  const navigate = useNavigate();
  const site = getMySite();
  const [path, setPath] = useState(readProfile);
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [custom, setCustom] = useState('');
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState({});
  const [writing, setWriting] = useState(null);
  const known = useRef([]);

  // What we already know: titles of what the user has analyzed.
  useEffect(() => {
    api.history({ limit: 10 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        known.current = [...new Set(items.map(i => i.title).filter(Boolean))].slice(0, 6);
      })
      .catch(() => {})
      .finally(loadOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOptions(forPath = path) {
    if (forPath.length >= MAX_STEPS) { setOptions([]); return; }
    setOptionsLoading(true);
    setError('');
    try {
      const { data } = await api.topicOptions({ path: forPath, lane, site: site || undefined, known: known.current });
      setOptions(data?.options || []);
    } catch (err) {
      setOptions([]);
      setError(err.message || 'Could not get options. Type your own below.');
    } finally {
      setOptionsLoading(false);
    }
  }

  function choose(value) {
    const v = value.trim();
    if (!v || path.length >= MAX_STEPS) return;
    const next = [...path, v];
    setPath(next);
    saveProfile(next);
    setCustom('');
    setQuestions([]);
    loadOptions(next);
  }

  function backTo(index) {
    const next = path.slice(0, index);
    setPath(next);
    saveProfile(next);
    setQuestions([]);
    loadOptions(next);
  }

  async function generate() {
    setQLoading(true);
    setError('');
    try {
      const { data } = await api.topicQuestions({ path, lane });
      setQuestions(data?.questions || []);
    } catch (err) {
      setError(err.message || 'Could not get questions. Try again.');
    } finally {
      setQLoading(false);
    }
  }

  async function handleTrack(q) {
    if (!trackableSite(site)) {
      setError('Weekly tracking needs your own website. Add it in Citation Monitor first, then come back.');
      return;
    }
    try {
      await tracking.track({ name: q.length > 60 ? `${q.slice(0, 57)}…` : q, topic: q, url: site });
      setTracked(t => ({ ...t, [q]: true }));
    } catch (err) {
      setError(err.message || 'Could not start tracking.');
    }
  }

  function write(q, kind) {
    const title = q.charAt(0).toUpperCase() + q.slice(1).replace(/\?*$/, '');
    navigate('/analyze', { state: { pendingTitle: title, question: q, freshIdea: true, contentType: kind === 'article' ? 'article' : 'blog_post' } });
  }

  const step = Math.min(path.length, MAX_STEPS - 1);
  const canTrack = (tracking?.cap ?? 0) > 0;

  return (
    <div className={`card ${base.panel}`}>
      <div className={base.head}>
        <span className={base.iconWrap}><Compass size={15} aria-hidden="true" /></span>
        <div>
          <h3 className={base.title}>Your topic</h3>
          <p className={base.sub}>Narrow down what you write about in a few taps. We'll list the questions readers ask AI about it, which you can track, check, or write a post for. Free, and it doesn't use your analyses.</p>
        </div>
      </div>

      {path.length > 0 && (
        <div className={styles.crumbs} aria-label="Your topic">
          {path.map((p, i) => (
            <span key={`${p}-${i}`} className={styles.crumb}>
              {p}
              <button type="button" className={styles.crumbX} onClick={() => backTo(i)} aria-label={`Remove ${p} and everything after it`}>
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {path.length < MAX_STEPS && (
        <div className={styles.step}>
          <div className={styles.stepTitle}>{STEP_TITLES[step]}</div>
          {optionsLoading ? (
            <p className={styles.thinking}>Thinking of options…</p>
          ) : (
            <div className={styles.chips}>
              {options.map(o => (
                <button key={o} type="button" className={styles.chip} onClick={() => choose(o)}>{o}</button>
              ))}
            </div>
          )}
          <form className={styles.customRow} onSubmit={e => { e.preventDefault(); choose(custom); }}>
            <input
              className={base.input}
              type="text"
              maxLength={80}
              placeholder="Something else? Type it"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              aria-label="Type your own"
            />
            <button type="submit" className={styles.addBtn} disabled={!custom.trim()}>Add</button>
          </form>
        </div>
      )}

      {path.length > 0 && (
        <div className={styles.generateRow}>
          <button type="button" className={base.btn} onClick={generate} disabled={qLoading}>
            {qLoading ? 'Thinking…' : questions.length ? 'Get fresh questions' : 'Show me the questions'}
          </button>
          {path.length < MAX_STEPS && <span className={styles.hint}>or narrow it further above</span>}
        </div>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      {qLoading && (
        <div style={{ marginTop: 16 }}>
          <CheckProgress
            title="Finding the questions readers ask"
            compact
            steps={[{ label: 'Thinking through your topic', ms: 3000 }, { label: 'Writing the questions' }]}
          />
        </div>
      )}

      {!qLoading && questions.length > 0 && (
        <>
          <p className={styles.note}>These are questions readers plausibly ask. They are not measured search volumes.</p>
          <ul className={styles.list}>
            {questions.map(({ question, intent }) => (
              <li key={question} className={styles.item}>
                <div className={styles.itemText}>
                  <span className={styles.intent}>{INTENT_LABEL[intent] || 'Learn'}</span>
                  <span className={styles.question}>{question}</span>
                </div>
                <div className={styles.actions}>
                  {canTrack && (tracked[question] || tracking.isTracked(question) ? (
                    <span className={styles.done}><Check size={13} aria-hidden="true" /> Tracking</span>
                  ) : (
                    <button type="button" className={styles.act} onClick={() => handleTrack(question)}>
                      <CalendarClock size={13} aria-hidden="true" /> Track weekly
                    </button>
                  ))}
                  {renderCheck && renderCheck(question, site)}
                  {writing === question ? (
                    <span className={styles.kindPick}>
                      <button type="button" className={styles.act} onClick={() => write(question, 'blog')}>Blog post</button>
                      <button type="button" className={styles.act} onClick={() => write(question, 'article')}>Article</button>
                      <button type="button" className={styles.actGhost} onClick={() => setWriting(null)} aria-label="Cancel"><X size={12} aria-hidden="true" /></button>
                    </span>
                  ) : (
                    <button type="button" className={styles.actPrimary} onClick={() => setWriting(question)} title="Writes a post or article that answers this question">
                      <PenLine size={13} aria-hidden="true" /> Write a post/article for this
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
