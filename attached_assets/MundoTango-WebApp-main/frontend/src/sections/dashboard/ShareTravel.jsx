import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useSharePostMutation } from "@/data/services/postApi";
import { StringSplice, timeAgo } from "@/utils/helper";
import React, { memo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const SharedTravelDetail = memo(({ handleClose, sharedPostRecord, refetch, group_id, event_id, user_id, getAllPost}) => {
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
        <h4 className="font-bold text-xl">Shared Travel Detail</h4>
        <CrossIcon className="cursor-pointer" onClick={handleClose} />
      </div>

      <div className="relative flex flex-col md:flex-row my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
      <div className="travel-details-card overflow-x-hidden">
        <div className="flex font-semibold mb-2">
          <div className="w-1/4">Date</div>
          <div className="w-1/3">City</div>
          <div className="w-1/3">Event Name</div>
        </div>

        <div>
          {!!UserTravel?.length ? (
            UserTravel.map(
              ({ event_name, start_date, event_type, city }, index) => (
                <div
                  key={index}
                  className="flex items-center mb-3 text-light-gray-color"
                >
                  <div className="w-1/4 truncate">
                    {moment(start_date).format("MMM D")}
                  </div>
                  <div className="w-1/3 truncate" title={city}>
                    {city || "N/A"}
                  </div>
                  <div className="w-1/3 truncate" title={event_name}>
                    {event_name}
                  </div>
                </div>
              )
            )
          ) : UserTravel?.length === 0 ? (
            <div className="flex justify-center w-full text-center py-4">
              Travel Details Not Found
            </div>
          ) : (
            <div className="flex justify-center w-full py-4">
              <SpinnerLoading />
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="pr-5 mt-4 flex items-end justify-end">
        <button
          onClick={handleShareSubmit}
          className="rounded-xl bg-btn-color w-28 h-10 justify-center flex items-center text-sm font-bold text-white"
        >
          {sharePostLoading ? <SpinnerLoading /> : "Share Post"}
        </button>
      </div>
    </div>
  );
});

export default SharedTravelDetail;
