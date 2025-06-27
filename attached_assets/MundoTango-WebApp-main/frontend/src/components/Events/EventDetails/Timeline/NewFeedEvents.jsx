import DotIcon from "@/components/SVGs/DotIcon";
import React from "react";

const textClassesTitle = "text-gray-text-color font-bold";
const textClassesDate = "text-gray-text-color";
const TestItems = [1, 2, 3, 4, 5];

const NewFeedEvents = () => (
  <div className="bg-[white] overflow-hidden h-full">
    {TestItems.map((item, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center py-7">
          <div className="flex flex-col xl:flex-row items-center justify-center mb-5 space-y-1 xl:space-y-0 px-0 xl:px-8">
            <div className="text-black font-bold text-center xl:text-left">
              Upcoming events you've RSVP'ed
            </div>
            <div className="w-20 text-btn-color font-semibold text-center xl:text-left cursor-pointer">
              See all
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 ml-3">
              <div>
                <DotIcon />
              </div>
              <div>
                <div className={textClassesTitle}>Backyard BBQ Gathering</div>
                <div className={textClassesDate}>
                  Saturday 16th June, Tom's Garden
                </div>
              </div>
            </div>
            <br />
            <div className="flex items-center gap-4 ml-3">
              <div>
                <DotIcon />
              </div>
              <div>
                <div className={textClassesTitle}>Backyard BBQ Gathering</div>
                <div className={textClassesDate}>
                  Saturday 16th June, Tom's Garden
                </div>
              </div>
            </div>
          </div>
        </div>
        {TestItems.length - 1 != index && (
          <div className="mx-8">
            <hr className=" border-border-color" />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default NewFeedEvents;
