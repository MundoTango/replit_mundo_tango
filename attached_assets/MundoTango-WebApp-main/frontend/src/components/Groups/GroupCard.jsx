"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  useAddVisitorMutation,
  useDeleteGroupMutation,
  useLeaveGroupMutation,
  usePinGroupMutation,
  useUpdateRequestGroupMutation,
} from "@/data/services/groupApi";
import { PATH_DASHBOARD } from "@/routes/paths";
import { formatNumber } from "@/utils/helper";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const GroupCard = ({
  item,
  refetch,
  onOpenReportModal,
  setSharedModal,
  setGroups,
  groups,
  setEDitOpenModal
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [leaveGroup] = useLeaveGroupMutation();

  const [pinGroup] = usePinGroupMutation();

  const [deleteGroup] = useDeleteGroupMutation();

  const [updateRequestGroup] = useUpdateRequestGroupMutation();

  const [addVisitor] = useAddVisitorMutation();

  const open = Boolean(anchorEl);

  const { push } = useRouter();

  const userContext = useAuthContext();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const joinedGroup = [
    {
      title: "Share",
      onClick: () => setSharedModal(item),
      className: "text-gray-text-color",
    },
    // {
    //   title: "Manage Notifications",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
    // {
    //   title: "Pin group",
    //   onClick: async () => {
    //     try {
    //       const response = await pinGroup({ group_id: item?.id });

    //       if (response?.error?.code) {
    //         toast.error("Seems like something went wrong");
    //         return;
    //       }

    //       if (response?.data?.code === 200) {
    //         toast.success("Pin Group Successfully");
    //         refetch();
    //       }
    //     } catch (e) {
    //       console.log(e.message);
    //     }
    //   },
    //   className: "text-gray-text-color",
    // },
    // {
    //   title: "Sort comments",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
    {
      title: "Report group",
      onClick: () => onOpenReportModal(),
      className: "text-gray-text-color",
    },
    {
      title: "Leave group",
      onClick: async () => {
        try {
          const response = await leaveGroup(item?.id);

          if (response?.error?.code) {
            toast.error("Seems like something went wrong");
            return;
          }

          if (response?.data?.code === 200) {
            toast.success("Leave Group Successfully");
            refetch();
          }
        } catch (e) {
          console.log(e.message);
        }
      },
      className: "text-gray-text-color",
    },
  ];

  const RequestedGroup = [
    {
      title: "Share",
      onClick: () => setSharedModal(item),
      className: "text-gray-text-color",
    },
    {
      title: "Report group",
      onClick: () => onOpenReportModal(),
      className: "text-gray-text-color",
    },
    {
      title: "Withdraw request",
      onClick: async () => {
        const data = { id: item?.id, status: "withdraw" };
        const response = await updateRequestGroup(data);

        if (response?.error?.code) {
          toast.error("Seems like something went wrong");
          return;
        }

        if (response?.data?.code === 200) {
          toast.success("Withdraw Group Request Successfully");
          const updatedGroups = groups?.filter(
            (group) => group.id !== item?.id
          );
          setGroups(updatedGroups);
          refetch();
        }
        try {
        } catch (e) {
          console.log(e.message);
        }
      },
      className: "text-gray-text-color",
    },
  ];
  const DiscoverGroup = [
    {
      title: "Share",
      onClick: () => setSharedModal(item),
      className: "text-gray-text-color",
    },
  ];

  const AdminGroup = [
    {
      title: "Delete group",
      onClick: async () => {
        try {
          const response = await deleteGroup(item?.id);

          if (response?.error?.code) {
            toast.error("Seems like something went wrong");
            return;
          }

          if (response?.data?.code === 200) {
            toast.success("Delete Group Successfully");
            const updatedGroups = groups?.filter(
              (group) => group.id !== item?.id
            );
            setGroups(updatedGroups);
            refetch();
          }
        } catch (e) {
          console.log(e.message);
        }
      },
      className: "text-gray-text-color",
    },
    {
      title: "Edit group",
      onClick: async () => setEDitOpenModal(),
      className: "text-gray-text-color",
    },
    {
      title: "Share",
      onClick: () => setSharedModal(item),
      className: "text-gray-text-color",
    },
    // {
    //   title: "Manage Notifications",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
    // {
    //   title: "Pin group",
    //   onClick: async () => {
    //     try {
    //       const response = await pinGroup(item?.id);

    //       if (response?.error?.code) {
    //         toast.error("Seems like something went wrong");
    //         return;
    //       }

    //       if (response?.data?.code === 200) {
    //         toast.success("Pin Group Successfully");
    //         refetch();
    //       }
    //     } catch (e) {
    //       console.log(e.message);
    //     }
    //   },
    //   className: "text-gray-text-color",
    // },
    // {
    //   title: "Sort comments",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
  ];

  const HandleVisitor = async () => {
    try {
      const response = await addVisitor({ group_id: item?.id });
      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }
      // if (response?.data?.code === 200) {
      //   toast.success("Visitor Request Accepted Successfully");
      // }
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="bg-[#F8FAFC] p-5 space-y-2 rounded-xl ">
      <div className="w-full">
        <img
          src={item?.image_url}
          alt=""
          className="rounded-lg h-40 w-full object-cover"
          loading="lazy"
        />
      </div>

      <div>
        <div className="text-black font-bold text-lg capitalize">
          {item?.name}
        </div>
        <div className="text-light-gray-color text-sm capitalize">
          {item?.privacy} Group
        </div>
      </div>

      {/* <div className="flex justify-between">
        <div className="flex">
          {item?.group_members?.slice(0, 3).map((x, i) => (
            <div className={i > 0 ? "ml-[-15px]" : ""} key={i}>
              <img
                src={x?.user?.image_url}
                alt=""
                className="w-10 h-10 rounded-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="text-light-gray-color text-sm">
          {formatNumber(item?.number_of_participants || 0)} Members
        </div>
      </div> */}

      <div className="flex gap-2 pt-2 items-center">
        <button
          className={`${item?.is_joined === 3 ? "bg-btn-color" : "bg-tag-color"} text-white rounded-xl p-2.5 text-sm font-semibold w-10/12`}
          onClick={() => {
            push(PATH_DASHBOARD.group.groupDetail(item?.id));
            if (item?.is_joined !== 3) {
              HandleVisitor();
            }
          }}
        >
          {item?.is_joined !== 3 ? "Visit Group" : "View Group"}
        </button>
        <div
          className="rounded-lg bg-white w-12 h-100 p-2.5 flex justify-center items-center"
          onClick={handleClick}
        >
          <MoreHorizIcon className="text-[#0D448A] cursor-pointer" />
        </div>
        <GroupMenu
          handleClose={handleClose}
          anchorEl={anchorEl}
          open={open}
          options={
            item?.user?.id === userContext?.user?.id
              ? AdminGroup
              : item?.is_joined === 3
                ? joinedGroup
                : item?.is_joined === 1
                  ? RequestedGroup
                  : DiscoverGroup
          }
        />
      </div>
    </div>
  );
};

export default GroupCard;

const GroupMenu = ({ handleClose, anchorEl, open, options }) => {
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
