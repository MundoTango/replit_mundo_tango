"use client";
import RHFTextField from "@/components/FORMs/RHFTextField";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddCreatorExperienceMutation,
  useGetCreatorExperienceMutation,
} from "@/data/services/userFormsApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import SpinnerLoading from "@/components/Loadings/Spinner";
import toast from "react-hot-toast";

const Creator = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2 ";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [addCreatorExperience, { isLoading: storeLoading }] =
    useAddCreatorExperienceMutation();

  const [getCreatorExperience, {}] = useGetCreatorExperienceMutation();

  const { push, back } = useRouter();

  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      shoes_url: "",
      clothing_url: "",
      jewelry: "",
      vendor_activities: "",
      vendor_url: "",
    },
  });

  const onSubmit = async (record) => {
    try {
      const response = await addCreatorExperience(record);

      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        nextForm();
        toast.success("Creator added successfully");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getCreatorExperience();

      if (response?.data?.code === 200) {
        const {
          data: {
            shoes_url,
            clothing_url,
            jewelry,
            vendor_activities,
            vendor_url,
          },
        } = response?.data;

        setValue("shoes_url", shoes_url);
        setValue("clothing_url", clothing_url);
        setValue("jewelry", jewelry);
        setValue("vendor_activities", vendor_activities);
        setValue("vendor_url", vendor_url);
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTrangoActivity();
  }, []);

  return (
    <div className="bg-background-color h-screen overflow-y-scroll">
      <ConfirmationHeader />
      <div className="grid grid-cols-12 ">
        <div className="hidden lg:block col-span-3" />

        <div className="col-span-12 lg:col-span-6 mt-5 px-10 lg:px-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            {loading ? (
              <div className="flex items-center justify-center py-64">
                <SpinnerLoading />
              </div>
            ) : (
              <div className="bg-white p-5 rounded-lg">
                <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5">
                  <div className="col-span-12 px-2 mb-1">
                    <div className="text-2xl font-bold">Creator</div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>Shoes</label>
                      <RHFTextField
                        type={"text"}
                        name="shoes_url"
                        control={control}
                        errors={errors}
                        placeholder="Enter Website URL / Facebook/Instagram page URL"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>Clothing</label>
                      <RHFTextField
                        type={"text"}
                        name="clothing_url"
                        control={control}
                        errors={errors}
                        placeholder="Enter Website URL / Facebook/Instagram page URL"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>Jewelry</label>
                      <RHFTextField
                        type={"text"}
                        name="jewelry"
                        control={control}
                        errors={errors}
                        placeholder="Enter Website URL / Facebook/Instagram page URL"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>Other Vendor</label>
                      <RHFTextField
                        type={"text"}
                        name="vendor_activities"
                        control={control}
                        errors={errors}
                        placeholder="Enter Other Vendor activities related to tango"
                        className={`${selectedBox} py-2 `}
                      />
                      <br />
                      <RHFTextField
                        type={"text"}
                        name="vendor_url"
                        control={control}
                        errors={errors}
                        placeholder="Website, Facebook/instagram page"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-between">
                  <button
                    className="bg-btn-color text-white px-10 py-3 rounded-xl"
                    type="button"
                    onClick={preForm}
                  >
                    <BackArrow />
                  </button>

                  <button className="bg-btn-color text-white w-32  rounded-xl flex items-center justify-center">
                    {storeLoading ? <SpinnerLoading /> : <NextArrow />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="hidden lg:block col-span-3" />
      </div>
    </div>
  );
};

export default Creator;
