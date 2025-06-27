"use client";
import SpinnerLoading from "@/components/Loadings/Spinner";
import FeedSearch from "@/components/Search/FeedSearch";
import {
  useAddActivityMutation,
  useGetActivityListQuery,
} from "@/data/services/activityApi";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";

const ActivityList = ({ onSetActivity, ActivityId, formData }) => {
  const [addActivity, { isLoading: addingloading }] = useAddActivityMutation();

  const [activity, setActivity] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading: activityLoading , refetch, error } = useGetActivityListQuery({search: search});
  const [activityList, setActivityList] = useState(data?.data);
  const [showAddButton, setShowAddButton] = useState(data?.data?.length <= 0);


  const addAcctivity = async (data) => {
    try {
      const result = await addActivity({ name: activity, parent_id: 1, icon: "/images/user-placeholder.jpeg" });
      if (result?.data?.code === 200) {
        setSearch('')
        refetch();
        // setActivityList(result?.data?.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const onSearch = async (e) => {
    try {
      const value = e.target.value;
      setSearch(value);
      // if (!value) {
      //   getAllActivity();
      // }

      if (e.key === "Backspace") {
        refetch();
      }

      // const filterRecord = activityList.filter(({ name }) =>
      //   name.toLowerCase().includes(value.toLowerCase())
      // );
      // setActivityList(filterRecord);
      if (data?.data?.length <= 0) {
        setShowAddButton(true);
        setActivity(value);
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (activityLoading) {
    return (
      <div className="bg-white rounded-2xl h-[35.4vh] p-5 flex items-center justify-center animate-fade-up">
        <SpinnerLoading />
      </div>
    );
  }
  

  return (
    <div className="bg-white rounded-2xl pt-5 px-3 animate-fade-up pb-3">
      <div className="px-3 font-bold">Activity</div>

      <div className="mt-3 relative">
        <FeedSearch placeholder="Search Activity" onChange={onSearch} />
        {showAddButton && (
          <button
            className="absolute top-2 right-14 text-gray-text-color rounded-full text-xs"
            onClick={() => addAcctivity()}
            style={{
              width: "18px",
              height: "18px",
              padding: "5px",
            }}
          >
            {addingloading ? <SpinnerLoading className={"text-sm"}/> : <FaPlus />}
          </button>
        )}
      </div>

      <div className="h-[25vh] overflow-auto">
        <div className="px-3 mt-5 select-none">
          {!!data?.data?.length &&
            data?.data?.map(({ id, name }, index) => (
              <div
                className={`mb-4 cursor-pointer ${ActivityId === id ? "font-bold text-gray-700" : "font-medium text-gray-text-color"} `}
                key={index}
                onClick={() => onSetActivity(id)}
              >
                {name}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default ActivityList;
