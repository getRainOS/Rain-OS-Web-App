import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAIReadiness } from '../hooks/useAIReadiness';

const AIReadinessSection = ({ postId, onCommit, isCommitting, commitStatus }) => {
  const { scores, isLoading, error } = useAIReadiness(postId);
  const [isExpanded, setIsExpanded] = useState(true);

  const getScoreClass = (score) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'poor';
  };

  const scoreItems = [
    { key: 'readability', label: __('Readability', 'rain-os-aeo-analyzer') },
    { key: 'structure', label: __('Structure', 'rain-os-aeo-analyzer') },
    { key: 'freshness', label: __('Freshness', 'rain-os-aeo-analyzer') },
    { key: 'citationReadiness', label: __('Citation Ready', 'rain-os-aeo-analyzer') },
    { key: 'aiVisibility', label: __('AI Visibility', 'rain-os-aeo-analyzer') },
  ];

  return (
    <div className="rain-os-ai-readiness">
      <div
        className="rain-os-ai-readiness-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <span className="rain-os-ai-readiness-title">
          {__('AI Readiness', 'rain-os-aeo-analyzer')}
        </span>
        <span style={{ color: '#64748b', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <>
          {commitStatus && (
            <div className={`rain-os-status-message ${commitStatus.type}`}>
              {commitStatus.message}
            </div>
          )}

          <button
            className="rain-os-action-button"
            onClick={onCommit}
            disabled={isCommitting}
          >
            {isCommitting ? (
              <>
                <span className="rain-os-spinner" style={{ width: 16, height: 16, margin: 0 }} />
                {__('Committing...', 'rain-os-aeo-analyzer')}
              </>
            ) : (
              __('Commit Content', 'rain-os-aeo-analyzer')
            )}
          </button>

          {isLoading ? (
            <div className="rain-os-loading" style={{ padding: '20px' }}>
              <div className="rain-os-spinner" />
              <span>{__('Loading scores...', 'rain-os-aeo-analyzer')}</span>
            </div>
          ) : error ? (
            <div className="rain-os-status-message error">{error}</div>
          ) : scores ? (
            <div className="rain-os-ai-readiness-scores">
              {scoreItems.map((item) => (
                <div key={item.key} className="rain-os-ai-score-item">
                  <span className="rain-os-ai-score-label">{item.label}</span>
                  <span className={`rain-os-ai-score-value ${getScoreClass(scores[item.key] || 0)}`}>
                    {scores[item.key] || '--'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '12px' }}>
              {__('Commit content to get AI readiness scores', 'rain-os-aeo-analyzer')}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIReadinessSection;
