import { __ } from '@wordpress/i18n';

const OverviewTab = ({ analysisData, isAnalyzing, analyzeContent, statusMessage }) => {
  const recommendations = analysisData?.recommendations || [];

  return (
    <div className="rain-os-overview-tab">
      {statusMessage && (
        <div className={`rain-os-status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}

      <button
        className="rain-os-action-button"
        onClick={analyzeContent}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <span className="rain-os-spinner" style={{ width: 16, height: 16, margin: 0 }} />
            {__('Analyzing...', 'rain-os-aeo-analyzer')}
          </>
        ) : (
          __('Analyze Content', 'rain-os-aeo-analyzer')
        )}
      </button>

      {recommendations.length > 0 && (
        <>
          <div className="rain-os-section-header">
            {__('Recommendations', 'rain-os-aeo-analyzer')}
          </div>
          {recommendations.map((rec, index) => (
            <div key={index} className="rain-os-recommendation-item">
              <div className="rain-os-recommendation-icon" style={{ color: rec.color || '#22d3ee' }}>
                {rec.icon || '💡'}
              </div>
              <div className="rain-os-recommendation-content">
                <div className="rain-os-recommendation-title">{rec.title}</div>
                <div className="rain-os-recommendation-description">{rec.description}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {!analysisData && !isAnalyzing && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#64748b', 
          fontSize: '13px' 
        }}>
          {__('Click "Analyze Content" to get your AI Readability score and recommendations.', 'rain-os-aeo-analyzer')}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
