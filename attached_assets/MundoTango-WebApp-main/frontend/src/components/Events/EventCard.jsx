"use client";
import {
  useDeleteEventMutation,
  useGoingEventMutation,
  useRequestJoinEventMutation,
} from "@/data/services/eventAPI";
import { PATH_DASHBOARD } from "@/routes/paths";
import { formatDateMonth } from "@/utils/helper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import FriendList from "./UserModal";
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs";
import { useAuthContext } from "@/auth/useAuthContext";
import { Menu, MenuItem } from "@mui/material";

const EventCard = ({ item, refetch, handleShared, setEDitOpenModal }) => {
  const [requestJoinEvent] = useRequestJoinEventMutation();
  const [goingEvent] = useGoingEventMutation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [friendListModal, setFriendListModal] = React.useState(false);
  const open = Boolean(anchorEl);
  const { user } = useAuthContext();
  const router = useRouter();

  const [deleteEvent] = useDeleteEventMutation();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleUserModal = () => {
    setFriendListModal((prev) => !prev);
  };
  const AdminGroup = [
    {
      title: "Delete Event",
      onClick: async () => {
        try {
          const response = await deleteEvent(item?.id);

          if (response?.error?.code) {
            toast.error("Seems like something went wrong");
            return;
          }

          if (response?.data?.code === 200) {
            toast.success("Delete Group Successfully");
            refetch();
          }
        } catch (e) {
          console.log(e.message);
        }
      },
      className: "text-gray-text-color",
    },
    {
      title: "Edit Event",
      onClick: async () => setEDitOpenModal(),
      className: "text-gray-text-color",
    },
  ];

  const HandleInterest = async () => {
    try {
      const response = await requestJoinEvent({ event_id: item?.id });
      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }
      if (response?.data?.code === 200) {
        toast.success("Request added successfully.");
        refetch();
      }
    } catch (e) {
      console.log(e.message);
    }
  };
  const HandleGoing = async () => {
    try {
      const response = await goingEvent({ event_id: item?.id });
      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }
      if (response?.data?.code === 200) {
        toast.success("Request added successfully.");
        refetch();
      }
    } catch (e) {
      console.log(e.message);
    }
  };
  return (
    <div
      className={`p-5 space-y-2 rounded-xl flex items-end h-[315px]`}
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(9, 21, 34, 0) 25.87%, #091522 88.88%), 
          url(${item?.image_url})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full h-[150px] space-y-2">
        <div>
          <div className="text-white text-sm">
            {formatDateMonth(item?.start_date || "")}
          </div>
          <div className="text-white flex justify-between">
            <Link href={PATH_DASHBOARD.event.eventDetail(item?.id)}>
              <p className="font-bold text-lg capitalize">{item?.name}</p>
            </Link>
            <div className="flex items-center gap-1">
              <img src="/images/location.svg" />
              <p>{item?.city}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-white text-sm">Friends who are going</div>
          <div
            className="flex cursor-pointer"
            onClick={() => setFriendListModal(true)}
          >
            {item?.event_participants?.slice(0, 3).map((x, i) => (
              <div className={i > 0 && "ml-[-15px]"}>
                <img
                  src={x?.user?.image_url}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
        {item.going_status === 1 ? (
          <div className="flex gap-2 pt-2 items-center w-full">
            <div
              className={`bg-white text-[#8E142E] rounded-xl p-2.5 text-sm font-semibold text-center w-10/12 cursor-pointer`}
              onClick={HandleGoing}
            >
              Going
            </div>
            <div
              className={`bg-white text-[#8E142E] rounded-xl p-2.5 text-sm font-semibold text-center w-10/12`}
            >
              Maybe
            </div>
            <div
              className="rounded-lg bg-white p-2.5 flex justify-center items-center h-100 w-14"
              onClick={(e) => {
                handleClick(e);
                handleShared(item);
              }}
            >
              <img
                src="/images/event/event_share.png"
                className="cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-2 items-center">
            <button
              className={`bg-white text-[#8E142E] rounded-xl p-2.5 text-sm font-semibold flex-1`}
              onClick={() => {
                // router.push(PATH_DASHBOARD.event.eventDetail(item?.id));
                HandleInterest();
              }}
            >
              Interested
            </button>
            <div
              className="rounded-lg bg-white w-9 h-100 p-2 flex justify-center items-center"
              onClick={(e) => {
                handleClick(e);
                handleShared(item);
              }}
            >
              <img
                src="/images/event/event_share.png"
                className="cursor-pointer"
              />
            </div>
            {item?.user_id === user?.id && (
              <button
                className=" text-white rounded-xl font-bold flex items-center gap-3 h-10 text-sm"
                onClick={handleClick}
              >
                <BsThreeDotsVertical />
              </button>
            )}
            <EventMenu
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              options={AdminGroup}
            />
          </div>
        )}
      </div>
      <FriendList
        openmodal={friendListModal}
        handleClose={handleUserModal}
        modal_name={"Friends"}
        data={item?.event_participants}
        button_title={"View Profile"}
        btnclass={"px-4"}
        onClickButton={() =>
          router.push(PATH_DASHBOARD.profile.userProfile(item?.id))
        }
      />
    </div>
  );
};

export default EventCard;
const EventMenu = ({ handleClose, anchorEl, open, options }) => {
  const menuStyles = {
    "& .MuiMenu-paper": {
      background: "#FFFFFF",
      border: "1px solid lightgrey",
      overflow: "auto",
      // height: `${options.length < 2 ? "150" : "250"}px`,
      maxHeight: "250px",
      borderRadius: 5,
    },
    boxShadow: 0,
  };

  return (
    <Menu
      sx={menuStyles}
      elevation={0}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {options.map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            handleClose();
            item?.onClick();
          }}
        >
          <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center ">
            <div className={item?.className}> {item?.title}</div>
          </div>
        </MenuItem>
      ))}
    </Menu>
  );
};
