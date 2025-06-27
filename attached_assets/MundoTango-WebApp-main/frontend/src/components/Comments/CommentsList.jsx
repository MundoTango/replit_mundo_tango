import { timeAgo } from "@/utils/helper";
import SendMessageIcon from "../SVGs/SendMessageIcon";
import { memo } from "react";

const CommentsList = memo(
  ({
    commentList,
    showHideReplyInput,
    parentIndex,
    onCommentLike,
    onChangeReplyComment,
    commentReplyString,
    onSubmitCommentReply,
  }) => {
    // const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // const handleEmojiClick = (emojiObject, index) => {
    //   console.log(emojiObject?.emoji, index);
    //   const text =
    //     commentReplyString[`${parentIndex}"_"${index}`] + emojiObject?.emoji;
    //   onChangeReplyComment(text, parentIndex);
    // };

    return (
      !!commentList?.commentList?.length &&
      commentList?.commentList?.map(
        ({ id, comment, user, replies, createdAt, is_liked }, index) => (
          <div key={index}>
            <div className="mt-4 flex gap-2 ">
              <div>
                <img
                  src={user?.user_images[0]?.image_url}
                  alt=""
                  className="w-10 h-10 object-cover rounded-full"
                  loading="lazy"
                />
              </div>
              <div className="w-full">
                <div className="bg-[#F0F2F5] px-5 py-2 rounded-2xl">
                  <div className="font-bold text-[14px]">{user?.name}</div>
                  <div className="text-sm leading-5">{comment}</div>
                </div>
                <div className="flex text-gray-text-color text-sm gap-6 pl-2 pt-2 cursor-pointer">
                  <div
                    onClick={() =>
                      onCommentLike({ id, is_liked, commentIndex: index })
                    }
                    className={is_liked ? "text-heart-color font-semibold" : ""}
                  >
                    Like
                  </div>
                  <div onClick={() => showHideReplyInput(parentIndex, index)}>
                    Reply
                  </div>
                  <div>{timeAgo(createdAt)}</div>
                </div>

                {!!commentList?.commentList[index]?.replyInput && (
                  <div className="relative flex gap-3 items-center justify-between bg-background-color rounded-lg my-2 pr-3">
                    <input
                      type="text"
                      name="reply"
                      className="input-text border-none shadow-none  w-full rounded-lg text-base outline-none h-12 px-3"
                      placeholder="Write here reply"
                      onChange={(e) =>
                        onChangeReplyComment(e, parentIndex, index)
                      }
                      value={
                        commentReplyString[`${parentIndex}"_"${index}`] || ""
                      }
                    />

                    {/* <EmojIcon
                    className="cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  /> */}
                    {/* {showEmojiPicker && (
                    <EmojiPicker
                      className="emoji-picker-component emoji-picker"
                      onEmojiClick={(e) => handleEmojiClick(e, index)}
                      open={showEmojiPicker}
                      style={{
                        height: "300px",
                        width: "350px",
                        position: "absolute",
                        top: 50,
                        right: 0,
                        zIndex: 999,
                      }}
                    />
                  )} */}

                    <SendMessageIcon
                      onClick={() =>
                        onSubmitCommentReply({
                          comment_id: id,
                          parentIndex,
                          index,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {!!replies?.length &&
              replies?.map(({ id, comment, user, createdAt }, index) => (
                <div key={index} className="mt-5 ml-24 flex gap-2">
                  <div>
                    <img
                      src={user?.user_images[0]?.image_url}
                      alt=""
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  </div>
                  <div className="w-full">
                    <div className="bg-[#F0F2F5] px-5 py-2 rounded-2xl">
                      <div className="font-bold text-[14px]">{user?.name}</div>
                      <div className="text-sm leading-5">{comment}</div>
                    </div>
                    <div className="flex text-gray-text-color text-sm gap-6 pl-2 pt-2 cursor-pointer">
                      <div>{timeAgo(createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}

            {/* <div className="mt-5 ml-24 flex gap-2">
        <div>
          <img src={ImageOne} alt="" className="w-20 rounded-full" />
        </div>
        <div>
          <div className="bg-[#F0F2F5] px-5 py-2 rounded-2xl">
            <div className="font-bold text-[14px]">Mike Johnson</div>
            <div className="text-sm leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam
              nisi, cras neque, lorem vel vulputate vitae aliquam. Pretium
              tristique nisi, ut commodo fames. Porttitor et sagittis egestas
              vitae metus, odio tristique amet, duis. Nunc tortor elit aliquet
              quis in mauris.
            </div>
          </div>
          <div className="flex text-gray-text-color text-sm gap-6 pl-2 pt-2 cursor-pointer">
            <div>Like</div>
            <div>Reply</div>
            <div>time</div>
          </div>
        </div>
      </div> */}
          </div>
        )
      )
    );
  }
);

export default CommentsList;
