import { useAuthContext } from "@/auth/useAuthContext";
import { PATH_AUTH, PATH_DASHBOARD, PATH_PAGE } from "@/routes/paths";
import { MenuItem } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import CustomMenu from "../Menus/CustomMenu";
import DownIcon from "../SVGs/DownIcon";
import DrawerIcon from "../SVGs/DrawerIcon";
import { FriendRequest, HeaderIcons, MessageIcon } from "../SVGs/HeaderIcons";
import FeedSearch from "../Search/FeedSearch";

const Header = forwardRef(({ isOpen, toggleSidebar }, ref) => {
  const { push } = useRouter();
  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const userLogout = async () => {
    try {
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
  ];

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
        </div>
      </div>

      <div className="mr-1 md:mr-4 flex items-center md:space-x-5">
        <div className=" flex items-center gap-5">
          <div className="relative">
            <FriendRequest className="cursor-pointer" />
          </div>
          <div>
            <MessageIcon
              className="cursor-pointer"
              onClick={() => push(PATH_DASHBOARD.message)}
            />
          </div>
          <div className="relative">
            <HeaderIcons className="cursor-pointer" />
          </div>
        </div>
        <div
          className="cursor-pointer pl-2 md:pl-0 flex items-center gap-2"
          onClick={handleClick}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              loading="lazy"
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          )}
          <div className="p-2">
            <DownIcon color="black" />
          </div>
        </div>

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
    </div>
  );
});

export default Header;