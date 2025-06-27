"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import Button from "@/components/Buttons/Button";
import SendFriendRequestModal from "@/components/Friends/SendFriendRequestModal";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CustomMenu from "@/components/Menus/CustomMenu";
import ModelComponent from "@/components/Modal/CustomModal";
import DownHalfArrow from "@/components/SVGs/DownHalfArrow";
import {
  useGetUserProfileQuery,
  useGetUserTimelineDetailsQuery,
  useSendFriendRequestMutation,
} from "@/data/services/friendApi";
import ProfileCoverImage from "@/sections/profile/ProfileCoverImage";
import ProfileUserName from "@/sections/profile/ProfileUserName";
import TabBar from "@/sections/profile/components/Tabs/TabBar";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import FriendsTabContent from "@/sections/profile/components/friends_content/FriendsTabContent";
import PhotosTabContent from "@/sections/profile/components/photos_content/PhotosTabContent";
import ProfileTabContent from "@/sections/profile/components/profile_content/ProfileTabContent";
import VideosTabContent from "@/sections/profile/components/videos_content/VideosTabContent";
import { ImageProfileCover } from "@/utils/Images";
import { Activities } from "@/utils/enum";
import { MenuItem } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Page() {
  const menuClass = `font-[Gilroy] flex gap-3 items-center m-1 justify-center text-sm font-semibold text-gray-text-color`;

  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();

  const id = useSearchParams()?.get("q");

  const { user } = useAuthContext();
  const { push } = useRouter();

  const {
    data: userProfile,
    isLoading: getProfileLoading,
    refetch,
  } = useGetUserProfileQuery(id);

  const { data: timelineRecord, isFetching: timeLineLoading } =
    useGetUserTimelineDetailsQuery(id);
    
  const tabs = [
    {
      id: 1,
      title: "Post",
      content: (
        <ProfileTabContent
          myprofile={false}
          isFriend={userProfile?.data?.is_friend_request === 2}
          Profile={timelineRecord?.data}
          UserTravelLoading={timeLineLoading}
          onSeeAllPhotos={() => setActiveTab(2)}
          onSeeAllFriends={() => setActiveTab(4)}
          profile_id={id}
          fullFriendShipView
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
          photoAbout={"You & " + userProfile?.data?.name}
          photoYour={"Your & " + userProfile?.data?.name}
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
          videoYour={"Your & " + userProfile?.data?.name}
        />
      ),
    },
    {
      id: 4,
      title: "Events",
      content: (
        <FriendsTabContent
          Friends={timelineRecord?.data?.friends}
          Loading={timeLineLoading}
        />
      ),
    },
  ];

  const FriendMenuOptions = [
    {
      title: "Block Friend",
      onClick: () => {},
      classes: menuClass,
    },
    {
      title: "Report Friend",
      onClick: () => {},
      classes: menuClass,
    },
    {
      title: "Remove Connection",
      onClick: () => {},
      classes: `${menuClass} text-secondary-red`,
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const [sendRequestOpen, setSendRequestOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenRequestModal = () => setSendRequestOpen(true);

  const handleCloseRequestModal = () => setSendRequestOpen(false);

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
      formData.append("city_we_meet", record?.which_city_did_we_meet_in);
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
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  if (getProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[86vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <main className="container-fluid md:mt-6 flex w-full flex-col bg-background-color mt-3">
      <div className="rounded-2xl bg-white">
        <ProfileCoverImage
          coverImage={ImageProfileCover}
          profileImage={userProfile?.data?.user_images[0]?.image_url}
          userImage={user?.image_url}
          fullFriendShipView
        />

        <section className="flex flex-col p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row">
            <ProfileUserName
              name={"You & " + userProfile?.data?.name}
              tag={""}
              city={userProfile?.data?.city || "N/A"}
              uniqueName={`@${userProfile?.data?.username}`}
              tags={Activities(userProfile?.data?.tango_activities || {})}
              fullFriendShipView
            />

            <div className="flex flex-col justify-center gap-2 sm:flex-row lg:justify-normal">
              {userProfile?.data?.is_friend_request === 2 && (
                <React.Fragment>
                  <Button
                    text="Send Message"
                    className={"h-10 text-sm bg-tag-color"}
                    title="Send Message"
                    onClick={() => push("/user/messages")}
                  />
                  <Button
                    text={<DownHalfArrow onClick={handleClick} />}
                    className={"h-10"}
                    onClick={handleClick}
                  />
                </React.Fragment>
              )}

              {userProfile?.data?.is_friend_request === 1 && (
                <Button
                  text="Request already send"
                  className={"bg-gray-text-color h-10"}
                  disabled
                />
              )}

              {userProfile?.data?.is_friend_request === 0 && (
                <Button
                  onClick={handleOpenRequestModal}
                  text="Connect"
                  className={"text-sm h-10"}
                />
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
          />
        </form>
      </ModelComponent>
    </main>
  );
}
