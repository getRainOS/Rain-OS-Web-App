import { __ } from '@wordpress/i18n';

const MetricsTab = ({ analysisData }) => {
  const subcategories = {
    aiReadability: [
      { name: __('Semantic Clarity', 'ai-readability-optimizer'), value: analysisData?.subScores?.semanticClarity || 0 },
      { name: __('Readability Score', 'ai-readability-optimizer'), value: analysisData?.subScores?.readabilityScore || 0 },
      { name: __('Logical Structure', 'ai-readability-optimizer'), value: analysisData?.subScores?.logicalStructure || 0 },
    ],
    digitalAuthority: [
      { name: __('Entity Recognition', 'ai-readability-optimizer'), value: analysisData?.subScores?.entityRecognition || 0 },
      { name: __('Citation Readiness', 'ai-readability-optimizer'), value: analysisData?.subScores?.citationReadiness || 0 },
      { name: __('Schema Extraction', 'ai-readability-optimizer'), value: analysisData?.subScores?.schemaExtraction || 0 },
    ],
    conversionReadiness: [
      { name: __('AI Alignment', 'ai-readability-optimizer'), value: analysisData?.subScores?.aeoAlignment || 0 },
      { name: __('QA-Format', 'ai-readability-optimizer'), value: analysisData?.subScores?.qaFormat || 0 },
      { name: __('Metadata Audit', 'ai-readability-optimizer'), value: analysisData?.subScores?.metadataAudit || 0 },
    ],
  };

  const pillarMeta = {
    aiReadability: { label: __('AI Readability', 'ai-readability-optimizer'), color: '#22d3ee' },
    digitalAuthority: { label: __('Digital Authority', 'ai-readability-optimizer'), color: '#10b981' },
    conversionReadiness: { label: __('Conversion Readiness', 'ai-readability-optimizer'), color: '#a855f7' },
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (!analysisData) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
        {__('Run an analysis to see detailed metrics.', 'ai-readability-optimizer')}
      </div>
    );
  }

  return (
    <div className="rain-os-metrics-tab">
      {Object.entries(subcategories).map(([pillar, scores]) => (
        <div key={pillar} style={{ marginBottom: '16px' }}>
          <div className="rain-os-section-header" style={{ color: pillarMeta[pillar].color }}>
            {pillarMeta[pillar].label}
          </div>
          {scores.map((score, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#252b3b',
                borderRadius: '6px',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{score.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#1a1f2e',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${score.value}%`,
                      height: '100%',
                      backgroundColor: getScoreColor(score.value),
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: getScoreColor(score.value),
                    minWidth: '28px',
                    textAlign: 'right',
                  }}
                >
                  {score.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MetricsTab;
