const TabContent = ({ tabs, activeTab }) => {
  return (
    <div className="mt-4">
      {tabs
        .filter((tab) => tab.id === activeTab)
        .map((tab) => (
          <div key={tab.id} className="">
            {tab.content}
          </div>
        ))}
    </div>
  );
};

export default TabContent;
