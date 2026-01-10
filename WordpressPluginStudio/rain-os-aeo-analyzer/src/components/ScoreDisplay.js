import { __ } from '@wordpress/i18n';

const ScoreDisplay = ({ score, isAnalyzing }) => {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="rain-os-score-display">
      <div className="rain-os-score-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="score-background"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="score-progress"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={isAnalyzing ? circumference : offset}
            style={{ stroke: getScoreColor(score) }}
          />
        </svg>
        <div className="rain-os-score-value">
          {isAnalyzing ? '...' : score}
        </div>
      </div>
      <div className="rain-os-score-label">
        {isAnalyzing
          ? __('Analyzing...', 'rain-os-aeo-analyzer')
          : __('AI Readability Score', 'rain-os-aeo-analyzer')}
      </div>
    </div>
  );
};

export default ScoreDisplay;
