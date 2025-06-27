import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { SwipperComponent } from "@/components/Swiper";
import { useSharePostMutation } from "@/data/services/postApi";
import { StringSplice, timeAgo } from "@/utils/helper";
import React, { memo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FacebookIcon, FacebookShareButton } from "react-share";

const SharedPostView = memo(
  ({
    handleClose,
    sharedPostRecord,
    refetch,
    group_id,
    event_id,
    user_id,
    getAllPost,
  }) => {
    const [sharePost, { isLoading: sharePostLoading }] = useSharePostMutation();

    const {
      control,
      formState: { errors },
      getValues,
      reset,
    } = useForm({
      mode: "onChange",
      defaultValues: {
        caption: "",
      },
    });

    const handleShareSubmit = async () => {
      try {
        const caption = getValues("caption");

        const body = {
          post_id: !!sharedPostRecord?.is_shared
            ? sharedPostRecord?.original_post_id
            : sharedPostRecord?.id,
          caption,
          ...(group_id && { group_id }),
          ...(event_id && { event_id }),
          ...(user_id && { user_id }),
        };

        const result = await sharePost(body);

        const { code } = result?.data;

        if (code === 200) {
          toast.success("Post shared successfully");
          reset();
          handleClose();
          getAllPost();
          refetch();
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    return (
      <div className="bg-white rounded-xl p-4 select-none">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-bold text-xl">Shared Post</h4>
          <CrossIcon className="cursor-pointer" onClick={handleClose} />
        </div>

        <RHFTextField
          type={"text"}
          name="caption"
          control={control}
          errors={errors}
          placeholder="Write caption here"
          autoComplete="off"
          className={` input-text border-none`}
        />

        <div className="relative flex flex-col md:flex-row my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
          <div className="relative p-2.5 md:w-2/5 shrink-0 overflow-hidden">
            <SwipperComponent
              spaceBetween={10}
              loop={true}
              className="main-slider"
              freeMode={true}
              watchSlidesProgress={true}
            >
              {sharedPostRecord?.attachments.map((image, index) => (
                <>
                  {image?.media_type === "video" ? (
                    <video
                      className="h-[170px] w-full rounded-md md:rounded-lg"
                      controls
                      src={image?.media_url}
                      alt={`Uploaded Video ${index}`}
                      autoPlay={sharedPostRecord?.attachments?.length === 1}
                      loop={sharedPostRecord?.attachments?.length === 1}
                      style={{
                        maxHeight: "170px",
                        objectFit: "contain",
                        backgroundColor: "black",
                        height: "170px",
                      }}
                    ></video>
                  ) : (
                    <img
                      src={image?.media_url}
                      alt="card-image"
                      className="h-[170px] w-full rounded-md md:rounded-lg object-cover cursor-pointer"
                    />
                  )}
                </>
              ))}
            </SwipperComponent>
          </div>

          <div className="p-6">
            <div className="text-black flex items-center gap-4 mb-3">
              <div>
                <img
                  src={sharedPostRecord?.user?.user_images[0]?.image_url}
                  alt="User Image not found"
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  {sharedPostRecord?.user?.name}
                </div>
                <div className="text-xs text-gray-text-color">
                  {timeAgo(sharedPostRecord?.createdAt)}
                </div>
              </div>
            </div>

            <p className="mb-8 text-slate-600 leading-normal font-medium">
              {StringSplice(sharedPostRecord?.content, 300)}
            </p>
          </div>
        </div>

        <div className="p-5 flex items-center">
          <input
            type="text"
            className="input-text flex-grow h-10 pl-2 cursor-pointer"
            disabled
            value={`https://web.mundotango.life/user/post?q=${sharedPostRecord?.id}`}
          />
          <button
            onClick={async () => {
              navigator.clipboard.writeText(`https://web.mundotango.life/user/post?q=${sharedPostRecord?.id}`);
              toast.success("Copy to clipboard");
            }}
            className="bg-btn-color text-white rounded-lg w-32 h-10"
          >
            Copy
          </button>
        </div>

        <div className="pr-5 mt-4 flex items-end justify-end w-full ">
          {/* <div>
            <FacebookShareButton
              url={`https://web.mundotango.life/user/post?q=${sharedPostRecord?.id}`} 
              quote={''} 
              hashtag="#TravelEvents #Mundo Tango"
              className="cursor-pointer"
              // onClick={uploadImages}
            >
              <FacebookIcon size={30} round />
            </FacebookShareButton>
          </div> */}
          <button
            onClick={handleShareSubmit}
            className="rounded-xl bg-btn-color w-60 h-10 justify-center flex items-center text-sm font-bold text-white"
          >
            {sharePostLoading ? <SpinnerLoading /> : "Share Post On Timeline"}
          </button>
        </div>
      </div>
    );
  }
);

export default SharedPostView;
