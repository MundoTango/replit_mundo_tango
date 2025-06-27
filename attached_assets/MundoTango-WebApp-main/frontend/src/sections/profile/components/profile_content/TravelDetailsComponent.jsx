import { useAuthContext } from "@/auth/useAuthContext";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import AddTravelDetailModal from "@/components/Profile/AddTravelDetailModal";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useGetAllEventsQuery } from "@/data/services/eventAPI";
import { useTravelDetailMutation } from "@/data/services/friendApi";
import ShareTravelDetails from "@/sections/dashboard/Timeline/ShareTravelDetails";
import moment from "moment";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";

const TravelDetailsComponent = ({
  UserTravel,
  userData,
  timelinerefetch,
  refetch,
}) => {
  const { user } = useAuthContext();
  const [shareModal, setShareModal] = useState(false);
  const [travelModal, setTravelModal] = useState(false);
  const [modalData, setModalData] = useState(false);
  const [travelDetail, {}] = useTravelDetailMutation();
  const { data: events } = useGetAllEventsQuery();

  const onDeleteDetail = async (id) => {
    try {
      const result = await travelDetail(id);
      const { code } = result?.data;
      if (code === 200) {
        toast.success("Travel Detail Deleted successfully");
        timelinerefetch();
        refetch();
      }
    } catch (e) {
      console.log(e.message);
    }
  };
  console.log(UserTravel)

  return (
    <div className="card">
      <div className="flex justify-between">
        <h2 className="">Travel Details </h2>
        {UserTravel?.length > 0 && user?.id == UserTravel[0]?.user_id ? (
          <button
            className="pr-6 text-btn-color"
            onClick={() => setShareModal(true)}
          >
            Share
          </button>
        ) : null}
      </div>
      {/* <div className="travel-details-card overflow-x-hidden">
        <table className="w-full overflow-auto">
          <thead>
            <tr>
              <th>Date</th>
              <th>City</th>
              <th>Event Name</th>
            </tr>
          </thead>
          <tbody>
            {!!UserTravel?.length ? (
              UserTravel.map(
                ({ event_name, start_date, event_type, city }, index) => (
                  <tr key={index}>
                    <td className="truncate w-1/4">
                      {moment(start_date).format("MMM D")}
                    </td>
                    <td className="truncate w-1/3" title={city}>
                      {city || "N/A"}
                    </td>
                    <td className="truncate w-1/3" title={event_name}>
                      {event_name}
                    </td>
                  </tr>
                )
              )
            ) : UserTravel?.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">
                  Travel Details Not Found
                </td>
              </tr>
            ) : (
              <tr>
                <td></td>
                <td className="text-center w-full flex justify-center">
                  <SpinnerLoading />
                </td>
                <td></td>
              </tr>
            )}
          </tbody> */}
      {/* <tbody>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
            <tr>
              <td>April 13 - 18</td>
              <td>Shanghai</td>
              <td>Festival</td>
            </tr>
          </tbody> */}
      {/* </table> */}
      <div className="travel-details-card overflow-x-hidden">
        <div className="flex font-semibold mb-2 gap-1">
          <div className="w-1/4">Date</div>
          <div className="w-1/3">City</div>
          <div className="w-1/2">Event Name</div>
        </div>

        <div>
          {!!UserTravel?.length ? (
            UserTravel.map((item, index) => {
              const name = events?.data?.find((x) => x?.id == item?.event_name);
              return (
                <div
                  key={index}
                  className="flex items-start mb-3 gap-1 text-light-gray-color"
                >
                  <div className="w-1/4 whitespace-wrap overflow-ellipsis">
                    {`${moment(item?.start_date).format("MMM D")} - ${moment(item?.end_date).format("MMM D")}`}
                  </div>
                  <div
                    className="w-1/3 whitespace-wrap overflow-x-hidden"
                    title={item?.city}
                  >
                    {item?.city || "N/A"}
                  </div>
                  <div
                    className="w-1/2 whitespace-wrap overflow-x-hidden flex items-center gap-1 me-1"
                    title={name?.name}
                  >
                    <p className="w-10/12">{name?.name}</p>
                    {userData?.id === user?.id && (
                      <>
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setTravelModal(true);
                            setModalData(item);
                          }}
                          title="Edit Detail"
                        >
                          <MdEdit />
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => onDeleteDetail(item?.id)}
                          title="Delete Detail"
                        >
                          <MdDelete />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
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
      <ModelComponent
        open={shareModal}
        handleClose={() => setShareModal(false)}
        // width={"50%"}
        className={"w-[95%] md:w-[50%]"}
      >
        <ShareTravelDetails
          sharedPostRecord={UserTravel}
          handleClose={() => setShareModal(false)}
        />
      </ModelComponent>
      <ModelComponent
        open={travelModal}
        handleClose={() => setTravelModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <AddTravelDetailModal
          setTravelModal={setTravelModal}
          refetch={refetch}
          // timelineRecord={timelineRecord?.data}
          timelinerefetch={timelinerefetch}
          modalData={modalData}
        />
      </ModelComponent>
    </div>
  );
};

export default TravelDetailsComponent;
