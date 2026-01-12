const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="rain-os-tab-buttons">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`rain-os-tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
