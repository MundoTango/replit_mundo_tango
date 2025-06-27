import SpinnerLoading from "@/components/Loadings/Spinner";
import DotIcon from "@/components/SVGs/DotIcon";
import { useGetUpcomingEventsQuery } from "@/data/services/eventAPI";
import { PATH_DASHBOARD } from "@/routes/paths";
import { firstUpperCase } from "@/utils/helper";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";

const textClassesTitle = "text-gray-text-color font-bold";
const textClassesDate = "text-gray-text-color";
const TestItems = [1, 2, 3];

const NewFeedEvents = () => {
  let { data, isLoading: upComingEventLoading } = useGetUpcomingEventsQuery();
  data = data?.data;

  const { push } = useRouter();

  const EventsList = [
    {
      title: "Upcoming events you've RSVP'ed",
      events: data?.upcoming_event || [],
      error: "Upcoming event not found",
    },
    {
      title: "Event in Your City",
      events: data?.event_in_your_city || [],
      error: "City event not found",
    },
    {
      title: "Events you follow",
      events: data?.followed_event || [],
      error: "You don't follow events",
    },
  ];

  const toEventList = async () => {
    try {
      push(PATH_DASHBOARD.event.root);
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div
      className={`bg-[white] mx-2.5 lg:mx-0 rounded-xl lg:rounded-none overflow-hidden h-full`}
    >
      {upComingEventLoading ? (
        <div className="flex items-center justify-center h-48">
          <SpinnerLoading />
        </div>
      ) : (
        !!EventsList?.length &&
        EventsList.map(({ title, events, error }, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center py-7 animate-fade-up">
              <div className="flex flex-col xl:flex-row items-center justify-between mb-5 space-y-1 xl:space-y-0 px-0 pl-6 w-full">
                <div className="text-black font-bold text-center xl:text-left">
                  {firstUpperCase(title)}
                </div>
                <div
                  onClick={toEventList}
                  className="w-20 text-btn-color font-semibold text-center xl:text-left cursor-pointer"
                >
                  See all
                </div>
              </div>

              {!!events?.length ? (
                events.map(({ name, start_date, location }, i) => (
                  <div key={i} className="flex items-center gap-4 ml-3">
                    <div>
                      <DotIcon />
                    </div>
                    <div>
                      <div className={textClassesTitle}>
                        {firstUpperCase(name, true)}
                      </div>
                      <div className={textClassesDate}>
                        {moment(start_date).format("dddd Do MMMM")}, {location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={textClassesDate}>{error}</div>
              )}
            </div>
            {TestItems.length - 1 != index && (
              <div className="mx-8">
                <hr className=" border-border-color" />
              </div>
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default NewFeedEvents;
