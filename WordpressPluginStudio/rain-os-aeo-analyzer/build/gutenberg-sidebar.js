(function(wp) {
  const { registerPlugin } = wp.plugins;
  const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
  const { createElement, useState, useEffect, useMemo, useCallback } = wp.element;
  const { useSelect } = wp.data;
  const { __ } = wp.i18n;
  const { PanelBody, Button, Spinner } = wp.components;
  const apiFetch = wp.apiFetch;
  const el = createElement;

  if (window.rainOsAeo && window.rainOsAeo.nonce) {
    apiFetch.use(apiFetch.createNonceMiddleware(window.rainOsAeo.nonce));
  }

  const ScoreDisplay = ({ score, isAnalyzing }) => {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

    return el('div', { className: 'rain-os-score-display' },
      el('div', { className: 'rain-os-score-ring' },
        el('svg', { width: 120, height: 120, viewBox: '0 0 120 120' },
          el('circle', { className: 'score-background', cx: 60, cy: 60, r: 52, fill: 'none', strokeWidth: 8, stroke: '#252b3b' }),
          el('circle', {
            className: 'score-progress',
            cx: 60, cy: 60, r: 52, fill: 'none', strokeWidth: 8,
            strokeDasharray: circumference,
            strokeDashoffset: isAnalyzing ? circumference : offset,
            stroke: getScoreColor(score),
            strokeLinecap: 'round',
            style: { transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }
          })
        ),
        el('div', { className: 'rain-os-score-value' }, isAnalyzing ? '...' : score)
      ),
      el('div', { className: 'rain-os-score-label' },
        isAnalyzing ? __('Analyzing...', 'rain-os-aeo-analyzer') : __('Overall AEO Score', 'rain-os-aeo-analyzer')
      )
    );
  };

  const PillarCard = ({ name, score, color }) => {
    return el('div', { className: 'rain-os-pillar-card' },
      el('div', { className: 'rain-os-pillar-header' },
        el('div', { className: 'rain-os-pillar-name' },
          el('div', { className: 'rain-os-pillar-indicator', style: { backgroundColor: color } }),
          name
        ),
        el('div', { className: 'rain-os-pillar-score', style: { color } }, score)
      ),
      el('div', { className: 'rain-os-pillar-bar' },
        el('div', { className: 'rain-os-pillar-bar-fill', style: { width: score + '%', backgroundColor: color } })
      )
    );
  };

  const TabButton = ({ label, active, onClick }) => {
    return el('button', {
      className: 'rain-os-tab-button' + (active ? ' active' : ''),
      onClick: onClick
    }, label);
  };

  const RecommendationItem = ({ icon, title, description, color }) => {
    return el('div', { className: 'rain-os-recommendation-item' },
      el('div', { className: 'rain-os-recommendation-icon', style: { color: color || '#22d3ee' } }, icon || '💡'),
      el('div', { className: 'rain-os-recommendation-content' },
        el('div', { className: 'rain-os-recommendation-title' }, title),
        el('div', { className: 'rain-os-recommendation-description' }, description)
      )
    );
  };

  const QuickAction = ({ icon, title, desc, onClick, isLoading }) => {
    return el('div', {
      className: 'rain-os-quick-action',
      onClick: onClick,
      style: { opacity: isLoading ? 0.7 : 1 }
    },
      el('div', { className: 'rain-os-quick-action-icon' }, icon),
      el('div', { className: 'rain-os-quick-action-text' },
        el('div', { className: 'rain-os-quick-action-title' }, title),
        el('div', { className: 'rain-os-quick-action-desc' }, desc)
      ),
      isLoading && el(Spinner)
    );
  };

  const AuditItem = ({ label, pass }) => {
    return el('div', { className: 'rain-os-audit-item' },
      el('div', { className: 'rain-os-audit-check ' + (pass ? 'pass' : 'fail') }, pass ? '✓' : '✗'),
      el('span', { className: 'rain-os-audit-label' }, label)
    );
  };

  const StatusMessage = ({ type, message }) => {
    if (!message) return null;
    return el('div', { className: 'rain-os-status-message ' + type }, message);
  };

  const useLocalAudit = (title, content) => {
    return useMemo(() => {
      const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;
      const hasHeadings = /<h[1-6][^>]*>/i.test(content);
      const hasImages = /<img[^>]+>/i.test(content);
      const hasAltTags = /<img[^>]+alt\s*=\s*["'][^"']+["']/i.test(content);
      const hasInternalLinks = /<a[^>]+href\s*=\s*["']\/[^"']*["']/i.test(content);
      const hasExternalLinks = /<a[^>]+href\s*=\s*["']https?:\/\/[^"']+["']/i.test(content);

      return {
        hasTitle: title && title.trim().length > 0,
        hasContent: plainText.length > 100,
        hasHeadings: hasHeadings,
        hasImages: hasImages,
        hasAltTags: hasImages ? hasAltTags : true,
        hasInternalLinks: hasInternalLinks,
        hasExternalLinks: hasExternalLinks,
        wordCountOk: wordCount >= 300,
        wordCount: wordCount
      };
    }, [title, content]);
  };

  const OverviewTab = ({ analysisData, isAnalyzing, analyzeContent, statusMessage }) => {
    const recommendations = analysisData?.recommendations || [];

    return el('div', { className: 'rain-os-overview-tab' },
      statusMessage && el(StatusMessage, { type: statusMessage.type, message: statusMessage.message }),
      el(Button, {
        className: 'rain-os-action-button',
        onClick: analyzeContent,
        disabled: isAnalyzing,
        isPrimary: true
      }, isAnalyzing ? el('span', null, el(Spinner), ' ', __('Analyzing...', 'rain-os-aeo-analyzer')) : __('Analyze Content', 'rain-os-aeo-analyzer')),
      recommendations.length > 0 && el('div', null,
        el('div', { className: 'rain-os-section-header' }, __('Recommendations', 'rain-os-aeo-analyzer')),
        recommendations.map((rec, i) => el(RecommendationItem, { key: i, ...rec }))
      ),
      !analysisData && !isAnalyzing && el('div', { style: { textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' } },
        __('Click "Analyze Content" to get your AEO score and recommendations.', 'rain-os-aeo-analyzer')
      )
    );
  };

  const ActionsTab = ({ content, title }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [results, setResults] = useState(null);

    const handleAction = async (action) => {
      setActiveAction(action);
      setIsLoading(true);
      setResults(null);

      try {
        const response = await apiFetch({
          path: '/rain-os-aeo/v1/quick-action',
          method: 'POST',
          data: { action: action, content: content, title: title }
        });

        if (response.success && response.data) {
          setResults({ action: action, data: response.data });
        }
      } catch (error) {
        console.error('Quick action failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const renderResults = () => {
      if (!results) return null;

      if (results.action === 'suggest_titles' && results.data.titles) {
        return el('div', { className: 'rain-os-result-card' },
          el('div', { className: 'rain-os-result-title' }, __('Title Suggestions', 'rain-os-aeo-analyzer')),
          results.data.titles.map((t, i) => el('div', { key: i, className: 'rain-os-title-suggestion' },
            el('span', { className: 'rain-os-title-text' }, t.text),
            el('span', { className: 'rain-os-title-score', style: { backgroundColor: t.score >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.2)', color: t.score >= 90 ? '#10b981' : '#22d3ee' } }, t.score)
          ))
        );
      }

      if (results.action === 'generate_meta' && results.data.meta_description) {
        return el('div', { className: 'rain-os-result-card' },
          el('div', { className: 'rain-os-result-title' }, __('Meta Description', 'rain-os-aeo-analyzer')),
          el('div', { className: 'rain-os-meta-description' }, results.data.meta_description),
          el('div', { className: 'rain-os-char-count' }, results.data.meta_description.length + ' ' + __('characters', 'rain-os-aeo-analyzer'))
        );
      }

      if (results.action === 'summarize' && results.data.summary) {
        return el('div', { className: 'rain-os-result-card' },
          el('div', { className: 'rain-os-result-title' }, __('Content Summary', 'rain-os-aeo-analyzer')),
          el('div', { className: 'rain-os-meta-description' }, results.data.summary)
        );
      }

      if (results.action === 'rewrite' && results.data.rewritten) {
        return el('div', { className: 'rain-os-result-card' },
          el('div', { className: 'rain-os-result-title' }, __('Rewritten Text', 'rain-os-aeo-analyzer')),
          el('div', { style: { fontSize: '12px', color: '#22d3ee', padding: '8px', backgroundColor: '#1a1f2e', borderRadius: '4px' } }, results.data.rewritten)
        );
      }

      return null;
    };

    const actions = [
      { id: 'suggest_titles', icon: '✍️', title: __('Suggest Titles', 'rain-os-aeo-analyzer'), desc: __('Generate optimized title variations', 'rain-os-aeo-analyzer') },
      { id: 'generate_meta', icon: '📝', title: __('Meta Description', 'rain-os-aeo-analyzer'), desc: __('Create SEO meta description', 'rain-os-aeo-analyzer') },
      { id: 'summarize', icon: '📋', title: __('Summarize', 'rain-os-aeo-analyzer'), desc: __('Get a concise content summary', 'rain-os-aeo-analyzer') },
      { id: 'rewrite', icon: '🔄', title: __('Rewrite Selection', 'rain-os-aeo-analyzer'), desc: __('Improve selected text', 'rain-os-aeo-analyzer') }
    ];

    return el('div', { className: 'rain-os-actions-tab' },
      el('div', { className: 'rain-os-section-header' }, __('Quick Actions', 'rain-os-aeo-analyzer')),
      actions.map((a) => el(QuickAction, { key: a.id, icon: a.icon, title: a.title, desc: a.desc, onClick: () => handleAction(a.id), isLoading: isLoading && activeAction === a.id })),
      renderResults()
    );
  };

  const MetricsTab = ({ analysisData }) => {
    if (!analysisData) {
      return el('div', { style: { textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' } },
        __('Run an analysis to see detailed metrics.', 'rain-os-aeo-analyzer')
      );
    }

    const subcategories = {
      aiReadability: [
        { name: __('Semantic Clarity', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.semanticClarity || 0 },
        { name: __('Readability Score', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.readabilityScore || 0 },
        { name: __('Logical Structure', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.logicalStructure || 0 }
      ],
      digitalAuthority: [
        { name: __('Entity Recognition', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.entityRecognition || 0 },
        { name: __('Citation Readiness', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.citationReadiness || 0 },
        { name: __('Schema Extraction', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.schemaExtraction || 0 }
      ],
      conversionReadiness: [
        { name: __('AEO Alignment', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.aeoAlignment || 0 },
        { name: __('QA-Format', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.qaFormat || 0 },
        { name: __('Metadata Audit', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.metadataAudit || 0 }
      ]
    };

    const pillarMeta = {
      aiReadability: { label: __('AI Readability', 'rain-os-aeo-analyzer'), color: '#22d3ee' },
      digitalAuthority: { label: __('Digital Authority', 'rain-os-aeo-analyzer'), color: '#10b981' },
      conversionReadiness: { label: __('Conversion Readiness', 'rain-os-aeo-analyzer'), color: '#a855f7' }
    };

    const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

    return el('div', { className: 'rain-os-metrics-tab' },
      Object.entries(subcategories).map(([pillar, scores]) => el('div', { key: pillar, style: { marginBottom: '16px' } },
        el('div', { className: 'rain-os-section-header', style: { color: pillarMeta[pillar].color } }, pillarMeta[pillar].label),
        scores.map((score, i) => el('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#252b3b', borderRadius: '6px', marginBottom: '6px' } },
          el('span', { style: { fontSize: '13px', color: '#e2e8f0' } }, score.name),
          el('span', { style: { fontSize: '13px', fontWeight: 600, color: getScoreColor(score.value) } }, score.value)
        ))
      ))
    );
  };

  const HistoryTab = ({ postId }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!postId) return;

      apiFetch({ path: '/rain-os-aeo/v1/history/' + postId })
        .then((data) => { setHistory(data || []); setIsLoading(false); })
        .catch(() => { setHistory([]); setIsLoading(false); });
    }, [postId]);

    const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

    if (isLoading) {
      return el('div', { className: 'rain-os-loading' }, el(Spinner), el('span', null, __('Loading history...', 'rain-os-aeo-analyzer')));
    }

    if (history.length === 0) {
      return el('div', { style: { textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' } },
        __('No analysis history yet.', 'rain-os-aeo-analyzer')
      );
    }

    return el('div', { className: 'rain-os-history-tab' },
      el('div', { className: 'rain-os-section-header' }, __('Analysis History', 'rain-os-aeo-analyzer')),
      history.map((entry, i) => el('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#252b3b', borderRadius: '8px', marginBottom: '8px' } },
        el('div', null,
          el('div', { style: { fontSize: '13px', color: '#e2e8f0', marginBottom: '4px' } }, new Date(entry.date).toLocaleDateString()),
          el('div', { style: { display: 'flex', gap: '8px' } },
            el('span', { style: { fontSize: '11px', color: '#22d3ee' } }, 'AI: ' + entry.aiReadability),
            el('span', { style: { fontSize: '11px', color: '#10b981' } }, 'DA: ' + entry.digitalAuthority),
            el('span', { style: { fontSize: '11px', color: '#a855f7' } }, 'CR: ' + entry.conversionReadiness)
          )
        ),
        el('div', { style: { fontSize: '18px', fontWeight: 700, color: getScoreColor(entry.overallScore) } }, entry.overallScore)
      ))
    );
  };

  const AIReadinessSection = ({ postId, onCommit, isCommitting, commitStatus }) => {
    const [scores, setScores] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
      if (!postId) return;

      setIsLoading(true);
      apiFetch({ path: '/rain-os-aeo/v1/ai-scores/' + postId })
        .then((response) => {
          if (response.success && response.data) {
            setScores(response.data);
          }
          setIsLoading(false);
        })
        .catch(() => { setIsLoading(false); });
    }, [postId]);

    const getScoreClass = (s) => s >= 80 ? 'good' : s >= 60 ? 'warning' : 'poor';

    const scoreItems = [
      { key: 'readability', label: __('Readability', 'rain-os-aeo-analyzer') },
      { key: 'structure', label: __('Structure', 'rain-os-aeo-analyzer') },
      { key: 'freshness', label: __('Freshness', 'rain-os-aeo-analyzer') },
      { key: 'citation_readiness', label: __('Citation Ready', 'rain-os-aeo-analyzer') },
      { key: 'ai_visibility', label: __('AI Visibility', 'rain-os-aeo-analyzer') }
    ];

    return el('div', { className: 'rain-os-ai-readiness' },
      el('div', { className: 'rain-os-ai-readiness-header', onClick: () => setIsExpanded(!isExpanded), style: { cursor: 'pointer' } },
        el('span', { className: 'rain-os-ai-readiness-title' }, __('AI Readiness', 'rain-os-aeo-analyzer')),
        el('span', { style: { color: '#64748b', fontSize: '12px' } }, isExpanded ? '▼' : '▶')
      ),
      isExpanded && el('div', null,
        commitStatus && el(StatusMessage, { type: commitStatus.type, message: commitStatus.message }),
        el(Button, { className: 'rain-os-action-button', onClick: onCommit, disabled: isCommitting, isPrimary: true },
          isCommitting ? el('span', null, el(Spinner), ' ', __('Committing...', 'rain-os-aeo-analyzer')) : __('Commit Content', 'rain-os-aeo-analyzer')
        ),
        isLoading ? el('div', { className: 'rain-os-loading', style: { padding: '20px' } }, el(Spinner), el('span', null, __('Loading scores...', 'rain-os-aeo-analyzer')))
          : scores ? el('div', { className: 'rain-os-ai-readiness-scores' },
              scoreItems.map((item) => el('div', { key: item.key, className: 'rain-os-ai-score-item' },
                el('span', { className: 'rain-os-ai-score-label' }, item.label),
                el('span', { className: 'rain-os-ai-score-value ' + getScoreClass(scores[item.key] || 0) }, scores[item.key] || '--')
              ))
            )
          : el('div', { style: { color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '12px' } },
              __('Commit content to get AI readiness scores', 'rain-os-aeo-analyzer')
            )
      )
    );
  };

  const LocalAudit = ({ results }) => {
    const auditItems = [
      { key: 'hasTitle', label: __('Title', 'rain-os-aeo-analyzer') },
      { key: 'hasContent', label: __('Content', 'rain-os-aeo-analyzer') },
      { key: 'hasHeadings', label: __('Headings', 'rain-os-aeo-analyzer') },
      { key: 'hasImages', label: __('Images', 'rain-os-aeo-analyzer') },
      { key: 'hasAltTags', label: __('Alt Tags', 'rain-os-aeo-analyzer') },
      { key: 'hasInternalLinks', label: __('Int. Links', 'rain-os-aeo-analyzer') },
      { key: 'hasExternalLinks', label: __('Ext. Links', 'rain-os-aeo-analyzer') },
      { key: 'wordCountOk', label: __('Word Count', 'rain-os-aeo-analyzer') }
    ];

    return el('div', { className: 'rain-os-local-audit' },
      el('div', { className: 'rain-os-section-header' }, __('Local Content Audit', 'rain-os-aeo-analyzer')),
      el('div', { className: 'rain-os-audit-grid' },
        auditItems.map((item) => el(AuditItem, { key: item.key, label: item.label, pass: results?.[item.key] }))
      )
    );
  };

  const AEOSidebar = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitStatus, setCommitStatus] = useState(null);

    const { title, content, postId } = useSelect((select) => {
      const editor = select('core/editor');
      return {
        title: editor.getEditedPostAttribute('title') || '',
        content: editor.getEditedPostContent() || '',
        postId: editor.getCurrentPostId()
      };
    }, []);

    const localAuditResults = useLocalAudit(title, content);

    const analyzeContent = useCallback(async () => {
      if (!content || content.trim().length < 50) {
        setStatusMessage({ type: 'error', message: __('Please add more content before analyzing.', 'rain-os-aeo-analyzer') });
        return;
      }

      setIsAnalyzing(true);
      setStatusMessage({ type: 'info', message: __('Analyzing your content...', 'rain-os-aeo-analyzer') });

      try {
        const response = await apiFetch({
          path: '/rain-os-aeo/v1/analyze',
          method: 'POST',
          data: { post_id: postId, title: title, content: content }
        });

        if (response.success && response.data) {
          setAnalysisData({
            overallScore: response.data.overall_score || 0,
            pillars: {
              aiReadability: { score: response.data.ai_readability || 0, label: 'AI Readability', color: '#22d3ee' },
              digitalAuthority: { score: response.data.digital_authority || 0, label: 'Digital Authority', color: '#10b981' },
              conversionReadiness: { score: response.data.conversion_readiness || 0, label: 'Conversion Readiness', color: '#a855f7' }
            },
            subScores: response.data.sub_scores || {},
            recommendations: response.data.recommendations || []
          });
          setStatusMessage({ type: 'success', message: __('Analysis complete!', 'rain-os-aeo-analyzer') });
          setTimeout(() => setStatusMessage(null), 3000);
        }
      } catch (error) {
        setStatusMessage({ type: 'error', message: error.message || __('Analysis failed.', 'rain-os-aeo-analyzer') });
      } finally {
        setIsAnalyzing(false);
      }
    }, [postId, title, content]);

    const commitContent = useCallback(async () => {
      if (!content || content.trim().length < 50) {
        setCommitStatus({ type: 'error', message: __('Please add more content before committing.', 'rain-os-aeo-analyzer') });
        return;
      }

      setIsCommitting(true);
      setCommitStatus({ type: 'info', message: __('Committing content...', 'rain-os-aeo-analyzer') });

      try {
        const response = await apiFetch({
          path: '/rain-os-aeo/v1/normalize',
          method: 'POST',
          data: { post_id: postId, title: title, content: content }
        });

        if (response.success) {
          setCommitStatus({ type: 'success', message: __('Content committed!', 'rain-os-aeo-analyzer') });
          setTimeout(() => setCommitStatus(null), 3000);
        }
      } catch (error) {
        setCommitStatus({ type: 'error', message: error.message || __('Commit failed.', 'rain-os-aeo-analyzer') });
      } finally {
        setIsCommitting(false);
      }
    }, [postId, title, content]);

    const pillars = analysisData?.pillars || {
      aiReadability: { score: 0, label: 'AI Readability', color: '#22d3ee' },
      digitalAuthority: { score: 0, label: 'Digital Authority', color: '#10b981' },
      conversionReadiness: { score: 0, label: 'Conversion Readiness', color: '#a855f7' }
    };

    const tabs = [
      { id: 'overview', label: __('Overview', 'rain-os-aeo-analyzer') },
      { id: 'actions', label: __('Actions', 'rain-os-aeo-analyzer') },
      { id: 'metrics', label: __('Metrics', 'rain-os-aeo-analyzer') },
      { id: 'history', label: __('History', 'rain-os-aeo-analyzer') }
    ];

    const renderTabContent = () => {
      switch (activeTab) {
        case 'overview':
          return el(OverviewTab, { analysisData, isAnalyzing, analyzeContent, statusMessage });
        case 'actions':
          return el(ActionsTab, { content, title });
        case 'metrics':
          return el(MetricsTab, { analysisData });
        case 'history':
          return el(HistoryTab, { postId });
        default:
          return null;
      }
    };

    return el('div', { className: 'rain-os-sidebar-content' },
      el(ScoreDisplay, { score: analysisData?.overallScore || 0, isAnalyzing }),
      Object.entries(pillars).map(([key, data]) => el(PillarCard, { key: key, name: data.label, score: data.score, color: data.color })),
      el('div', { className: 'rain-os-tab-buttons' },
        tabs.map((tab) => el(TabButton, { key: tab.id, label: tab.label, active: activeTab === tab.id, onClick: () => setActiveTab(tab.id) }))
      ),
      renderTabContent(),
      el(AIReadinessSection, { postId, onCommit: commitContent, isCommitting, commitStatus }),
      el(LocalAudit, { results: localAuditResults })
    );
  };

  const RainOSIcon = el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    el('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' }),
    el('path', { d: 'M12 6v6l4 2' })
  );

  registerPlugin('rain-os-aeo-analyzer', {
    render: function() {
      return el('div', null,
        el(PluginSidebarMoreMenuItem, { target: 'rain-os-aeo-sidebar', icon: RainOSIcon }, __('Rain OS AEO Analyzer', 'rain-os-aeo-analyzer')),
        el(PluginSidebar, { name: 'rain-os-aeo-sidebar', title: __('Rain OS AEO', 'rain-os-aeo-analyzer'), icon: RainOSIcon, className: 'rain-os-aeo-sidebar' },
          el(AEOSidebar)
        )
      );
    },
    icon: RainOSIcon
  });

})(window.wp);
