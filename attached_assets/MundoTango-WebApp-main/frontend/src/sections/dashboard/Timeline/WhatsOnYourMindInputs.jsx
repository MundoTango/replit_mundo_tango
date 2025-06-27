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

import { useEffect, useRef, useState } from "react";

import SpinnerLoading from "@/components/Loadings/Spinner";
import { useCreatePostMutation, useUpdatePostMutation } from "@/data/services/postApi";
import { POST_CREATION_TYPE } from "@/utils/enum";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import ActivityList from "./ActivityList";
import LocationList from "./LocationList";
import { useRouter } from "next/navigation";
import { PATH_DASHBOARD } from "@/routes/paths";

const WhatsOnYourMindInputs = ({
  handleType,
  createPostView,
  handleCloseCreateModal,
  getAllPost,
  editPostData,
  setEditPostData
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      content: "",
      images: [],
      country: "Pakistan",
      city: "Karachi",
      activity_id: 1,
      feeling_id: 1,
      latitude: 24.8607,
      longitude: 67.0011,
      status: "active",
    },
  });

  console.log(editPostData);

  const router = useRouter();

  const [createPost, { isLoading }] = useCreatePostMutation();

  const [updatePost, { isLoading: updateloading }] = useUpdatePostMutation();

  const [visibility, setVisibility] = useState("Public");

  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  const [images, setImages] = useState([]);

  const fileInputRef = useRef()

  const [formData, setFormData] = useState({
    activity_id: 1,
    feeling_id: null,
    latitude: "",
    longitude: "",
    country: "",
    city: "",
    location: "",
  });

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEmojiPopup = () => setShowEmojiPicker(!showEmojiPicker);

  const handleEmojiClick = (emojiObject) => {
    try {
      let temp = getValues("postDescription");
      temp += emojiObject.emoji;
      setValue("postDescription", temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleOnChangeFile = async (event) => {
    const files = event.target.files;
    try {
      let temp = images?.length > 0 ? [...images] : [];
      if (temp.length < 10) {
        Array.from(files).forEach(file => {
          if (file) {
            let record = {
              image_file: file,
              media_url: URL.createObjectURL(file),
              media_type: file.type.split("/")[0],
            };
            temp.push(record);
          }
        });
        setImages(temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const removeFiles = async (index) => {
    try {
      let temp = [...images];
      temp.splice(index, 1);
      setImages(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!getValues("postDescription")) {
        toast.error("Write something here!");
        return;
      }

      const formRecord = new FormData();
      Object.keys(formData).map((item) => {
        formRecord.append(item, formData[item]);
      });

      formRecord.append("content", getValues("postDescription"));
      // formRecord.append("location", formData.location || '');
      formRecord.append("feeling_id", 1);
      formRecord.append("visibility", visibility?.toLowerCase());
      formRecord.append("status", "active");

      images.map(({ image_file }) => {
        formRecord.append("image", image_file);
      });

      let result;
      if (editPostData?.id) {
        const obj = { formData: formRecord, id: editPostData.id };
        result = await updatePost(obj);
      } else {
        result = await createPost(formRecord);
      }
      
      if (result?.error?.data?.code === 400) {
        toast.error(result?.error?.data?.message);
        return;
      }

      if (result?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }
      const { code } = result?.data;
      if (code === 200) {
        toast.success(`Post ${editPostData?.id ? "Updated" : "Created"} successfully!`);
        setEditPostData({});
        handleCloseCreateModal();
        getAllPost();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setImages(editPostData?.attachments);
    setValue("postDescription", editPostData?.content)
    setFormData({country: editPostData?.country, activity_id: editPostData?.activity_id !== null ? editPostData?.activity_id : 1 , location: editPostData?.location})
  },[editPostData]);

  const DynamicPost = {
    [POST_CREATION_TYPE.ACTIVITY]: (
      <ActivityList
        onSetActivity={(value) =>
          setFormData((pre) => ({ ...pre, activity_id: value }))
        }
        ActivityId={formData?.activity_id}
        formData={formData}
      />
    ),
    [POST_CREATION_TYPE.LOCATION]: (
      <LocationList
        onSetActivity={(value) =>
          setFormData((pre) => ({
            ...pre,
            ...value,
          }))
        }
        formData={formData}
      />
    ),
  };

  return (
    <div>
      <div className="card select-none cursor-pointer">
        <div className="flex flex-col md:flex-row justify-between pr-5">
          <div className="text-black flex items-center gap-4 cursor-pointer" onClick={() => router.push(PATH_DASHBOARD.profile.root)}>
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
          <div
            className="flex items-center mt-3 md:mt-0 md:justify-end gap-2 cursor-pointer "
            onClick={handleClick}
          >
            <div>
              <EarthIcon />
            </div>
            <div className="font-semibold w-16">{visibility}</div>
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
            className={`input-text border-none`}
          />

          <EmojIcon className="cursor-pointer" onClick={handleOpenEmojiPopup} />
          {showEmojiPicker && (
            <EmojiPicker
              className="emoji-picker-component emoji-picker "
              onEmojiClick={(e) => handleEmojiClick(e)}
              open={showEmojiPicker}
              style={{
                height: "300px",
                width: "350px",
                position: "absolute",
                top: 130,
                right: 0,
              }}
            />
          )}
        </div>

        <div className="flex gap-3">
          {!!images?.length &&
            images.map(({ media_url, media_type }, index) => (
              <div key={index} className="relative w-16 h-16">
                {media_type === "image" && (
                  <img
                    className="w-full h-full object-cover rounded-md"
                    src={media_url}
                  />
                )}

                {media_type === "video" && (
                  <video
                    className="w-full h-full object-cover rounded-md"
                    controls
                  >
                    <source src={media_url} />
                  </video>
                )}

                <button
                  className="absolute top-0 right-0 text-white bg-gray-400 p-1 rounded-full text-xs"
                  onClick={() => removeFiles(index)}
                  style={{
                    width: "20px",
                    height: "20px",
                    padding: "2px",
                  }}
                >
                  &#10005;
                </button>
              </div>
            ))}
        </div>

        <br></br>
        <hr></hr>
        <br></br>

        <div className="flex flex-col md:flex-row  w-full justify-between items-start md:items-center">
          <div className="flex w-auto justify-between flex-wrap gap-8">
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium"
              onClick={() => handleType(POST_CREATION_TYPE.LOCATION)}
            >
              <span className="px-2">
                <Location />
              </span>
              Location
            </button>
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center text-center text-sm font-medium"
            >
              <input
                type="file"
                id={`fileInput`}
                className="hidden"
                onChange={(e) => handleOnChangeFile(e)}
                multiple
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/jpg, video/mp4, video/webm, video/ogg, video/avi, video/mkv, video/3gpp"
              />

              <label htmlFor={`fileInput`} className="cursor-pointer flex">
                <span className="px-2">
                  <Gallery />
                </span>
                Image/Video
              </label>
            </button>
            {/* <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium"
              onClick={() => handleType(POST_CREATION_TYPE.ACTIVITY)}
            >
              <span className="px-2">
                <StarOutline />
              </span>
              Activity
            </button> */}
          </div>

          <div className="pr-5 flex items-end justify-end mt-5 md:mt-0">
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-btn-color px-8 text-center w-auto md:w-32 h-10 text-sm font-bold text-white flex justify-center items-center"
              disabled={isLoading}
            >
              {(isLoading || updateloading) ? <SpinnerLoading /> : editPostData ? "Edit Post" : "Post"}
            </button>
          </div>
        </div>
      </div>

      {DynamicPost[createPostView]}

      <CustomMenu handleClose={handleClose} anchorEl={anchorEl} open={open}>
        {["Public", "Friend", "Private"].map((item, index) => (
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

export default WhatsOnYourMindInputs;


