import { __ } from '@wordpress/i18n';

const LocalAudit = ({ results }) => {
  const auditItems = [
    { key: 'hasTitle', label: __('Title', 'rain-os-aeo-analyzer') },
    { key: 'hasContent', label: __('Content', 'rain-os-aeo-analyzer') },
    { key: 'hasHeadings', label: __('Headings', 'rain-os-aeo-analyzer') },
    { key: 'hasImages', label: __('Images', 'rain-os-aeo-analyzer') },
    { key: 'hasAltTags', label: __('Alt Tags', 'rain-os-aeo-analyzer') },
    { key: 'hasInternalLinks', label: __('Int. Links', 'rain-os-aeo-analyzer') },
    { key: 'hasExternalLinks', label: __('Ext. Links', 'rain-os-aeo-analyzer') },
    { key: 'wordCountOk', label: __('Word Count', 'rain-os-aeo-analyzer') },
  ];

  return (
    <div className="rain-os-local-audit">
      <div className="rain-os-section-header">
        {__('Local Content Audit', 'rain-os-aeo-analyzer')}
      </div>
      <div className="rain-os-audit-grid">
        {auditItems.map((item) => (
          <div key={item.key} className="rain-os-audit-item">
            <div className={`rain-os-audit-check ${results?.[item.key] ? 'pass' : 'fail'}`}>
              {results?.[item.key] ? '✓' : '✗'}
            </div>
            <span className="rain-os-audit-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalAudit;
