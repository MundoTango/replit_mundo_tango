import CreatePostComponent from "@/sections/profile/components/profile_content/CreatePostComponent";
import MapLocation from "../AboutTab/GoogleMap";
import Guests from "../AboutTab/Guests";
import PostComponent from "@/sections/profile/components/profile_content/PostComponent";
import TimeLine from "../Timeline/TimeLine";
import ParticipantData from "../AboutTab/ParticipantGraph/ParticipantData";

const EventDiscussionContent = ({event , getQuest}) => {
  console.log(event);
  const marker = { lat: event?.latitude, lan: event?.longitude };
  return (
    <div className="container-fluid md:mt-6">
      <div className="flex flex-col md:flex-row">
        {/* First Column */}
        <div className="order-first md:order-none  md:w-[58%]">
        {/* <CreatePostComponent />
          {Array.from({ length: 3 }).map((_, index) => {
            return <PostComponent key={index} />;
          })} */}
          <TimeLine myprofile={event} event_id={event?.id} />
        </div>

        {/* Second Column */}
        <div className="md:w-[40%] md:ml-4 md:mt-0">
          <div className="main_card">
            <MapLocation marker={marker} id={event?.id} />
            <h2 className="mt-3 text-[14px] font-[600]">{`${event?.city} ${event?.country}`}</h2>
            <p className="font-[400] text-[14px]">{event?.location}</p>
          </div>

          <Guests getQuest={getQuest}/>

          <ParticipantData id={event?.id} />
        </div>
      </div>
    </div>
  );
};

export default EventDiscussionContent;
