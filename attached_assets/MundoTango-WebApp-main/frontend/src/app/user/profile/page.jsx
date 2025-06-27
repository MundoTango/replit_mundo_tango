"use client";
import Button from "@/components/Buttons/Button";
import ConfirmationRequest from "@/components/Friends/ConfirmationRequest";
import FriendRequestModal from "@/components/Friends/FriendRequestModal";
import ReportFriendView from "@/components/Friends/ReportFriendView";
import SendFriendRequestModal from "@/components/Friends/SendFriendRequestModal";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CustomMenu from "@/components/Menus/CustomMenu";
import ModelComponent from "@/components/Modal/CustomModal";
import CrossIcon from "@/components/SVGs/CrossIcon";
import DownHalfArrow from "@/components/SVGs/DownHalfArrow";
import DeleteWarning from "@/components/WarningPopup/DeleteWarning";
import { setUserData } from "@/data/features/userSlice";
import {
  useBlockUserMutation,
  useGetALLAboutDetailsQuery,
  useGetUserProfileQuery,
  useGetUserTimelineDetailsQuery,
  useRemoveConnectionMutation,
  useSendFriendRequestMutation,
  useUpdateRequestStatusMutation,
} from "@/data/services/friendApi";
import ProfileCoverImage from "@/sections/profile/ProfileCoverImage";
import ProfileUserName from "@/sections/profile/ProfileUserName";
import TabBar from "@/sections/profile/components/Tabs/TabBar";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import AboutTabContentUser from "@/sections/profile/components/about_content/AboutTabContent_user";
import FriendsTabContent from "@/sections/profile/components/friends_content/FriendsTabContent";
import PhotosTabContent from "@/sections/profile/components/photos_content/PhotosTabContent";
import ProfileTabContent from "@/sections/profile/components/profile_content/ProfileTabContent";
import VideosTabContent from "@/sections/profile/components/videos_content/VideosTabContent";
import { ImageProfileCover } from "@/utils/Images";
import { Activities, REQUEST_STATUS } from "@/utils/enum";
import { MenuItem } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function Page() {
  const id = useSearchParams()?.get("q");
  const { push } = useRouter();
  const userAboutRef = useRef();
  const menuClass = `font-[Gilroy] flex gap-3 items-center m-1 justify-center text-sm font-semibold text-gray-text-color`;
  const dispatch = useDispatch(); 
  const {
    data: userProfile,
    isFetching: getProfileLoading,
    refetch,
  } = useGetUserProfileQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: userAbout,
    isLoading: getAboutLoading,
    refetch: getAboutRefetch,
  } = useGetALLAboutDetailsQuery(id);

  const { data: timelineRecord, isFetching: timeLineLoading } =
    useGetUserTimelineDetailsQuery(id);

  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();

  const [updateRequestStatus, { isLoading: updateRequestLoading }] =
    useUpdateRequestStatusMutation();

  let tabs = [
    {
      id: 0,
      title: "About",
      content: (
        <AboutTabContentUser
          data={userAbout?.data}
          loader={getAboutLoading}
          ref={userAboutRef}
          getAboutRefetch={getAboutRefetch}
          userProfile={userProfile?.data}
        />
      ),
    },
    {
      id: 1,
      title: "Profile",
      content: (
        <ProfileTabContent
          myprofile={false}
          Profile={timelineRecord?.data}
          UserTravelLoading={timeLineLoading}
          onSeeAllPhotos={() => setActiveTab(2)}
          onSeeAllFriends={() => setActiveTab(4)}
          profile_id={id}
        />
      ),
    },
    {
      id: 2,
      title: "Photos",
      content: (
        <PhotosTabContent
          PhotoAboutYouImages={timelineRecord?.data?.photos_about_you}
          YourPhotosImages={timelineRecord?.data?.your_photos}
          Loading={timeLineLoading}
          photoAbout={userProfile?.data?.name}
          photoYour={userProfile?.data?.name}
        />
      ),
    },
    {
      id: 3,
      title: "Videos",
      content: (
        <VideosTabContent
          videos={timelineRecord?.data?.videos}
          Loading={timeLineLoading}
          videoYour={userProfile?.data?.name}
        />
      ),
    },
    {
      id: 4,
      title: "Friends",
      content: (
        <FriendsTabContent
          Friends={timelineRecord?.data?.friends}
          Loading={timeLineLoading}
        />
      ),
    },
  ];

  if (userProfile?.data?.is_privacy){
    tabs = tabs.filter(tab => tab.id !== 0);
  }

  const [activeTab, setActiveTab] = useState(tabs[1].id);

  const [sendRequestOpen, setSendRequestOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [reportModal, setReportModal] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [receiverNotes, setReceiverNotes] = useState("");

  const [requestStatus, setRequestStatus] = useState("");

  const [friendRequestPop, setFriendRequestPop] = useState(false);

  const [confirmRequest, setConfirmRequest] = useState(false);

  const [blockUserWarning, setBlockUserWarning] = useState(false);

  const [removeConnectionWarning, setRemoveConnectionWarning] = useState(false);

  const [blockUser, { isLoading: blockUserLoading }] = useBlockUserMutation();

  const [removeConnection, { isLoading: removeConnectionLoading }] =
    useRemoveConnectionMutation();

  const handleOpenFriendRequestPop = () => setFriendRequestPop(true);

  const handleCloseFriendRequestPop = () => setFriendRequestPop(false);

  const handleOpenConfirm = () => setConfirmRequest(true);

  const handleCloseConfirm = () => setConfirmRequest(false);

  const handleOpenRequestModal = () => setSendRequestOpen(true);

  const handleCloseRequestModal = () => setSendRequestOpen(false);

  const [cities, setCities] = useState([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      have_we_danced: "",
      which_did_we_meet_in: "",
      when_did_we_meet: "",
      did_we_meet_in_event: "",
      topic: "",
      your_notes: "",
    },
  });

  const [imagesList, setImagesList] = useState([
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
  ]);

  const handleChangeFile = async (event, index) => {
    try {
      let temp = [...imagesList];
      temp[index].image = event.target.files[0];
      temp[index].objectUrl = URL.createObjectURL(event.target.files[0]);
      setImagesList(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const removeImageFile = async (index) => {
    try {
      let temp = [...imagesList];
      temp[index] = {
        image: null,
        objectUrl: null,
      };
      setImagesList(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleFriendRequest = async (record) => {
    try {
      const formData = new FormData();
      formData.append("friend_id", id);
      formData.append("have_we_danced", record?.have_we_danced);
      formData.append("city_we_meet", cities);
      formData.append("when_did_we_meet", record?.when_did_we_meet);
      formData.append("event_we_meet", record?.did_we_meet_in_event);
      formData.append("connect_reason", record?.connect_reason);
      formData.append("notes", record?.topic);
      imagesList?.map((item) => {
        if (item?.image && item?.objectUrl) {
          formData.append("image", item?.image);
        }
      });

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const result = await sendFriendRequest(formData);
      if (result?.data?.code === 200) {
        toast.success("Friend request send successfully!");
        handleCloseRequestModal();
        refetch();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const confirmRejectRequest = async (item, status, flag) => {
    try {
      let body = {};
      let user_id = "";

      if (flag) {
        body = {
          status: status,
          receiver_notes: null,
        };

        user_id = item?.friend_request_id;
      } else {
        if (!requestStatus) toast.error("Seems like something went wrong!");

        body = {
          status: requestStatus,
          receiver_notes: receiverNotes,
        };

        user_id = userProfile?.data?.friend_request_id;
      }

      const result = await updateRequestStatus({ body, user_id });

      if (result?.data?.code === 200) {
        // console.log(result?.data?.data);
        let msg = "";
        if (requestStatus === REQUEST_STATUS.CONNECTED) {
          msg = `Request accepted successfully !`;
        } else if (status === REQUEST_STATUS.DECLINE) {
          msg = `Request decline successfully !`;
        }
        toast.success(msg);
        handleCloseConfirm();
        refetch();
        setReceiverNotes("");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const onBlockUser = async () => {
    try {
      const result = await blockUser({
        blocked_user_id: userProfile?.data?.id,
      });

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Block user successfully");
        refetch();
      }
    } catch (e) {
      console.log(e.message);
      toast.error("Seems like something went wrong");
    }
  };

  const onRemoveUserConnection = async () => {
    try {
      const result = await removeConnection(
        userProfile?.data?.friend_request_id
      );

      const { code } = result?.data;
      if (code === 200) {
        toast.success("Remove user successfully");
        refetch();
      }
    } catch (e) {
      console.log(e.message);
      toast.error("Seems like something went wrong");
    }
  };

  if (getProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[86vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  if (userProfile?.data?.is_blocked !== 0) {
    return (
      <div className="flex items-center justify-center h-[86vh] bg-white m-6 rounded-lg text-3xl text-gray-text-color">
        You have block this user
      </div>
    );
  }

  const FriendMenuOptions = [
    {
      title: "Block Friend",
      onClick: () => setBlockUserWarning(true),
      classes: menuClass,
    },
    {
      title: "Report Friend",
      onClick: () => setReportModal(true),
      classes: menuClass,
    },
    {
      title: "Remove Connection",
      onClick: () => setRemoveConnectionWarning(true),
      classes: `${menuClass} text-secondary-red`,
    },
  ];


  return (
    <main
      className={`md:mt-6 md:mr-6 flex flex-col bg-background-color animate-fade-up ${getProfileLoading ? "hidden" : "flex"} `}
    >
      <div className="rounded-2xl bg-white">
        <ProfileCoverImage
          coverImage={userProfile?.data?.background_url || ImageProfileCover}
          profileImage={userProfile?.data?.image_url}
        />

        <section className="flex flex-col -mt-8 md:mt-0 p-4 md:p-7">
          <div className="flex flex-col items-start md:items-center justify-between gap-4 lg:flex-row">
            <ProfileUserName
              name={userProfile?.data?.name}
              tag={""}
              city={userProfile?.data?.city || "N/A"}
              uniqueName={`@${userProfile?.data?.username}`}
              tags={Activities(userProfile?.data?.tango_activities || {})}
            />

            <div className="flex flex-col justify-center gap-2 sm:flex-row lg:justify-normal">
              {userProfile?.data?.is_friend_request === 0 && (
                <Button
                  onClick={handleOpenRequestModal}
                  text="Connect"
                  className={"text-sm h-10"}
                />
              )}

              {userProfile?.data?.is_friend_request === 1 && (
                <Button
                  text="Request already send"
                  className={"bg-gray-text-color h-10"}
                  disabled
                />
              )}

              {userProfile?.data?.is_friend_request === 2 && (
                <React.Fragment>
                  <Button
                    text="Send Message"
                    className={"h-10 text-sm bg-tag-color"}
                    title="Send Message"
                    onClick={() => {push("/user/messages"); dispatch(setUserData(userProfile?.data))}}
                  />
                  <Button
                    text={<DownHalfArrow onClick={handleClick} />}
                    className={" h-10"}
                    onClick={handleClick}
                  />
                </React.Fragment>
              )}

              {userProfile?.data?.is_friend_request === 3 && (
                <React.Fragment>
                  <Button
                    text="See Request"
                    className={"h-10 text-sm"}
                    onClick={() => {
                      setRequestStatus(REQUEST_STATUS.CONNECTED);
                      handleOpenFriendRequestPop();
                    }}
                  />
                  <Button
                    text="Decline"
                    className={"h-10 text-sm bg-tag-color"}
                    onClick={() =>
                      confirmRejectRequest(
                        userProfile?.data,
                        REQUEST_STATUS.DECLINE,
                        true
                      )
                    }
                  />
                </React.Fragment>
              )}
            </div>
          </div>

          <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
        </section>
      </div>

      <TabContent tabs={tabs} activeTab={activeTab} />

      <CustomMenu
        open={open}
        handleClick={handleClick}
        handleClose={handleClose}
        anchorEl={anchorEl}
      >
        {FriendMenuOptions.map(({ title, onClick, classes }, index) => (
          <MenuItem
            aria-hidden="false"
            key={index}
            onClick={() => {
              onClick();
              handleClose();
            }}
          >
            <div className={classes}>{title}</div>
          </MenuItem>
        ))}
      </CustomMenu>

      <ModelComponent
        open={sendRequestOpen}
        handleClose={handleCloseRequestModal}
        width={"670px"}
      >
        <form onSubmit={handleSubmit(handleFriendRequest)}>
          <SendFriendRequestModal
            handleClose={handleCloseRequestModal}
            control={control}
            errors={errors}
            imagesList={imagesList}
            handleChangeFile={handleChangeFile}
            removeImageFile={removeImageFile}
            onDecline={handleCloseRequestModal}
            isLoading={isLoading}
            setCities={setCities}
            cities={cities}
          />
        </form>
      </ModelComponent>

      <ModelComponent
        open={friendRequestPop}
        handleClose={handleCloseFriendRequestPop}
        width={"670px"}
      >
        <FriendRequestModal
          handleClose={handleCloseFriendRequestPop}
          handleRequest={() => {
            handleCloseFriendRequestPop();
            handleOpenConfirm();
          }}
          selectedRequest={{
            ...userProfile?.data,
            friend_user: { user_images: userProfile?.data?.user_images },
          }}
        />
      </ModelComponent>

      <ModelComponent
        width={"670px"}
        open={confirmRequest}
        handleClose={handleCloseConfirm}
      >
        <div>
          <div className="absolute right-3 top-3">
            <CrossIcon
              className="cursor-pointer"
              onClick={handleCloseConfirm}
            />
          </div>
          <div className="px-8 py-5">
            <ConfirmationRequest
              receiverNotes={receiverNotes}
              setReceiverNotes={(e) => setReceiverNotes(e.target.value)}
              confirmRejectRequest={confirmRejectRequest}
              requestLoading={isLoading}
            />
          </div>
        </div>
      </ModelComponent>

      <ModelComponent
        open={reportModal}
        handleClose={() => setReportModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <ReportFriendView
          handleClose={() => setReportModal(false)}
          selectedFriend={userProfile?.data}
        />
      </ModelComponent>

      <ModelComponent
        open={blockUserWarning}
        handleClose={() => setBlockUserWarning(false)}
        width={"50%"}
      >
        <DeleteWarning
          title={`Block ${userProfile?.data?.name}`}
          message={`Are you really want to block ${userProfile?.data?.name}?`}
          onClick={onBlockUser}
          handleClose={() => setBlockUserWarning(false)}
        />
      </ModelComponent>

      <ModelComponent
        open={removeConnectionWarning}
        handleClose={() => setRemoveConnectionWarning(false)}
        width={"50%"}
      >
        <DeleteWarning
          title={`Remove Connection`}
          message={`Are you really want to remove ${userProfile?.data?.name} from connection?`}
          onClick={onRemoveUserConnection}
          handleClose={() => setRemoveConnectionWarning(false)}
        />
      </ModelComponent>
    </main>
  );
}
