"use client";
import CreateModal from "@/components/Events/CreateEvent";
import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";
import React from "react";
import EventCard from "../Events/EventCard";
import { useGetEventsListDetailsQuery } from "@/data/services/communityApi";
import SpinnerLoading from "../Loadings/Spinner";
import { useGetEventWithLocationsQuery } from "@/data/services/eventAPI";
import ModelComponent from "../Modal/CustomModal";
import toast from "react-hot-toast";

function CommunityEvents({ city }) {
  let { data, isLoading } = useGetEventWithLocationsQuery({
    city,
    query_type: 0,
  });

  data = data?.data;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [events, setEvents] = React.useState([
    {
      id: 0,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: true,
      is_pending: true,
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
      is_pending: true,
    },
    {
      id: 3,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: true,
      is_pending: true,
    },
    {
      id: 4,
      group_image: FriendOne,
      group_name: "Texas DJ Group",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 1.5,
      isjoined: false,
      is_pending: false,
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
      is_pending: false,
    },
    {
      id: 6,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: false,
      is_pending: false,
    },
    {
      id: 7,
      group_image: FriendOne,
      group_name: "Texas DJ Group",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 1.5,
      group_type: "Private",
      isjoined: false,
      is_pending: false,
    },
    {
      id: 8,
      group_image: FriendOne,
      group_name: "Henry, Arthur ",
      button_title: "View Profile",
      members_profile: [FriendOne, FriendTwo, FriendThree],
      members: 3.6,
      group_type: "Private",
      isjoined: false,
      is_pending: false,
    },
  ]);
  const [sharedModal, setSharedModal] = React.useState(false);

  const [url, setUrl] = React.useState("");
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

  const handleOpenSharedModal = (item) => {
    setUrl(`${window.location.origin}/user/event?q=${item.id}`);
    setSharedModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[38vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="mt-6  bg-white card overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 pr-5 gap-4">
        {!!data?.length &&
          data?.map((item, key) => (
            <div key={key} className="col-span-12 md:col-span-4 xl:col-span-3">
              <EventCard {...item} item={item} handleShared={handleOpenSharedModal} />
            </div>
          ))}

        <CreateModal
          open={openModal}
          description={
            "Details - Remember to give instructions clearly so if someone is coming for the first time they know everything they need to know."
          }
          handleClose={handleModalClose}
          title={type === "event" ? "Create Event" : "Create Group"}
          type={type}
        />
      </div>
      <ModelComponent
        open={sharedModal}
        handleClose={() => setSharedModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <div className="p-5">
          <input
            type="text"
            className="input-text w-full h-10 pl-2 cursor-pointer"
            disabled
            value={url}
          />
          <button
            onClick={async () => {
              navigator.clipboard.writeText(url);
              toast.success("Copy to clipboard");
            }}
            className="mt-4 bg-btn-color text-white rounded-lg w-32 h-10"
          >
            Copy
          </button>
        </div>
      </ModelComponent>
    </div>
  );
}

export default CommunityEvents;
