"use client";
import Button from "@/components/Buttons/Button";
import FriendComponents from "@/components/Friends/FriendList";
import FriendShipCard from "@/components/Friends/FriendShipCard";
import CountryList from "@/components/Groups/CountryList";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import DownIcon from "@/components/SVGs/DownIcon";
import {
  useAllFriendsMutation,
  useGetBlockListQuery,
  useUnBlockUserMutation,
} from "@/data/services/friendApi";
import { PATH_DASHBOARD } from "@/routes/paths";
import { FriendTwo } from "@/utils/Images";
import { Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// let friends = [
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendOne,
//     full_name: "Henry, Arthur ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendTwo,
//     full_name: "Cooper, Kristin ",
//     button_title: "View Profile",
//   },
//   {
//     image: FriendThree,
//     full_name: "Miles, Esther ",
//     button_title: "View Profile",
//   },
// ];

function Friends() {
  const [AllFriends,{ data, refetch, isFetching, isLoading }] = useAllFriendsMutation(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [view, setView] = useState("Friend"); // Block OR Friend

  const { push } = useRouter();

  const [friendShipModal, setFriendShipModal] = useState(false);

  const [friendId, setFriendId] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  const [city, setCity] = useState("");

  useEffect(() => {
    if (view === "Friend") {
      AllFriends();
    }
  }, [view]);

  useEffect(() => {
    // if (city) {
      const citi = city?.toLowerCase()
      AllFriends({city: citi});
    // }
  }, [city]);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenFriendModal = () => setFriendShipModal(true);

  const handleCloseFriendModal = () => setFriendShipModal(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="bg-white card mt-2">
      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row items-end">
              <div className="text-2xl font-bold">All Friends</div>
              <div
                className="cursor-pointer pl-1 ml-2 md:pl-0 flex items-center text-xs justify-end"
                onClick={handleClick}
              >
                <p className="text-gray-500">({city === "" ? "city" : city})</p>
                <div className="p-2">
                  <DownIcon color="gray" />
                </div>
              </div>
            </div>
            <MenuPop
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              setCity={setCity}
            />

            <Button
              text={view === "Friend" ? "View Block User" : "View Friend List"}
              className="h-10 text-sm bg-tag-color"
              onClick={() =>
                view === "Friend" ? setView("Block") : setView("Friend")
              }
            />
          </div>
        </div>

        {view === "Friend" &&
          (!!data?.data?.length ? (
            data?.data?.map((item, key) => (
              <div
                key={key}
                className="col-span-12 sm:col-span-4 md:col-span-3 animate-fade-up"
              >
                <FriendComponents
                  {...item}
                  image={item?.friend?.user_images[0]?.image_url}
                  full_name={item?.friend?.name || ""}
                  button_title={"View Profile"}
                  second_button={"See Friendship"}
                  onClickFirstBtn={() => {
                    push(PATH_DASHBOARD.profile.userProfile(item?.friend?.id));
                  }}
                  onClickSecondBtn={() => {
                    handleOpenFriendModal();
                    setFriendId(item?.friend?.id);
                  }}
                />
              </div>
            ))
          ) : (
            <div className="col-span-12">
              <div className="flex items-center justify-center h-[400px]">
                <h1 className="text-xl font-bold ">No Record Found!</h1>
              </div>
            </div>
          ))}

        {view === "Block" && <BlockUserList />}

        <ModelComponent
          open={friendShipModal}
          handleClose={handleCloseFriendModal}
          className={"w-[95%] md:w-[410px]"}
        >
          <FriendShipCard
            handleClose={handleCloseFriendModal}
            friendId={friendId}
          />
        </ModelComponent>
        <ModelComponent
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        className={"w-[95%] md:w-[410px]"}
      >
        <CountryList
          handleClose={handleClose}
          setlanguage={""}
          setValue={setCity}
          value={city}
        />
      </ModelComponent>
      </div>
    </div>
  );
}

export default Friends;

export const MenuPop = ({ handleClose, anchorEl, open, setCity }) => {
  const HeaderPopup = [
    {
      title: "toronto",
      onClick: () => {
        setCity("toronto");
      },
      className: "text-gray-text-color",
    },
    {
      title: "texas",
      onClick: () => {
        setCity("texas");
      },
      className: "text-gray-text-color",
    },
    {
      title: "toronto",
      onClick: () => {
        setCity("toronto");
      },
      className: "text-gray-text-color",
    },
    {
      title: "texas",
      onClick: () => {
        setCity("texas");
      },
      className: "text-gray-text-color",
    },
    {
      title: "toronto",
      onClick: () => {
        setCity("toronto");
      },
      className: "text-gray-text-color",
    },
    {
      title: "texas",
      onClick: () => {
        setCity("texas");
      },
      className: "text-gray-text-color",
    },
    {
      title: "toronto",
      onClick: () => {
        setCity("toronto");
      },
      className: "text-gray-text-color",
    },
    {
      title: "texas",
      onClick: () => {
        setCity("texas");
      },
      className: "text-gray-text-color",
    },
    {
      title: "toronto",
      onClick: () => {
        setCity("toronto");
      },
      className: "text-gray-text-color",
    },
    {
      title: "texas",
      onClick: () => {
        setCity("texas");
      },
      className: "text-gray-text-color",
    },
  ];

  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          border: "1px solid lightgrey",
          overflow: "auto",
          height: "250px",
          borderRadius: 5,
        },
        boxShadow: 0,
      }}
      elevation={0}
      anchorEl={anchorEl}
      // open={open}
      onClose={handleClose}
    >
      {HeaderPopup.map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            handleClose();
            item?.onClick();
          }}
        >
          <div className={item?.className}> {item?.title}</div>
          <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center "></div>
        </MenuItem>
      ))}
    </Menu>
  );
};

const BlockUserList = () => {
  const { data, isLoading, refetch } = useGetBlockListQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [unBlockUser, { isLoading: unBlockUserLoading }] =
    useUnBlockUserMutation();

  const onUnBlockUser = async (id) => {
    try {
      const result = await unBlockUser(id);

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Block user successfully");
        refetch();
      }
    } catch (e) {
      toast.error("Seems like something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] w-[75vw]">
        <SpinnerLoading />
      </div>
    );
  }

  return !!data?.data?.length ? (
    data?.data?.map((item, key) => (
      <div
        key={key}
        className="col-span-12 sm:col-span-4 md:col-span-3 animate-fade-up"
      >
        <FriendComponents
          {...item}
          image={item?.blocked_user?.user_images[3]?.image_url}
          full_name={item?.blocked_user?.name || ""}
          button_title={
            unBlockUserLoading ? <SpinnerLoading /> : "Unblock user"
          }
          onClickFirstBtn={() => onUnBlockUser(item.blocked_user_id)}
        />
      </div>
    ))
  ) : (
    <div className="col-span-12">
      <div className="flex items-center justify-center h-[400px]">
        <h1 className="text-xl font-bold ">No Record Found!</h1>
      </div>
    </div>
  );
};
