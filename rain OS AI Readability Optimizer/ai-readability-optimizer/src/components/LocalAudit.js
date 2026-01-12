import { __ } from '@wordpress/i18n';

const LocalAudit = ({ results }) => {
  const auditItems = [
    { key: 'hasTitle', label: __('Title', 'ai-readability-optimizer') },
    { key: 'hasContent', label: __('Content', 'ai-readability-optimizer') },
    { key: 'hasHeadings', label: __('Headings', 'ai-readability-optimizer') },
    { key: 'hasImages', label: __('Images', 'ai-readability-optimizer') },
    { key: 'hasAltTags', label: __('Alt Tags', 'ai-readability-optimizer') },
    { key: 'hasInternalLinks', label: __('Int. Links', 'ai-readability-optimizer') },
    { key: 'hasExternalLinks', label: __('Ext. Links', 'ai-readability-optimizer') },
    { key: 'wordCountOk', label: __('Word Count', 'ai-readability-optimizer') },
  ];

  return (
    <div className="rain-os-local-audit">
      <div className="rain-os-section-header">
        {__('Local Content Audit', 'ai-readability-optimizer')}
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
