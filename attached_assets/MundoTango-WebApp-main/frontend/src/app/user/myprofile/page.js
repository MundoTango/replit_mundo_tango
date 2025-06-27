"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import Button from "@/components/Buttons/Button";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import AddTravelDetailModal from "@/components/Profile/AddTravelDetailModal";
import EditProfile from "@/components/Profile/EditProfile";
import {
  useGetALLAboutDetailsQuery,
  useGetUserProfileQuery,
  useGetUserTimelineDetailsQuery,
} from "@/data/services/friendApi";
import AddTravelDetails from "@/sections/profile/AddTravelDetails";
import BioDetails from "@/sections/profile/BioDetails";
import ProfileCoverImage from "@/sections/profile/ProfileCoverImage";
import ProfileUserName from "@/sections/profile/ProfileUserName";
import TabBar from "@/sections/profile/components/Tabs/TabBar";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import AboutTabContent from "@/sections/profile/components/about_content/AboutTabContent";
import FriendsTabContent from "@/sections/profile/components/friends_content/FriendsTabContent";
import PhotosTabContent from "@/sections/profile/components/photos_content/PhotosTabContent";
import ProfileTabContent from "@/sections/profile/components/profile_content/ProfileTabContent";
import VideosTabContent from "@/sections/profile/components/videos_content/VideosTabContent";
import { ImageFour, ImageProfileCover } from "@/utils/Images";
import { Activities } from "@/utils/enum";
import { useRef, useState } from "react";

function Page() {
  const { user } = useAuthContext();
  const [onSaveChanges, setOnSaveChanges] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [travelModal, setTravelModal] = useState(false);
  const aboutTabRef = useRef(null);
  const {
    data: userProfile,
    isLoading: getProfileLoading,
    refetch,
  } = useGetUserProfileQuery(user?.id);

  const {
    data: userAbout,
    isLoading: getAboutLoading,
    refetch: getAboutRefetch,
  } = useGetALLAboutDetailsQuery(user?.id);

  const {
    data: timelineRecord,
    isFetching: timeLineLoading,
    refetch: timelinerefetch,
  } = useGetUserTimelineDetailsQuery(user?.id);

  const handleSaveChanges = () => {
    if (aboutTabRef.current) {
      aboutTabRef.current.triggerOnSubmit();
    }
  };

  const tabs = [
    {
      id: 1,
      title: "About",
      content: (
        <AboutTabContent
          data={userAbout?.data}
          loader={getAboutLoading}
          ref={aboutTabRef}
          getAboutRefetch={getAboutRefetch}
          userProfile={userProfile?.data}
        />
      ),
    },
    {
      id: 2,
      title: "Profile",
      content: (
        <ProfileTabContent
          myprofile={true}
          Profile={timelineRecord?.data}
          UserTravelLoading={timeLineLoading}
          onSeeAllPhotos={() => setActiveTab(3)}
          onSeeAllFriends={() => setActiveTab(5)}
          refetch={refetch}
          timelinerefetch={timelinerefetch}
        />
      ),
    },
    {
      id: 3,
      title: "Photos",
      content: (
        <PhotosTabContent
          PhotoAboutYouImages={timelineRecord?.data?.photos_about_you}
          YourPhotosImages={timelineRecord?.data?.your_photos}
          Loading={timeLineLoading}
          timelinerefetch={timelinerefetch}
        />
      ),
    },
    {
      id: 4,
      title: "Videos",
      content: (
        <VideosTabContent
          videos={timelineRecord?.data?.videos}
          Loading={timeLineLoading}
        />
      ),
    },
    {
      id: 5,
      title: "Friends",
      content: (
        <FriendsTabContent
          Friends={timelineRecord?.data?.friends}
          Loading={timeLineLoading}
        />
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(tabs[1].id);

  if (getProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[86vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <main className="md:mt-6 md:mr-6 flex flex-col bg-background-color animate-fade-up">
      <div className="rounded-2xl bg-white">
        <ProfileCoverImage
          coverImage={userProfile?.data?.background_url || ImageProfileCover}
          profileImage={
            userProfile?.data?.image_url ===
            "https://api.mundotango.trangotechdevs.com/null"
              ? userProfile?.data?.user_images?.length > 0 &&
                userProfile?.data?.user_images[0]?.image_url
              : userProfile?.data?.image_url || "/images/user-placeholder.jpeg"
          }
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

            <div className="flex gap-2 flex-row">
              {activeTab === tabs[0].id ? null : (
                <AddTravelDetails
                  onClick={() => {
                    setTravelModal(true);
                  }}
                />
              )}

              {activeTab === tabs[0].id ? (
                <Button
                  text="Save Changes"
                  className="h-10"
                  onClick={handleSaveChanges}
                />
              ) : (
                <Button
                  text="Edit Profile"
                  className="h-10"
                  onClick={() => setEditProfileModal(true)}
                />
              )}
            </div>
          </div>
          {userProfile?.data?.bio && (
            <BioDetails bioDetails={userProfile?.data?.bio} />
          )}

          <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
        </section>
      </div>

      <TabContent tabs={tabs} activeTab={activeTab} />
      <ModelComponent
        open={editProfileModal}
        handleClose={() => setEditProfileModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <EditProfile
          setEditProfileModal={setEditProfileModal}
          refetch={refetch}
          timelinerefetch={timelinerefetch}
        />
      </ModelComponent>
      <ModelComponent
        open={travelModal}
        handleClose={() => setTravelModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <AddTravelDetailModal
          setTravelModal={setTravelModal}
          refetch={refetch}
          timelineRecord={timelineRecord?.data}
          timelinerefetch={timelinerefetch}
        />
      </ModelComponent>
    </main>
  );
}

export default Page;
