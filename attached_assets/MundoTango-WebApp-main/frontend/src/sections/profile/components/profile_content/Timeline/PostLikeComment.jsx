"use client";

import EmojIcon from "@/components/SVGs/EmojIcon";

import KababMenu from "@/components/SVGs/KababMenu";

import CommentIcon from "@/components/SVGs/CommentIcon";

import HeartIcon from "@/components/SVGs/HeartIcon";

import ShareIcon from "@/components/SVGs/ShareIcon";

import CommentsList from "@/components/Comments/CommentsList";

import SpinnerLoading from "@/components/Loadings/Spinner";

import SendMessageIcon from "@/components/SVGs/SendMessageIcon";

import { timeAgo } from "@/utils/helper";

import EmojiPicker from "emoji-picker-react";

import { memo, useEffect, useState } from "react";

import { useAuthContext } from "@/auth/useAuthContext";

import PopupMenu from "@/components/Menus/PopupMenu";

import {
  useDeletePostMutation,
  useHidePostMutation,
  useSavePostMutation,
  useUnSavePostMutation,
} from "@/data/services/postApi";

import ModelComponent from "@/components/Modal/CustomModal";
import DeleteWarning from "@/components/WarningPopup/DeleteWarning";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PATH_DASHBOARD } from "@/routes/paths";
import Link from "next/link";
import PreviewImages from "@/components/SliderImages/PreviewImages";
import moment from "moment";
import { useGetAllEventsQuery } from "@/data/services/eventAPI";
import { useGetEventTypesQuery } from "@/data/services/friendApi";

const LikeCommentShareClass =
  "flex items-center gap-2 cursor-pointer w-[110px]";

const PostLikeComment = memo(
  ({
    item,
    handleCommentView,
    commentList,
    index,
    onLikeDislike,
    setCommentString,
    commentString,
    onCommentSubmit,
    showHideReplyInput,
    onCommentLike,
    onChangeReplyComment,
    commentReplyString,
    onSubmitCommentReply,
    handleOpenFriendModal,
    onShareOpenPopup,
    commentPostingLoading,
    getAllPost,
    onOpenReportModal,
    setEditPostData,
    setEditModal,
  }) => {
    const { user } = useAuthContext();

    const router = useRouter();

    const [savePost, { isLoading: savePostLoading }] = useSavePostMutation();

    const [hidePost, { isLoading: hidePostLoading }] = useHidePostMutation();

    const [unSavePost, { isLoading: unSavePostLoading }] =
      useUnSavePostMutation();

    const [deletePost, { isLoading: deletePostLoading }] =
      useDeletePostMutation();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [commentText, setCommentText] = useState("");

    const [postDeleteWarning, setPostDeleteWarning] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const [previewImage, setPreviewImage] = useState(false);

    const [Images, setImages] = useState([]);

    const [menuList, setMenuList] = useState([]);

    const { data: events } = useGetAllEventsQuery();

    const { data: event_type, isLoading: typeLoading } = useGetEventTypesQuery();

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleEmojiClick = (emojiObject) => {
      setCommentText((pre) => pre + emojiObject.emoji);
    };

    const onSavePost = async () => {
      try {
        const body = {
          post_id: item?.id,
        };

        const result = await savePost(body);

        const { code } = result?.data;

        if (code === 200) {
          toast.success("Post saved successfully");
          getAllPost();
          handleClose();
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const onRemoveSavePost = async () => {
      try {
        const result = await unSavePost(item?.id);
        const { code } = result?.data;
        if (code === 200) {
          toast.success("Post saved successfully");
          getAllPost();
          handleClose();
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const onHidePost = async () => {
      try {
        const body = {
          post_id: item?.id,
        };

        const result = await hidePost(body);

        const { code } = result?.data;

        if (code === 200) {
          toast.success("Post hide successfully");
          getAllPost();
          handleClose();
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const onDeletePost = async () => {
      try {
        let temp = [];

        if (item?.is_shared) {
          temp = item?.shared_by_user?.id === user.id;
        } else {
          temp = item?.user_id === user.id;
        }

        if (!temp) {
          toast.error("You can't delete this post.");
          return;
        }

        const result = await deletePost(item?.id);

        const { code } = result?.data;

        if (code === 200) {
          toast.success("Post delete successfully");
          getAllPost();
          handleClose();
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const MenuList = [
      {
        title: "Report post",
        onClick: () => {
          onOpenReportModal();
          handleClose();
        },
      },
    ];

    useEffect(() => {
      if (item?.user_id === user.id) {
        setMenuList((prevMenuList) => [
          ...MenuList,
          {
            title: "Edit Post",
            onClick: () => {
              setEditPostData(item);
              setEditModal(true);
            },
          },
          {
            title: <div className="text-secondary-red">Delete post</div>,
            onClick: () => {
              handleClose();
              setPostDeleteWarning(true);
            },
          },
        ]);
      } else {
        setMenuList([
          {
            title: "Report post",
            onClick: () => {
              onOpenReportModal();
              handleClose();
            },
          },
        ]);
      }
    }, [item, user.id, setEditPostData, setEditModal]);

    let is_shared = !!item?.is_shared;
    return (
      <div className="card select-none animate-fade-up" id="scrolling">
        {is_shared && (
          <div className="flex justify-between mb-4 pr-5">
            <div
              className="text-black flex items-center gap-4"
              // onClick={() => {
              //   if (item?.user_id !== user?.id) {
              //     router.push(
              //       PATH_DASHBOARD.profile.userProfile(item?.user_id)
              //     );
              //   }
              // }}
            >
              <Link
                href={
                  item?.user_id === user?.id
                    ? PATH_DASHBOARD.profile.root
                    : PATH_DASHBOARD.profile.userProfile(item?.user_id)
                }
              >
                <img
                  src={item?.shared_by_user?.user_images[0]?.image_url}
                  alt=""
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </Link>
              <div>
                <div className="text-sm font-semibold">
                  {item?.shared_by_user?.name}
                </div>
                <div className="text-xs text-gray-text-color">
                  {timeAgo(item?.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 cursor-pointer">
              {user.id !== item?.shared_by_user?.id && (
                <div
                  onClick={handleOpenFriendModal}
                  className="text-btn-color text-sm font-bold"
                >
                  See Friendship
                </div>
              )}

              <div onClick={handleClick}>
                <KababMenu />
              </div>
            </div>
          </div>
        )}

        <div className="pr-5">
          <div className={is_shared ? "border py-3 px-5 mb-2 rounded-2xl" : ""}>
            <div className={`flex justify-between`}>
              <div className="text-black flex items-center gap-4">
                <Link
                  href={
                    item?.user_id === user?.id
                      ? PATH_DASHBOARD.profile.root
                      : PATH_DASHBOARD.profile.userProfile(item?.user_id)
                  }
                >
                  <img
                    src={item?.user?.user_images[0]?.image_url}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </Link>
                <div>
                  <div className="text-sm font-semibold">
                    {item?.user?.name}
                  </div>
                  {!item?.is_shared && (
                    <div className="text-xs text-gray-text-color">
                      {timeAgo(item?.createdAt)}
                    </div>
                  )}
                </div>
                <div>
                  {/* {item?.user?.tango_activities?.map((tag, index) => (
                <Tag name={tag} key={index} className="text-sm" />
              ))} */}
                </div>
              </div>
              <div className="flex items-center gap-4 cursor-pointer">
                {user.id !== item.user_id && !is_shared && (
                  <div
                    onClick={handleOpenFriendModal}
                    className="text-btn-color text-sm font-bold"
                  >
                    See Friendship
                  </div>
                )}
                {!is_shared && (
                  <div onClick={handleClick}>
                    <KababMenu />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-text-color text-base font-semibold py-5">
                {item?.content}
              </div>

              {!!item?.attachments?.length && (
                <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap lg:gap-0 ">
                  {item?.attachments.map(({ media_url, media_type }, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setImages(item?.attachments);
                        setPreviewImage(true);
                      }}
                      className="cursor-pointer"
                    >
                      {media_type === "image" ? (
                        <img
                          className="object-cover w-72 md:w-[15rem] h-[180px] mb-3 pr-2 rounded-xl"
                          loading="lazy"
                          src={media_url}
                        />
                      ) : media_type === "video" ? (
                        <video
                          className="object-cover w-72 md:w-[15.5rem] h-[180px] mb-3 pr-2 rounded-xl"
                          controls
                        >
                          <source src={media_url} />
                        </video>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {!!item?.user_travels?.length && (
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="text-xl font-semibold text-gray-700 mb-4">
                    {item?.user?.name} Travel Details
                  </h5>
                  <div className="space-y-4">
                    {item?.user_travels.map(
                      (
                        {
                          event_name,
                          start_date,
                          event_type_id,
                          city,
                          end_date,
                          id,
                        },
                        index
                      ) => {
                        const name = events?.data?.find((x) => x?.id == event_name);
                        const type = event_type?.data?.find((x) => x?.id == event_type_id);
                        return (
                        <div
                          key={id || index}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all ease-in-out"
                        >
                          <div className="flex justify-between text-sm text-gray-600">
                            <div className="font-medium text-gray-800">
                              {`${moment(start_date).format("MMM D")} - ${moment(end_date).format("MMM D")}`}
                            </div>
                            <div className="text-gray-500 italic">
                              Event Type: {type?.name || "N/A"}
                            </div>
                          </div>
                          <div
                            className="mt-2 text-lg font-semibold text-gray-700 truncate"
                            title={name?.name}
                          >
                            {name?.name || "Event Name N/A"}
                          </div>
                          <div className="mt-1 text-gray-600" title={city}>
                            {city || "City N/A"}
                          </div>
                        </div>
                      )}
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr />
          <br />

          <div className="flex items-center justify-around md:justify-between text-light-gray-color flex-wrap md:gap-0">
            <div
              className={`${LikeCommentShareClass} justify-start sm:justify-center`}
              onClick={onLikeDislike}
            >
              <div>
                <HeartIcon color={item?.is_liked ? "#EB2560" : "#94A3B8"} />
              </div>
              <div
                className={`${item?.is_liked ? "text-heart-color" : ""} flex gap-1`}
              >
                {item?.total_likes}{" "}
                <span className="hidden md:block">Likes</span>
              </div>
            </div>
            <div
              className={`${LikeCommentShareClass} justify-center sm:justify-start`}
              onClick={
                commentList[index]?.show
                  ? () => {}
                  : !!item?.total_comments
                    ? handleCommentView
                    : () => {}
              }
            >
              <div>
                <CommentIcon />
              </div>
              <div className="flex gap-1">
                {item?.total_comments}{" "}
                <span className="hidden md:block">Comments</span>
              </div>
            </div>
            <div
              className={`${LikeCommentShareClass} justify-end sm:justify-start`}
              onClick={onShareOpenPopup}
            >
              <div>
                <ShareIcon />
              </div>
              <div className="flex gap-1">
                {item?.total_shares}{" "}
                <span className="hidden md:block">Shares</span>
              </div>
            </div>
          </div>

          <br />
          <hr />

          {commentList[index]?.loading ? (
            <div className="my-3 flex items-center justify-center">
              <SpinnerLoading />
            </div>
          ) : (
            commentList[index]?.show && (
              <div className="max-h-[400px] overflow-auto comment-section my-2 pr-4">
                <CommentsList
                  showHideReplyInput={showHideReplyInput}
                  commentList={commentList[index]}
                  parentIndex={index}
                  onCommentLike={onCommentLike}
                  onChangeReplyComment={onChangeReplyComment}
                  commentReplyString={commentReplyString}
                  onSubmitCommentReply={onSubmitCommentReply}
                />
              </div>
            )
          )}

          <div className="my-5 pr-3 input-text flex items-center gap-3 relative">
            <input
              placeholder="Write your comment here"
              className="input-text border-none shadow-none w-full rounded-lg p-3 pl-5 text-base outline-none"
              onChange={(e) => setCommentText(e.target.value)}
              value={commentText || ""}
            />

            <EmojIcon
              className="cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <button className="outline-gray-text-color outline-1 w-10 h-8 flex items-center justify-center rounded-md">
              {commentPostingLoading ? (
                <SpinnerLoading />
              ) : (
                <SendMessageIcon
                  onClick={() => {
                    onCommentSubmit(commentText);
                    setCommentText("");
                  }}
                />
              )}
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                className="emoji-picker-component emoji-picker"
                onEmojiClick={handleEmojiClick}
                open={showEmojiPicker}
                style={{
                  height: "300px",
                  width: "350px",
                  position: "absolute",
                  top: 50,
                  right: 0,
                }}
              />
            )}
          </div>
        </div>

        <PopupMenu
          anchorEl={anchorEl}
          open={open}
          handleClose={handleClose}
          menuList={menuList}
        />

        <ModelComponent
          open={postDeleteWarning}
          handleClose={() => setPostDeleteWarning(false)}
          // width={"50%"}
          className={"w-[95%] md:w-[50%]"}
        >
          <DeleteWarning
            title={"Delete Warning"}
            message={"Are you really want to delete this post?"}
            onClick={onDeletePost}
            handleClose={() => setPostDeleteWarning(false)}
          />
        </ModelComponent>

        <ModelComponent
          open={previewImage}
          handleClose={() => setPreviewImage(false)}
          // width={"50%"}
          className={"w-[95%] md:w-[50%]"}
        >
          <PreviewImages setImageModal={setPreviewImage} images={Images} />
        </ModelComponent>
      </div>
    );
  }
);

export default PostLikeComment;
