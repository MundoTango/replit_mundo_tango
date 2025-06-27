"use client";
import { MenuPop } from "@/app/user/friend/page";
import GroupCard from "@/components/Groups/GroupCard";
import { useGetGroupsDetailsQuery } from "@/data/services/communityApi";
import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";
import React, { useState } from "react";
import SpinnerLoading from "../Loadings/Spinner";

function CommunityGroup({ city }) {
  const { data, isLoading } = useGetGroupsDetailsQuery(city);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedCity, setCity] = React.useState("City");
  const [groups, setGroups] = React.useState([
    {
      id: 0,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: true,
    },
    {
      id: 1,
      group_image: FriendOne,
      group_name: "Texas DJ Group",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 1.5,
      group_type: "Private",
      isjoined: true,
    },
    {
      id: 2,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: true,
    },
    {
      id: 3,
      group_image: FriendOne,
      group_name: "Texas DJ Group",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 1.5,
      isjoined: false,
    },
    {
      id: 4,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: false,
    },
    {
      id: 5,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: false,
    },
    {
      id: 6,
      group_image: FriendOne,
      group_name: "Texas DJ Group",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 1.5,
      group_type: "Private",
      isjoined: false,
    },
    {
      id: 7,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: false,
    },
  ]);
  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[38vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white card animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <MenuPop
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              setCity={setCity}
            />
          </div>
        </div>

        {data?.data?.length &&
          data?.data?.map((item, key) => (
            <div key={key} className="col-span-12 md:col-span-4">
              <GroupCard {...item} item={item} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default CommunityGroup;
