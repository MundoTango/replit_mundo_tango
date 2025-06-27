"use client";
import ConfirmationRequest from "@/components/Friends/ConfirmationRequest";
import FriendComponents from "@/components/Friends/FriendList";
import FriendRequestModal from "@/components/Friends/FriendRequestModal";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import CrossIcon from "@/components/SVGs/CrossIcon";
import {
  useGetAllFriendRequestQuery,
  useUpdateRequestStatusMutation,
} from "@/data/services/friendApi";
import { REQUEST_STATUS } from "@/utils/enum";
import { useState } from "react";
import toast from "react-hot-toast";

function ConnectionRequests() {
  const {
    data,
    isLoading: friendLoading,
    isFetching,
    refetch,
  } = useGetAllFriendRequestQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateRequestStatus, { isLoading }] = useUpdateRequestStatusMutation();

  const [friendRequestPop, setFriendRequestPop] = useState(false);

  const [confirmRequest, setConfirmRequest] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState({});

  const [receiverNotes, setReceiverNotes] = useState("");

  const [requestStatus, setRequestStatus] = useState("");

  const handleOpenFriendRequestPop = () => setFriendRequestPop(true);

  const handleCloseFriendRequestPop = () => setFriendRequestPop(false);

  const handleOpenConfirm = () => setConfirmRequest(true);

  const handleCloseConfirm = () => setConfirmRequest(false);

  const confirmRejectRequest = async (item, status, flag) => {
    try {
      let body = {};
      let user_id = "";

      if (flag) {
        body = {
          status: status,
          receiver_notes: null,
        };

        user_id = item?.id;
      } else {
        if (!requestStatus) toast.error("Seems like something went wrong!");

        body = {
          status: requestStatus,
          receiver_notes: receiverNotes,
        };

        user_id = selectedRequest?.id;
      }

      const result = await updateRequestStatus({ body, user_id });

      if (result?.data?.code === 200) {
        // console.log(result?.data?.data);
        let msg = "";
        if (requestStatus === REQUEST_STATUS.CONNECTED) {
          msg = `Request accepted successfully !`;
        } else if (status === REQUEST_STATUS.DECLINE) {
          msg = `Request decline successfully !`;
        }
        toast.success(msg);
        handleCloseConfirm();
        refetch();
        setReceiverNotes("");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  if (friendLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="bg-white card mt-2">
      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex flex-col justify-between  ">
            <div className="text-xl font-bold">Connection Requests</div>
            <div className="text-sm text-light-gray-color">
              Add if you know them
            </div>
          </div>
        </div>
        {!!data?.data?.length ? (
          data?.data?.map((item, key) => (
            <div key={key} className="col-span-12 sm:col-span-4 md:col-span-3">
              <FriendComponents
                {...item}
                image={item?.friend_user?.user_images[3]?.image_url}
                full_name={item?.friend_user?.name}
                button_title={"See Request"}
                second_button={"Decline"}
                onClickFirstBtn={() => {
                  handleOpenFriendRequestPop();
                  setSelectedRequest(item);
                  setRequestStatus(REQUEST_STATUS.CONNECTED);
                }}
                onClickSecondBtn={() => {
                  confirmRejectRequest(item, REQUEST_STATUS.DECLINE, true);
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-12">
            <div className="flex items-center justify-center h-[400px]">
              <h1 className="text-xl font-bold ">No Record Found!</h1>
            </div>
          </div>
        )}
      </div>

      <ModelComponent
        open={friendRequestPop}
        handleClose={handleCloseFriendRequestPop}
        width={"670px"}
      >
        <FriendRequestModal
          handleClose={handleCloseFriendRequestPop}
          handleRequest={() => {
            handleCloseFriendRequestPop();
            handleOpenConfirm();
          }}
          selectedRequest={selectedRequest}
        />
      </ModelComponent>

      <ModelComponent
        width={"670px"}
        open={confirmRequest}
        handleClose={handleCloseConfirm}
      >
        <div>
          <div className="absolute right-3 top-3">
            <CrossIcon
              className="cursor-pointer"
              onClick={handleCloseConfirm}
            />
          </div>
          <div className="px-8 py-5">
            <ConfirmationRequest
              receiverNotes={receiverNotes}
              setReceiverNotes={(e) => setReceiverNotes(e.target.value)}
              confirmRejectRequest={confirmRejectRequest}
              requestLoading={isLoading}
            />
          </div>
        </div>
      </ModelComponent>
    </div>
  );
}

export default ConnectionRequests;
