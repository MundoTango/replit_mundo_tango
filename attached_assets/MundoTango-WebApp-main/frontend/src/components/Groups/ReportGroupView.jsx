import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import {
  useAddReportMutation,
  useGetAllReportTypeQuery,
} from "@/data/services/reportPostApi";
import { formatNumber, StringSplice, timeAgo } from "@/utils/helper";
import { memo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ReportGroupView = memo(({ handleClose, selectedGroup }) => {
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
      instance_type: "group",
      instance_id: "",
      description: "",
    },
  });

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        instance_id: selectedGroup?.id,
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

  return (
    <div className="bg-white rounded-xl p-4 select-none">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-xl">Report Post</h4>
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
              src={selectedGroup?.image_url}
              alt="Group Image"
              className="h-[170px] w-full rounded-md md:rounded-lg object-cover"
            />
          </div>

          <div className="p-2 flex flex-col gap-2 ">
            <div>
              <div className="text-black font-bold text-lg capitalize">
                {selectedGroup?.name}
              </div>
              <div className="text-light-gray-color text-sm capitalize">
                {selectedGroup?.privacy} Group
              </div>
            </div>

            <div className="text-light-gray-color text-sm">
              {formatNumber(selectedGroup?.number_of_participants || 0)} Members
            </div>

            <div className="flex">
              {selectedGroup?.group_members?.slice(0, 3).map((x, i) => (
                <div className={i > 0 ? "ml-[-15px]" : ""} key={i}>
                  <img
                    src={x?.user?.image_url}
                    alt=""
                    className="w-10 h-10 rounded-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* <div className="text-black flex items-center gap-4 mb-3">
              <div>
                <img
                  // src={selectedGroup?.user?.user_images[0]?.image_url}
                  alt="User Image not found"
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  {selectedGroup?.user?.name}
                </div>
                <div className="text-xs text-gray-text-color">
                  {timeAgo(selectedGroup?.createdAt)}
                </div>
              </div>
            </div>

            <p className="mb-8 text-slate-600 leading-normal font-medium">
              {StringSplice(selectedGroup?.content, 300)}
            </p> */}
          </div>
        </div>

        <div className="pr-5 mt-4 flex items-end justify-end">
          <button
            disabled={reportPostLoading}
            className="rounded-xl bg-btn-color w-28 h-10 justify-center flex items-center text-sm font-bold text-white"
          >
            {reportPostLoading ? <SpinnerLoading /> : "Report Group"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReportGroupView;
