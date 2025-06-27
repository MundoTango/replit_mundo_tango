"use client";
import React, { useState } from 'react';
import { Avatar, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ProfileHeadProps {
  user: {
    id: number;
    name: string;
    username?: string;
    profileImage?: string;
    backgroundImage?: string;
    city?: string;
    country?: string;
    tangoRoles?: string[];
    bio?: string;
    isOwner: boolean;
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEditProfile?: () => void;
  onAddTravelDetails?: () => void;
}

const ProfileHead: React.FC<ProfileHeadProps> = ({
  user,
  activeTab = 'about',
  onTabChange,
  onEditProfile,
  onAddTravelDetails
}) => {
  const tabs = ["about", "photos", "videos", "friends"];
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="grid grid-cols-12 pr-5 gap-4 mt-3 rounded-[12px]">
      <div className="col-span-12 bg-white h-[65vh]">
        {/* Background Image */}
        <div
          className="w-full h-60 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md"
          style={{
            backgroundImage: user.backgroundImage 
              ? `url('${user.backgroundImage}')` 
              : `url('/images/profile/profile_bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Profile Content */}
        <div className="relative -top-28 w-full px-6">
          <div>
            {/* Profile Picture */}
            <Avatar
              alt={user.name}
              src={user.profileImage}
              sx={{ width: 150, height: 150, border: "5px solid white" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            {/* Profile Info and Actions */}
            <div className="flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex gap-5 mt-1">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <div className="flex gap-2 items-end">
                    {user.tangoRoles?.map((role) => (
                      <p
                        className="p-1 bg-[#8E142E] capitalize rounded-2xl min-w-[47px] h-[25px] px-2.5 text-center text-white flex justify-center items-center"
                        key={role}
                      >
                        {role}
                      </p>
                    ))}
                  </div>
                </div>
                <p className="text-[#64748B] mt-1">
                  {user.username && `User Name: @${user.username}`}
                  {user.username && user.city && ' | '}
                  {user.city && `City: ${user.city}`}
                  {user.country && `, ${user.country}`}
                </p>
              </div>

              {/* Action Buttons */}
              {user.isOwner && (
                <div className="flex items-center h-10">
                  <div 
                    className="flex items-center gap-1 text-[#0D448A] px-4 py-2 font-semibold cursor-pointer"
                    onClick={onAddTravelDetails}
                  >
                    <AddIcon className="text-xs" />
                    <p className="text-sm">Add Travel Details</p>
                  </div>
                  <Button
                    onClick={onEditProfile}
                    sx={{
                      backgroundColor: '#0D448A',
                      color: 'white',
                      borderRadius: '11px',
                      padding: '10px 20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#0a3570',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-3">
                <p className="text-[#64748B] text-sm">{user.bio}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-4 flex space-x-4 text-sm">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  className={
                    currentTab === tab
                      ? "bg-black rounded-full text-white px-2.5 py-1 cursor-pointer"
                      : "cursor-pointer font-bold px-2 py-1 text-black hover:bg-gray-100 rounded-full"
                  }
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHead;