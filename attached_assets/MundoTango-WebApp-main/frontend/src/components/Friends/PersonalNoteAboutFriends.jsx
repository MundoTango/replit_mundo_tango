import React from "react";
import CalenderIcon from "../SVGs/CalenderIcon";
import MutualFriendIcon from "../SVGs/MutualFriendIcon";
import UserIcon from "../SVGs/UserIcon";
import Location from "../SVGs/Location";
import FriendSinceIcon from "../SVGs/FriendSinceIcon";
import { useGetCommonThingsQuery } from "@/data/services/friendApi";
import moment from "moment";

const PersonalNoteAboutFriends = ({ record, ProfileId }) => {
  const { data: commonThings, isFetching: commonThingLoading } =
    useGetCommonThingsQuery(ProfileId);

  let travel_one =
    commonThings?.data?.mutual_travelling?.rows[0]?.mutual_travel?.event_name ||
    "";
  let travel_two =
    commonThings?.data?.mutual_travelling?.rows[1]?.mutual_travel?.event_name ||
    "";

  let location_one =
    commonThings?.data?.mutual_travelling?.rows[0]?.mutual_travel?.city || "";
  let location_two =
    commonThings?.data?.mutual_travelling?.rows?.length > 1 &&
    location_one !==
      commonThings?.data?.mutual_travelling?.rows[1]?.mutual_travel?.city
      ? `, ${commonThings?.data?.mutual_travelling?.rows[1]?.mutual_travel?.city}`
      : "";

  const friend_mutal = commonThings?.data?.mutual_Friend;

  const friend_one = friend_mutal?.rows[0]?.friend?.username || "";

  const friend_two = friend_mutal?.rows[1]?.friend?.username || "";

  const groups = commonThings?.data?.mutual_groups?.rows?.slice(0, 2) || [];
  const groups_one =
    groups?.length > 0 && groups[0]?.group != null ? groups[0]?.group : "";
  const groups_two =
    groups?.length > 1 && groups[1]?.group ? `, ${groups[1]?.group}` : "";
  const groups_three =
    groups?.length > 2 && groups[2]?.group ? `, ${groups[2]?.group}` : "";
  const groups_count = commonThings?.data?.mutual_groups?.count || 0;

  const ThingsInCommon = [
    {
      icon: <CalenderIcon />,
      title: `Went to ${travel_one}  ${travel_two && "&" + travel_two}`,
    },
    {
      icon: <UserIcon />,
      title: `Also member of ${groups_one}${groups_two}${groups_three} and ${groups_count - 3} other groups`,
    },
    {
      icon: <MutualFriendIcon />,
      title: `${friend_mutal?.count} mutual friends including ${friend_one}  ${friend_two && "and " + friend_two} `,
    },
    {
      icon: <Location />,
      title: `${location_one}${location_two} Location we've overlapped`,
    },
    {
      icon: <FriendSinceIcon />,
      title: !!record?.createdAt
        ? `Your friend since ${moment(record?.createdAt).format("MMMM YYYY")}`
        : null,
    },
  ];

  return (
    <div className="card">
      <div className="mr-4">
        <div className="mb-2">
          <h2>Personal note about this friend</h2>

          <textarea
            disabled
            className="bg-background-color w-full rounded-lg resize-none h-24 outline-none mt-4 text-gray-text-color p-3 text-sm font-medium"
            value={record?.receiver_notes}
          ></textarea>
        </div>

        <div className="py-5">
          <hr />
        </div>

        <div>
          <h2>Things in common</h2>
          {!!ThingsInCommon?.length &&
            ThingsInCommon.map(({ icon, title }, index) => (
              <div
                key={index}
                className="flex items-center gap-5 mt-3 animate-fade-up"
              >
                <div>{icon}</div>
                <div>
                  <div className="font-medium">{title}</div>
                  {/* <div className="text-btn-color font-medium text-sm mt-1 cursor-pointer">
                    See All
                  </div> */}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalNoteAboutFriends;
