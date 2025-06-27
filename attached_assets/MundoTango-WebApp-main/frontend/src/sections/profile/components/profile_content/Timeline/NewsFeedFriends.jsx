import FriendComponents from "@/components/Friends/FriendList";

import KababMenu from "@/components/SVGs/KababMenu";

import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";

const NewsFeedFriends = () => {
  return (
    <div className="mt-6  bg-white card">
      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                New Users In Your Area
              </div>
              <div className="text-light-gray-color">Add if you know them</div>
            </div>

            <div>
              <KababMenu className="cursor-pointer" />
            </div>
          </div>
        </div>

        {[
          {
            image: FriendOne,
            full_name: "Henry, Arthur ",
          },
          {
            image: FriendTwo,
            full_name: "Cooper, Kristin ",
          },
          {
            image: FriendThree,
            full_name: "Miles, Esther ",
          },
        ].map((item, key) => (
          <div key={key} className="col-span-4">
            <FriendComponents {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeedFriends;
