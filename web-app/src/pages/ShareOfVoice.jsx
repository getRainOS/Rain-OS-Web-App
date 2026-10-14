import { useState, useEffect, useMemo } from 'react';
import CheckProgress from '../components/CheckProgress.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart2, Search, CheckCircle2, AlertCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { buildCitationShare } from '../lib/citationShare.js';
import PageHeader from '../components/PageHeader.jsx';
import { ViewTabs, SubTabs, NewCheckButton, QuestionPicker, CheckChips, TabEmpty, shortDate } from '../components/MonitorTabs.jsx';
import styles from './ShareOfVoice.module.css';

/* ── Per-prompt card ──────────────────────────────────────────────────────── */
const MODEL_META = {
  gemini:          { label: 'Asking for the best options', ask: t => `What are the best tools, products, or services for "${t}"?` },
  chatgpt_style:   { label: 'Asking for a recommendation', ask: t => `I need help with "${t}". What would you personally recommend?` },
  perplexity_style:{ label: 'Asking for a comparison',     ask: t => `Research and compare the leading solutions for "${t}". Which brands or tools dominate this space?` },
};

function ModelCard({ m, topic }) {
  const meta  = MODEL_META[m.modelKey] || MODEL_META.gemini;
  const mentioned = m.mentioned ?? m.cited ?? false;
  return (
    <div className={styles.modelCard}>
      <div className={styles.modelHead}>
        <div className={styles.modelTitle}>{meta.label}</div>
        <div className={styles.modelPromptStyle}>{topic ? `“${meta.ask(topic)}”` : m.promptStyle}</div>
      </div>

      {/* Mentioned status */}
      <div className={styles.modelStatusRow}>
        {mentioned ? (
          <span className={styles.statusText} style={{ color: 'var(--green)' }}>
            <CheckCircle2 size={11} /> Mentioned
          </span>
        ) : (
          <span className={styles.statusText} style={{ color: 'var(--red)' }}>
            <AlertCircle size={11} /> Not mentioned
          </span>
        )}
      </div>

      {/* Answer excerpt */}
      {m.answerExcerpt && (
        <p className={styles.modelExcerpt}>
          "{m.answerExcerpt}"
        </p>
      )}

      {/* Sources */}
      {m.sources?.length > 0 && (
        <div>
          <div className={styles.modelSourcesLabel}>Cited sources</div>
          <div className={styles.modelSourcesGrid}>
            {m.sources.slice(0, 4).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.modelSourceChip}>
                <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`} alt="" className={styles.modelSourceFavicon} onError={e => e.currentTarget.style.display='none'} />
                {s.title || s.domain}
                <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MentionCountBadge({ count }) {
  const allGood = count === 3;
  const none    = count === 0;
  const color = allGood ? 'var(--green)' : none ? 'var(--red)' : 'var(--yellow)';
  return (
    <span className={`${styles.statusText} ${styles.statusTextNum}`} style={{ color }}>
      {count} of 3
    </span>
  );
}

function ShareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.shareTooltip}>
      <div className={styles.shareTooltipName}>{d.name}</div>
      <div className={styles.shareTooltipPct}>{d.pct}% of citations</div>
    </div>
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

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ShareOfVoice() {
  const { refreshUser } = useApp();
  const [name,  setName]    = useState('');
  const [brand, setBrand]   = useState('');
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(() => searchParams.get('q') || '');
  const [url,   setUrl]     = useState(() => searchParams.get('url') || '');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [planGated, setPlanGated] = useState(false);
  const [result,  setResult]  = useState(null);

  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [tab, setTab]                 = useState('check'); // 'check' | 'history'
  const [resultTab, setResultTab]     = useState('summary');
  const [pastTab, setPastTab]         = useState('overview');
  const [pastKey, setPastKey]         = useState(null);

  useEffect(() => {
    api.sovHistory()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPlanGated(false);
    try {
      const { data } = await api.shareOfVoice({ name: name.trim(), brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
      setResult(data?.data ?? data);
      // prepend to history without refetch
      setHistory(prev => [{ ...(data?.data ?? data), checkedAt: new Date().toISOString(), id: Date.now() }, ...prev]);
      refreshUser();
    } catch (err) {
      if (err.status === 403) {
        setPlanGated(true);
      } else {
        setError(err.message || 'Share of voice check failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm('Delete all saved Share of Voice history? This cannot be undone.')) return;
    try {
      await api.clearSovHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    }
  }

  function handleReset() { setResult(null); setError(''); setResultTab('summary'); }

  const citationShare = useMemo(() => buildCitationShare(result), [result]);

  // Group history by brand/topic. Old rows still render: the mention count
  // comes from the stored cited_count (repurposed to mean "mentioned in X
  // of 3 prompts"), and there is no score to display or chart for any row.
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of history) {
      const b = (h.brand || '').toLowerCase();
      const t = (h.topic || '').toLowerCase();
      if (!b || !t) continue;
      const key = `${b}:::${t}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checkedAt || a.checked_at) - new Date(b.checkedAt || b.checked_at));
      const latest = arr[arr.length - 1];
      const mentionedCount = latest.mentionedCount ?? latest.citedCount ?? latest.cited_count ?? 0;
      out.push({
        key: `${(latest.brand || '').toLowerCase()}:::${(latest.topic || '').toLowerCase()}`,
        name: latest.name,
        brand: latest.brand,
        topic: latest.topic,
        mentionedCount,
        checkedAt: latest.checkedAt || latest.checked_at,
        checks: arr.length,
        list: arr,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [history]);

  return (
    <div className={`${styles.page} fade-in`}>

      <PageHeader
        title="Share of Voice"
        subtitle="See how often Gemini mentions and cites you for a topic, and which competitors show up instead."
        about={[
          { heading: 'What the numbers mean', body: 'Mentions and citation share are literal counts from three real Gemini prompts, not a score. Re-run over time to see whether your presence is growing.' },
          { heading: 'How the check works', body: 'We ask Gemini about your topic 3 different ways (best options, a recommendation, and a comparison), each with a live Google search. The 3 questions tab shows exactly what was asked. It covers Gemini only, at one moment, so treat it as a trend signal rather than true market share.' },
        ]}
        actions={(tab !== 'check' || result) && <NewCheckButton onClick={() => { handleReset(); setTab('check'); }} />}
      />

      <ViewTabs
        label="Share of Voice views"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'check', label: 'New check' },
          { id: 'history', label: 'Past checks', count: trendGroups.length },
        ]}
      />

      {/* ── Check tab ─────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
          {planGated && (
            <div className={styles.planGated}>
              <div>
                <div className={styles.planGatedTitle}>Business plan required</div>
                <div className={styles.planGatedDesc}>
                  Share of Voice runs 3 Google Search-grounded Gemini checks per topic — an informational question, a conversational request, and a research-style comparison. Available on Business plan.
                </div>
              </div>
              <a href="/upgrade" className={styles.planGatedCta}>
                Upgrade to Business →
              </a>
            </div>
          )}
          {error && <div className={styles.errorBox}>{error}</div>}

          {!result ? (
            <form onSubmit={handleCheck} className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label}>Analysis name</label>
                <input className={styles.input} type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acme Roofing SOV check" maxLength={120} required />
                <div className={styles.hint}>Required — so you can find this check again later.</div>
              </div>
              <div className={styles.formGrid2}>
                <div>
                  <label className={styles.label}>Brand / product name</label>
                  <input className={styles.input} type="text" value={brand} onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Rain OS" maxLength={200} required />
                  <div className={styles.hint}>Use your name as people write it publicly.</div>
                </div>
                <div>
                  <label className={styles.label}>Question or Prompt to Determine Share of Voice For</label>
                  <input className={styles.input} type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. AI content optimization tools" maxLength={300} required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Your website URL <span className={styles.optionalHint}>(optional — used to check if your domain is in cited sources)</span></label>
                <input className={styles.input} type="text" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com" />
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.btn} style={{ opacity: loading ? 0.6 : 1 }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Asking Gemini 3 different ways…</> : <><BarChart2 size={14} /> Check Share of Voice</>}
                </button>
              </div>
              {loading && (
                <div style={{ marginTop: 20 }}>
                  <CheckProgress
                    title="Asking Gemini 3 different ways"
                    skeleton="cards"
                    steps={[
                      { label: 'Asking for the best options', ms: 7000 },
                      { label: 'Asking for a recommendation', ms: 7000 },
                      { label: 'Asking for a comparison', ms: 7000 },
                      { label: 'Counting mentions and sources' },
                    ]}
                  />
                </div>
              )}
            </form>
          ) : (
            /* ── Results ─────────────────────────────────────────────────── */
            <>
              <SubTabs
                label="Result views"
                value={resultTab}
                onChange={setResultTab}
                items={[
                  { id: 'summary', label: 'Summary' },
                  { id: 'prompts', label: 'The 3 questions', count: result.modelResults.length },
                  { id: 'competitors', label: 'Competitors', count: citationShare.length },
                  ...(result.recommendations?.length ? [{ id: 'actions', label: 'What to do', count: result.recommendations.length }] : []),
                ]}
              />
              {resultTab === 'summary' && (
              <div className={styles.card}>
                <div className={styles.field}>
                  {result.name && (
                    <div className={styles.resultName}>{result.name}</div>
                  )}
                  <div className={styles.resultBrand}>{result.brand}</div>
                  <div className={styles.resultTopic}>"{result.topic}"</div>

                  <div className={styles.resultHeadline} style={{ marginBottom: result.domainSharePercent !== null ? 4 : 12 }}>
                    Mentioned in {result.mentionedCount} of 3 prompts
                  </div>
                  {result.domainSharePercent !== null && (
                    <div className={styles.resultDomainShare}>
                      Your domain is {result.domainCitedCount} of {result.domainSourceCount} cited sources ({result.domainSharePercent}%)
                    </div>
                  )}

                  <div className={styles.resultModelsRow}>
                    {result.modelResults.map(m => {
                      const meta = MODEL_META[m.modelKey] || MODEL_META.gemini;
                      const mentioned = m.mentioned ?? m.cited ?? false;
                      return (
                        <span key={m.modelKey} className={`${styles.statusText} ${styles.resultModelBadge}`} style={{ color: mentioned ? 'var(--green)' : 'var(--text-dim)' }}>
                          {mentioned ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className={styles.resultSummaryText}>{result.summary}</div>

                  {result.mentionedCount === 0 && result.url && (
                    <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.urlScannerCta}>
                      Check what your page needs in URL Scanner →
                    </Link>
                  )}
                </div>

              </div>
              )}

              {/* What you can do about it */}
              {resultTab === 'actions' && result.recommendations?.length > 0 && (
                <div className={styles.card}>
                  <p className={styles.sectionTitle}>What you can do about it</p>
                  <ul className={styles.recommendationsList}>
                    {result.recommendations.map((r, i) => (
                      <li key={i} className={styles.recommendationItem}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Per-prompt cards */}
              {resultTab === 'prompts' && (
                <div className={styles.resultsGrid3}>
                  {result.modelResults.map(m => <ModelCard key={m.modelKey} m={m} topic={result.topic} />)}
                </div>
              )}

              {/* Citation share */}
              {resultTab === 'competitors' && citationShare.length === 0 && (
                <TabEmpty>Gemini didn't cite any sources across the three prompts.</TabEmpty>
              )}
              {resultTab === 'competitors' && citationShare.length > 0 && (
                <div className={styles.card}>
                  <p className={styles.sectionTitle}>Citation share</p>
                  <div className={styles.shareHeadline}>
                    {citationShare[0].name}
                    <span className={styles.shareHeadlinePct}>
                      {citationShare[0].pct}% of citations
                    </span>
                  </div>

                  <div className={styles.shareChartWrap}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={citationShare}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={95}
                          paddingAngle={6}
                          cornerRadius={8}
                          stroke="none"
                        >
                          {citationShare.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip content={<ShareTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.shareLegendRowWrap}>
                    {citationShare.map((d, i) => (
                      <div key={i} className={styles.shareLegendInline}>
                        <span className={styles.shareLegendDot} style={{ background: d.color }} />
                        <span className={styles.shareLegendLabel}>{d.name}{d.isOwn ? ' (you)' : ''}</span>
                        <span className={styles.shareLegendPct}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.shareFootnote}>
                    Share of all sources Gemini cited across the 3 questions for this topic — real counts, not an estimate.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Past checks ───────────────────────────────────────────────── */}
      {tab === 'history' && (
        <>
          {histLoading ? (
            <div className={styles.historyLoading}>
              <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div className={styles.emptyCard}>
              <BarChart2 size={32} className={styles.emptyIcon} />
              <p className={styles.emptyDesc}>No Share of Voice checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} className={styles.btn}><Search size={13} /> Run first check</button>
            </div>
          ) : (() => {
            const group = trendGroups.find(g => g.key === pastKey) || trendGroups[0];
            const checks = group.list;
            const mentionsOf = h => h.mentionedCount ?? h.citedCount ?? h.cited_count ?? 0;
            const chartData = checks.map(h => ({ date: shortDate(h.checkedAt || h.checked_at), mentions: mentionsOf(h) }));
            return (
              <>
                {pastTab !== 'all' && (
                  <QuestionPicker
                    id="sov-scope"
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
                    { id: 'trend', label: 'Trend' },
                    { id: 'all', label: 'All checks', count: trendGroups.length },
                  ]}
                />

                {pastTab === 'overview' && (
                  <div className={styles.card}>
                    <div className={styles.resultBrand}>{group.brand}</div>
                    <div className={styles.resultTopic}>"{group.topic}"</div>
                    <div className={styles.resultHeadline}>Latest: mentioned in {group.mentionedCount} of 3 prompts</div>
                    <p className={styles.shareFootnote} style={{ marginBottom: 14, textAlign: 'left' }}>{group.checks} {group.checks === 1 ? 'check' : 'checks'} so far · last run {timeAgo(group.checkedAt)}</p>
                    <CheckChips
                      items={checks.slice(-12).map(h => {
                        const n = mentionsOf(h);
                        return { date: shortDate(h.checkedAt || h.checked_at), label: `${n} of 3`, tone: n === 3 ? 'good' : n === 0 ? 'bad' : 'strong' };
                      })}
                    />
                  </div>
                )}

                {pastTab === 'trend' && (checks.length < 2 ? (
                  <TabEmpty>The trend appears after this topic has been checked twice. Run it again to start the line.</TabEmpty>
                ) : (
                  <div className={styles.card}>
                    <p className={styles.sectionTitle}>Mentions over time</p>
                    <p className={styles.shareFootnote} style={{ marginBottom: 12, textAlign: 'left' }}>How many of the 3 prompts mentioned {group.brand} on each check.</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 8, left: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="date" padding={{ left: 24, right: 24 }} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} allowDecimals={false} tickFormatter={v => `${v}/3`} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip
                          contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12 }}
                          formatter={v => [`${v} of 3 prompts`, 'Mentioned']}
                        />
                        <Line type="monotone" dataKey="mentions" stroke="#2B8FE3" strokeWidth={2.5} dot={{ r: 5, fill: '#2B8FE3', strokeWidth: 0 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}

                {pastTab === 'all' && (
                  <>
                    <div className={styles.clearRow}>
                      <button onClick={handleClear} className={styles.btnSecondary} style={{ color: 'var(--red)' }}>
                        <Trash2 size={12} /> Clear history
                      </button>
                    </div>
                    {trendGroups.map(g => (
                      <div
                        key={g.key}
                        className={styles.trendRow}
                        onClick={() => { setPastKey(g.key); setPastTab('overview'); }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          <MentionCountBadge count={g.mentionedCount} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.trendBrand}>{g.brand}</div>
                          <div className={styles.trendMeta}>
                            "{g.topic}" · {g.checks} check{g.checks > 1 ? 's' : ''}
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
