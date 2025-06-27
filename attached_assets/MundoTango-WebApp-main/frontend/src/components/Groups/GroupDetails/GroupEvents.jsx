"use client";
import DownIcon from "@/components/SVGs/DownIcon";
import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";
import { Icon, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import EventCard from "../../../components/Events/EventCard";
import CreateModal from "@/components/Events/CreateEvent";
import Link from "next/link";
import { PATH_DASHBOARD } from "@/routes/paths";

function GroupEvents({ events, group_id, refetch, handleShared }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const [events, setEvents] = React.useState([
  //   {
  //     id: 0,
  //     group_image: FriendOne,
  //     group_name: "Henry, Arthur ",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 3.6,
  //     group_type: "Private",
  //     isjoined: true,
  //     is_pending: true,
  //   },
  //   {
  //     id: 1,
  //     group_image: FriendOne,
  //     group_name: "Texas DJ Group",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 1.5,
  //     group_type: "Private",
  //     isjoined: true,
  //     is_pending: true,
  //   },
  //   {
  //     id: 3,
  //     group_image: FriendOne,
  //     group_name: "Henry, Arthur ",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 3.6,
  //     group_type: "Private",
  //     isjoined: true,
  //     is_pending: true,
  //   },
  //   {
  //     id: 4,
  //     group_image: FriendOne,
  //     group_name: "Texas DJ Group",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 1.5,
  //     isjoined: false,
  //     is_pending: false,
  //   },
  //   {
  //     id: 5,
  //     group_image: FriendOne,
  //     group_name: "Henry, Arthur ",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 3.6,
  //     group_type: "Private",
  //     isjoined: false,
  //     is_pending: false,
  //   },
  //   {
  //     id: 6,
  //     group_image: FriendOne,
  //     group_name: "Henry, Arthur ",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 3.6,
  //     group_type: "Private",
  //     isjoined: false,
  //     is_pending: false,
  //   },
  //   {
  //     id: 7,
  //     group_image: FriendOne,
  //     group_name: "Texas DJ Group",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 1.5,
  //     group_type: "Private",
  //     isjoined: false,
  //     is_pending: false,
  //   },
  //   {
  //     id: 8,
  //     group_image: FriendOne,
  //     group_name: "Henry, Arthur ",
  //     button_title: "View Profile",
  //     members_profile: [FriendOne, FriendTwo, FriendThree],
  //     members: 3.6,
  //     group_type: "Private",
  //     isjoined: false,
  //     is_pending: false,
  //   },
  // ]);

  const [openModal, setOpenModal] = React.useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);
  const type = "event";

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="bg-white card overflow-auto">
      <div className="flex justify-between me-6">
      <div className="flex items-end mb-4">
        <div className="text-xl font-bold">Events In This Group</div>
        <div
          className="cursor-pointer pl-1 ml-1 md:pl-0 flex items-center text-xs justify-end"
          onClick={handleClick}
        >
          <p className="text-gray-500">({events?.length})</p>
        </div>
      </div>
      <div
        className="flex items-end md:items-center gap-1 text-[#0D448A] font-semibold cursor-pointer"
        onClick={handleOpen}
      >
        <AddIcon className="text-xs" />
        <p className="text-md tracking-wide">Create Event</p>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 pr-5 gap-4">
        {events
        // ?.filter((x) => x.going_status === 0)
        ?.length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              No events found.
            </p>
          </div>
        ) : (
          events
            // ?.filter((x) => x.going_status === 0)
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <EventCard {...item} item={item} refetch={refetch} handleShared={handleShared}/>
              </div>
            ))
        )}
        <CreateModal
          open={openModal}
          description={
            "Details - Remember to give instructions clearly so if someone is coming for the first time they know everything they need to know."
          }
          handleClose={handleModalClose}
          title={type === "event" ? "Create Event" : "Create Group"}
          type={type}
          group_id={group_id}
          refetch={refetch}
        />
      </div>
    </div>
  );
}

export default GroupEvents;
