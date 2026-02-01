import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useQuickActions } from '../../hooks/useQuickActions';

const ActionsTab = ({ content, title }) => {
  const {
    suggestTitles,
    generateMeta,
    summarizeContent,
    rewriteSelection,
    isLoading,
    results,
  } = useQuickActions();

  const [selectedAction, setSelectedAction] = useState(null);

  const actions = [
    {
      id: 'titles',
      icon: '✍️',
      title: __('Suggest Titles', 'ai-readability-optimizer'),
      desc: __('Generate optimized title variations', 'ai-readability-optimizer'),
      handler: () => suggestTitles(content, title),
    },
    {
      id: 'meta',
      icon: '📝',
      title: __('Meta Description', 'ai-readability-optimizer'),
      desc: __('Create AI-optimized meta description', 'ai-readability-optimizer'),
      handler: () => generateMeta(content, title),
    },
    {
      id: 'summarize',
      icon: '📋',
      title: __('Summarize', 'ai-readability-optimizer'),
      desc: __('Get a concise content summary', 'ai-readability-optimizer'),
      handler: () => summarizeContent(content),
    },
    {
      id: 'rewrite',
      icon: '🔄',
      title: __('Rewrite Selection', 'ai-readability-optimizer'),
      desc: __('Improve selected text', 'ai-readability-optimizer'),
      handler: () => rewriteSelection(getSelectedText()),
    },
  ];

  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  };

  const handleAction = async (action) => {
    setSelectedAction(action.id);
    await action.handler();
  };

  const renderResults = () => {
    if (!results || !selectedAction) return null;

    switch (selectedAction) {
      case 'titles':
        return results.titles ? (
          <div className="rain-os-result-card">
            <div className="rain-os-result-title">{__('Title Suggestions', 'ai-readability-optimizer')}</div>
            {results.titles.map((t, i) => (
              <div key={i} className="rain-os-title-suggestion">
                <span className="rain-os-title-text">{t.text}</span>
                <span
                  className="rain-os-title-score"
                  style={{
                    backgroundColor: t.score >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.2)',
                    color: t.score >= 90 ? '#10b981' : '#22d3ee',
                  }}
                >
                  {t.score}
                </span>
              </div>
            ))}
          </div>
        ) : null;

      case 'meta':
        return results.meta ? (
          <div className="rain-os-result-card">
            <div className="rain-os-result-title">{__('Meta Description', 'ai-readability-optimizer')}</div>
            <div className="rain-os-meta-description">{results.meta.text}</div>
            <div className="rain-os-char-count">
              {results.meta.text.length} {__('characters', 'ai-readability-optimizer')}
            </div>
          </div>
        ) : null;

      case 'summarize':
        return results.summary ? (
          <div className="rain-os-result-card">
            <div className="rain-os-result-title">{__('Content Summary', 'ai-readability-optimizer')}</div>
            <div className="rain-os-meta-description">{results.summary}</div>
          </div>
        ) : null;

      case 'rewrite':
        return results.rewrite ? (
          <div className="rain-os-result-card">
            <div className="rain-os-result-title">{__('Rewritten Text', 'ai-readability-optimizer')}</div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                {__('Original:', 'ai-readability-optimizer')}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px', backgroundColor: '#1a1f2e', borderRadius: '4px' }}>
                {results.rewrite.original}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                {__('Improved:', 'ai-readability-optimizer')}
              </div>
              <div style={{ fontSize: '12px', color: '#22d3ee', padding: '8px', backgroundColor: '#1a1f2e', borderRadius: '4px' }}>
                {results.rewrite.improved}
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="rain-os-actions-tab">
      <div className="rain-os-section-header">
        {__('Quick Actions', 'ai-readability-optimizer')}
      </div>

      {actions.map((action) => (
        <div
          key={action.id}
          className="rain-os-quick-action"
          onClick={() => handleAction(action)}
          style={{ opacity: isLoading && selectedAction === action.id ? 0.7 : 1 }}
        >
          <div className="rain-os-quick-action-icon">{action.icon}</div>
          <div className="rain-os-quick-action-text">
            <div className="rain-os-quick-action-title">{action.title}</div>
            <div className="rain-os-quick-action-desc">{action.desc}</div>
          </div>
          {isLoading && selectedAction === action.id && (
            <div className="rain-os-spinner" style={{ width: 16, height: 16 }} />
          )}
        </div>
      ))}

      {renderResults()}
    </div>
  );
};

export default ActionsTab;
