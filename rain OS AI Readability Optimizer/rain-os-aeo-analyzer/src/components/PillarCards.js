import { __ } from '@wordpress/i18n';

const pdEnabled = window.rainOsAeo?.pdEnabled !== false;

const basePillars = {
  aiReadability: { score: 0, label: 'AI Readability', color: '#22d3ee' },
  digitalAuthority: { score: 0, label: 'Digital Authority', color: '#10b981' },
  conversionReadiness: { score: 0, label: 'Conversion Readiness', color: '#a855f7' },
};

const defaultPillars = pdEnabled
  ? { ...basePillars, productDiscoverability: { score: 0, label: 'Product Discoverability', color: '#f97316' } }
  : basePillars;

const PillarCards = ({ pillars }) => {
  const pillarData = pillars || defaultPillars;

  const renderPillar = (key, data) => (
    <div className="rain-os-pillar-card" key={key}>
      <div className="rain-os-pillar-header">
        <div className="rain-os-pillar-name">
          <div
            className="rain-os-pillar-indicator"
            style={{ backgroundColor: data.color }}
          />
          {__(data.label, 'rain-os-aeo-analyzer')}
        </div>
        <div
          className="rain-os-pillar-score"
          style={{ color: data.color }}
        >
          {data.score}
        </div>
      </div>
      <div className="rain-os-pillar-bar">
        <div
          className="rain-os-pillar-bar-fill"
          style={{
            width: `${data.score}%`,
            backgroundColor: data.color,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="rain-os-pillars">
      {Object.entries(pillarData).map(([key, data]) =>
        renderPillar(key, data)
      )}
    </div>
  );
};

export default PillarCards;
