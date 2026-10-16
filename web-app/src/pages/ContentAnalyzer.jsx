import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import styles from './ContentAnalyzer.module.css';

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
  const [title, setTitle] = useState(prefill.pendingTitle || (savedDraftMatchesAnalysis ? savedDraft.title : '') || '');
  const [content, setContent] = useState(prefill.pendingContent || (savedDraftMatchesAnalysis ? savedDraft.content : '') || '');
  const [url, setUrl] = useState(prefill.pendingUrl || (savedDraftMatchesAnalysis ? savedDraft.url : '') || '');
  const [contentType, setContentType] = useState(
    (savedDraftMatchesAnalysis ? savedDraft.contentType : '') || defaultContentTypeForLane(userLane)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Keep the editor draft across refreshes and route changes. This is intentionally
  // separate from analysis history so an in-progress edit is never lost.
  useEffect(() => {
    saveDraft({ title, content, url, contentType, analysisId: id || null });
  }, [title, content, url, contentType, id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getAnalysisById(id)
      .then(({ data }) => {
        if (!cancelled) {
          setResult(data?.data ?? null);
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
  const [textareaFocused, setTextareaFocused] = useState(false);

  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
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
    if (!title.trim()) return;
    if (!content.trim() && !url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setRewriteResult(null);
    try {
      const contentTypeLabel = CONTENT_TYPES.find(t => t.id === contentType)?.label || '';
      // Re-analyzing an open past result continues that piece's series, so the
      // dashboard can show its trend. A fresh analysis starts a new piece.
      const previousAnalysisId = id && result ? Number(id) : undefined;
      const { data } = await api.analyze({ title, content, url, module: analysisModule, lane: userLane, contentType: contentTypeLabel, previousAnalysisId });
      setResult(data);
      refreshUser();
      if (data?.analysisId) {
        // Carry the submitted draft through the route transition as a second
        // safeguard in addition to localStorage.
        navigate(`/analyze/${data.analysisId}`, {
          replace: true,
          state: { pendingTitle: title, pendingContent: content, pendingUrl: url },
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
      const { data } = await api.rewrite({ content, module: analysisModule });
      setRewriteResult(data);
      refreshUser();
    } catch (err) {
      setRewriteError(err.message || 'Rewrite failed. Please try again.');
    } finally {
      setRewriteLoading(false);
    }
  }

  function handleAcceptRewrite() {
    if (rewriteResult?.rewritten) {
      setContent(rewriteResult.rewritten);
      setRewriteResult(null);
      setResult(null);
    }
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
            <label className={styles.label}>Content Type</label>
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
              {rewriteLoading ? 'Rewriting…' : 'Rewrite for AI'}
            </button>
            {result && id && (
              <button
                type="button"
                className={styles.rewriteBtn}
                disabled={loading}
                onClick={() => {
                  saveDraft({ title: '', content: '', url: '', contentType, analysisId: null });
                  setTitle(''); setContent(''); setUrl(''); setResult(null); setRewriteResult(null);
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
              rewriteResult={rewriteResult}
              onAccept={handleAcceptRewrite}
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
        <div className={styles.results}>
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

          {result.recommendations?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {result.recommendations.map((r, i) => {
                  const isObj = typeof r === 'object' && r !== null;
                  const text = isObj
                    ? (r.text || r.recommendation || r.description || r.issue || '')
                    : String(r);
                  const artifact = isObj ? r.artifact : null;
                  return (
                    <li key={i} className={styles.recoItem}>
                      <span className={styles.recoNum}>{i + 1}</span>
                      <div className={styles.recoContent}>
                        <span>{text}</span>
                        {artifact && <ArtifactBlock artifact={artifact} />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <QuickTools content={content} title={title} />

          <CitationCrossPromo
            title="Optimization done? Now check if AI actually cites you."
            sub="Citation Monitor gives you a real-time snapshot of current AI citations — run it before and after optimizing to see where you stand."
          />
        </div>
      )}
    </div>
  );
}

function RewritePanel({ rewriteResult, onAccept, onDiscard }) {
  const [tab, setTab] = useState('rewritten');

  return (
    <div className={styles.rewritePanel}>
      <div className={styles.rewritePanelHeader}>
        <div className={styles.rewritePanelTitle}>
          <Sparkles className={styles.rewriteSparkle} aria-hidden="true" />
          AI-Optimized Rewrite
        </div>
        <div className={styles.rewriteTabs}>
          <button
            className={`${styles.rewriteTab} ${tab === 'rewritten' ? styles.rewriteTabActive : ''}`}
            onClick={() => setTab('rewritten')}
          >
            Rewritten
          </button>
          <button
            className={`${styles.rewriteTab} ${tab === 'changes' ? styles.rewriteTabActive : ''}`}
            onClick={() => setTab('changes')}
          >
            Changes ({rewriteResult.changes?.length ?? 0})
          </button>
        </div>
      </div>

      {tab === 'rewritten' && (
        <div className={styles.rewriteContent}>
          <pre className={styles.rewriteText}>{rewriteResult.rewritten}</pre>
        </div>
      )}

      {tab === 'changes' && (
        <div className={styles.rewriteChangesList}>
          {(rewriteResult.changes || []).map((change, i) => (
            <div key={i} className={styles.rewriteChange}>
              <span className={styles.rewriteChangeTick}>✓</span>
              <span>{change}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.rewriteActions}>
        <button className={styles.rewriteAcceptBtn} onClick={onAccept}>
          Use this version
        </button>
        <button className={styles.rewriteDiscardBtn} onClick={onDiscard}>
          Keep original
        </button>
      </div>
    </div>
  );
}
