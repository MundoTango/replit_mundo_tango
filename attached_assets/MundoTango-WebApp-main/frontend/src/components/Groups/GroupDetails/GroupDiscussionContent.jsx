import TimeLine from "./Timeline/TimeLine";

const GroupDiscussionContent = ({group}) => {
  return (
    <div className="container-fluid md:mt-6">
      <div className="flex flex-col md:flex-row">
        {/* First Column */}
        <div className="w-full md:w-[58%]">
          {/* <CreatePostComponent />
          {Array.from({ length: 3 }).map((_, index) => {
            return <PostComponent key={index} />;
          })} */}
          <TimeLine myprofile={group} group_id={group?.id} />
        </div>

        {/* Second Column */}
        <div className="w-full md:w-[42%] ">
          <div className="md:ml-4 md:mt-0">
          <div className="main_card">
            <h2 className="mt-3 mb-3 text-xl font-[700]">
              General Information
            </h2>
            <p className="font-[400] text-[14px] max-h-[357px] overflow-y-auto">
              {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.*/}
              {group?.description} 
            </p>
          </div>
          {/* <ParticipantDataGraph /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionContent;
