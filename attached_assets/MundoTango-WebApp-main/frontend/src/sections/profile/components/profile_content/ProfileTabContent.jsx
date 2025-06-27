import PersonalNoteAboutFriends from "@/components/Friends/PersonalNoteAboutFriends";
import SeeFullFriendRequestDetails from "@/components/Friends/SeeFullFriendRequestDetails";
import { useGetFriendShipCardMutation } from "@/data/services/friendApi";
import React, { useEffect, useState } from "react";
import FriendsComponent from "./FriendsComponent";
import PhotosComponent from "./PhotosComponent";
import TimeLine from "./Timeline/TimeLine";
import TravelDetailsComponent from "./TravelDetailsComponent";
import { formatDateMonth } from "@/utils/helper";

const ProfileTabContent = ({
  myprofile = true,
  UserTravelLoading,
  Profile,
  onSeeAllPhotos,
  onSeeAllFriends,
  profile_id,
  fullFriendShipView = false,
  isFriend,
  timelinerefetch,
  refetch
}) => {
  const [getFriendShipCard, { isLoading }] = useGetFriendShipCardMutation();

  const [record, setRecord] = useState({
    have_we_danced: false,
    event_we_meet: "",
    city_we_meet: "",
    when_did_we_meet: "",
    sender_notes: "",
    receiver_notes: "",
    attachments: [],
    createdAt: "",
  });

  useEffect(() => {
    getFriendDetails();
  }, []);

  const getFriendDetails = async () => {
    try {
      const result = await getFriendShipCard(profile_id);
      const { code, data } = result?.data;

      // console.log(data);

      if (code) {
        // console.log(data?.have_we_danced);
        // console.log(data?.event_we_meet);
        // console.log(data?.city_we_meet);
        // console.log(data?.when_did_we_meet);
        // console.log(data?.sender_notes);
        // console.log(data?.receiver_notes);
        // console.log(data?.attachments);

        setRecord({
          have_we_danced: data?.have_we_danced,
          event_we_meet: data?.event_we_meet,
          city_we_meet: data?.city_we_meet,
          when_did_we_meet: formatDateMonth(data?.when_did_we_meet),
          sender_notes: data?.sender_notes,
          receiver_notes: data?.receiver_notes,
          attachments: data?.attachments,
          createdAt: data?.createdAt,
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="container-fluid md:mt-6">
      <div className="flex flex-col md:flex-row">
        {/* First Column */}
        <div className="md:w-4/12">
          {!fullFriendShipView && (
            <TravelDetailsComponent UserTravel={Profile?.user_travels} userData={Profile?.user} timelinerefetch={timelinerefetch} refetch={refetch} />
          )}

          {fullFriendShipView && (
            <React.Fragment>
              <SeeFullFriendRequestDetails record={record} />

              <PersonalNoteAboutFriends
                record={record}
                ProfileId={profile_id}
              />
            </React.Fragment>
          )}

          <PhotosComponent
            Photos={Profile?.your_photos}
            onSeeAllPhotos={onSeeAllPhotos}
          />

          <FriendsComponent
            Friends={Profile?.friends}
            onSeeAllFriends={onSeeAllFriends}
          />
        </div>

        {/* Second Column */}
        <div className="order-first md:order-none md:ml-4 md:mt-0 md:w-8/12">
          <TimeLine isFriend={isFriend} myprofile={myprofile} profile_id={profile_id} />
        </div>
      </div>
    </div>
  );
};

export default ProfileTabContent;
