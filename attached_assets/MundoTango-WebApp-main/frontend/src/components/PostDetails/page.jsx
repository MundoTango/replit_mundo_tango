"use client";
import SpinnerLoading from "@/components/Loadings/Spinner";
import {
    useDisLikePostMutation,
    useGetPostCommentsMutation,
    useGetPostDetailsQuery,
    useLikePostMutation,
    usePostCommentsMutation,
} from "@/data/services/postApi";
import { useEffect, useState } from "react";
import CommentsList from "../Comments/CommentsList";
import CommentIcon from "../SVGs/CommentIcon";
import HeartIcon from "../SVGs/HeartIcon";
import SendMessageIcon from "../SVGs/SendMessageIcon";
import { SwipperComponent } from "../Swiper";

function PostDetails({ id }) {
  const { data, refetch, isLoading, error } = useGetPostDetailsQuery({
    id: id,
  });
  const [getPostComments, {}] = useGetPostCommentsMutation();
  const [postComments, { isLoading: commentPostingLoading }] =
    usePostCommentsMutation();

  const [likePost, {}] = useLikePostMutation();

  const [disLikePost, {}] = useDisLikePostMutation();
  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState([]);
  const [commentReplyString, setCommentReplyString] = useState({});
  const LikeCommentShareClass =
    "flex items-center gap-2 cursor-pointer w-[140px]";

  const handleLikePosts = async (post_id, isLiked, index) => {
    let temp = JSON.parse(JSON.stringify(post));
    if (isLiked) {
      temp[index].is_liked = 0;
      temp[index].total_likes = temp[index].total_likes - 1;
      setPost(temp);
      await disLikePost(post_id);
      // if (result?.data?.code == 200) {
      // }
    } else {
      temp[index].is_liked = 1;
      temp[index].total_likes = temp[index].total_likes + 1;
      setPost(temp);
      await likePost({ post_id });
    }

    // refetch();
  };

  const handleCommentView = async (post_id, index) => {
    try {
      let temp = [...commentList];
      temp[0] = {
        show: false,
        loading: true,
        commentList: [],
      };
      setCommentList(temp);

      let result = await getPostComments({ id: post_id, page: commentPage });
      if (result?.data?.code == 200) {
        let temp = [...commentList];
        temp[0] = {
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

  const onCommentSubmit = async (comment, item, i) => {
    try {
      if (!comment) return;

      const body = {
        post_id: Number(id),
        comment: comment,
      };

      const result = await postComments(body);
      if (result?.data?.code === 200) {
        // getPostComments({ id: body?.post_id, page: commentPage })
        await handleCommentView(post[0]?.id, 0);
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

  const onLikeDislike = () => {
    handleLikePosts(Number(id), !!post[0]?.is_liked, 0);
  };

  useEffect(() => {
    if (data?.data?.id) {
      const resp = [data?.data];
      setPosts(resp);
    }
  }, [data]);

  useEffect(() => {
    const posting = post?.data?.length > 0 ? posts[0] : posts;
    setPost(posting);
  }, [posts]);

  console.log(post);
  //  const handleCommentView = () => handleCommentView(item.id, index)
  // commentList={commentList}

  // setCommentString={(e) => onChangeComment(e, index)}
  // commentString={commentString[index]}

  // showHideReplyInput={showHideReplyInput}
  // onCommentLike={(params) => {
  //   onCommentLike(params, { post_id: item.id, index });
  // }}
  // onChangeReplyComment={onChangeReplyComment}
  // commentReplyString={commentReplyString}
  // onSubmitCommentReply={(record) =>
  //   onSubmitCommentReply(record, item.id)
  // }
  if (isLoading) {
    return (
      <div className="md:mt-6 bg-white centered_card md:mr-6 h-screen">
        <div className="flex items-center justify-center h-20">
          <SpinnerLoading />
        </div>
      </div>
    );
  }

  return (
    <main className="md:mt-6 md:mr-6 md:pr-6 flex flex-col bg-background-color animate-fade-up">
      <div className="rounded-2xl bg-white overflow-hidden w-full">
        {post.length > 0 && (
          <div className="flex mt-2 w-full overflow-hidden">
            <div className="w-[300px] h-[200px] md:h-full md:w-[1560px] lg:[1560px]">
              <SwipperComponent
                loop={true}
                className="main-slider"
                freeMode={true}
                watchSlidesProgress={true}
                slidesPerView={post[0]?.attachments?.length > 1 ? 2 : 0}
                spaceBetween={10}
              >
                {post[0]?.attachments?.map((x) => (
                  <div key={x?.id}>
                    {x?.media_type === "video" ? (
                      <video
                        className="relative p-5 space-y-2 rounded-t-xl flex items-end h-full w-full overflow-hidden"
                        controls
                        src={x?.media_url}
                        alt={`Uploaded Video ${index}`}
                        autoPlay={post[0]?.attachments?.length === 1}
                        loop={post[0]?.attachments?.length === 1}
                        style={{
                          maxHeight: "290px",
                          objectFit: "contain",
                          backgroundColor: "black",
                          height: "290px",
                        }}
                      ></video>
                    ) : (
                      <img
                        src={x?.media_url}
                        alt="card-image"
                        className="relative p-5 space-y-2 rounded-t-xl flex items-end h-full w-full overflow-hidden bg-contain"
                        style={{
                          maxHeight: "290px",
                          objectFit: "contain",
                          backgroundColor: "black",
                          height: "290px",
                        }}
                      />
                    )}
                  </div>
                ))}
              </SwipperComponent>
            </div>
          </div>
        )}

        <div className="text-gray-text-color text-base font-semibold py-5 px-4">
          {post[0]?.content}
        </div>

        <br />

        <div className="flex items-center justify-around md:justify-between text-light-gray-color md:gap-0 w-1/3">
          <div
            className={`${LikeCommentShareClass} justify-start sm:justify-center`}
            onClick={onLikeDislike}
          >
            <div>
              <HeartIcon color={post[0]?.is_liked ? "#EB2560" : "#94A3B8"} />
            </div>
            <div
              className={`${post[0]?.is_liked ? "text-heart-color" : ""} flex gap-1`}
            >
              {post[0]?.total_likes}{" "}
              <span className="hidden md:block">Likes</span>
            </div>
          </div>
          <div
            className={`${LikeCommentShareClass} justify-center sm:justify-start`}
            onClick={
              commentList[0]?.show
                ? () => {}
                : !!post[0]?.total_comments
                  ? () => handleCommentView(post[0]?.id, 0)
                  : () => {}
            }
          >
            <div>
              <CommentIcon />
            </div>
            <div className="flex gap-1">
              {post[0]?.total_comments}{" "}
              <span className="hidden md:block">Comments</span>
            </div>
          </div>
        </div>

        <br />
        <hr />

        {commentList[0]?.loading ? (
          <div className="my-3 flex items-center justify-center">
            <SpinnerLoading />
          </div>
        ) : (
          commentList[0]?.show && (
            <div className="max-h-[400px] overflow-auto comment-section my-2 pr-4">
              <CommentsList
                showHideReplyInput={showHideReplyInput}
                commentList={commentList[0]}
                parentIndex={0}
                onCommentLike={(params) => {
                  onCommentLike(params, { post_id: post[0]?.id, index: 0 });
                }}
                onChangeReplyComment={onChangeReplyComment}
                commentReplyString={commentReplyString}
                onSubmitCommentReply={(record) =>
                  onSubmitCommentReply(record, post[0]?.id)
                }
              />
            </div>
          )
        )}

        <div className="my-5 pr-3 input-text flex items-center gap-3 relative">
          <input
            placeholder="Write your comment here"
            className="input-text border-none shadow-none w-full rounded-lg p-3 pl-5 text-base outline-none md:max-w-[900px]"
            onChange={(e) => setCommentText(e.target.value)}
            value={commentText || ""}
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
        </div>
      </div>
    </main>
  );
}

export default PostDetails;
