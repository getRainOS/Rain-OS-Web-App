import { __ } from '@wordpress/i18n';

const pdEnabled = window.rainOsAeo?.pdEnabled !== false;

const MetricsTab = ({ analysisData }) => {
  const subcategories = {
    aiReadability: [
      { name: __('Semantic Clarity', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.semanticClarity || 0 },
      { name: __('Readability Score', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.readabilityScore || 0 },
      { name: __('Logical Structure', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.logicalStructure || 0 },
      { name: __('AEO Alignment', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.aeoAlignment || 0 },
    ],
    digitalAuthority: [
      { name: __('Entity Recognition', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.entityRecognition || 0 },
      { name: __('Citation Readiness', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.citationReadiness || 0 },
      { name: __('Descriptive Metadata', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.descriptiveMetadata || 0 },
    ],
    conversionReadiness: [
      { name: __('Schema Extraction', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.schemaExtraction || 0 },
      { name: __('QA-Format Detection', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.qaFormat || 0 },
      { name: __('Metadata Audit', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.metadataAudit || 0 },
    ],
    ...(pdEnabled ? {
      productDiscoverability: [
        { name: __('Schema Completeness', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.schemaCompleteness || 0 },
        { name: __('Answer Layer Quality', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.answerLayerQuality || 0 },
        { name: __('Freshness Signals', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.freshnessSignals || 0 },
        { name: __('Conversational Query Match', 'rain-os-aeo-analyzer'), value: analysisData?.subScores?.conversationalQueryMatch || 0 },
      ],
    } : {}),
  };

  const pillarMeta = {
    aiReadability: { label: __('AI Readability', 'rain-os-aeo-analyzer'), color: '#22d3ee' },
    digitalAuthority: { label: __('Digital Authority', 'rain-os-aeo-analyzer'), color: '#10b981' },
    conversionReadiness: { label: __('Conversion Readiness', 'rain-os-aeo-analyzer'), color: '#a855f7' },
    ...(pdEnabled ? {
      productDiscoverability: { label: __('Product Discoverability', 'rain-os-aeo-analyzer'), color: '#f97316' },
    } : {}),
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (!analysisData) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
        {__('Run an analysis to see detailed metrics.', 'rain-os-aeo-analyzer')}
      </div>
    );
  }

  const authorship = analysisData?.authorship || null;

  const AuthorshipBadge = ({ ok, label }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
      background: ok ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
      color: ok ? '#10b981' : '#64748b',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
    }}>
      {ok ? '✓' : '–'} {label}
    </span>
  );

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

      {authorship && (
        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
          <div className="rain-os-section-header" style={{ color: '#94a3b8', marginBottom: '10px' }}>
            {__('Authorship & Provenance', 'rain-os-aeo-analyzer')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            <AuthorshipBadge ok={authorship.hasAuthorByline}  label={__('Author Byline',   'rain-os-aeo-analyzer')} />
            <AuthorshipBadge ok={authorship.hasPublishDate}   label={__('Publish Date',    'rain-os-aeo-analyzer')} />
            <AuthorshipBadge ok={authorship.hasOrganization}  label={__('Organization',    'rain-os-aeo-analyzer')} />
          </div>
          {typeof authorship.authorityScore === 'number' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#252b3b', borderRadius: '6px' }}>
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{__('Authority Score', 'rain-os-aeo-analyzer')}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: getScoreColor(authorship.authorityScore) }}>
                {authorship.authorityScore}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricsTab;
