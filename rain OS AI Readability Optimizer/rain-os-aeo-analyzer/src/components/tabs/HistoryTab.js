import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const pdEnabled = window.rainOsAeo?.pdEnabled !== false;

const HistoryTab = ({ postId }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    setIsLoading(true);
    apiFetch({
      path: `/rain-os-aeo/v1/history/${postId}`,
    })
      .then((data) => {
        setHistory(data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setIsLoading(false);
      });
  }, [postId]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="rain-os-loading">
        <div className="rain-os-spinner" />
        <span>{__('Loading history...', 'rain-os-aeo-analyzer')}</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
        {__('No analysis history yet. Run your first analysis to start tracking.', 'rain-os-aeo-analyzer')}
      </div>
    );
  }

  return (
    <div className="rain-os-history-tab">
      <div className="rain-os-section-header">
        {__('Analysis History', 'rain-os-aeo-analyzer')}
      </div>
      {history.map((entry, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#252b3b',
            borderRadius: '8px',
            marginBottom: '8px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '4px' }}>
              {formatDate(entry.date)}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#22d3ee' }}>
                AI: {entry.aiReadability}
              </span>
              <span style={{ fontSize: '11px', color: '#10b981' }}>
                DA: {entry.digitalAuthority}
              </span>
              <span style={{ fontSize: '11px', color: '#a855f7' }}>
                CR: {entry.conversionReadiness}
              </span>
              {pdEnabled && (
                <span style={{ fontSize: '11px', color: '#f97316' }}>
                  PD: {entry.productDiscoverability}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: getScoreColor(
                pdEnabled
                  ? entry.overallScore
                  : Math.round(((entry.aiReadability || 0) + (entry.digitalAuthority || 0) + (entry.conversionReadiness || 0)) / 3)
              ),
            }}
          >
            {pdEnabled
              ? entry.overallScore
              : Math.round(((entry.aiReadability || 0) + (entry.digitalAuthority || 0) + (entry.conversionReadiness || 0)) / 3)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
