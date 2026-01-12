import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ScoreDisplay from './ScoreDisplay';
import PillarCards from './PillarCards';
import TabNavigation from './TabNavigation';
import OverviewTab from './tabs/OverviewTab';
import ActionsTab from './tabs/ActionsTab';
import MetricsTab from './tabs/MetricsTab';
import HistoryTab from './tabs/HistoryTab';
import AIReadinessSection from './AIReadinessSection';
import LocalAudit from './LocalAudit';
import { useContentAnalysis } from '../hooks/useContentAnalysis';
import { useLocalAudit } from '../hooks/useLocalAudit';

const AEOSidebar = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { title, content, postId } = useSelect((select) => {
    const editor = select('core/editor');
    return {
      title: editor.getEditedPostAttribute('title') || '',
      content: editor.getEditedPostContent() || '',
      postId: editor.getCurrentPostId(),
    };
  }, []);

  const {
    analysisData,
    isAnalyzing,
    analyzeContent,
    statusMessage,
    commitContent,
    isCommitting,
    commitStatus,
  } = useContentAnalysis(postId, title, content);

  const localAuditResults = useLocalAudit(title, content);

  const tabs = [
    { id: 'overview', label: __('Overview', 'rain-os-aeo-analyzer') },
    { id: 'actions', label: __('Actions', 'rain-os-aeo-analyzer') },
    { id: 'metrics', label: __('Metrics', 'rain-os-aeo-analyzer') },
    { id: 'history', label: __('History', 'rain-os-aeo-analyzer') },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            analysisData={analysisData}
            isAnalyzing={isAnalyzing}
            analyzeContent={analyzeContent}
            statusMessage={statusMessage}
          />
        );
      case 'actions':
        return <ActionsTab content={content} title={title} />;
      case 'metrics':
        return <MetricsTab analysisData={analysisData} />;
      case 'history':
        return <HistoryTab postId={postId} />;
      default:
        return null;
    }
  };

  return (
    <div className="rain-os-sidebar-content">
      <ScoreDisplay
        score={analysisData?.overallScore || 0}
        isAnalyzing={isAnalyzing}
      />

      <PillarCards pillars={analysisData?.pillars} />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {renderTabContent()}

      <AIReadinessSection
        postId={postId}
        onCommit={commitContent}
        isCommitting={isCommitting}
        commitStatus={commitStatus}
      />

      <LocalAudit results={localAuditResults} />
    </div>
  );
};

export default AEOSidebar;
