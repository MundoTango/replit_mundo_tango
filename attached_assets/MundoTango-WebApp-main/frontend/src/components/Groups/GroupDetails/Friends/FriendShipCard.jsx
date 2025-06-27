import { useGetFriendShipCardMutation } from "@/data/services/friendApi";
import { FriendOne, FriendTwo } from "@/utils/Images";
import { useEffect, useState } from "react";
import CrossIcon from "../SVGs/CrossIcon";
import SpinnerLoading from "../Loadings/Spinner";

const FriendShipCard = ({ handleClose, friendId }) => {
  const [getFriendShipCard, { isLoading }] = useGetFriendShipCardMutation();

  const [friendShip, setFriendShip] = useState({});

  useEffect(() => {
    const getRecord = async () => {
      try {
        let result = await getFriendShipCard(friendId);

        if (result?.data?.code === 200) {
          console.log(result?.data?.data);
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
              src={FriendOne}
              alt=""
              className="rounded-full w-16 object-contain"
              loading="lazy"
            />
          </div>
          <div className="absolute">
            <img
              src={FriendTwo}
              alt=""
              className="rounded-full w-16 object-contain"
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
        <button className="bg-btn-color text-white w-full rounded-lg h-10">
          See Full Friendship
        </button>
      </div>
    </div>
  );
};

export default FriendShipCard;
