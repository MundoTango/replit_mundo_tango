"use client";

import RHFTextField from "@/components/FORMs/RHFTextField";

import Gallery from "@/components/SVGs/Gallery";

import Location from "@/components/SVGs/Location";

import StarOutline from "@/components/SVGs/StarOutline";

import { ProfileImage } from "@/utils/Images";

import DownIcon from "@/components/SVGs/DownIcon";

import EarthIcon from "@/components/SVGs/EarthIcon";

import EmojIcon from "@/components/SVGs/EmojIcon";

import { useForm } from "react-hook-form";

import { useAuthContext } from "@/auth/useAuthContext";

import CustomMenu from "@/components/Menus/CustomMenu";

import { MenuItem } from "@mui/material";

import { useEffect, useRef, useState } from "react";

import { POST_CREATION_TYPE } from "@/utils/enum";
import ActivityList from "./ActivityList";
import LocationList from "./LocationList";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "@/data/services/postApi";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { useRouter } from "next/navigation";
import { PATH_DASHBOARD } from "@/routes/paths";
import SpinnerLoading from "@/components/Loadings/Spinner";

const WhatsOnYourMindInputs = ({
  handleType,
  createPostView,
  refetch,
  editPostData,
  setEditPostData,
  getAllPost,
  setCreatePostModal,
  handleCloseCreateModal
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
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

  const { user } = useAuthContext();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [location, setLocation] = useState("Location");
  const [activity, setActivity] = useState("Activity");
  const [visibility, setVisibility] = useState("Public");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const open = Boolean(anchorEl);
  const [images, setImages] = useState([]);
  const router = useRouter();

  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();

  const [updatePost, { isLoading: updateloading }] = useUpdatePostMutation();

  const [formData, setFormData] = useState({
    activity_id: null,
    feeling_id: null,
    latitude: "",
    longitude: "",
    status: "active",
    country: "",
    city: "",
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const imageRef = useRef();

  const handleOnChangeFile = async (event) => {
    const files = event.target.files;
    try {
      let temp = [...images];
      if (temp.length < 10) {
        Array.from(files).forEach((file) => {
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

  const removeFiles = async (e, index) => {
    e.preventDefault();
    try {
      let temp = [...images];
      temp.splice(index, 1);
      setImages(temp);

      if (temp.length === 0) {
        imageRef.current.value = "";
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedImages((prevImages) => [...prevImages, ...files]);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setValue("content", message);
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prevImages) => {
      return prevImages.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data) => {
    try {
      if (!message) {
        toast.error("Write something here!");
        return;
      }
  
      const formData = new FormData();
      formData.append("content", message);
      formData.append("location", location);
      formData.append("activity_id", data.activity_id);
      formData.append("feeling_id", 1);
      formData.append("city", data.city);
      formData.append("country", data.country);
      formData.append("visibility", visibility?.toLowerCase());
      formData.append("status", data.status);
      formData.append("user_id", user.id);
  
      images.map(({ image_file }) => {
        formData.append("image", image_file);
      });
  
      let result;
      if (editPostData?.id) {
        const obj = { formData, id: editPostData.id };
        result = await updatePost(obj);
      } else {
        result = await createPost(formData);
      }
  
      const { code } = result?.data;
      if (code === 200) {
        handleCloseCreateModal();
        setEditPostData({});
        getAllPost();
        toast.success(
          `Post ${editPostData?.id ? "Updated" : "Created"} successfully!`
        );
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };
  

  useEffect(() => {
    setImages(editPostData?.attachments || []);
    // setValue("content", editPostData?.content);
    setMessage(editPostData?.content);
    setFormData({
      country: editPostData?.country,
      activity_id: editPostData?.activity_id,
    });
  }, [editPostData]);

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
      <div className="w-full rounded-[0.75rem] opacity-[0.75rem] bg-white p-[1.5rem] select-none">
        <form>
          <div className="flex justify-between">
            <div
              className="text-black flex items-center gap-4 cursor-pointer"
              onClick={() => router.push(PATH_DASHBOARD.profile.root)}
            >
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
              className="flex items-center justify-end  gap-2 cursor-pointer "
              onClick={handleClick}
            >
              <div>
                <EarthIcon />
              </div>
              <div className="font-semibold w-16">{visibility}</div>
              <DownIcon color="black" />
            </div>
          </div>

          <div className="my-5 pr-3 input-text flex items-center gap-3">
            <RHFTextField
              type={"text"}
              name="content"
              control={control}
              errors={errors}
              placeholder="What’s on your mind?"
              className={`input-text border-none`}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />

            <EmojIcon
              className="cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <EmojiPicker
                className="emoji-picker-component emoji-picker"
                onEmojiClick={(e) => handleEmojiClick(e)}
                open={showEmojiPicker}
                style={{
                  height: "300px",
                  width: "350px",
                  position: "absolute",
                  bottom: "110px",
                  overflow: "auto",
                  right: "20px",
                }}
              />
            )}
          </div>

          {/* <br></br> */}
          <div className="flex gap-3">
            {!!images?.length &&
              images.map(({ media_url, media_type }, index) => (
                <div key={index} className="relative w-16 h-16">
                  {media_type === "image" && (
                    <img
                      lassName="w-full h-full object-cover rounded-md"
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
                    onClick={(e) => removeFiles(e, index)}
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

          <div className="flex w-full justify-between items-center">
            <div className="flex w-auto justify-between flex-wrap gap-8">
              <button
                type="button"
                className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium"
                onClick={() => handleType(POST_CREATION_TYPE.LOCATION)}
              >
                <span className="px-2">
                  <Location />
                </span>
                {location}
              </button>
              <label className="text-light-gray-color text-md inline-flex items-center text-center text-sm font-medium">
                <span className="px-2">
                  <Gallery />
                </span>
                <input
                  type="file"
                  id={`fileInput`}
                  className="hidden"
                  onChange={(e) => handleOnChangeFile(e)}
                  multiple
                  ref={imageRef}
                  accept="image/jpeg, image/png, image/jpg"
                />
                Image/Video
              </label>
              <button
                type="button"
                className="text-light-gray-color text-md inline-flex items-center  text-center text-sm font-medium"
                onClick={() => handleType(POST_CREATION_TYPE.ACTIVITY)}
              >
                <span className="px-2">
                  <StarOutline />
                </span>
                {activity}
              </button>
            </div>

            <div className="flex items-end justify-end">
              <button
                className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white"
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                {isLoading || updateloading ? (
                  <SpinnerLoading />
                ) : editPostData ? (
                  "Edit Post"
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      {DynamicPost[createPostView] || null}

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
