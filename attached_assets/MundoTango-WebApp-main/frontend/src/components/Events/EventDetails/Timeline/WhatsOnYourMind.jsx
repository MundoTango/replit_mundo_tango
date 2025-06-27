"use client";

import RHFTextField from "@/components/FORMs/RHFTextField";

import Gallery from "@/components/SVGs/Gallery";

import Location from "@/components/SVGs/Location";

import StarOutline from "@/components/SVGs/StarOutline";

import DownIcon from "@/components/SVGs/DownIcon";

import EarthIcon from "@/components/SVGs/EarthIcon";

import EmojIcon from "@/components/SVGs/EmojIcon";

import { useForm } from "react-hook-form";

import { useAuthContext } from "@/auth/useAuthContext";

import CustomMenu from "@/components/Menus/CustomMenu";

import { MenuItem } from "@mui/material";

import { POST_CREATION_TYPE } from "@/utils/enum";

import { useState } from "react";

const WhatsOnYourMind = ({ visibility, setVisibility, handleModalOpen }) => {
  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      mindDescription: "",
    },
  });

  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {/* <div className="flex justify-between items-center my-5 ">
        <div className="text-2xl font-bold">New Feeds</div>
        <div>
          <button
            onClick={handleClick}
            className="rounded-xl bg-btn-color text-sm font-bold text-white flex items-center justify-center gap-2 w-32 h-10"
          >
            {visibility} <DownIcon />
          </button>
        </div>
      </div> */}
      <div className="card select-none">
        <div className="flex justify-between pr-5">
          <div className="text-black flex items-center gap-4">
            <div>
              <img
                src={user?.image_url}
                alt=""
                loading="lazy"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-sm text-gray-text-color">
                @{user?.username}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 " onClick={handleModalOpen}>
            <div>
              <EarthIcon />
            </div>
            <div className="font-semibold">Public</div>
            <DownIcon color="black" />
          </div>
        </div>

        <div className="mr-5 my-5 pr-3 input-text flex items-center gap-3">
          <RHFTextField
            type={"text"}
            name="postDescription"
            control={control}
            errors={errors}
            placeholder="What’s on your mind?"
            onClick={handleModalOpen}
            autoComplete="off"
            className={` input-text border-none `}
          />

          <EmojIcon className="" onClick={handleModalOpen}/>
        </div>

        <br></br>
        <hr></hr>
        <br></br>

        <div className="flex w-full justify-between flex-wrap">
          <div className="flex w-auto justify-between flex-wrap gap-8">
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center text-center text-sm font-medium cursor-default"
              onClick={() => handleModalOpen(POST_CREATION_TYPE.LOCATION)}
            >
              <span className="px-2">
                <Location />
              </span>
              Location
            </button>
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium cursor-default"
              onClick={() => handleModalOpen()}
            >
              <span className="px-2">
                <Gallery />
              </span>
              Image/Video
            </button>
            {/* <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium cursor-default"
              onClick={() => handleModalOpen(POST_CREATION_TYPE.ACTIVITY)}
            >
              <span className="px-2">
                <StarOutline />
              </span>
              Activity
            </button> */}
            {/* <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium"
            >
              <span className="px-2">
                <Recommendation />
              </span>
              Recommendation
            </button> */}
          </div>
          <div className="pr-5 mt-4 xl:mt-0">
            <button
              onClick={handleModalOpen}
              className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white cursor-default"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <CustomMenu handleClose={handleClose} anchorEl={anchorEl} open={open}>
        {["All", "Public", "Friend", "Private"].map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              setVisibility(item);
            }}
          >
            <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center ">
              {item}
            </div>
          </MenuItem>
        ))}
      </CustomMenu>
    </div>
  );
};

export default WhatsOnYourMind;
