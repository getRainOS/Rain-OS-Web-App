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
        target="rain-os-aeo-sidebar"
        icon={cloud}
      >
        {__('Rain OS AI Readability', 'rain-os-aeo-analyzer')}
      </PluginSidebarMoreMenuItem>
      <PluginSidebar
        name="rain-os-aeo-sidebar"
        title={__('Rain OS AI Readability', 'rain-os-aeo-analyzer')}
        icon={cloud}
        className="rain-os-aeo-sidebar"
      >
        <AEOSidebar />
      </PluginSidebar>
    </>
  );
};

registerPlugin('rain-os-aeo-analyzer', {
  render: RainOSAEOPlugin,
  icon: cloud,
});
