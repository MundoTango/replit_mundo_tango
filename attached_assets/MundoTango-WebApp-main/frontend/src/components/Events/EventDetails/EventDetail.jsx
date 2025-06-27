"use client";
import Button from "@/components/Buttons/Button";
import SpinnerLoading from "@/components/Loadings/Spinner";
import {
  useAllGuestsMutation,
  useEventByIdMutation,
  useGetAllEventsQuery,
  useGetEventTimelineDetailsQuery,
  useInviteEventMutation,
} from "@/data/services/eventAPI";
import { useAllFriendsMutation } from "@/data/services/friendApi";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import { useEffect, useState } from "react";
import { BsShare } from "react-icons/bs";
import FriendList from "../UserModal";
import EventAboutContent from "./AboutTab/EventAboutContent";
import EventDiscussionContent from "./DiscussionTab/EventDiscussionContent";
import TopBanner from "./TopBanner";
import PhotosTabContent from "./photos_content/PhotosTabContent";
import VideosTabContent from "./videos_content/VideosTabContent";
import ModelComponent from "@/components/Modal/CustomModal";
import FriendModal from "../FriendModal";
import toast from "react-hot-toast";


const EventDetail = ({ id }) => {
  const [friendListModal, setFriendListModal] = useState(false);
  const [sharedModal, setSharedModal] = useState(false);
  const [url, setUrl] = useState("");
  const [eventById, { data: event, refetch, isLoading }] =
    useEventByIdMutation();
  const [allGuests, { data: getQuest, isLoading: GroupMemberLoading }] =
    useAllGuestsMutation();
  const [AllFriends,{data: getFriends, isFetching }] = useAllFriendsMutation({},
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: events } = useGetAllEventsQuery();
  const { data: timelineRecord, isFetching: timeLineLoading } =
    useGetEventTimelineDetailsQuery(id);
  const [inviteEvent, {isFetching: inviteLoading}] = useInviteEventMutation();

  const eventData = events?.data?.find((event) => event.id === Number(id));

  const SendInvite = async (user_id) => {
    const response = await inviteEvent({ event_id: Number(id), user_id: user_id });

    if (response?.error?.code) {
      toast.error("Seems like something went wrong");
      return;
    }

    if (response?.error?.data?.code === 400) {
      toast.error(response?.error?.data?.message);
      return;
    }
    
    if (response?.data?.code === 200) {
      toast.success("Invite Send Successfully");
      AllFriends({city: "", event_id: Number(id)});
    }
  };

  const tabs = [
    {
      id: 1,
      title: "About",
      content: (
        <EventAboutContent event={eventData} getQuest={getQuest?.data} />
      ),
    },
    {
      id: 2,
      title: "Discussion",
      content: (
        <EventDiscussionContent event={eventData} getQuest={getQuest?.data} />
      ),
    },
    {
      id: 3,
      title: "Photos",
      content: (
        <PhotosTabContent
          PhotoAboutYouImages={timelineRecord?.data?.photos}
          Loading={timeLineLoading}
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
    }
  ];
  const [activeTab, setActiveTab] = useState(tabs[1].id);

  useEffect(() => {
    if (id) {
      eventById(id);
      allGuests(id);
    }
  }, [id]);

  useEffect(() => {
    AllFriends({city: "", event_id: Number(id)});
  }, []);

  if (isLoading) {
    return (
      <div className="md:mt-6 bg-white centered_card md:mr-6 h-screen">
        <div className="flex items-center justify-center h-20">
          <SpinnerLoading />
        </div>
      </div>
    );
  }
  const handleOpenSharedModal = (item) => {
    setUrl(`${window.location.origin}/user/event?q=${item.id}`);
    setSharedModal(true);
  };

  const handleUserModal = () => {
    setFriendListModal((prev) => !prev);
  };

  return (
    <main className="md:pr-6 md:mt-6 flex w-full flex-col bg-background-color animate-fade-up">
      <div className="rounded-2xl bg-white">
        <TopBanner event={event?.data} />

        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row p-4 md:p-8">
            <div className="flex md:flex-wrap w-full md:w-2/3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-5 md:px-8 py-2 text-xs md:text-base font-semibold ${activeTab === tab.id ? "bg-black text-white transition-all " : "text-black transition-all "}`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full md:w-1/3 justify-end">
              <Button
                text="Invite Friends"
                className={"h-10 text-sm"}
                onClick={() => setFriendListModal(true)}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* {activeTab === tabs[0].id ? null : ( */}
                <div className="bg-btn-color text-white px-3 py-3 rounded-xl font-bold text-sm"
                onClick={() => handleOpenSharedModal(eventData)}>
                  <BsShare />
                </div>
                {/* )} */}
              </div>
            </div>
          </div>
        </section>
      </div>

      <TabContent tabs={tabs} activeTab={activeTab} />
      <FriendModal
        openmodal={friendListModal}
        handleClose={handleUserModal}
        modal_name={"Friends"}
        data={getFriends?.data}
        button_title={"Invite"}
        onClickButton={SendInvite}
        isCloseNeed={false}
        btn_loading={inviteLoading}
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
};

export default EventDetail;
