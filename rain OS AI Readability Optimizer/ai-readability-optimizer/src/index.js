import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import AEOSidebar from './components/AEOSidebar';
import './index.css';

const RainOSAEOPlugin = () => {
  return (
    <>
      <PluginSidebarMoreMenuItem
        target="ai-readability-sidebar"
        icon={cloud}
      >
        {__('Rain OS AI Readability', 'ai-readability-optimizer')}
      </PluginSidebarMoreMenuItem>
      <PluginSidebar
        name="ai-readability-sidebar"
        title={__('Rain OS AI Readability', 'ai-readability-optimizer')}
        icon={cloud}
        className="ai-readability-sidebar"
      >
        <AEOSidebar />
      </PluginSidebar>
    </>
  );
};

registerPlugin('ai-readability-optimizer', {
  render: RainOSAEOPlugin,
  icon: cloud,
});
