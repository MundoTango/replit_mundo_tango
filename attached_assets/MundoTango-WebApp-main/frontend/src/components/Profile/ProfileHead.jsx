"use client";
import { FriendOne } from "@/utils/Images";
import { Avatar, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import * as React from "react";
import Tab from "@mui/material/Tab";

const ProfileHead = ({ active_tab }) => {
  const tabs = ["about", "photos", "videos", "friends"];
  const [activeTab, setActiveTab] = React.useState(active_tab);

  return (
    <>
      <div className="grid grid-cols-12 pr-5 gap-4 mt-3 rounded-[12px]">
      <div className="col-span-12 bg-white h-[65vh]">
        <div
          className="w-full h-60 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md"
          style={{
            backgroundImage: `url('/images/profile/profile_bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative -top-28 w-full px-6">
          <div className="">
            <Avatar
              alt="Profile Picture"
              src={FriendOne}
              sx={{ width: 150, height: 150, border: "5px solid white" }}
            />
            <div className="flex gap-2 items-center justify-between w-full">
              <div className="">
                <div className="flex gap-5 mt-1">
                  <h1 className="text-3xl font-bold">Carlie John</h1>
                  <div className="flex gap-2 items-end">
                    {["teacher", "housing host", "DJ"].map((x) => (
                      <p
                        className="p-1 bg-[#8E142E] capitalize rounded-2xl min-w-[47px] h-[25px] px-2.5 text-center text-white flex justify-center items-center"
                        key={x}
                      >
                        {x}
                      </p>
                    ))}
                  </div>
                </div>
                <p className="text-[#64748B] mt-1">
                  User Name: @carlie_john | City: Florida
                </p>
              </div>
              <div className="flex items-center h-10">
                <div className="flex items-center gap-1 text-[#0D448A] px-4 py-2 font-semibold cursor-pointer">
                  <AddIcon className="text-xs" />
                  <p className="text-sm">Add Travel Details</p>
                </div>
                <button className="bg-[#0D448A] p-2.5 w-[107px] text-white rounded-[11px]">
                  Edit Profile
                </button>
              </div>
            </div>
            <div className="mt-4 flex space-x-4 text-sm">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  className={
                    activeTab === tab
                      ? "bg-black rounded-full text-white px-2.5 py-1"
                      : "cursor-pointer font-bold px-2 py-1 text-black"
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-12 pr-5 gap-4 mt-3 rounded-[12px]">
              
    </div>
    </>

  );
};

export default ProfileHead;
