// import { useAuthContext } from "@/auth/useAuthContext";
// import RHFTextField from "@/components/FORMs/RHFTextField";
// import SpinnerLoading from "@/components/Loadings/Spinner";
// import CrossIcon from "@/components/SVGs/CrossIcon";
// import { useGetAllEventsQuery } from "@/data/services/eventAPI";
// import { useSharePostMutation, useTravelPostMutation } from "@/data/services/postApi";
// import { StringSplice, timeAgo } from "@/utils/helper";
// import moment from "moment";
// import React, { memo } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { MdDelete } from "react-icons/md";
// import { FacebookIcon, FacebookShareButton, InstapaperShareButton } from "react-share";
// import { GrInstagram } from "react-icons/gr";

// const ShareTravelDetails = memo(({ handleClose, sharedPostRecord, refetch, group_id, event_id, user_id, getAllPost}) => {
//   console.log(sharedPostRecord);
//     const [travelPost, { isLoading: sharePostLoading }] =
//       useTravelPostMutation();
//   const { data: events } = useGetAllEventsQuery();

//   const {
//     control,
//     formState: { errors },
//     getValues,
//     reset,
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//         visibility: "friend",
//         status: "active",
//       },
//   });

//   const { user } = useAuthContext();

//   const handleShareSubmit = async () => {
//     try {
//       const caption = getValues("caption");

//         // const body = {
//         //   post_id: !!sharedPostRecord?.is_shared
//         //     ? sharedPostRecord?.original_post_id
//         //     : sharedPostRecord?.id,
//         //   caption,
//         //   ...(group_id && { group_id }),
//         //   ...(event_id && { event_id }),
//         //   ...(user_id && { user_id }),
//         // };

//         const result = await travelPost({
//             visibility: "friend",
//             status: "active",
//           });

//       const { code } = result?.data;

//       if (code === 200) {
//         toast.success("Post shared successfully");
//         reset();
//         handleClose();
//         getAllPost();
//         refetch();
//       }
//     } catch (e) {
//       console.log(e.message);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl p-4 select-none">
//       <div className="flex items-center justify-between mb-5">
//         <h4 className="font-bold text-xl">Shared Travel Detail</h4>
//         <CrossIcon className="cursor-pointer" onClick={handleClose} />
//       </div>

//       <div className="travel-details-card overflow-x-hidden">
//         <div className="flex font-semibold mb-2">
//           <div className="w-1/4 border px-1">Date</div>
//           <div className="w-1/3 border px-1">City</div>
//           <div className="w-1/3 border px-1">Event Name</div>
//         </div>

//         <div>
//           {!!sharedPostRecord?.length ? (
//             sharedPostRecord.map(
//               (
//                 { event_name, start_date, event_type, city, end_date, id },
//                 index
//               ) => {

//                 return (
//                 <div
//                   key={index}
//                   className="flex items-start mb-3 gap-1 text-light-gray-color"
//                 >
//                   <div className="w-1/4 whitespace-wrap overflow-ellipsis px-1 ">
//                     {`${moment(start_date).format("MMM D")} - ${moment(end_date).format("MMM D")}`}
//                   </div>
//                   <div
//                     className="w-1/3 whitespace-wrap overflow-x-hidden px-1"
//                     title={city}
//                   >
//                     {city || "N/A"}
//                   </div>
//                   <div
//                     className="w-1/3 whitespace-wrap overflow-x-hidden flex items-center gap-1 px-1"
//                     title={event_name}
//                   >
//                     {event_name}
//                   </div>
//                 </div>
//               )}
//             )
//           ) : sharedPostRecord?.length === 0 ? (
//             <div className="flex justify-center w-full text-center py-4">
//               Travel Details Not Found
//             </div>
//           ) : (
//             <div className="flex justify-center w-full py-4">
//               <SpinnerLoading />
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="pr-5 mt-4 flex items-end justify-end">
//         <button
//           onClick={handleShareSubmit}
//           className="rounded-xl bg-btn-color w-28 h-10 justify-center flex items-center text-sm font-bold text-white"
//         >
//           {sharePostLoading ? <SpinnerLoading /> : "Share Post"}
//         </button>
//       </div>
//     </div>
//   );
// });

// export default ShareTravelDetails;


import React from "react";
import { FacebookShareButton, FacebookIcon, InstapaperShareButton } from "react-share";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import moment from "moment";
import { GrInstagram } from "react-icons/gr";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useGetAllEventsQuery } from "@/data/services/eventAPI";
import { useUploadUserImagesMutation } from "@/data/services/userApi";

const TravelDetails = ({ handleClose, sharedPostRecord }) => {
  const { data: events } = useGetAllEventsQuery();
  const eventList = events?.data || [];
  const [uploadUserImages, { isLoading }] = useUploadUserImagesMutation();

  // ✅ Create a lookup object for event names (Improves Performance)
  const eventMap = eventList.reduce((acc, event) => {
    acc[event.id] = event.name;
    return acc;
  }, {});

  // ✅ Function to format text for Facebook
  const formatEventText = (events) => {
    return events
      .map(
        (event) =>
          `📅 ${moment(event.start_date).format("MMM D, YYYY")} - ${moment(event.end_date).format("MMM D, YYYY")}
🏙️ City: ${event.city}
🎉 Event: ${eventMap[event.event_name] || "Unknown"}
🎭 Type: ${event.event_type.name}
----------------------------`
      )
      .join("\n");
  };

  const eventText = formatEventText(sharedPostRecord);

  const shareOnInstagram = () => {
    const travelCard = document.querySelector(".travel-details-card");
    html2canvas(travelCard).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, "travel-details.png");
      });
    });
  };

  const shareTextOnFacebook = (eventText) => {
  
    if (navigator.share) {
      navigator
        .share({
          title: "Upcoming Travel Events",
          text: eventText,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this device.");
    }
  };
  
  const uploadImages = async () => {
    const formData = new FormData();
    const travelCard = document.querySelector(".travel-details-card");
  
    try {
      const canvas = await html2canvas(travelCard);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  
      if (!blob) {
        console.error("Failed to create image blob.");
        return;
      }
  
      const file = new File([blob], "travel-details.png", { type: "image/png" });
      formData.append("file", file);
  
      const result = await uploadUserImages(formData); // Your API function
      console.log(result?.data?.data[result?.data?.data?.length - 1]?.image_url);
      return result?.data?.data[result?.data?.data?.length - 1]?.image_url;

    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 select-none">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-xl">Shared Travel Detail</h4>
        <div className="flex gap-6 items-center">
          {/* Facebook Share Button */}
          <FacebookShareButton
            url={`https://web.mundotango.life/user/profile?q=${sharedPostRecord[0]?.user_id}`} 
            quote={eventText} 
            hashtag="#TravelEvents #Mundo Tango"
            className="cursor-pointer"
            // onClick={uploadImages}
          >
            <FacebookIcon size={30} round />
          </FacebookShareButton>

          {/* <InstapaperShareButton 
            url={`https://web.mundotango.life/user/profile?q=${sharedPostRecord[0]?.user_id}`}
            hashtag="#TravelEvents"
            className="cursor-pointer">
              <GrInstagram size={30} />
          </InstapaperShareButton> */}

          {/* Close Button */}
          <CrossIcon className="cursor-pointer" onClick={handleClose} />
        </div>
      </div>

      {/* Travel Details Card */}
      <div className="travel-details-card overflow-x-hidden p-4 border shadow-sm bg-white" style={{ maxWidth: "600px", margin: "auto" }}>
        <div className="flex font-semibold mb-2">
          <div className="w-1/4 border-b px-1">Date</div>
          <div className="w-1/3 border-b px-1">City</div>
          <div className="w-1/3 border-b px-1">Event Name</div>
        </div>

        <div>
          {!!sharedPostRecord?.length ? (
            sharedPostRecord.map(({ event_name, start_date, city, end_date, event_type }, index) => (
              <div key={index} className="flex items-start mb-3 gap-1 text-gray-600">
                <div className="w-1/4 whitespace-nowrap px-1">
                  {`${moment(start_date).format("MMM D")} - ${moment(end_date).format("MMM D")}`}
                </div>
                <div className="w-1/3 whitespace-nowrap px-1" title={city}>
                  {city || "N/A"}
                </div>
                <div className="w-1/3 whitespace-nowrap px-1">
                  {eventMap[event_name] || "Unknown"} ({event_type.name})
                </div>
              </div>
            ))
          ) : sharedPostRecord?.length === 0 ? (
            <div className="text-center py-4">Travel Details Not Found</div>
          ) : (
            <div className="text-center py-4">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelDetails;
