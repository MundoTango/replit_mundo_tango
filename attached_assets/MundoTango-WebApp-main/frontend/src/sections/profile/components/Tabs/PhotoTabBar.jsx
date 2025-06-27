const PhotoTabBar = ({ tabs, activeTab, onSelect }) => {
  return (
    <div className="my-8 flex flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`px-8 py-2 text-lg ${activeTab === tab.id ? "border-b-4 border-btn-color font-semibold text-btn-color transition-all" : "text-light-gray-color transition-all"}`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
};

export default PhotoTabBar;
