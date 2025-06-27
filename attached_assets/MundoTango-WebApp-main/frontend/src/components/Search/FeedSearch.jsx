import React from "react";
import SearchIcon from "../SVGs/SearchIcon";

const FeedSearch = ({
  placeholder = "Search for friends, posts, or groups",
  onChange,
  value,
}) => {
  return (
    <div>
      <div className="flex items-center gap-4 border border-[#E2E8F0] md:ml-3 md:mr-8 py-2 px-3 rounded-xl ">
        <div>
          <SearchIcon />
        </div>
        <div className="w-full">
          <input
            className="outline-none w-full text-gray-text-color font-semibold text-sm truncate"
            placeholder={placeholder}
            onKeyUp={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedSearch;
