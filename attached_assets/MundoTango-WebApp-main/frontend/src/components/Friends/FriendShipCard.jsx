import { useGetFriendShipCardMutation } from "@/data/services/friendApi";
import { FriendOne, FriendTwo } from "@/utils/Images";
import { useEffect, useState } from "react";
import CrossIcon from "../SVGs/CrossIcon";
import SpinnerLoading from "../Loadings/Spinner";
import Link from "next/link";
import { PATH_DASHBOARD } from "@/routes/paths";

const FriendShipCard = ({ handleClose, friendId }) => {
  const [getFriendShipCard, { isLoading }] = useGetFriendShipCardMutation();

  const [friendShip, setFriendShip] = useState({});

  useEffect(() => {
    const getRecord = async () => {
      try {
        let result = await getFriendShipCard(friendId);

        if (result?.data?.code === 200) {
          setFriendShip(result?.data?.data);
        }
      } catch (e) {
        console.log(e.message);
      }
    };
    getRecord();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[433px] flex items-center justify-center">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="text-btn-color text-xl font-bold">
          Your friendship with {friendShip?.friend?.name}
        </div>
        <CrossIcon className="cursor-pointer" onClick={handleClose} />
      </div>

      <div className="flex items-center justify-center mt-4 ">
        <div>
          <div className="absolute left-40">
            <img
              src={friendShip?.friend_user?.user_images[0]?.image_url}
              alt=""
              className="rounded-full w-14 h-14 object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute">
            <img
              src={friendShip?.friend?.user_images[0]?.image_url}
              alt=""
              className="rounded-full w-14 h-14 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <hr />
      </div>

      <div className="flex justify-between mt-3">
        <div>
          <div className="text-btn-color font-bold">Who They Are</div>
          <div className="w-[135px] text-gray-text-color mt-2 flex flex-col gap-3">
            <div>
              <div>User name: </div>
              <div className="font-bold">
                {friendShip?.friend?.name || "N/A"}
              </div>
            </div>

            <div>
              <div>City: </div>
              <div className="font-bold">
                {friendShip?.city_we_meet || "N/A"}
              </div>
            </div>

            <div>
              <div>Role in tango: </div>
              <div className="font-bold">Photographer, DJ</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-btn-color font-bold">Your Notes</div>
          <div className="w-[135px] text-gray-text-color text-[15px] mt-2 ">
            {friendShip?.notes}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Link href={PATH_DASHBOARD.friends.seeFullFriendShip(friendId)}>
          <button className="bg-btn-color text-white rounded-lg w-full h-10">
            See Full Friendship
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FriendShipCard;
