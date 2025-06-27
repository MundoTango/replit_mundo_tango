import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { SwipperComponent } from "@/components/Swiper";
import {
  useAddReportMutation,
  useGetAllReportTypeQuery,
} from "@/data/services/reportPostApi";
import { StringSplice, timeAgo } from "@/utils/helper";
import { memo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ReportPostView = memo(({ handleClose, reportPostRecord, getAllPost }) => {
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
      instance_type: "post",
      instance_id: "",
      description: "",
    },
  });

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        instance_id: reportPostRecord?.id,
      };

      const result = await addReport(body);

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Report added successfully");
        getAllPost();
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
            <SwipperComponent
              spaceBetween={10}
              loop={true}
              className="main-slider"
              freeMode={true}
              watchSlidesProgress={true}
            >
              {reportPostRecord?.attachments.map((image, index) => (
                <>
                  {image?.media_type === "video" ? (
                    <video
                      className="h-[170px] w-full rounded-md md:rounded-lg"
                      controls
                      src={image?.media_url}
                      alt={`Uploaded Video ${index}`}
                      autoPlay={reportPostRecord?.attachments?.length === 1}
                      loop={reportPostRecord?.attachments?.length === 1}
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
                  src={reportPostRecord?.user?.user_images[0]?.image_url}
                  alt="User Image not found"
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  {reportPostRecord?.user?.name}
                </div>
                <div className="text-xs text-gray-text-color">
                  {timeAgo(reportPostRecord?.createdAt)}
                </div>
              </div>
            </div>

            <p className="mb-8 text-slate-600 leading-normal font-medium">
              {StringSplice(reportPostRecord?.content, 300)}
            </p>
          </div>
        </div>

        <div className="pr-5 mt-4 flex items-end justify-end">
          <button
            disabled={reportPostLoading}
            className="rounded-xl bg-btn-color w-28 h-10 justify-center flex items-center text-sm font-bold text-white"
          >
            {reportPostLoading ? <SpinnerLoading /> : "Report Post"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReportPostView;
