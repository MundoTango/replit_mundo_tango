import { useAuthContext } from "@/auth/useAuthContext";
import { useGetAllFriendRequestQuery } from "@/data/services/friendApi";
import { useNotificationListingQuery } from "@/data/services/notificationApi";
import { useGlobalSearchQuery } from "@/data/services/searchApi";
import {
  useDeleteAccMutation,
  useLogoutMutation,
} from "@/data/services/userAuthApi";
import { PATH_AUTH, PATH_DASHBOARD, PATH_PAGE } from "@/routes/paths";
import { StringSplice } from "@/utils/helper";
import { MenuItem } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import CustomPopup from "../CustomPopups/CustomPop";
import FriendRequestList from "../Friends/FriendRequestList";
import CustomMenu from "../Menus/CustomMenu";
import NotificationList from "../Notification/NotificationList";
import DownIcon from "../SVGs/DownIcon";
import DrawerIcon from "../SVGs/DrawerIcon";
import { FriendRequest, HeaderIcons, MessageIcon } from "../SVGs/HeaderIcons";
import FeedSearch from "../Search/FeedSearch";
import ModelComponent from "../Modal/CustomModal";
import DeleteWarning from "../WarningPopup/DeleteWarning";
import ChangePassword from "../Modal/ChangePassword";

const Header = forwardRef(({ isOpen, toggleSidebar }, ref) => {
  const [logout] = useLogoutMutation();
  const [deleteAcc] = useDeleteAccMutation();

  const { push } = useRouter();

  const { user } = useAuthContext();

  const [activeTab, setActiveTab] = useState(0);

  const { data: notificationListing, isLoading: notificationLoading, refetch } =
    useNotificationListingQuery({ userId: user?.id, isRead: activeTab });

  let { data: friendRequest, isFetching: friendRequestLoading } =
    useGetAllFriendRequestQuery(
      {},
      {
        refetchOnMountOrArgChange: true,
      }
    );

  friendRequest = friendRequest?.data;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [showFriendPopup, setShowFriendPopup] = useState(false);

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [deleteAccount, setDeleteAccount] = useState(false);

  const [changePassword, setChangePassword] = useState(false);

  const { data: searchRecord, isLoading: searchLoading } = useGlobalSearchQuery(
    {
      query: searchQuery,
      type: "",
    }
  );

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const userLogout = async () => {
    try {
      await logout();
      push(PATH_AUTH.login);
      localStorage.clear();
    } catch (e) {
      console.log(e.message);
    }
  };

  const onDeleteAcc = async () => {
    try {
      await deleteAcc();
      push(PATH_AUTH.login);
      localStorage.clear();
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleSearchChange = async (e) => {
    try {
      const value = e.target.value;
      setSearchQuery(value);
    } catch (err) {
      console.log(err.message);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSearchBox: () => {
      setSearchQuery("");
    },
  }));

  const HeaderPopup = [
    {
      title: "Change Password",
      onClick: () => {
        setChangePassword(true);
        setAnchorEl("");
      },
      className: "text-gray-text-color",
    },
    {
      title: "FAQs",
      onClick: () => {
        push(PATH_PAGE.faqs);
        setAnchorEl("");
      },
      className: "text-gray-text-color",
    },
    {
      title: "Help & Support",
      onClick: () => {
        push(PATH_PAGE.helpSupport);
        setAnchorEl("");
      },
      className: "text-gray-text-color",
    },
    {
      title: "Privacy Policy",
      onClick: () => {
        push(PATH_PAGE.privacyPolicy);
        setAnchorEl("");
      },
      className: "text-gray-text-color",
    },
    {
      title: "Terms & Conditions",
      onClick: () => {
        push(PATH_PAGE.termsCondition);
        setAnchorEl("");
      },
      className: "text-gray-text-color",
    },
    {
      title: <div className="text-secondary-red"> Logout</div>,
      onClick: userLogout,
      className: "text-secondary-red",
    },
    {
      title: <div className="text-secondary-red"> Delete Account</div>,
      onClick: () => {
        setDeleteAccount(true);
        setAnchorEl("");
      },
    },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFriendPopup, showNotificationPopup])

  
  const handleOutsideClick = (event) => {
    const Div = document.getElementById('view-dialogue');

    if (!Div?.contains(event.target)) {
      setShowFriendPopup(null);
      setShowNotificationPopup(null);
    }
  }

  return (
    <div className="bg-[white] h-16 border-b-2 border-border-color transition-all flex items-center gap-3 p-3 md:p-5 select-none">
      <div>
        {!isOpen && (
          <DrawerIcon onClick={toggleSidebar} className="cursor-pointer" />
        )}
      </div>

      <div className="flex-1 relative">
        <div className="">
          <FeedSearch value={searchQuery} onChange={handleSearchChange} />
          {searchQuery && (
            <SearchResults
              searchRecord={searchRecord?.data}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>
      </div>

      <div className="mr-1 md:mr-4 flex items-center md:space-x-5">
        <div className=" flex items-center gap-5">
          <div className="relative">
            <FriendRequest
              className="cursor-pointer"
              onClick={() => {
                setShowFriendPopup(!showFriendPopup);
                setShowNotificationPopup(false);
              }}
            />
            {showFriendPopup && (
              <CustomPopup>
                <FriendRequestList
                  friendRequest={friendRequest}
                  isFetching={friendRequestLoading}
                />
              </CustomPopup>
            )}
          </div>
          <div>
            <MessageIcon
              className="cursor-pointer"
              onClick={() => push(PATH_DASHBOARD.message)}
            />
          </div>
          <div className="relative">
            <HeaderIcons
              onClick={() => {
                setShowNotificationPopup(!showNotificationPopup);
                setShowFriendPopup(false);
              }}
              className="cursor-pointer"
            />
            {showNotificationPopup && (
              <CustomPopup>
                <NotificationList
                  setShowNotificationPopup={setShowNotificationPopup}
                  notificationListing={notificationListing?.data}
                  refetch={refetch}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
              </CustomPopup>
            )}
          </div>
        </div>
        <div
          className="cursor-pointer pl-2 md:pl-0 flex items-center gap-2"
          onClick={handleClick}
        >
          {user?.image_url && (
            <img
              src={
                user?.image_url ===
                "https://api.mundotango.trangotechdevs.com/null"
                  ? user?.user_images?.length > 0 &&
                    user?.user_images[0]?.image_url
                  : user?.image_url || "/images/user-placeholder.jpeg"
              }
              alt=""
              loading="lazy"
              className="w-10 h-10 object-cover rounded-full"
            />
          )}
          <div className="p-2">
            <DownIcon color="black" />
          </div>
        </div>

        {/* <PopupMenu
          anchorEl={anchorEl}
          open={open}
          handleClose={handleClose}
          menuList={HeaderPopup}
        /> */}

        <CustomMenu anchorEl={anchorEl} handleClose={handleClose} open={open}>
          {!!HeaderPopup?.length &&
            HeaderPopup.map(({ title, onClick }, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  if (onClick) {
                    onClick();
                  }
                }}
              >
                <div
                  className={`font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center font-semibold text-gray-text-color`}
                >
                  {title}
                </div>
              </MenuItem>
            ))}
        </CustomMenu>
      </div>
      <ModelComponent
        open={deleteAccount}
        handleClose={() => setDeleteAccount(false)}
        // width={"50%"}
        className={"w-[95%] md:w-[50%]"}
      >
        <DeleteWarning
          title={"Delete Warning"}
          message={"Are you really want to delete your Account?"}
          onClick={onDeleteAcc}
          handleClose={() => setDeleteAccount(false)}
        />
      </ModelComponent>
      <ModelComponent
        open={changePassword}
        handleClose={() => setChangePassword(false)}
        // width={"50%"}
        className={"w-[95%] md:w-[50%]"}
      >
        <ChangePassword setChangePassword={setChangePassword} />
      </ModelComponent>
    </div>
  );
});

export default Header;

const SearchResults = ({ searchRecord, setSearchQuery }) => {
  const searchPopupClass = "overflow-y-scroll max-h-[360px] mt-3";

  return (
    <div className="absolute w-[300px] md:w-[96.5%] max-h-[400px] overflow-y-auto left-3 bg-white rounded-2xl border p-3 z-50 animate-fade-up">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3">
          <h2>Posts</h2>
          <div className={searchPopupClass}>
            {!!searchRecord?.posts?.length &&
              searchRecord?.posts?.map(({ content, user }, index) => (
                <View
                  key={index}
                  content={content}
                  image={user?.user_images[0]?.image_url}
                  url={`/user`}
                  setSearchQuery={setSearchQuery}
                />
              ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <h2>Group</h2>
          <div className={searchPopupClass}>
            {!!searchRecord?.groups?.length &&
              searchRecord?.groups?.map(({ id, name, image_url }, index) => (
                <View
                  key={index}
                  content={name}
                  image={image_url}
                  url={`/user/group?q=${id}`}
                  setSearchQuery={setSearchQuery}
                />
              ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <h2>Friend</h2>
          <div className={searchPopupClass}>
            {!!searchRecord?.peoples?.length &&
              searchRecord?.peoples?.map(({ id, name, image_url }, index) => (
                <View
                  key={index}
                  content={name}
                  image={image_url}
                  url={`/user/profile/?q=${id}`}
                  setSearchQuery={setSearchQuery}
                />
              ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <h2>Events</h2>
          <div className={searchPopupClass}>
            {!!searchRecord?.events?.length &&
              searchRecord?.events?.map(({ id, name, image_url }, index) => (
                <View
                  key={index}
                  content={name}
                  image={image_url}
                  url={`/user/event?q=${id}`}
                  setSearchQuery={setSearchQuery}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const View = ({ image, content, url, setSearchQuery }) => {
  return (
    <Link href={url}>
      <div
        className="flex gap-3 items-center mb-2 cursor-pointer py-1"
        onClick={() => {
          setSearchQuery("");
        }}
      >
        <img
          src={image}
          className="w-10 h-10 object-contain rounded-full"
          loading="lazy"
        />
        <div>{StringSplice(content, 40)}</div>
      </div>
    </Link>
  );
};
