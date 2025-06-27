"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import Button from "@/components/Buttons/Button";
import FriendList from "@/components/Events/UserModal";
import {
  useGetGroupByIdQuery,
  useGetGroupMembersQuery,
  useGetGroupRequestQuery,
  useGetGroupTimelineDetailsQuery,
  useGetVisitorsQuery,
  useInvitationGroupMutation,
  useRequestJoinGroupMutation,
  useUpdateRequestGroupMutation,
} from "@/data/services/groupApi";
import ProfileUserName from "@/sections/profile/ProfileUserName";
import TabBar from "@/sections/profile/components/Tabs/TabBar";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import { Activities } from "@/utils/enum";
import { formatNumber } from "@/utils/helper";
import { Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import GroupDiscussionContent from "./GroupDiscussionContent";
import GroupEvents from "./GroupEvents";
import GroupEventsGuests from "./GroupEventsGuests";
import TopBanner from "./TopBanner";
import PhotosTabContent from "./photos_content/PhotosTabContent";
import VideosTabContent from "./videos_content/VideosTabContent";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import { useGetAllUsersQuery } from "@/data/services/friendApi";

function GroupDetails({ id }) {
  const { data: group, refetch, isLoading } = useGetGroupByIdQuery(id);
  const { data: getGroupMembers, isLoading: GroupMemberLoading } =
    useGetGroupMembersQuery(id);
  const [invitationGroup, {}] = useInvitationGroupMutation();
  const [updateRequestGroup] = useUpdateRequestGroupMutation();
  const [requestJoinGroup, { isLoading: joinreqloading }] =
    useRequestJoinGroupMutation();
  const { data: timelineRecord, isFetching: timeLineLoading } =
    useGetGroupTimelineDetailsQuery(id);
  const { data: groupVisitor, isLoading: groupVisitorLoading } =
    useGetVisitorsQuery(id);
  const { data: groupRequests, isLoading: groupRequestsLoading, refetch: refetchRequests } =
    useGetGroupRequestQuery(id);
  const {data, refetch: userRefetch} = useGetAllUsersQuery({group_id: Number(id)});
  const [ActiveMember, setActiveMemberModal] = useState("");
  const [sharedModal, setSharedModal] = useState(false);
  const [url, setUrl] = useState("");
  const { user } = useAuthContext();
  
  const handleOpenSharedModal = (item) => {
    setUrl(`${window.location.origin}/user/group?q=${id}`);
    setSharedModal(true);
  };

  const tabs = [
    {
      id: 1,
      title: "Discussion",
      content: <GroupDiscussionContent group={group?.data || {}} />,
    },
    {
      id: 2,
      title: "Photo",
      content: (
        <PhotosTabContent
          PhotoAboutYouImages={timelineRecord?.data?.photos}
          // YourPhotosImages={timelineRecord?.data?.your_photos}
          Loading={timeLineLoading}
        />
      ),
    },
    {
      id: 3,
      title: "Video",
      content: (
        <VideosTabContent
          videos={timelineRecord?.data?.videos}
          Loading={timeLineLoading}
        />
      ),
    },
    {
      id: 4,
      title: "Events",
      content: (
        <GroupEvents
          events={timelineRecord?.data?.events}
          group_id={id}
          refetch={refetch}
          handleShared={handleOpenSharedModal}
        />
      ),
    },
    // {
    //   id: 5,
    //   title: "Members",
    //   content: (
    //     <GroupEventsGuests
    //       getGroupMembers={
    //         ActiveMember === "Living"
    //           ? getGroupMembers?.data?.member_in_city
    //           : getGroupMembers?.data?.following_members
    //       }
    //       memeber_type={ActiveMember}
    //       GroupMemberLoading={GroupMemberLoading}
    //     />
    //   ),
    // },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [friendListModal, setFriendListModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const userContext = useAuthContext();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInvite = async (user_id) => {
    console.log("user_id", user_id);
    const response = await invitationGroup({ group_id: Number(id), user_id: user_id });

    if (response?.error?.code) {
      toast.error("Seems like something went wrong");
      return;
    }

    if (response?.error?.status === 400) {
      toast.error(response?.error?.data?.message);
      return;
    }

    if (response?.data?.code === 200) {
      toast.success("Joining Request Accepted Successfully");
      userRefetch();
    }
  };

  const AcceptRequest = async (user_id) => {
    console.log("user_id", user_id);    
    const response = await updateRequestGroup({id: user_id, status: "joined"});

    if (response?.error?.code) {
      toast.error("Seems like something went wrong");
      return;
    }

    if (response?.data?.code === 200) {
      toast.success("Joining Request Accepted Successfully");
      refetchRequests();
    }
  };

  const handleUserModal = () => {
    setFriendListModal((prev) => !prev);
  };
  const handleRequestModal = () => {
    setRequestModal((prev) => !prev);
  };

  const joinedGroup = [
    {
      title: "Share",
      onClick: () => handleOpenSharedModal(id),
      className: "text-gray-text-color",
    },
    // {
    //   title: "Manage Notifications",
    //   onClick: () =>
    //   className: "text-gra-text-color",
    // }
    // {
    //   title: "Sort comments",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
  ];
  const RequestedGroup = [
    {
      title: "Share",
      onClick: () => handleOpenSharedModal(id),
      className: "text-gray-text-color",
    },
  ];
  const AdminGroup = [
    {
      title: "Joining Requests",
      onClick: () => setRequestModal(true),
      className: "text-gray-text-color",
    },
    {
      title: "Share",
      onClick: () => handleOpenSharedModal(id),
      className: "text-gray-text-color",
    },
    // {
    //   title: "Manage Notifications",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
    // {
    //   title: "Sort comments",
    //   onClick: () => {},
    //   className: "text-gray-text-color",
    // },
  ];

  const handleJoin = async () => {
    try {
      const response = await requestJoinGroup({ group_id: id });

      if (response?.data?.code === 200) {
        toast.success("Group Joined Successfully");
        refetch();
      } else {
        toast.error(
          response?.data?.message || "Seems like something went wrong"
        );
      }

      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="md:mt-6 bg-white centered_card md:mr-6 h-screen">
        <div className="flex items-center justify-center h-20">
          <SpinnerLoading />
        </div>
      </div>
    );
  }

  return (
    <main className="md:mt-6 md:mr-6 md:pr-6 flex flex-col bg-background-color animate-fade-up">
      <div className="rounded-2xl bg-white ">
        <TopBanner coverImage={group?.data?.image_url} />

        <section className="flex flex-col p-4 md:p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <ProfileUserName
              name={group?.data?.name}
              tags={Activities(group?.data?.tango_activities || {})}
              // city={group?.data?.city || "N/A"}
              // uniqueName={`@${group?.data?.user?.name}`}
              fullFriendShipView
            />

            <div className="flex gap-2 items-end md:items-center md:justify-between mb-1">
              <Button
                text="Invite User"
                className={"bg-tag-color h-10 text-xs md:text-sm px-8"}
                onClick={() => setFriendListModal(true)}
              />
              {group?.data?.is_joined === 3 ? (
                <button className="bg-btn-color text-white px-10 py-3 rounded-xl font-bold flex items-center gap-3 h-10 text-sm">
                  Joined <FaCheck />
                </button>
              ) : group?.data?.is_joined === 1 ? (
                <button className="bg-btn-color text-white px-10 py-3 rounded-xl font-bold flex items-center gap-3 h-10 text-sm">
                  Pending
                </button>
              ) : (
                <button
                  className="bg-btn-color text-white px-10 py-3 rounded-xl font-bold flex items-center gap-3 h-10 text-sm"
                  onClick={handleJoin}
                >
                  {joinreqloading ? "Joining..." : "Join"}
                </button>
              )}

              <button
                className="bg-btn-color text-white px-5 py-3 rounded-xl font-bold flex items-center gap-3 h-10 text-sm"
                onClick={handleClick}
              >
                <BsThreeDots />
              </button>
              <GroupMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                open={open}
                options={
                  group?.data?.user?.id === userContext?.user?.id
                    ? AdminGroup
                    : group?.data?.is_joined === 3
                      ? joinedGroup
                      : RequestedGroup
                }
              />
            </div>
          </div>
          {/* <div className="mt-3 mb-2">
            <div
              className={`flex justify-start gap-3 items-center cursor-pointer ${ActiveMember === "Living" && "font-bold"}`}
              onClick={() => {
                setActiveTab(tabs[4].id);
                setActiveMemberModal("Living");
              }}
            >
              <div className="flex">
                {getGroupMembers?.data?.member_in_city
                  ?.slice(0, 3)
                  ?.map((x, i) => {
                    return (
                      <div className={i > 0 && "ml-[-15px]"}>
                        <img
                          src={x?.image_url}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="text-light-gray-color text-sm cursor-pointer">
                {formatNumber(
                  getGroupMembers?.data?.member_in_city?.length || 0
                )}{" "}
                Members Living in the City
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div
              className={`flex justify-start gap-3 items-center cursor-pointer ${ActiveMember === "Following" && "font-bold "}`}
              onClick={() => {
                setActiveTab(tabs[4].id);
                setActiveMemberModal("Following");
              }}
            >
              <div className="flex">
                {getGroupMembers?.data?.following_members
                  ?.slice(0, 3)
                  ?.map((x, i) => (
                    <div className={i > 0 && "ml-[-15px]"}>
                      <img
                        src={x?.user?.image_url}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                  ))}
              </div>
              <div className="text-light-gray-color text-sm">
                {formatNumber(
                  getGroupMembers?.data?.following_members?.length || 0
                )}{" "}
                Members following in the City
              </div>
            </div>
          </div> */}

          <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
        </section>
      </div>

      <TabContent tabs={tabs} activeTab={activeTab} />
      <FriendList
        openmodal={friendListModal}
        handleClose={handleUserModal}
        button_title={"Invite"}
        modal_name={"User"}
        onClickButton={handleInvite}
        data={
          data?.data?.length > 0
            ? data?.data?.filter((x) => x?.name !== user?.name)
            : []
        }
        loading={groupVisitorLoading}
        isCloseNeed={false}
      />
      <FriendList
        openmodal={requestModal}
        handleClose={handleRequestModal}
        button_title={"Accept"}
        modal_name={"Joining Requests"}
        onClickButton={AcceptRequest}
        data={groupRequests?.data}
        loading={groupRequestsLoading}
        isCloseNeed={false}
      />
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
    </main>
  );
}

export default GroupDetails;

const GroupMenu = ({ handleClose, anchorEl, open, options }) => {
  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          border: "1px solid lightgrey",
          overflow: "auto",
          // maxheight: `${options.length == 3 ? "150" : "250"}px`,
          maxHeight: "250px",
        },
        boxShadow: 0,
      }}
      elevation={0}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {options.map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
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
