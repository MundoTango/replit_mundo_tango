"use client";

import SpinnerLoading from "@/components/Loadings/Spinner";

import {
  useCommentLikeMutation,
  useDisLikeCommentMutation,
  useDisLikePostMutation,
  useGetAllPostsMutation,
  useGetPostCommentsMutation,
  useLikePostMutation,
  usePostCommentsMutation,
} from "@/data/services/postApi";

import { useEffect, useState } from "react";

import NewFeedEvents from "./NewFeedEvents";

import PostLikeComment from "./PostLikeComment";

import WhatsOnYourMind from "./WhatsOnYourMind";

import ModelComponent from "@/components/Modal/CustomModal";

import FriendShipCard from "@/components/Friends/FriendShipCard";

import CustomInfiniteScroll from "@/components/InfiniteScroll/InfiniteScroll";

import WhatsOnYourMindInputs from "./WhatsOnYourMindInputs";

import SharedPostView from "./SharedPostView";

import ReportPostView from "./ReportPostView";

function TimeLine() {
  const [likePost, {}] = useLikePostMutation();

  const [disLikePost, {}] = useDisLikePostMutation();

  const [getPostComments, {}] = useGetPostCommentsMutation();

  const [postComments, { isLoading: commentPostingLoading }] =
    usePostCommentsMutation();

  const [commentLike, {}] = useCommentLikeMutation();

  const [disLikeComment, {}] = useDisLikeCommentMutation();

  const [postPage, setPostPage] = useState(1);

  const [visibility, setVisibility] = useState("Public");

  const [getAllPosts, { isLoading }] = useGetAllPostsMutation();

  const [postList, setPostList] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [commentList, setCommentList] = useState([]);

  const [commentPage, setCommentPage] = useState(1);

  const [commentString, setCommentString] = useState({});

  const [commentReplyString, setCommentReplyString] = useState({});

  const [friendShipModal, setFriendShipModal] = useState(false);

  const [friendId, setFriendId] = useState("");

  const [createPostModal, setCreatePostModal] = useState(false);

  const [createPostView, setCreatePostView] = useState("");

  const [shareModal, setShareModal] = useState(false);

  const [sharedPostRecord, setSharedPostRecord] = useState({});

  const [reportModal, setReportModal] = useState(false);

  const handleOpenFriendModal = () => setFriendShipModal(true);

  const handleCloseFriendModal = () => setFriendShipModal(false);

  const [editPostData, setEditPostData] = useState(null);

  const [editModal, setEditModal] = useState(false);

  useEffect(() => {
    if (postPage > 1) {
      getAllPost();
    }
  }, [postPage]);

  useEffect(() => {
    if (visibility) {
      updateVisibilityPost();
    }
  }, [visibility]);

  const getAllPost = async () => {
    const postvisible = visibility === "All" ? "" : visibility?.toLowerCase();
    try {
      let temp = [...postList];
      let result = await getAllPosts({
        visibility: postvisible,
        page: postPage,
      });

      if (result?.data?.code === 200 && result?.data?.data?.length) {
        temp.push(...result?.data?.data);
        setPostList(temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const updateVisibilityPost = async () => {
    try {
      const postvisible = visibility === "All" ? "" : visibility?.toLowerCase();
      let result = await getAllPosts({
        visibility: postvisible,
        page: postPage,
      });

      if (result?.data?.code === 200) {
        if (!pagination) {
          setPagination(result?.data?.links);
        }
        setPostList(result?.data?.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleLikePosts = async (post_id, isLiked, index) => {
    let temp = JSON.parse(JSON.stringify(postList));
    if (isLiked) {
      temp[index].is_liked = 0;
      temp[index].total_likes = temp[index].total_likes - 1;
      setPostList(temp);
      await disLikePost(post_id);
      // if (result?.data?.code == 200) {
      // }
    } else {
      temp[index].is_liked = 1;
      temp[index].total_likes = temp[index].total_likes + 1;
      setPostList(temp);
      await likePost({ post_id });
    }

    // refetch();
  };

  const handleCommentView = async (post_id, index) => {
    try {
      let temp = [...commentList];
      temp[index] = {
        show: false,
        loading: true,
        commentList: [],
      };
      setCommentList(temp);

      let result = await getPostComments({ id: post_id, page: commentPage });
      if (result?.data?.code == 200) {
        let temp = [...commentList];
        temp[index] = {
          show: true,
          loading: false,
          commentList: result?.data?.data,
        };
        setCommentList(temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const onChangeComment = async (e, i) => {
    try {
      let temp = { ...commentString };
      if (typeof e === "string") {
        temp[i] = temp[i] + "" + e;
      } else {
        temp[i] = e.target?.value;
      }

      setCommentString(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const onCommentSubmit = async (item, i, comment) => {
    try {
      if (!comment) return;

      const body = {
        post_id: item.id,
        comment: comment,
      };

      const result = await postComments(body);
      if (result?.data?.code === 200) {
        await handleCommentView(item.id, i);
        // setCommentString((pre) => ({
        //   ...pre,
        //   [i]: "",
        // }));
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const showHideReplyInput = async (parentIndex, index) => {
    try {
      let temp = JSON.parse(JSON.stringify(commentList));
      temp[parentIndex].commentList[index].replyInput =
        !temp[parentIndex].commentList[index].replyInput;
      setCommentList(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const onCommentLike = async (params, post) => {
    try {
      let temp = JSON.parse(JSON.stringify(commentList));

      setCommentList(temp);
      if (params?.is_liked) {
        temp[post.index].commentList[params.commentIndex].is_liked = 0;
        temp[post.index].commentList[params.commentIndex].total_likes--;
        setCommentList(temp);
        await disLikeComment(params.id);
      } else {
        temp[post.index].commentList[params.commentIndex].is_liked = 1;
        temp[post.index].commentList[params.commentIndex].total_likes++;
        setCommentList(temp);
        await commentLike({ comment_id: params.id });
      }

      // await getCommentLists(post.post_id, post.index);
    } catch (e) {
      console.log(e.message);
    }
  };

  const onChangeReplyComment = async (e, postIndex, commentIndex) => {
    try {
      let temp = { ...commentReplyString };
      temp[`${postIndex}"_"${commentIndex}`] =
        typeof e === "string" ? e : e.target.value;
      setCommentReplyString(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const onSubmitCommentReply = async (record, post_id) => {
    try {
      let comment =
        commentReplyString[`${record.parentIndex}"_"${record.index}`];

      if (!comment) return;

      const body = {
        comment,
        parent_id: record.comment_id,
        post_id: post_id,
      };

      showHideReplyInput(record?.parentIndex, record?.index);

      const result = await postComments(body);
      if (result?.data?.code === 200) {
        await getCommentLists(post_id, record.parentIndex);

        let temp = { ...commentReplyString };
        temp[`${record.parentIndex}"_"${record.index}`] = "";
        setCommentReplyString(temp);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getCommentLists = async (post_id, index) => {
    try {
      let result = await getPostComments({ id: post_id, page: commentPage });
      if (result?.data?.code == 200) {
        let temp = [...commentList];
        temp[index] = {
          show: true,
          loading: false,
          commentList: result?.data?.data,
        };
        setCommentList(temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getRecords = async () => {
    console.log("getRecords");
    try {
      let temp = postPage;
      temp = temp + 1;
      setPostPage(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const refreshPostList = async () => {
    try {
      const postvisible = visibility === "All" ? "" : visibility?.toLowerCase();
      let result = await getAllPosts({
        visibility: postvisible,
        page: postPage,
      });

      if (result?.data?.code === 200 && result?.data?.data?.length) {
        setPostList(result?.data?.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-5 overflow-hidden">
      <div className="col-span-12 lg:col-span-9">
        <div className="px-2 py-2">
          <div>
            <WhatsOnYourMind
              visibility={visibility}
              setVisibility={setVisibility}
              handleModalOpen={(type) => {
                setCreatePostModal(true);
                setCreatePostView(type);
                setEditPostData(null);
              }}
            />
          </div>
          {isLoading && !postList?.length ? (
            <div className="flex items-center justify-center">
              <SpinnerLoading />
            </div>
          ) : !postList?.length ? (
            <div className="flex items-center justify-center">
              <p className="w-full text-center text-light-gray-color" >No Posts available</p>
            </div>
          ) : (
            <CustomInfiniteScroll
              dataLength={postList?.length}
              LoadingScreen={
                <div className="flex items-center justify-center">
                  <SpinnerLoading />
                </div>
              }
              getRecords={getRecords}
              hasMore={postList?.length != pagination?.total_records}
            >
              {!!postList?.length &&
                postList?.map((item, index) => (
                  <PostLikeComment
                    key={index}
                    item={item}
                    index={index}
                    handleCommentView={() => handleCommentView(item.id, index)}
                    commentList={commentList}
                    onLikeDislike={() => {
                      handleLikePosts(item.id, !!item?.is_liked, index);
                    }}
                    setCommentString={(e) => onChangeComment(e, index)}
                    commentString={commentString[index]}
                    onCommentSubmit={(comment) =>
                      onCommentSubmit(item, index, comment)
                    }
                    showHideReplyInput={showHideReplyInput}
                    onCommentLike={(params) => {
                      onCommentLike(params, { post_id: item.id, index });
                    }}
                    onChangeReplyComment={onChangeReplyComment}
                    commentReplyString={commentReplyString}
                    onSubmitCommentReply={(record) =>
                      onSubmitCommentReply(record, item.id)
                    }
                    handleOpenFriendModal={() => {
                      handleOpenFriendModal();
                      setFriendId(
                        item.is_shared
                          ? item?.shared_by_user?.id
                          : item?.user_id
                      );
                    }}
                    onShareOpenPopup={() => {
                      setShareModal(true);
                      setSharedPostRecord(item);
                    }}
                    commentPostingLoading={commentPostingLoading}
                    onOpenReportModal={() => {
                      setReportModal(true);
                      setSharedPostRecord(item);
                    }}
                    getAllPost={refreshPostList}
                    editPostData={editPostData}
                    setEditPostData={setEditPostData}
                    setEditModal={setEditModal}
                  />
                ))}
            </CustomInfiniteScroll>
          )}

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
            open={createPostModal || editModal}
            handleClose={() => {
              setCreatePostModal(false);
              setEditModal(false);
              setEditPostData(null);
            }}
            // width={"60%"}
            className={"w-[95%] md:w-[60%]"}
            bgColor={"rgb(0 0 0 / 7%)"}
          >
            <WhatsOnYourMindInputs
              createPostView={createPostView}
              handleType={(type) => {
                setCreatePostView(type);
              }}
              handleCloseCreateModal={() => {
                setCreatePostModal(false);
                setEditModal(false);
                setEditPostData(null);
              }}
              getAllPost={refreshPostList}
              editPostData={editPostData}
              setEditPostData={setEditPostData}
            />
          </ModelComponent>

          <ModelComponent
            open={shareModal}
            handleClose={() => setShareModal(false)}
            // width={"50%"}
            className={"w-[95%] md:w-[50%]"}
          >
            <SharedPostView
              sharedPostRecord={sharedPostRecord}
              handleClose={() => setShareModal(false)}
              getAllPost={refreshPostList}
            />
          </ModelComponent>

          <ModelComponent
            open={reportModal}
            handleClose={() => setReportModal(false)}
            // width={"50%"}
            className={"w-[95%] md:w-[50%]"}
          >
            <ReportPostView
              handleClose={() => setReportModal(false)}
              reportPostRecord={sharedPostRecord}
              getAllPost={refreshPostList}
            />
          </ModelComponent>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 -pt-6 -pr-6 h-screen">
        <NewFeedEvents />
      </div>
    </div>
  );
}

export default TimeLine;
