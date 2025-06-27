'use client';
import { useEffect, useState } from "react";
import SearchIcon from "../SVGs/SearchIcon";
import SpinnerLoading from "../Loadings/Spinner";
import { Box, Modal } from "@mui/material";

const FriendList = ({ user_slug, handleClose, openmodal, setUserSlug, button_title, modal_name , isCloseNeed = true,  onClickButton , data , loading, btnclass, btn_loading }) => {
  const [followerList, setFollowerList] = useState(data);

  const searchUser = (e) => {
    try {
      const value = e.target.value;
      if (value == "") {
        setFollowerList(data);
        return;
      } else {
        let list = data?.filter((v) =>
          v?.user?.username?.toLowerCase()?.includes(value?.toLowerCase())
        );
        setFollowerList(list);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(()=> {
    setFollowerList(data);
  },[data])

  return (
    <Modal open={openmodal} onClose={handleClose}>
      <Box
        className="m-auto w-[90vw] md:max-w-[412px] bg-white rounded-xl space-y-4 h-svh overflow-auto"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        //   width: "412px",
          boxShadow: 24,
          bgcolor: "background.paper",
          border: "none",
          borderRadius: 4,
          outline: "none",
          height: "90vh",
        }}
      >
        <div className="p-2 h-full overflow-auto">
          <div className="mt-3 px-5">
            <div className="w-full flex justify-between">
              <h2 className="text-2xl font-bold">{modal_name || "User"} List</h2>
              <button className="bg-[#f0f0f0] flex justify-center items-center rounded-full w-6 h-6" onClick={handleClose}>
                <img src="/images/event/xmark.svg" />
              </button>
            </div>
          </div>
          <div className="mt-5 px-5">
            <div className="flex items-center gap-4 border bg-[#f0f0f0]  border-[#E2E8F0] py-2 px-3 rounded-[24px] mb-3">
              <div>
                <SearchIcon />
              </div>
              <div className=" w-full">
                <input
                  className="outline-none w-full text-gray-text-color font-semibold text-sm bg-[#f0f0f0]"
                  placeholder="Search"
                  onChange={searchUser}
                />
              </div>
            </div>
          </div>

          <div className=" overflow-y-scroll h-[65vh] mt-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <SpinnerLoading size={40} />
              </div>
            ) : !!followerList?.length ? (
              followerList.map(
                ({ user, id, user_images, name, username, is_in_group}, index) => (
                  <div
                    key={index}
                    className="mt-5 flex justify-between items-center px-5"
                  >
                    <div className="flex gap-3">
                      <img
                        src={user?.image_url || user_images[0]?.image_url}
                        alt=""
                        className="w-10 h-10 rounded-full"
                        loading="lazy"
                      />
                      <div className="text-[#323232]">
                        <div className="font-extrabold text-md">
                          {user?.username || name}
                        </div>
                        <div className="text-xs font-bold">@{user?.username || username}</div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => {onClickButton(id); isCloseNeed && handleClose()}}
                        className={`${btnclass} ${is_in_group == 2 || is_in_group == 3 ? "bg-gray-text-color" : "bg-btn-color"} w-full px-10 py-2 text-xs font-medium text-white rounded-lg`}
                        disabled={is_in_group == 2  || is_in_group == 3}
                      >
                        {btn_loading ? <SpinnerLoading size={10}/> : is_in_group == 2 ? `Invited` : is_in_group == 3 ? `Joined` : button_title || 'Add'}
                      </button>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="flex items-center justify-center h-40 text-xl font-bold">
                <h2>{modal_name || 'user'} not found !</h2>
              </div>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default FriendList;
