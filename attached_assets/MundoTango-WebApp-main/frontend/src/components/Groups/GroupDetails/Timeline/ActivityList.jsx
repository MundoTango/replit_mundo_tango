import FeedSearch from "@/components/Search/FeedSearch";
import React from "react";

const activity = ["Celebration", "Eating", "Drinking", "Travelling", "Gyming"];

const ActivityList = ({ setActivity }) => {
  console.log(setActivity);
  return (
    <div className="bg-white rounded-2xl pt-5 px-3 animate-fade-up mt-4">
      <div className="px-3 font-bold">Activity</div>

      <div className="mt-3">
        <FeedSearch placeholder="Search Activity" />
      </div>

      <div className="px-3 mt-5 pb-1 h-[25vh] overflow-auto">
        {activity.map((item, index) => (
          <div
            className="mb-4 text-gray-text-color cursor-pointer font-medium"
            key={index}
            onClick={() => setActivity(item)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ActivityList;
