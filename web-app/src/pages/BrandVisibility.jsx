import { useState, useEffect, useMemo } from 'react';
import CheckProgress from '../components/CheckProgress.jsx';
import ImproveCta from '../components/ImproveCta.jsx';
import SiteNote from '../components/SiteNote.jsx';
import RecentPicker from '../components/RecentPicker.jsx';
import { improveLink } from '../lib/improveLink.js';
import { getMySite, setMySite } from '../lib/mySite.js';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ViewTabs, SubTabs, NewCheckButton, QuestionPicker, CheckChips, TabEmpty, shortDate } from '../components/MonitorTabs.jsx';
import styles from './BrandVisibility.module.css';

function MentionBadge({ status }) {
  const map = {
    mentioned: { color: 'var(--green)', label: 'Mentioned by AI' },
    ambiguous: { color: 'var(--yellow)', label: 'Ambiguous mention' },
    not_mentioned: { color: 'var(--red)', label: 'Not mentioned' },
  };
  const cfg = map[status] || map.not_mentioned;
  return (
    <span className={styles.statusText} style={{ color: cfg.color }}>
      <span className={styles.statusDot} style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const map = {
    positive: { color: 'var(--green)', label: 'Positive sentiment' },
    neutral: { color: 'var(--text-muted)', label: 'Neutral sentiment' },
    negative: { color: 'var(--red)', label: 'Negative sentiment' },
    not_applicable: { color: 'var(--text-dim)', label: 'N/A sentiment' },
  };
  const cfg = map[sentiment] || map.not_applicable;
  return <span className={styles.statusText} style={{ color: cfg.color }}>{cfg.label}</span>;
}

function CitedBadge() {
  return (
    <span className={styles.statusText} style={{ color: 'var(--text)' }}>
      <span className={styles.statusDot} style={{ background: 'var(--text)' }} />
      Your site was cited as a source
    </span>
  );
}

function timeAgo(str) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (days === 0 && hrs < 1) return 'Just now';
  if (days === 0) return `${hrs}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Icons (simple SVG fallbacks) ───────────────────────────────────────────────── */
function SearchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function ClockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function TrashIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function AlertIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

export default function BrandVisibility() {
  const { refreshUser } = useApp();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(() => searchParams.get('q') || '');
  const [url, setUrl] = useState(() => searchParams.get('url') || getMySite());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [planGated, setPlanGated] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState('check'); // 'check' | 'history'
  const [resultTab, setResultTab] = useState('summary');
  const [pastTab, setPastTab] = useState('overview');
  const [pastKey, setPastKey] = useState(null);

  useEffect(() => {
    setHistoryLoading(true);
    api.brandVisHistory()
      .then(({ data }) => setHistory(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setPlanGated(false);
    setResult(null);
    try {
      const { data } = await api.brandVisibility({ name: name.trim(), brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
      setResult(data.data || data);
      setMySite(url);
      setResultTab('summary');
      // Refresh history
      const h = await api.brandVisHistory();
      setHistory(Array.isArray(h.data.data) ? h.data.data : Array.isArray(h.data) ? h.data : []);
      refreshUser();
    } catch (err) {
      if (err.status === 403) {
        setPlanGated(true);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    if (!window.confirm('Clear all Brand Sentiment history? This cannot be undone.')) return;
    try {
      await api.clearBrandVisHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    }
  }

  // Group history by brand+topic. Old rows still render: mention status
  // comes from the stored mention_status field, and there is no score to
  // display or chart for any row, old or new.
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of history) {
      const b = (h.brand || '').toLowerCase().trim();
      const t = (h.topic || '').toLowerCase().trim();
      if (!b || !t) continue;
      const key = `${b}::${t}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checked_at || a.checkedAt) - new Date(b.checked_at || b.checkedAt));
      const latest = arr[arr.length - 1];
      out.push({
        key: `${(latest.brand || '').toLowerCase().trim()}::${(latest.topic || '').toLowerCase().trim()}`,
        list: arr,
        latest,
        brand: latest.brand,
        topic: latest.topic,
        latestSentiment: latest.sentiment || 'not_applicable',
        latestMention: latest.mention_status || latest.mentionStatus || 'not_mentioned',
        checkedAt: latest.checked_at || latest.checkedAt,
        checks: arr.length,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [history]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Brand Sentiment"
        subtitle="See whether Gemini mentions your brand, how it describes you, and what to do if it doesn't."
        about={[
          { heading: 'What the result means', body: 'Whether you are mentioned is a direct check of Gemini\'s answer. The tone label is AI\'s judgment of the exact sentences that mention you, which we show so you can judge them yourself.' },
          { heading: 'How the check works', body: 'We ask Gemini with live Google Search grounding and report mentions, citations and tone as given. One model and one phrasing, so it suits spot checks better than full brand monitoring.' },
        ]}
        actions={(tab !== 'check' || result) && <NewCheckButton onClick={() => { setResult(null); setError(''); setTab('check'); }} />}
      />

      <ViewTabs
        label="Brand Sentiment views"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'check', label: 'New check' },
          { id: 'history', label: 'Past checks', count: trendGroups.length },
        ]}
      />

      {/* ── Check tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
      {planGated && (
        <div className={styles.planGated}>
          <div>
            <div className={styles.planGatedTitle}>Business plan required</div>
            <div className={styles.planGatedDesc}>
              Brand Sentiment tracks how Gemini describes your brand across live, Google Search-grounded answers. It runs multiple Gemini calls per check and is available on the Business plan.
            </div>
          </div>
          <a href="/upgrade" className={styles.planGatedCta}>
            Upgrade to Business →
          </a>
        </div>
      )}
      {error && <div className={styles.errorBox}>{error}</div>}

      {!result && (
      <div className={styles.card}>
        <form onSubmit={handleCheck}>
          <div className={styles.field}>
            <label className={styles.label}>Analysis name</label>
            <input
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Roofing brand check"
              required
              maxLength={120}
            />
            <div className={styles.hint}>Required — so you can find this check again later.</div>
          </div>
          <div className={styles.formGrid2}>
            <div>
              <label className={styles.label}>Brand or product name</label>
              <input
                className={styles.input}
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. rain OS, Acme Widgets"
                required
                maxLength={200}
              />
              <div className={styles.hint}>Use your name as people write it publicly.</div>
            </div>
            <div>
              <label className={styles.label}>Question or Prompt to View Sentiment For</label>
              <input
                className={styles.input}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. AI content optimization tools"
                required
                maxLength={300}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Your website URL <span className={styles.optionalHint}>(optional)</span></label>
            <input
              className={styles.input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
            />
            <RecentPicker mode="site" onPick={setUrl} />
            <SiteNote url={url} blankText="Add your website to see whether your site is cited. Without it we can still tell whether AI names your brand." />
          </div>
          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.btn}
              disabled={loading}
            >
              {loading && <span className={styles.spinner} />}
              {loading ? 'Checking AI answers…' : 'Check brand sentiment'}
            </button>
          </div>
          {loading && (
            <div style={{ marginTop: 20 }}>
              <CheckProgress
                title="Checking what AI says about you"
                skeleton="list"
                steps={[
                  { label: 'Asking Gemini about your brand', ms: 3000 },
                  { label: 'Searching Google live', ms: 7000 },
                  { label: 'Reading the answer and its sources', ms: 5000 },
                  { label: 'Judging the tone' },
                ]}
              />
            </div>
          )}
        </form>
      </div>
      )}

      {result && (
        <div>
          <SubTabs
            label="Result views"
            value={resultTab}
            onChange={setResultTab}
            items={[
              { id: 'summary', label: 'Summary' },
              ...(result.answerExcerpt ? [{ id: 'answer', label: 'What AI said' }] : []),
              { id: 'sources', label: 'Sources', count: result.sources?.length || 0 },
              ...(result.recommendations?.length ? [{ id: 'actions', label: 'What to do', count: result.recommendations.length }] : []),
            ]}
          />
          {resultTab === 'summary' && (
          <div className={styles.card}>
            <div className={styles.resultMeta}>
              {result.name && <div className={styles.resultName}>{result.name}</div>}
              <div className={styles.resultTitle}>{result.brand}</div>
              <p className={styles.resultSub}>{result.summary}</p>
              {result.siteShared && (
                <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '8px 0 0' }}>Your site is on a platform many businesses share, so we can’t tell whether a cited page is yours.</p>
              )}
              <div className={styles.badgeRow}>
                <MentionBadge status={result.mentionStatus} />
                {result.mentionStatus === 'mentioned' && <SentimentBadge sentiment={result.sentiment} />}
                {result.cited && <CitedBadge />}
              </div>
              {result.notMentionedHint && (
                <p className={styles.notMentionedHint}>{result.notMentionedHint}</p>
              )}
              {result.url && result.mentionStatus === 'not_mentioned' && (
                <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.urlScannerCta}>
                  Check what your page needs in URL Scanner →
                </Link>
              )}
            </div>
            {result.sentimentExplanation && (
              <div className={styles.sentimentBlock}>
                <div className={styles.sectionTitle}>AI's read</div>
                <p className={styles.resultSub}>{result.sentimentExplanation}</p>
              </div>
            )}
          </div>
          )}

          {resultTab === 'summary' && (() => {
            const mentioned = result.mentionStatus === 'mentioned';
            const good = mentioned && result.sentiment === 'positive' && (result.cited || !(result.url || url));
            if (good) return null;
            const mode = !mentioned ? 'share_of_voice' : result.sentiment !== 'positive' ? 'sentiment' : 'citation';
            const title = !mentioned ? 'AI did not name you. See how to get mentioned.'
              : result.sentiment === 'negative' ? 'AI described you negatively. See what to fix.'
              : result.sentiment !== 'positive' ? 'AI mentions you without much warmth. See how to improve it.'
              : 'AI names you but does not cite your site. See how to get cited.';
            return (
              <ImproveCta
                title={title}
                body="We compare your page with the sources Gemini used and list the changes to make first."
                link={improveLink({ question: result.topic, url: result.url || url, mode, brand: result.brand, sources: result.sources || [], competitors: result.competitors || [], note: result.sentimentExplanation })}
              />
            );
          })()}
          {resultTab === 'answer' && result.answerExcerpt && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>What AI answered for "{result.topic}"</div>
              <div className={styles.excerpt}>"{result.answerExcerpt}"</div>
            </div>
          )}

          {resultTab === 'actions' && result.recommendations && result.recommendations.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>What you can do about it</div>
              <ul className={styles.recommendationsList}>
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recommendationItem}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {resultTab === 'sources' && !(result.sources?.length) && (
            <TabEmpty>Gemini answered without citing any sources.</TabEmpty>
          )}

          {resultTab === 'sources' && result.competitors && result.competitors.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>Sites Gemini cited</div>
              <div className={styles.competitorGrid}>
                {result.competitors.map((c, i) => (
                  <span key={i} className={styles.competitorChip}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {resultTab === 'sources' && result.sources && result.sources.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>Sources AI cited ({result.sources.length})</div>
              {result.sources.map((s, i) => (
                <div key={i} className={styles.sourceItem}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`}
                    alt=""
                    className={styles.favicon}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <div className={styles.sourceDomain}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>{s.title || s.domain}</a>
                      {i === result.citedSourceIndex && (
                        <span className={styles.yourSiteBadge}>Your site</span>
                      )}
                    </div>
                    {s.snippet && <div className={styles.sourceSnippet}>{s.snippet}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* ── History tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <>
          {historyLoading ? (
            <div className={styles.historyLoading}>
              <span className={`${styles.spinner} ${styles.spinnerLg}`} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyCard}`}>
              <ClockIcon size={32} />
              <p className={styles.emptyDesc}>No Brand Sentiment checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} className={styles.btn}><SearchIcon size={13} /> Run first check</button>
            </div>
          ) : (() => {
            const group = trendGroups.find(g => g.key === pastKey) || trendGroups[0];
            const latest = group.latest;
            const toneOf = h => {
              const mention = h.mention_status || h.mentionStatus || 'not_mentioned';
              if (mention !== 'mentioned') return { label: 'Not mentioned', tone: 'bad' };
              const sent = h.sentiment || 'not_applicable';
              if (sent === 'positive') return { label: 'Positive', tone: 'good' };
              if (sent === 'negative') return { label: 'Negative', tone: 'bad' };
              if (sent === 'mixed') return { label: 'Mixed', tone: 'warn' };
              if (sent === 'neutral') return { label: 'Neutral', tone: 'strong' };
              return { label: 'Mentioned', tone: 'strong' };
            };
            return (
              <>
                {pastTab !== 'all' && (
                  <QuestionPicker
                    id="bv-scope"
                    label="Topic"
                    options={trendGroups.map(g => ({ key: g.key, label: `${g.brand} · ${g.topic} (${g.checks} ${g.checks === 1 ? 'check' : 'checks'})` }))}
                    value={group.key}
                    onChange={setPastKey}
                  />
                )}
                <SubTabs
                  label="Past check views"
                  value={pastTab}
                  onChange={setPastTab}
                  items={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'tone', label: 'Tone over time' },
                    { id: 'all', label: 'All checks', count: trendGroups.length },
                  ]}
                />

                {pastTab === 'overview' && (
                  <div className={styles.card}>
                    <div className={styles.resultMeta}>
                      <div className={styles.resultTitle}>{group.brand}</div>
                      <p className={styles.resultSub}>"{group.topic}" · {group.checks} {group.checks === 1 ? 'check' : 'checks'} · last run {timeAgo(group.checkedAt)}</p>
                      <div className={styles.badgeRow}>
                        <MentionBadge status={group.latestMention} />
                        {group.latestMention === 'mentioned' && <SentimentBadge sentiment={group.latestSentiment} />}
                      </div>
                      {latest.summary && <p className={styles.resultSub}>{latest.summary}</p>}
                    </div>
                    {latest.sentiment_explanation && (
                      <div className={styles.sentimentBlock}>
                        <div className={styles.sectionTitle}>AI's read</div>
                        <p className={styles.resultSub}>{latest.sentiment_explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {pastTab === 'tone' && (
                  <div className={styles.card}>
                    <div className={styles.sectionTitle}>How Gemini described {group.brand} on each check</div>
                    <CheckChips
                      items={group.list.slice(-16).map(h => ({ date: shortDate(h.checked_at || h.checkedAt), ...toneOf(h) }))}
                    />
                    {group.list.length < 2 && (
                      <p className={styles.resultSub} style={{ marginTop: 12 }}>Run this topic again to see how the tone changes over time.</p>
                    )}
                  </div>
                )}

                {pastTab === 'all' && (
                  <>
                    <div className={styles.clearRow}>
                      <button onClick={clearHistory} className={styles.btnSecondary} style={{ color: 'var(--red)' }}>
                        <TrashIcon size={12} /> Clear history
                      </button>
                    </div>
                    {trendGroups.map(g => (
                      <div
                        key={g.key}
                        className={styles.trendRow}
                        onClick={() => { setPastKey(g.key); setPastTab('overview'); }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          <MentionBadge status={g.latestMention} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.trendTitle}>
                            {g.brand} — {g.topic}
                          </div>
                          <div className={styles.trendMeta}>
                            {g.latestSentiment.replace('_', ' ')} sentiment · {g.checks} check{g.checks > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className={styles.trendTime}>{timeAgo(g.checkedAt)}</div>
                      </div>
                    ))}
                  </>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
