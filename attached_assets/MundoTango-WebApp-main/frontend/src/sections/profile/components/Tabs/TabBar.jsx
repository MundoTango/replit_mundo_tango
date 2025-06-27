const TabBar = ({ tabs, activeTab, onSelect }) => {
  return (
    <div className="mt-4 md:mt-8 flex flex-wrap justify-start">
      {tabs.map(
        (tab, index) =>
          tab?.title && (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`rounded-full px-3 md:px-8 py-1 md:py-2 text-xs md:text-base font-semibold ${activeTab === tab.id ? `${tab.title && "bg-black"} text-white transition-all` : "text-black transition-all "}`}
            >
              {tab.title}
            </button>
          )
      )}
    </div>
  );
};

export default TabBar;
