import EventAboutDetails from "./EventAboutDetails";
import EventHost from "./EventHosts";
import MapLocation from "./GoogleMap";
import Guests from "./Guests";
import ParticipantData from "./ParticipantGraph/ParticipantData";

const EventAboutContent = ({ event, getQuest }) => {
  const marker = { lat: event?.latitude, lan: event?.longitude };
  return (
    <div className="md:mt-6">
      <div className="flex flex-col md:flex-row">
        {/* First Column */}
        <div className="order-first md:order-none w-full md:w-[58%]">
          <EventAboutDetails event={event}/>
          <EventHost
            title={"Co-host"}
            desc={"Who invited in this Event"}
            isButton={false}
            getQuest={getQuest?.co_hosts?.slice(0, 3)}
            isslider={true}
          />
            <EventHost title={"Teacher/DJ/Photographer"} getQuest={getQuest?.general_hosts} isslider={true} />
        </div>

        {/* Second Column */}
        <div className="w-full md:w-[40%] md:ml-4 md:mt-0">
          <div className="main_card">
            {/* <Map marker={marker} /> */}
            <MapLocation marker={marker} />
            <h2 className="mt-3 text-[14px] font-[600]">{`${event?.city} ${event?.country}`}</h2>
            <p className="font-[400] text-[14px]">{event?.location}</p>
          </div>

          <Guests getQuest={getQuest} />

          <ParticipantData id={event?.id} />
        </div>
      </div>
    </div>
  );
};

export default EventAboutContent;
