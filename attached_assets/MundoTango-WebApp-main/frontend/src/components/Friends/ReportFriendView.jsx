import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import {
  useAddReportMutation,
  useGetAllReportTypeQuery,
} from "@/data/services/reportPostApi";
import Tag from "@/sections/profile/Tag";
import { Activities } from "@/utils/enum";
import { memo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ReportFriendView = memo(({ handleClose, selectedFriend }) => {
  let { data, isLoading } = useGetAllReportTypeQuery();

  data = data?.data;

  const [addReport, { isLoading: reportPostLoading }] = useAddReportMutation();

  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      report_type_id: "",
      instance_type: "friend",
      instance_id: "",
      description: "",
    },
  });

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        instance_id: selectedFriend?.id,
      };

      const result = await addReport(body);

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Report added successfully");
        reset();
        handleClose();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const ActivitiesList = Activities(selectedFriend?.tango_activities || {});

  return (
    <div className="bg-white rounded-xl p-4 select-none">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-xl">Report Friend</h4>
        <CrossIcon className="cursor-pointer" onClick={handleClose} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <RHFTextField
          type={"text"}
          name="description"
          control={control}
          errors={errors}
          placeholder="Write report reason"
          autoComplete="off"
          className={`input-text border-none mb-3`}
        />

        <RHFSelect
          control={control}
          errors={errors}
          name="report_type_id"
          className="input-text rounded-xl"
        >
          <option value="" disabled>
            Select Report Type
          </option>

          {!!data?.length &&
            data?.map(({ id, name }, index) => (
              <option key={index} value={id}>
                {name}
              </option>
            ))}
        </RHFSelect>

        <div className="relative flex flex-col md:flex-row my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
          <div className="relative p-2.5 md:w-2/5 shrink-0 overflow-hidden">
            <img
              src={selectedFriend?.user_images[0]?.image_url}
              alt="Friend Image"
              className="h-[170px] w-full rounded-md md:rounded-lg object-cover"
            />
          </div>

          <div className="p-2 flex gap-2">
            <div className="text-black gap-4 mb-3">
              <div className="text-lg my-3 font-semibold">
                {selectedFriend?.name}
              </div>
              <div>
                {!!ActivitiesList?.length &&
                  ActivitiesList?.map((tag, index) => (
                    <Tag name={tag} key={index} className={"text-sm"} />
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pr-5 mt-4 flex items-end justify-end">
          <button
            disabled={reportPostLoading}
            className="rounded-xl bg-btn-color w-28 h-10 justify-center flex items-center text-sm font-bold text-white"
          >
            {reportPostLoading ? <SpinnerLoading /> : "Report Friend"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReportFriendView;
