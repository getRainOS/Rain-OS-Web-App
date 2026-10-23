import PastAnalyses from '../components/PastAnalyses.jsx';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import QuickTools from '../components/QuickTools.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import TypewriterPlaceholder from '../components/TypewriterPlaceholder.jsx';
import CitationCrossPromo from '../components/CitationCrossPromo.jsx';
import { FileText, PenLine, ShoppingBag, LayoutTemplate, BookOpen, MessageSquare, Sparkles, Lock } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import CheckProgress from '../components/CheckProgress.jsx';
import InterviewDraft from '../components/InterviewDraft.jsx';
import styles from './ContentAnalyzer.module.css';
import { PILLAR_COLORS } from '../lib/pillarColors.js';

const DRAFT_STORAGE_KEY = 'rain_os_content_analyzer_draft';

const CONTENT_TYPES = [
  { id: 'article', label: 'Article', Icon: FileText },
  { id: 'blog_post', label: 'Blog Post', Icon: PenLine },
  { id: 'product_description', label: 'Product Description', Icon: ShoppingBag },
  { id: 'landing_page', label: 'Landing Page', Icon: LayoutTemplate },
  { id: 'documentation', label: 'Documentation', Icon: BookOpen },
  { id: 'social_post', label: 'Social Post', Icon: MessageSquare },
];

// Only the content types a given lane's user is actually likely to write —
// showing all six to every lane is noise (a developer isn't writing a
// product description; a product seller isn't writing documentation). First
// entry in each list is that lane's default.
// Plain-English version of the scorer's content-type rubric
// (backend CONTENT_TYPE_RUBRICS), shown behind the "?" next to Content type.
const TYPE_EXPECTATIONS = {
  article: 'a clear headline, descriptive subheadings, an answer-first opening and attributed claims.',
  blog_post: 'a hook in the first two sentences, short paragraphs, concrete examples and a clear takeaway.',
  product_description: 'price, availability and specs as plain facts, who it is for, and how it differs from alternatives. Vague adjectives cost points.',
  landing_page: 'one clear value proposition, a direct call to action, and specific proof (numbers, testimonials) over vague claims.',
  documentation: 'clear navigation, numbered steps, runnable code examples, and error cases covered.',
  social_post: 'a strong first line, one idea, and a takeaway that stands on its own.',
};

// Exact length checks per content type (no AI): a social post longer than
// the platforms show before "see more", or a product description that runs
// to an essay, is flagged whatever the score says.
const LENGTH_LIMITS = {
  social_post: { maxChars: 1300, note: 'LinkedIn cuts posts off after about 210 characters with "see more", X allows 280 characters, and posts over about 1,300 characters get far less engagement. Lead with the hook and cut it down, or split it into a thread.' },
  product_description: { maxWords: 400, note: 'Shoppers and AI shopping answers pull the key facts from the top. Keep the description tight and move the long story to a separate page.' },
};

function lengthWarning(contentType, text) {
  const limit = LENGTH_LIMITS[contentType];
  const t = (text || '').trim();
  if (!limit || !t) return null;
  const chars = t.length;
  const words = t.split(/\s+/).length;
  if (limit.maxChars && chars > limit.maxChars) return `Too long for a social post: ${chars.toLocaleString()} characters (aim for under ${limit.maxChars.toLocaleString()}). ${limit.note}`;
  if (limit.maxWords && words > limit.maxWords) return `Long for a product description: ${words.toLocaleString()} words (aim for under ${limit.maxWords}). ${limit.note}`;
  return null;
}

const PILLAR_NAMES = {
  ai_readability: 'AI Readability', digital_authority: 'Digital Authority', conversion_readiness: 'Conversion Readiness',
  product_discoverability: 'Product Discoverability', rag_readiness: 'RAG Readiness', local_presence: 'Local Presence',
};
const PILLAR_CAMEL = {
  ai_readability: 'aiReadability', digital_authority: 'digitalAuthority', conversion_readiness: 'conversionReadiness',
  product_discoverability: 'productDiscoverability', rag_readiness: 'ragReadiness', local_presence: 'localPresence',
};
const pillarScoreOf = (result, key) => {
  const v = result?.[key] ?? result?.pillarScores?.[PILLAR_CAMEL[key]];
  return typeof v === 'number' ? Math.round(v) : null;
};

// The analysis's fixes in one shape. Older analyses have no ids, so each
// gets one from its position.
function fixesOf(result) {
  return (result?.recommendations || []).map((r, i) => (typeof r === 'object' && r !== null
    ? { id: r.id || `r:${i}`, text: r.text || r.recommendation || r.description || r.issue || '', pillar: r.pillar || null, source: r.source || 'judged', metric: r.metric, sub: r.sub, artifact: r.artifact || null }
    : { id: `r:${i}`, text: String(r), pillar: null, source: 'judged', artifact: null })).filter(f => f.text);
}

const LANE_CONTENT_TYPES = {
  general: ['article', 'blog_post', 'landing_page', 'social_post'],
  product_sellers: ['product_description', 'landing_page', 'social_post'],
  developers: ['documentation', 'article', 'landing_page'],
  vibe_coders: ['landing_page', 'documentation', 'social_post'],
  local_business: ['landing_page', 'blog_post', 'social_post'],
};

function contentTypesForLane(lane) {
  const ids = LANE_CONTENT_TYPES[lane] || LANE_CONTENT_TYPES.general;
  return ids.map(id => CONTENT_TYPES.find(t => t.id === id)).filter(Boolean);
}

function defaultContentTypeForLane(lane) {
  return contentTypesForLane(lane)[0].id;
}

function readSavedDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return {};
    return {
      title: typeof saved.title === 'string' ? saved.title : '',
      content: typeof saved.content === 'string' ? saved.content : '',
      url: typeof saved.url === 'string' ? saved.url : '',
      contentType: typeof saved.contentType === 'string' ? saved.contentType : '',
      analysisId: saved.analysisId != null ? String(saved.analysisId) : null,
      lastAnalysisId: saved.lastAnalysisId != null ? String(saved.lastAnalysisId) : null,
    };
  } catch {
    return {};
  }
}

function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      title: draft.title || '',
      content: draft.content || '',
      url: draft.url || '',
      contentType: draft.contentType || '',
      analysisId: draft.analysisId != null ? String(draft.analysisId) : null,
      // The last analysis you were looking at, so coming back reopens its results.
      lastAnalysisId: draft.lastAnalysisId != null ? String(draft.lastAnalysisId) : null,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // Draft persistence is best-effort; never interrupt editing if storage is unavailable.
  }
}

export default function ContentAnalyzer() {
  const { refreshUser, user, userLane } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const prefill = location.state || {};
  const savedDraft = readSavedDraft();
  const savedDraftMatchesAnalysis = !id || !savedDraft.analysisId || savedDraft.analysisId === String(id);
  // A content idea sent over from Prompt Research starts a fresh piece with that title.
  const fromIdea = !!prefill.freshIdea;
  const [title, setTitle] = useState(prefill.pendingTitle || (savedDraftMatchesAnalysis ? savedDraft.title : '') || '');
  const [content, setContent] = useState(prefill.pendingContent || (!fromIdea && savedDraftMatchesAnalysis ? savedDraft.content : '') || '');
  const [url, setUrl] = useState(prefill.pendingUrl || (!fromIdea && savedDraftMatchesAnalysis ? savedDraft.url : '') || '');
  const [typeHelpOpen, setTypeHelpOpen] = useState(false);
  // Product fact sheets the rewrite can use as verified facts.
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  useEffect(() => {
    if (userLane !== 'product_sellers') return;
    api.products().then(({ data }) => setProducts(data?.items || [])).catch(() => {});
  }, [userLane]);
  const [contentType, setContentType] = useState(
    (fromIdea && contentTypesForLane(userLane).some(t => t.id === prefill.contentType) ? prefill.contentType : '')
      || (savedDraftMatchesAnalysis ? savedDraft.contentType : '') || defaultContentTypeForLane(userLane)
  );
  const [interviewOpen, setInterviewOpen] = useState(fromIdea && !prefill.pendingContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // The text the open result was scored on, to tell when the editor has moved on.
  const [analyzedContent, setAnalyzedContent] = useState(null);
  // Fix id -> { done, now } from re-checking the edited text (no AI, no credit).
  const [fixState, setFixState] = useState({});

  // Keep the editor draft across refreshes and route changes. This is intentionally
  // separate from analysis history so an in-progress edit is never lost.
  useEffect(() => {
    saveDraft({ title, content, url, contentType, analysisId: id || null, lastAnalysisId: id || readSavedDraft().lastAnalysisId || null });
  }, [title, content, url, contentType, id]);

  // Coming back to the editor (for example from the sidebar) reopens the
  // results of the analysis you were last on, instead of showing the text alone.
  useEffect(() => {
    if (id || fromIdea) return;
    const last = readSavedDraft().lastAnalysisId;
    if (last) navigate(`/analyze/${last}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getAnalysisById(id)
      .then(({ data }) => {
        if (!cancelled) {
          setResult(data?.data ?? null);
          setAnalyzedContent(typeof data?.data?.content === 'string' && data.data.content.trim() ? data.data.content : null);
          // Older analyses, or deployments where the content column is still
          // empty, must not erase the text that is already in the editor.
          const persistedContent = data?.data?.content;
          if (typeof persistedContent === 'string' && persistedContent.trim()) {
            setContent(persistedContent);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load that analysis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);
  // Re-check the listed fixes as the text is edited, by hand or by an accepted
  // rewrite, so the ones actually done drop off. Measured fixes are exact;
  // judged ones wait for the next analysis.
  // Older analyses saved no text: the editor's text when they opened is the baseline.
  useEffect(() => {
    if (result && analyzedContent === null && content.trim()) setAnalyzedContent(content);
  }, [result, analyzedContent, content]);
  const contentEdited = !!result && analyzedContent !== null && content !== analyzedContent;
  useEffect(() => {
    if (!result) return;
    if (!contentEdited) { setFixState({}); return; }
    const fixes = fixesOf(result);
    if (!fixes.some(f => f.source === 'measured')) return;
    const t = setTimeout(() => {
      const contentTypeLabel = CONTENT_TYPES.find(x => x.id === contentType)?.label || '';
      api.checkFixes({ content, contentType: contentTypeLabel, fixes: fixes.map(({ id, source, metric, sub }) => ({ id, source, metric, sub })) })
        .then(({ data }) => setFixState(Object.fromEntries((data?.status || []).map(x => [x.id, x]))))
        .catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, [content, contentEdited, result, contentType]);

  const [textareaFocused, setTextareaFocused] = useState(false);

  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
  // True after "Use this version": the results below are for the old text.
  const [stale, setStale] = useState(false);
  // Score before an accepted rewrite, shown as "64 → 71" once it's rescored.
  const [beforeScore, setBeforeScore] = useState(null);
  const [rewriteError, setRewriteError] = useState('');

  const usageCount = user?.usage?.count ?? 0;
  const usageLimit = user?.usage?.limit ?? 5;
  const isAtLimit = user && usageCount >= usageLimit && user.subscriptionStatus !== 'active';

  const analysisModule = userLane === 'product_sellers' ? 'product_sellers'
    : userLane === 'developers' ? 'developers'
    : userLane === 'local_business' ? 'local_business'
    : userLane === 'vibe_coders' ? 'vibe_coders'
    : 'general';

  const pageLabel = userLane === 'developers'
    ? 'Documentation Optimizer'
    : userLane === 'product_sellers'
    ? 'Product Content Optimizer'
    : userLane === 'local_business'
    ? 'Local Business Optimizer'
    : userLane === 'vibe_coders'
    ? 'Vibe Coder Content Optimizer'
    : 'Content Optimizer';

  const pageSub = userLane === 'developers'
    ? 'Paste your documentation to score and optimize it for AI discoverability'
    : userLane === 'product_sellers'
    ? 'Paste your product content to analyze it for AI shopping and discovery signals'
    : userLane === 'local_business'
    ? 'Paste your website content or Google Business Profile description to score it for local AI visibility'
    : userLane === 'vibe_coders'
    ? 'Paste your vibe-coded landing page or app copy to audit AI readability and discoverability before launch'
    : 'Paste your content to get a full AEO analysis and rewrite it for AI readability';

  async function handleAnalyze(e) {
    e.preventDefault();
    setBeforeScore(null);
    await runAnalysis(content);
  }

  async function runAnalysis(text) {
    if (!title.trim()) return;
    if (!text.trim() && !url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setRewriteResult(null);
    try {
      const contentTypeLabel = CONTENT_TYPES.find(t => t.id === contentType)?.label || '';
      // Re-analyzing an open past result continues that piece's series, so the
      // dashboard can show its trend. A fresh analysis starts a new piece.
      const previousAnalysisId = id && result ? Number(id) : undefined;
      setStale(false);
      const { data } = await api.analyze({ title, content: text, url, module: analysisModule, lane: userLane, contentType: contentTypeLabel, previousAnalysisId });
      setResult(data);
      setAnalyzedContent(text);
      refreshUser();
      if (data?.analysisId) {
        // Carry the submitted draft through the route transition as a second
        // safeguard in addition to localStorage.
        navigate(`/analyze/${data.analysisId}`, {
          replace: true,
          state: { pendingTitle: title, pendingContent: text, pendingUrl: url },
        });
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (!content.trim()) return;
    setRewriteLoading(true);
    setRewriteError('');
    setRewriteResult(null);
    try {
      const contentTypeLabel = CONTENT_TYPES.find(t => t.id === contentType)?.label || undefined;
      // The server rewrites to the scoring rubric, scores the result, and uses
      // this piece's saved score as the "before".
      // With results open, the rewrite works through exactly the fixes still listed.
      const fixes = result ? fixesOf(result).filter(f => fixState[f.id]?.done !== true).map(({ artifact, ...f }) => f) : undefined;
      const { data } = await api.rewrite({ content, module: analysisModule, contentType: contentTypeLabel, analysisId: id && result ? Number(id) : undefined, productId: productId ? Number(productId) : undefined, fixes });
      setRewriteResult(data);
      refreshUser();
    } catch (err) {
      setRewriteError(err.message || 'Rewrite failed. Please try again.');
    } finally {
      setRewriteLoading(false);
    }
  }

  // Swap in the rewrite and score it straight away. The old result stays
  // open until then, so the new analysis joins the same piece's series and
  // the dashboard shows before and after.
  async function handleAcceptRewrite() {
    if (!rewriteResult?.rewritten) return;
    const text = rewriteResult.rewritten;
    const prev = result?.overall_score ?? result?.rain_score ?? null;
    setContent(text);
    setRewriteResult(null);
    if (!result) return;
    if (isAtLimit) { setStale(true); return; }
    setBeforeScore(typeof prev === 'number' ? prev : null);
    await runAnalysis(text);
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <PageHeader title={pageLabel} subtitle={pageSub} />

      {isAtLimit && (
        <div className={styles.upgradeGate}>
          <Lock className={styles.upgradeGateIcon} size={18} aria-hidden="true" />
          <p className={styles.upgradeGateText}>
            You've used all {usageLimit} free analyses.
          </p>
          <p className={styles.upgradeGateSub}>Upgrade your plan to continue analyzing content.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upgrade')}>
            View Plans →
          </button>
        </div>
      )}

      {
        <form onSubmit={handleAnalyze} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Title <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="My article title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>URL (optional)</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://example.com/article"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Content type
              <button type="button" className={styles.typeHelpBtn} aria-label="How does content type change the score?" aria-expanded={typeHelpOpen}
                onClick={() => setTypeHelpOpen(o => !o)}>?</button>
            </label>
            {typeHelpOpen && (
              <div className={styles.typeHelp} role="note">
                <p><strong>Your lane</strong> sets how much each pillar counts toward the score (see the lane chooser on the dashboard).</p>
                <p><strong>The content type</strong> doesn't change those weights. It changes what's expected, and the AI rewrite is held to the same expectations:</p>
                <ul>
                  {contentTypesForLane(userLane).map(t => <li key={t.id}><strong>{t.label}:</strong> {TYPE_EXPECTATIONS[t.id]}</li>)}
                </ul>
              </div>
            )}
            {userLane === 'product_sellers' && (
              <div className={styles.productPick}>
                <label htmlFor="ca-product">Product facts <span>Optional</span></label>
                {products.length ? (
                  <select id="ca-product" value={productId} onChange={e => setProductId(e.target.value)}>
                    <option value="">None</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.facts.name} ({p.completeness.filled}/{p.completeness.total} facts)</option>)}
                  </select>
                ) : (
                  <p><Link to="/products">Add a product fact sheet</Link> and the rewrite can state your real prices, specs and shipping instead of asking for them.</p>
                )}
              </div>
            )}
            <div className={styles.typePills}>
              {contentTypesForLane(userLane).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.typePill} ${contentType === t.id ? styles.typePillActive : ''}`}
                  onClick={() => setContentType(t.id)}
                >
                  <t.Icon className={styles.typePillIcon} aria-hidden="true" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {interviewOpen && !content.trim() && (
            <InterviewDraft
              question={prefill.question || title}
              kind={contentType === 'article' ? 'article' : 'blog'}
              onDraft={(t, d) => { if (t) setTitle(t); setContent(d); setInterviewOpen(false); refreshUser?.(); }}
              onSkip={() => setInterviewOpen(false)}
            />
          )}

          <div className={styles.field}>
            <label className={styles.label}>Content</label>
            <div className={styles.textareaWrap}>
              <TypewriterPlaceholder
                value={content}
                isFocused={textareaFocused}
                padding="12px 14px"
                fontSize="14px"
                lineHeight="1.6"
              />
              <textarea
                className={styles.textarea}
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
                rows={14}
              />
            </div>
            <span className={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isAtLimit || !title.trim() || (!content.trim() && !url.trim())}
            >
              {loading ? (result ? 'Re-analyzing…' : 'Analyzing…') : (result ? 'Re-analyze' : 'Analyze content')}
            </button>
            <button
              type="button"
              className={styles.rewriteBtn}
              disabled={rewriteLoading || loading || isAtLimit || !content.trim()}
              onClick={handleRewrite}
            >
              {rewriteLoading ? 'Rewriting to the rubric and scoring it… (up to a minute)' : 'Rewrite for AI'}
            </button>
            {result && id && (
              <button
                type="button"
                className={styles.rewriteBtn}
                disabled={loading}
                onClick={() => {
                  saveDraft({ title: '', content: '', url: '', contentType, analysisId: null, lastAnalysisId: null });
                  setTitle(''); setContent(''); setUrl(''); setResult(null); setRewriteResult(null); setStale(false);
                  navigate('/analyze');
                }}
              >
                Start a new piece
              </button>
            )}
            {!loading && !title.trim() && (content.trim() || url.trim()) && (
              <span className={styles.actionHint}>Add a title above to analyze</span>
            )}
          </div>

          {rewriteError && <p className={styles.error}>{rewriteError}</p>}

          {rewriteResult && (
            <RewritePanel
              listedFixes={result ? fixesOf(result) : []}
              rewriteResult={rewriteResult}
              onAccept={handleAcceptRewrite}
              canRescore={!!result && !isAtLimit}
              onDiscard={() => setRewriteResult(null)}
            />
          )}
        </form>
      }
      {loading && (
        <div style={{ marginTop: 20 }}>
          <CheckProgress
            title={result ? 'Re-analyzing your content' : 'Analyzing your content'}
            skeleton="report"
            steps={[
              { label: 'Reading your content', ms: 2500 },
              { label: 'Measuring structure and readability', ms: 4000 },
              { label: 'Scoring each pillar', ms: 8000 },
              { label: 'Writing your fixes' },
            ]}
          />
        </div>
      )}
      {rewriteLoading && (
        <div style={{ marginTop: 20 }}>
          <CheckProgress
            title="Rewriting for AI"
            compact
            steps={[
              { label: 'Reading your draft', ms: 2500 },
              { label: 'Restructuring it so AI can quote it' },
            ]}
          />
        </div>
      )}
      {result && (
        <div className={styles.results} style={stale ? { opacity: 0.55 } : undefined}>
          {stale && (
            <p className={styles.error} style={{ marginBottom: 12 }} role="status">
              You swapped in the rewrite, so these scores are for your old text. Choose Re-analyze to score the new version (uses 1 analysis).
            </p>
          )}
          {beforeScore !== null && typeof (result.overall_score ?? result.rain_score) === 'number' && (() => {
            const after = result.overall_score ?? result.rain_score;
            const d = Math.round(after - beforeScore);
            return (
              <p className={styles.rescoreNote} role="status">
                After the rewrite: <strong>{Math.round(beforeScore)} → {Math.round(after)}</strong>
                {' '}({d > 0 ? `+${d}` : d === 0 ? 'no change' : d})
              </p>
            );
          })()}
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Analysis Results</h2>
              {result.title && <p className={styles.resultsSub}>{result.title}</p>}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just scored ${result.overall_score ?? result.rain_score ?? '—'}/100 on rain OS for AI readability. How does your content rank?`)}
&url=${encodeURIComponent(window.location.origin + '/analyze')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share
              </a>
            </div>
          </div>

          <PillarScores result={result} lane={userLane} />

          {result.authorship && (
            <div className={`card ${styles.authorshipCard}`}>
              <h3 className={styles.sectionTitle}>Authorship &amp; E-E-A-T Signals</h3>
              <div className={styles.authorshipGrid}>
                {[
                  { label: 'Author Byline', ok: result.authorship.hasAuthorByline },
                  { label: 'Publish Date', ok: result.authorship.hasPublishDate },
                  { label: 'Organization', ok: result.authorship.hasOrganization },
                ].map(({ label, ok }) => (
                  <div key={label} className={styles.authorshipBadge}>
                    <span className={styles.authorshipBadgeIcon} style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>
                      {ok ? '✓' : '✗'}
                    </span>
                    <span style={{ color: ok ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
                  </div>
                ))}
                <div className={styles.authorshipScore}>
                  <span>Authority Score</span>
                  <span className={styles.authorshipScoreValue}>{result.authorship.authorityScore}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/100</span>
                </div>
              </div>
            </div>
          )}

          {result.summary && (
            <div className={`card ${styles.summaryCard}`}>
              <h3 className={styles.sectionTitle}>Summary</h3>
              <p className={styles.summaryText}>{result.summary}</p>
            </div>
          )}

          {/* Older analyses have no measured length fix, so the length warning stands in. */}
          {lengthWarning(contentType, content) && !fixesOf(result).some(f => f.metric === 'characters' || f.metric === 'words') && (
            <div className={`card ${styles.recoCard}`} role="alert" style={{ borderColor: 'var(--yellow)' }}>
              <h3 className={styles.sectionTitle}>Length</h3>
              <p className={styles.summaryText}>{lengthWarning(contentType, content)}</p>
            </div>
          )}

          {fixesOf(result).length > 0 && (() => {
            const all = fixesOf(result);
            const open = all.filter(f => fixState[f.id]?.done !== true);
            const done = all.filter(f => fixState[f.id]?.done === true);
            const weak = Object.keys(PILLAR_NAMES)
              .map(k => ({ key: k, score: pillarScoreOf(result, k) }))
              .filter(p => p.score !== null && p.score < 50 && all.some(r => r.pillar === p.key))
              .sort((a, b) => a.score - b.score);
            const groups = [
              ...Object.keys(PILLAR_NAMES)
                .map(k => ({ key: k, score: pillarScoreOf(result, k), items: open.filter(r => r.pillar === k) }))
                .filter(g => g.items.length)
                .sort((a, b) => (a.score ?? 100) - (b.score ?? 100)),
              { key: 'other', score: null, items: open.filter(r => !r.pillar || !PILLAR_NAMES[r.pillar]) },
            ].filter(g => g.items.length);
            let n = 0;
            return (
              <div className={`card ${styles.recoCard}`}>
                <h3 className={styles.sectionTitle}>
                  What to fix ({open.length}){done.length > 0 && <span style={{ fontWeight: 400, color: 'var(--green)', marginLeft: 8, fontSize: 13 }}>{done.length} done</span>}
                </h3>
                {weak.length > 0 && (
                  <p className={styles.summaryText} style={{ marginBottom: 12 }}>
                    Based on your Needs Work {weak.length === 1 ? 'pillar' : 'pillars'}: {weak.map(p => `${PILLAR_NAMES[p.key]} (${p.score})`).join(' and ')}. Start at the top.
                  </p>
                )}
                {contentEdited && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>
                    You've edited the text. Fixes we can measure (length, sentences, headings…) update as you type; the rest are confirmed when you re-analyze.
                  </p>
                )}
                {open.length === 0 && (
                  <p className={styles.summaryText}>Every measured fix is done. Re-analyze to confirm the rest and get your new score.</p>
                )}
                {groups.map(g => (
                  <div key={g.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: g.key === 'other' ? 'var(--text-muted)' : PILLAR_COLORS[g.key], margin: '10px 0 8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.key === 'other' ? 'var(--text-muted)' : PILLAR_COLORS[g.key] }} aria-hidden="true" />
                      {g.key === 'other' ? 'General' : PILLAR_NAMES[g.key]}
                      {g.score !== null && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>· {g.score}/100</span>}
                    </div>
                    <ul className={styles.recoList}>
                      {g.items.map(r => (
                        <li key={r.id} className={styles.recoItem}>
                          <span className={styles.recoNum}>{++n}</span>
                          <div className={styles.recoContent}>
                            <span>{r.text}</span>
                            {r.source === 'measured' && fixState[r.id]?.now && (
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Now: {fixState[r.id].now}</span>
                            )}
                            {r.source !== 'measured' && contentEdited && (
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Re-analyze to confirm</span>
                            )}
                            {r.artifact && <ArtifactBlock artifact={r.artifact} />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {done.length > 0 && (
                  <details style={{ marginTop: 4 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--green)' }}>Done ({done.length})</summary>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                      {done.map(f => <li key={f.id} style={{ textDecoration: 'line-through', marginBottom: 4 }}>{f.text}</li>)}
                    </ul>
                  </details>
                )}
                {content.trim() && open.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                    <button type="button" className="btn btn-primary" disabled={rewriteLoading || loading || isAtLimit} onClick={handleRewrite}>
                      {rewriteLoading ? 'Fixing and re-scoring… (up to a minute)' : `Fix ${open.length === 1 ? 'this' : `all ${open.length}`} for me`}
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Rewrites your piece against every fix above, re-scores it, and shows which ones it fixed. Anything only you can supply is listed for you.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          <QuickTools content={content} title={title} />

          <CitationCrossPromo
            title="Optimization done? Now check if AI actually cites you."
            sub="Citation Monitor gives you a real-time snapshot of current AI citations — run it before and after optimizing to see where you stand."
          />
        </div>
      )}
      <PastAnalyses kind="content" refreshKey={result} />
    </div>
  );
}

function RewritePanel({ rewriteResult, onAccept, onDiscard, canRescore, listedFixes = [] }) {
  const changes = rewriteResult.changes || [];
  const signals = rewriteResult.signals || [];
  const needsYou = rewriteResult.needsYou || [];
  const faq = rewriteResult.faq || [];
  const before = rewriteResult.before;
  const after = rewriteResult.after;
  const [copied, setCopied] = useState(false);
  function copySchema() {
    const tag = `<script type="application/ld+json">\n${rewriteResult.schema}\n</script>`;
    navigator.clipboard?.writeText(tag).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }
  return (
    <div className={styles.rewritePanel}>
      <div className={styles.rewritePanelHeader}>
        <div className={styles.rewritePanelTitle}>
          <Sparkles className={styles.rewriteSparkle} aria-hidden="true" />
          AI-Optimized Rewrite
        </div>
      </div>

      {rewriteResult.truncated && (
        <p className={styles.error} style={{ margin: '12px 16px 0' }}>
          Your piece is very long, so only the first 24,000 characters were rewritten. Rewrite the rest as a separate piece.
        </p>
      )}

      {before && after && (
        <div className={styles.rewriteScore}>
          <div className={styles.rewriteScoreHead}>
            <span>Scored with the same rubric as your analysis</span>
            <strong>{before.overall} → {after.overall}</strong>
            <span className={after.overall > before.overall ? styles.signalBetter : styles.signalWorse}>
              {after.overall > before.overall ? `+${after.overall - before.overall}` : after.overall === before.overall ? 'no change' : after.overall - before.overall}
            </span>
          </div>
          <ul className={styles.rewritePillars}>
            {after.pillars.map(p => {
              const b = before.pillars.find(x => x.key === p.key)?.score ?? 0;
              return (
                <li key={p.key}>
                  <span>{p.label}</span>
                  <span className={styles.rewritePillarBar}><span style={{ width: `${p.score}%` }} /></span>
                  <span className={styles.rewritePillarNum}>{b} → {p.score}</span>
                </li>
              );
            })}
          </ul>
          {!rewriteResult.improved && (
            <p className={styles.rewriteScoreNote}>The rewrite didn't raise the score. What's holding it back is listed under "Only you can add these".</p>
          )}
        </div>
      )}

      <div className={styles.rewriteContent}>
        <pre className={styles.rewriteText}>{rewriteResult.rewritten}</pre>
      </div>

      {(rewriteResult.fixes || []).length > 0 && (() => {
        const byId = Object.fromEntries(listedFixes.map(f => [f.id, f]));
        const st = rewriteResult.fixes.filter(x => byId[x.id]);
        const fixed = st.filter(x => x.done === true);
        const notYet = st.filter(x => x.done !== true);
        return (
          <div style={{ margin: '12px 16px 0' }}>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Fixed {fixed.length} of {st.length} listed fixes (checked on the rewritten text)</p>
            {notYet.length > 0 && (
              <details>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>Still open ({notYet.length})</summary>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                  {notYet.map(x => <li key={x.id} style={{ marginBottom: 4 }}>{byId[x.id].text}</li>)}
                </ul>
              </details>
            )}
          </div>
        );
      })()}

      {needsYou.length > 0 && (
        <div className={styles.needsYou}>
          <div className={styles.rewriteSignalsTitle}>Only you can add these{after && after.overall < 100 ? ` to close the remaining ${100 - after.overall} points` : ''}</div>
          <p className={styles.rewriteSignalsNote} style={{ marginTop: 0 }}>The rewrite doesn't invent facts. Add these yourself to close the gap.</p>
          <ol>
            {needsYou.map((n, i) => (
              <li key={i}><strong>{n.item}</strong>{n.where ? ` — ${n.where}` : ''}{n.why ? <span className={styles.needsYouWhy}>{n.why}</span> : null}</li>
            ))}
          </ol>
        </div>
      )}

      {faq.length > 0 && (
        <div className={styles.needsYou}>
          <div className={styles.rewriteSignalsTitle}>FAQ for this page</div>
          <p className={styles.rewriteSignalsNote} style={{ marginTop: 0 }}>Questions customers ask AI, answered from your content. Add them to the page, and paste the schema so AI and search engines read them as Q&A.</p>
          <dl className={styles.faqList}>
            {faq.map((f, i) => (<div key={i}><dt>{f.q}</dt><dd>{f.a}</dd></div>))}
          </dl>
          {rewriteResult.schema && (
            <button type="button" className={styles.rewriteDiscardBtn} onClick={copySchema}>{copied ? 'Copied' : 'Copy FAQ schema code'}</button>
          )}
          {rewriteResult.productSchema && (
            <button type="button" className={styles.rewriteDiscardBtn} style={{ marginLeft: 8 }} onClick={() => navigator.clipboard?.writeText(`<script type="application/ld+json">\n${rewriteResult.productSchema}\n</script>`)}>Copy product schema code</button>
          )}
        </div>
      )}

      {signals.length > 0 && (
        <div className={styles.rewriteSignals}>
          <div className={styles.rewriteSignalsTitle}>Measured before and after</div>
          <table>
            <tbody>
              {signals.map(s => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td>{s.before}</td>
                  <td aria-hidden="true">→</td>
                  <td className={s.better === true ? styles.signalBetter : s.better === false ? styles.signalWorse : undefined}>{s.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.rewriteSignalsNote}>Exact counts from the text, the same measurements the score is anchored on.</p>
        </div>
      )}

      {changes.length > 0 && (
        <details className={styles.rewriteChangesList}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '4px 0' }}>What changed ({changes.length})</summary>
          {changes.map((change, i) => (
            <div key={i} className={styles.rewriteChange}>
              <span className={styles.rewriteChangeTick}>✓</span>
              <span>{change}</span>
            </div>
          ))}
        </details>
      )}

      <div className={styles.rewriteActions}>
        <button className={styles.rewriteAcceptBtn} onClick={onAccept}>
          {canRescore ? 'Use this version and rescore' : 'Use this version'}
        </button>
        <button className={styles.rewriteDiscardBtn} onClick={onDiscard}>
          Keep original
        </button>
      </div>
    </div>
  );
}
