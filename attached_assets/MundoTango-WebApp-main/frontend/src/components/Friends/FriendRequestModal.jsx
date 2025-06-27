import { useForm } from "react-hook-form";
import RHFTextArea from "../FORMs/RHFTextArea";
import RHFTextField from "../FORMs/RHFTextField";
import CrossIcon from "../SVGs/CrossIcon";
import { formatDateMonth } from "@/utils/helper";

const FriendRequestModal = ({
  handleClose,
  selectedRequest,
  handleRequest,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      have_you_danced: "",
      which_city: "",
      when_did_meet: "",
      did_we_meet_in_event: "",
      topic: "",
    },
  });
  console.log(selectedRequest)

  const labelClass = "flex gap-1 mb-1 font-bold ";
  const textAreaLabel = "flex gap-1 mb-1 font-medium ";
  const inputClass = "bg-background-color p-2 text-[#94A3B8]";

  return (
    <div className="px-8 py-5 my-4 max-h-[90vh] overflow-y-auto">
      <div className="absolute right-3 top-3">
        <CrossIcon className="cursor-pointer" onClick={handleClose} />
      </div>

      <div>
        <img
          src={selectedRequest?.friend_user?.user_images[0]?.image_url}
          alt=""
          className="w-14 h-14 object-cover rounded-full"
        />
        <div className="mt-4">
          <div className="font-bold text-2xl">
            {selectedRequest?.friend_user?.name}
          </div>
          <div className="text-gray-text-color font-medium flex items-center gap-3">
            <div>User name: @Carlie05</div>
            <div>|</div>
            <div>City: Florida</div>
          </div>
        </div>
        <div></div>
      </div>

      <br />
      <hr />
      <br />

      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>Have we danced?</label>
          <RHFTextField
            disabled
            name="have_you_danced"
            type={"text"}
            control={control}
            placeholder="Lorem ipsum dolor sit amet, consectetur .."
            className={inputClass}
            value={selectedRequest.have_we_danced ? "Yes" : "No"}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>Which city did we meet in?</label>
          <RHFTextField
            disabled
            name="city_we_meet"
            type={"text"}
            control={control}
            placeholder="Lorem ipsum dolor sit amet, consectetur .."
            className={inputClass}
            value={selectedRequest.city_we_meet}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>When did we meet?</label>
          <RHFTextField
            disabled
            name="when_did_meet"
            type={"text"}
            control={control}
            placeholder="Lorem ipsum dolor sit amet, consectetur .."
            className={inputClass}
            value={formatDateMonth(selectedRequest?.when_did_we_meet)}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>
            Did we meet at an event? Which one
          </label>
          <RHFTextField
            disabled
            name="did_we_meet_in_event"
            type={"text"}
            control={control}
            placeholder="Lorem ipsum dolor sit amet, consectetur .."
            className={inputClass}
            value={selectedRequest?.event_we_meet}
          />
        </div>

        <div className="col-span-12">
          <br />
          <hr />
        </div>

        <div className="col-span-12">
          <label className={textAreaLabel}>
            Why do you want to connect? Did we have an interesting conversation
            topic, did we go on an adventure, etc
          </label>
          <RHFTextArea
            disabled
            numberLength={false}
            name="topic"
            type={"text"}
            control={control}
            placeholder="Lorem ipsum dolor sit amet, consectetur .."
            className={"bg-background-color p-2 h-24 text-[#94A3B8]"}
            defaultValue={selectedRequest?.connect_reason}
          />
        </div>

        <div className="col-span-12">
          <label className={labelClass}>Add Photos if any</label>
          <div className="flex overflow-scroll w-full gap-5">
            {selectedRequest?.friend_user?.user_images.map((item, index) => (
              <img
                src={item?.image_url}
                alt=""
                className="h-32 w-32 rounded-xl border"
                key={index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-5">
        {/* <button className="bg-tag-color w-full rounded-xl text-white h-10">
          Decline
        </button> */}
        <button
          onClick={handleRequest}
          className="bg-btn-color w-full rounded-xl text-white h-10"
        >
          Confirm Request
        </button>
      </div>
    </div>
  );
};

export default FriendRequestModal;
