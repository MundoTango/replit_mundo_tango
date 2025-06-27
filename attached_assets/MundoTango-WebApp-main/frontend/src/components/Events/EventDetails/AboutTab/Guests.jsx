import { formatNumber } from "@/utils/helper";
import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";
import React from "react";
import FriendList from "../../UserModal";
import { useRouter } from "next/navigation";
import { PATH_DASHBOARD } from "@/routes/paths";

const Guests = ({getQuest}) => {
  const [friendListModal, setFriendListModal] = React.useState(false);
  const [otherListModal, setOtherListModal] = React.useState(false);
  const [allGuestsModal, setAllGuestModal] = React.useState(false);
  const router = useRouter();
  const handleUserModal = () => {
    setFriendListModal((prev) => !prev);
  };
  return (
    <div className="main_card">
      <div className="mb-2 flex justify-between">
        <h2 className="heading-text">Guest </h2>
        <button className="pr-6 text-btn-color" onClick={() => setAllGuestModal(true)}>See All</button>
      </div>

      <div className="mt-4 mb-4">
        <p className="normal-text">Friends who are coming or Interested</p>
        <div className="flex justify-between items-center">
          <div className="flex cursor-pointer" onClick={() => setFriendListModal(true)}>
            {getQuest?.guest_friends?.slice(0, 3).map((x, i) => (
              <div className={i > 0 && "ml-[-15px]"}>
                <img src={x?.user?.image_url} alt="" className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </div>
          <div className="text-light-gray-color text-sm cursor-pointer" onClick={() => setFriendListModal(true)}>
            {formatNumber(getQuest?.guest_friends?.length)} Members
          </div>
        </div>
      </div>
    <hr/>
      <div className="mt-4">
        <p className="normal-text">Others who are coming or Interested</p>
        <div className="flex justify-between items-center">
          <div className="flex cursor-pointer" onClick={() => setOtherListModal(true)}>
            {getQuest?.guests?.slice(0, 3).map((x, i) => (
              <div className={i > 0 && "ml-[-15px]"}>
                <img src={x?.user?.image_url} alt="" className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </div>
          <div className="text-light-gray-color text-sm cursor-pointer" onClick={() => setOtherListModal(true)}>
            {formatNumber(getQuest?.guests?.length)} Members
          </div>
        </div>
      </div>
      <FriendList
        openmodal={friendListModal}
        handleClose={handleUserModal}
        modal_name={"Friends"}
        data={getQuest?.guest_friends}
        button_title={"View Profile"}
        btnclass={"px-4"}
        onClickButton={(id) => router.push(PATH_DASHBOARD.profile.userProfile(id))}
      />
      <FriendList
        openmodal={otherListModal}
        handleClose={()=> setOtherListModal((prev) => !prev)}
        data={getQuest?.guests}
        button_title={"View Profile"}
        btnclass={"px-4"}
        modal_name={"Other Guests"}
        onClickButton={(id) => router.push(PATH_DASHBOARD.profile.userProfile(id))}
      />
      <FriendList
        openmodal={allGuestsModal}
        handleClose={()=> setAllGuestModal((prev) => !prev)}
        data={[...getQuest?.guests || [], ...getQuest?.guest_friends || []]}
        button_title={"View Profile"}
        btnclass={"px-4"}
        modal_name={"All Guests"}
        onClickButton={(id) => router.push(PATH_DASHBOARD.profile.userProfile(id))}
      />
    </div>
  );
};

export default Guests;
