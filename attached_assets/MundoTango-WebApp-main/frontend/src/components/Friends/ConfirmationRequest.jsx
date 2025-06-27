import SpinnerLoading from "../Loadings/Spinner";

const ConfirmationRequest = ({
  receiverNotes,
  setReceiverNotes,
  confirmRejectRequest,
  requestLoading,
}) => {
  const textAreaLabel = " gap-1 mb-1 font-sm ";

  return (
    <div>
      <div className="text-black font-bold text-xl mb-3">Confirm Request</div>

      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <label className={textAreaLabel}>
            Write Personal note about this person &nbsp;
            <span className="text-[#94A3B8]">
              (it will be confidential and will NOT be shared to that person)
            </span>
          </label>
          <br />

          <textarea
            onChange={setReceiverNotes}
            value={receiverNotes}
            name="topic"
            placeholder="Write Personal note about this person..."
            className={
              "bg-background-color p-3 h-32 w-full text-[#94A3B8] mt-2 outline-none rounded-xl resize-none "
            }
          />

          <div className="flex items-end justify-end">
            <button
              type="submit"
              className={`w-48 p-2 rounded-xl font-medium outline-none bg-btn-color text-white mt-4 flex items-center justify-center`}
              onClick={confirmRejectRequest}
            >
              {requestLoading ? <SpinnerLoading /> : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationRequest;
