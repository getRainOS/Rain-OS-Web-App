import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import WhyNotCited from '../components/WhyNotCited.jsx';
import SubjectPicker from '../components/SubjectPicker.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { AlertCircle, Search, ArrowRight } from 'lucide-react';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import { buildSourceTypes } from '../lib/sourceTypes.js';
import PageHeader from '../components/PageHeader.jsx';
import { ViewTabs, SubTabs, NewCheckButton, QuestionPicker } from '../components/MonitorTabs.jsx';
import PromptSuggestions from '../components/PromptSuggestions.jsx';
import ImproveCta from '../components/ImproveCta.jsx';
import RecentPicker from '../components/RecentPicker.jsx';
import { isSharedPlatform } from '../lib/sharedPlatforms.js';
import { improveLink } from '../lib/improveLink.js';
import { getMySite, setMySite } from '../lib/mySite.js';
import CheckProgress from '../components/CheckProgress.jsx';
import TrackedQueriesPanel, { useTrackedQueries } from '../components/TrackedQueries.jsx';
import LocalListings from '../components/LocalListings.jsx';
import { needsPlace } from '../lib/localListings.js';
import EngineCheckPanel from '../components/EngineCheckPanel.jsx';
import Select from '../components/Select.jsx';
import { COUNTRIES, US_STATES } from '../lib/usStates.js';
import styles from './CitationMonitor.module.css';
import { CitationWorldMap, EXAMPLE_TOPICS, LOCAL_EXAMPLE_TOPICS, RECENT_PAGE_SIZE, topicKey, getFavicon, normalizeDomain, ownPositionOf, byCheckedAtAsc, shortDate, timeAgo, RANK_LINE_COLORS, RankingsChart, ResultConsole, RecentAnalysesSection, MapEmptyViz, MapSummaryPanel, MapDetailSection, pct, SourceTypesSection } from '../components/citation/CitationParts';
// Lazy: react-simple-maps + d3-geo only need to load for whoever actually
// has region data to render, not on every page in the app.






// Where the user's own site sat in one check's ordered source list.




export default function CitationMonitor() {
  const { refreshUser, userLane, user } = useApp();
  const [engineRun, setEngineRun] = useState(null);
  // Engines beyond Gemini (ChatGPT, AI Overviews, …) that run alongside it.
  const [otherEngines, setOtherEngines] = useState([]);
  const [enginesLocked, setEnginesLocked] = useState(false);
  const hasChatGpt = otherEngines.length > 0;
  // Where the ChatGPT check is asked from. Settings is only the default.
  const [checkCountry, setCheckCountry] = useState('US');
  const [checkState, setCheckState] = useState(null);
  useEffect(() => { if (user) setCheckState(s => s ?? (user.locationState || '')); }, [user]);
  useEffect(() => {
    api.engines().then(({ data }) => {
      const others = (data?.engines || []).filter(e => e.id !== 'gemini');
      setOtherEngines(others.filter(e => !e.locked));
      setEnginesLocked(others.some(e => e.locked));
    }).catch(() => {});
  }, []);
  const tracking = useTrackedQueries();
  const formRef = useRef(null);
  const checkRequestIdRef = useRef(0);

  const [name, setName] = useState('');
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(() => searchParams.get('q') || '');
  const [url, setUrl] = useState(() => searchParams.get('url') || getMySite());
  const [noSite, setNoSite] = useState(false);
  // The analyzed brand / website / content this check is for (SubjectPicker).
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Cross-topic citation history from the backend (drives the Competitor Map + Recent Analyses)
  const [mapHistory, setMapHistory] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  // Backend per-topic timeline (drives "Previous checks for this topic")
  const [topicHistory, setTopicHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(RECENT_PAGE_SIZE);
  // ?view=past&topic=… opens that question's past checks (the dashboard map links here).
  const [view, setView] = useState(() => (searchParams.get('view') === 'past' ? 'past' : 'new'));
  const [resultTab, setResultTab] = useState('result');
  const [pastTab, setPastTab] = useState('overview');
  const [mapFilter, setMapFilter] = useState(() => (searchParams.get('topic') ? topicKey(searchParams.get('topic')) : null));

  async function fetchMapHistory() {
    setMapLoading(true);
    try {
      const { data } = await api.citationHistory();
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setMapHistory(items);
    } catch (_) {
      setMapHistory([]);
    } finally {
      setMapLoading(false);
    }
  }

  // Load cross-topic history from the backend on mount
  useEffect(() => {
    fetchMapHistory();
  }, []);

  async function loadTopicHistory(forTopic) {
    if (!forTopic || forTopic.trim().length < 3) {
      setTopicHistory([]);
      return;
    }
    try {
      const { data } = await api.citationHistory({ topic: forTopic.trim() });
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setTopicHistory(items);
    } catch (_) {
      setTopicHistory([]);
    }
  }

  async function handleCheck(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    if (!subject) {
      setError('Choose what you are checking. Analyze your website or content first if the list is empty.');
      return;
    }
    const checkName = name.trim() || (topic.trim().length > 60 ? `${topic.trim().slice(0, 57)}…` : topic.trim());
    // Guards against a slower in-flight check (e.g. an accidental double
    // submit, or just normal Gemini latency variance) resolving after a
    // newer one and overwriting its result — only the most recently
    // started request is allowed to update state.
    const requestId = ++checkRequestIdRef.current;
    // ChatGPT starts alongside Gemini and fills in when it is ready.
    setEngineRun(hasChatGpt ? { topic: topic.trim(), url: noSite ? undefined : (url.trim() || undefined), name: checkName, subject: subject.key, brand: subject.lookFor || undefined, id: requestId, country: checkCountry, state: checkCountry === 'US' ? (checkState || null) : null } : null);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.citationCheck({ name: checkName, topic: topic.trim(), url: noSite ? undefined : (url.trim() || undefined), subject: subject.key, brand: subject.lookFor || undefined });
      if (requestId !== checkRequestIdRef.current) return;
      // Keep the subject on the result, so Track weekly records it.
      setResult({ ...data, subject: subject?.key });
      setMySite(url);
      setResultTab('result');
      setMapFilter(topicKey(data?.topic || topic));
      // Prefer the per-topic history payload that came back with the check; fall back to a fetch.
      if (Array.isArray(data?.history) && data.history.length > 0) {
        setTopicHistory(data.history);
      } else {
        loadTopicHistory(topic);
      }
      // Refresh cross-topic history for the Competitor Map + Recent Analyses
      fetchMapHistory();
      refreshUser();
    } catch (err) {
      if (requestId !== checkRequestIdRef.current) return;
      setError(err.message || 'Citation check failed. Please try again.');
    } finally {
      if (requestId === checkRequestIdRef.current) setLoading(false);
    }
  }

  function handlePickRecent(h) {
    setName(h.name || '');
    setTopic(h.topic || '');
    setUrl(h.url || '');
    setResult(null);
    setError('');
    setView('new');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleUseSuggestion(q, site) {
    setTopic(q);
    setName(q.length > 48 ? `${q.slice(0, 45)}…` : q);
    if (site && !url.trim()) setUrl(site);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('cm-topic')?.focus();
  }

  function handleExampleClick(t) {
    setTopic(t);
    if (!name.trim()) {
      setName(t.length > 48 ? `${t.slice(0, 45)}…` : t);
    }
  }

  const ownDomain = (d => (d && !isSharedPlatform(d) ? d : null))(normalizeDomain(url));

  // Most competitor domains use generic TLDs (.com, .io) that carry no
  // geographic signal, so TLD inference alone leaves the map mostly empty.
  // Once we know which domains TLD inference couldn't place, we ask the
  // backend (Gemini HQ lookup, cached server-side) for just those — results
  // land here and override the TLD guess on the next render.
  const [resolvedCountries, setResolvedCountries] = useState(() => new Map());

  const questionOptions = useMemo(() => {
    const seen = new Map();
    const sorted = [...mapHistory].sort((a, b) =>
      new Date(b.checkedAt || b.checked_at) - new Date(a.checkedAt || a.checked_at));
    for (const h of sorted) {
      const key = topicKey(h.topic);
      if (!key || seen.has(key)) continue;
      seen.set(key, { key, label: h.name || h.topic, count: 0 });
    }
    for (const h of mapHistory) {
      const o = seen.get(topicKey(h.topic));
      if (o) o.count += 1;
    }
    return [...seen.values()];
  }, [mapHistory]);

  // "New check" only ever shows the question just run; "Past checks" shows
  // whichever question the filter picks, or everything.
  // Checks of different questions are never blended: coverage only means
  // something across repeated checks of the same question.
  const pastKey = questionOptions.some(o => o.key === mapFilter) ? mapFilter : (questionOptions[0]?.key ?? null);
  const scopeKey = view === 'new' ? (result ? topicKey(result.topic || topic) : null) : pastKey;
  const scopedHistory = useMemo(() => {
    if (scopeKey === null) return [];
    return mapHistory.filter(h => topicKey(h.topic) === scopeKey);
  }, [mapHistory, scopeKey]);
  const scopeLabel = scopeKey
    ? (questionOptions.find(o => o.key === scopeKey)?.label || result?.name || topic)
    : null;

  const competitorMap = useMemo(
    () => buildCompetitorMap(scopedHistory, ownDomain, resolvedCountries),
    [scopedHistory, ownDomain, resolvedCountries]
  );
  const sourceTypes = useMemo(
    () => buildSourceTypes(competitorMap.domains, competitorMap.ownPoint),
    [competitorMap]
  );

  useEffect(() => {
    const needsLookup = competitorMap.domains
      .filter(d => d.country === null && !resolvedCountries.has(d.domain))
      .map(d => d.domain);
    if (needsLookup.length === 0) return;
    let cancelled = false;
    api.resolveDomainCountries(needsLookup)
      .then(({ data }) => {
        if (cancelled || !data?.domains) return;
        setResolvedCountries(prev => {
          const next = new Map(prev);
          for (const [domain, country] of Object.entries(data.domains)) {
            next.set(domain, country);
          }
          return next;
        });
      })
      .catch(() => {
        // Best-effort only — the map still works with TLD-only inference.
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitorMap.domains]);

  async function handleClearHistory() {
    if (!window.confirm('Clear all saved citation checks? This permanently deletes your citation history from your account.')) return;
    try {
      await api.deleteCitationHistory();
      setMapHistory([]);
      setTopicHistory([]);
      setVisibleCount(RECENT_PAGE_SIZE);
    } catch (err) {
      setError(err.message || 'Failed to clear citation history.');
    }
  }

  const recentAnalyses = useMemo(() => {
    return [...mapHistory].sort((a, b) =>
      new Date(b.checkedAt || b.checked_at) - new Date(a.checkedAt || a.checked_at)
    );
  }, [mapHistory]);

  const hasMapDetail = competitorMap.domains.length > 0 || competitorMap.regions.length > 0;

  return (
    <div className={`${styles.page} fade-in`}>
      <PageHeader
        title="Citation Monitor"
        subtitle="Check whether AI engines cite your site when people ask about the topics you care about."
        about={[
          { heading: 'What the result means', body: 'Two results for each answer. Mentioned: the AI named your brand (needs only a name). Cited: it linked to your website as a source (needs a website). Each is what one real AI answer did at that moment, so track it over time rather than reading one check as a lasting rank.' },
          { heading: 'How the check works', body: 'We ask each AI engine your exact question live (Gemini with Google Search, ChatGPT and the others through their real answers) and look for your domain among the sources each one cites. One phrasing per check, so run a few variations before drawing conclusions.' },
        ]}
        actions={view !== 'new' && <NewCheckButton onClick={() => setView('new')} />}
      />

      <ViewTabs
        label="Citation Monitor views"
        value={view}
        onChange={setView}
        items={[
          { id: 'new', label: 'New check' },
          { id: 'past', label: 'Past checks', count: mapHistory.length },
          { id: 'tracked', label: 'Tracked weekly', count: tracking.items.length },
        ]}
      />

      {view === 'new' && (<>
      <div className={styles.workspace}>
        <div className={styles.formColumn} ref={formRef}>
          <form onSubmit={handleCheck} className={`card ${styles.formCard}`}>
            <div className={styles.formHead}>
              <h2 className={styles.formTitle}>Check a question</h2>
              <p className={styles.formSub}>See which sites AI cites when a customer asks it, and whether yours is one of them.</p>
            </div>

            <div className={styles.field}>
              <SubjectPicker
                label="Checking for"
                initialKey={searchParams.get('subject') || undefined}
                onChange={sub => { setSubject(sub); setUrl(sub?.website || ''); if (sub?.state) { setCheckCountry('US'); setCheckState(sub.state); } setNoSite(!sub?.website); setError(''); }}
                note={subject && !subject.website ? (subject.lookFor ? `Each answer is checked for “${subject.lookFor}”. Add the page’s link once it’s published to also see whether it’s cited.` : 'Add a brand name to this content in Content Optimizer so we can check whether AI names you.') : undefined}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cm-topic">Question</label>
              <textarea
                id="cm-topic"
                rows={2}
                className={`${styles.input} ${styles.textarea}`}
                placeholder={userLane === 'local_business' ? 'What would a customer ask AI? e.g. best wedding cake bakery in Austin' : 'What would a customer ask AI? e.g. best AI content optimizer for bloggers'}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
                maxLength={500}
                required
              />
              <RecentPicker mode="question" onPick={setTopic} />
              {userLane === 'local_business' && (
                needsPlace(topic)
                  ? <p className={styles.placeWarn}>“Near me” is answered from wherever the person asking is, and our check has no location. Add your city instead, like “best bakery in Austin”.</p>
                  : <p className={styles.placeHint}>Include your city, the way customers ask: “best plumber in Austin”.</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cm-name">
                Name <span className={styles.optional}>Optional</span>
              </label>
              <input
                id="cm-name"
                type="text"
                className={styles.input}
                placeholder="Defaults to the question"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={120}
              />
            </div>

            {hasChatGpt && (
              <div className={styles.field}>
                <span className={styles.label}>Check as someone in</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Select
                    value={checkCountry}
                    onChange={setCheckCountry}
                    ariaLabel="Country the check is asked from"
                    options={COUNTRIES.map(([v, l]) => ({ value: v, label: l }))}
                  />
                  {checkCountry === 'US' && (
                    <Select
                      value={checkState ?? ''}
                      onChange={setCheckState}
                      ariaLabel="US state the check is asked from"
                      options={[{ value: '', label: 'Anywhere in the US' }, ...US_STATES.map(([v, l]) => ({ value: v, label: l }))]}
                    />
                  )}
                </div>
                <p className={styles.fieldHint}>Applies to ChatGPT and Google's AI answers; Gemini, Perplexity and Claude don't take a location. The default comes from Settings.</p>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading || !topic.trim() || !subject}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Checking…
                </>
              ) : (
                <>
                  Check citations
                  <ArrowRight size={15} aria-hidden="true" />
                </>
              )}
            </button>

            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Examples</span>
              {(userLane === 'local_business' ? LOCAL_EXAMPLE_TOPICS : EXAMPLE_TOPICS).map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.exampleLink}
                  onClick={() => handleExampleClick(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {error}
            </div>
          )}

        </div>

        <div className={styles.mapColumn}>
          {loading ? (
            <CheckProgress
              title="Checking your question"
              skeleton="sources"
              steps={[
                { label: 'Asking Gemini your question', ms: 2500 },
                { label: 'Searching Google live', ms: 6000 },
                { label: 'Reading the sources it cited', ms: 5000 },
                { label: 'Finding your site among them' },
              ]}
            />
          ) : result ? (
            <div className={styles.resultsWrap}>
              <SubTabs
                label="Result views"
                value={resultTab}
                onChange={setResultTab}
                items={[
                  { id: 'result', label: 'Result' },
                  { id: 'competitors', label: 'Competitors', count: competitorMap.domains.length },
                  { id: 'map', label: 'Citation distribution', count: competitorMap.regions.length },
                  { id: 'types', label: 'Source types', count: sourceTypes.types.length },
                  ...(result.answerExcerpt ? [{ id: 'answer', label: 'What AI said' }] : []),
                ]}
              />
              {resultTab === 'result' && (
                <>
                  <ResultConsole result={result} name={name} topicHistory={topicHistory} tracking={tracking}
                    location={engineRun ? { country: engineRun.country, state: engineRun.state } : null} />
                  {engineRun && otherEngines.map(e => (
                    <EngineCheckPanel key={e.id} engine={e.id} label={e.label} usesLocation={e.location !== 'none'} run={engineRun} />
                  ))}
                  {enginesLocked && (
                    <div className={`card ${styles.gptLocked}`}>
                      <div>
                        <strong>See what every AI engine says</strong>
                        <p>Pro and Business ask ChatGPT, Google AI Overviews and the other engines the same question, from the state or country you choose, and show every site each one cited.</p>
                      </div>
                      <Link to="/upgrade" className="btn btn-primary">Upgrade</Link>
                    </div>
                  )}
                  {userLane === 'local_business' && <LocalListings sources={result.sources} url={result.url || url} />}
                  {(() => {
                    const rank = result.citedSourceIndex != null ? result.citedSourceIndex + 1 : null;
                    if (rank === 1) return null;
                    const title = result.siteShared ? 'We can’t tell which page is yours'
                      : !result.url ? 'Add your website to see where you rank'
                      : rank ? `You are cited at #${rank}. See how to move up.`
                      : 'Not cited yet. See what the cited pages do that you do not.';
                    const body = result.siteShared
                      ? 'Your site is on a platform many businesses share. Use your own website if you have one. You can still see how to improve.'
                      : !result.url
                      ? 'Without your website we cannot tell if you are cited. Add it and we will compare your page with the sources Gemini used.'
                      : 'We compare your page with the sources Gemini cited for this question and list the changes to make first.';
                    return (
                      <ImproveCta
                        title={title}
                        body={body}
                        link={improveLink({ question: result.topic || topic, url: result.url || url, mode: 'citation', sources: result.sources || [], competitors: result.competitorDomains || [] })}
                      />
                    );
                  })()}
                </>
              )}
              {resultTab === 'competitors' && <MapDetailSection map={competitorMap} scopeLabel={scopeLabel} part="domains" />}
              {resultTab === 'map' && <MapDetailSection map={competitorMap} scopeLabel={scopeLabel} part="regions" />}
              {resultTab === 'types' && <SourceTypesSection data={sourceTypes} scopeLabel={scopeLabel} />}
              {resultTab === 'answer' && result.answerExcerpt && (
                <div className={`card ${styles.answerCard}`}>
                  <h3 className={styles.sectionTitle}>What AI actually said</h3>
                  <p className={styles.sectionSub}>The grounded answer Gemini gave for your question.</p>
                  <blockquote className={styles.answerQuote}>{result.answerExcerpt}</blockquote>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.resultsWrap}>
              <PromptSuggestions url={url} lockSite brand={subject?.lookFor || undefined} subject={subject?.key} lane={userLane || 'general'} tracking={tracking} onUse={handleUseSuggestion} />
              <p className={styles.emptyHint}>
                Run a check and your result appears here: every source AI cited for your question and where your site ranked.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content without a website: what the check can and can't tell, and the two ways forward. */}
      {subject && !subject.website ? (
        <div className={styles.unpublishedCard}>
          <p className={styles.unpublishedTitle}>
            {subject.lookFor ? `Checks show whether AI names “${subject.lookFor}”` : `Add a brand name to “${subject.name}”`}
          </p>
          <p className={styles.unpublishedText}>
            {subject.lookFor
              ? 'That works without a website. To also see whether AI links to the piece as a source (cited), add its link once it’s published.'
              : 'Mentions are found by name, so tell us the business or brand behind this content. To also track citations, add the page’s link once it’s published.'}
          </p>
          <div className={styles.unpublishedActions}>
            <Link to={`/analyze/${subject.latestId}?addLink=1`} className="btn btn-primary">
              {subject.lookFor ? 'Add its link in Content Optimizer' : 'Add a brand name and link'}
            </Link>
          </div>
        </div>
      ) : (
        <WhyNotCited open={!!result && result.cited === false} />
      )}

      </>)}

      {view === 'past' && (<>
        {questionOptions.length > 0 && pastTab !== 'all' && (
          <QuestionPicker
            id="cm-scope"
            options={questionOptions.map(o => ({ key: o.key, label: `${o.label} (${o.count} ${o.count === 1 ? 'check' : 'checks'})` }))}
            value={pastKey}
            onChange={setMapFilter}
          />
        )}

        {mapHistory.length > 0 && (
          <SubTabs
            label="Past check views"
            value={pastTab}
            onChange={setPastTab}
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'competitors', label: 'Competitors', count: competitorMap.domains.length },
              { id: 'rankings', label: 'Rankings' },
              { id: 'map', label: 'Citation distribution', count: competitorMap.regions.length },
                  { id: 'types', label: 'Source types', count: sourceTypes.types.length },
              { id: 'all', label: 'All checks', count: mapHistory.length },
            ]}
          />
        )}

        {(pastTab === 'overview' || mapHistory.length === 0) && (
          <MapSummaryPanel map={competitorMap} history={scopedHistory} loading={mapLoading} />
        )}
        {mapHistory.length > 0 && pastTab === 'competitors' && <MapDetailSection map={competitorMap} scopeLabel={scopeLabel} part="domains" />}
        {mapHistory.length > 0 && pastTab === 'rankings' && <RankingsChart history={scopedHistory} map={competitorMap} />}
        {mapHistory.length > 0 && pastTab === 'map' && <MapDetailSection map={competitorMap} scopeLabel={scopeLabel} part="regions" />}
        {mapHistory.length > 0 && pastTab === 'types' && <SourceTypesSection data={sourceTypes} scopeLabel={scopeLabel} />}
        {mapHistory.length > 0 && pastTab === 'all' && (
          <RecentAnalysesSection
            analyses={recentAnalyses}
            loading={mapLoading}
            visibleCount={visibleCount}
            onShowMore={() => setVisibleCount(v => v + RECENT_PAGE_SIZE)}
            onClearHistory={handleClearHistory}
            onSelect={handlePickRecent}
          />
        )}
      </>)}

      {view === 'tracked' && <TrackedQueriesPanel tracking={tracking} />}
    </div>
  );
}




