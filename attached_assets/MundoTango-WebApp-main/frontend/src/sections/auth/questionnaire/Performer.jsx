"use client";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddPerformExperienceMutation,
  useGetPerformExperienceMutation,
} from "@/data/services/userFormsApi";
import { Country } from "country-state-city";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";

const Performer = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [addPerformExperience, { isLoading: storeLoading }] =
    useAddPerformExperienceMutation();
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [getPerformExperience, {}] = useGetPerformExperienceMutation();

  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      partner_profile_link1: "",
      partner_profile_link2: "",
      partner_profile_link3: "",
      recent_performance_url: "",
    },
  });

  const onSubmit = async (record) => {
    try {
      const body = {
        recent_performance_url: record?.recent_performance_url,
        partner_profile_link: [
          record?.partner_profile_link1,
          record?.partner_profile_link2,
          record?.partner_profile_link3,
        ],
        // partner_profile_link: [record?.partner_profile_link]
      };

      const response = await addPerformExperience(body);

      if (response?.data?.code === 200) {
        toast.success("Performer experience added successfully");
        nextForm();
      }

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getPerformExperience();

      if (response?.data?.code === 200) {
        const {
          data: { partner_profile_link, recent_performance_url },
        } = response?.data;
        setValue("partner_profile_link", partner_profile_link);
        setValue("partner_profile_link1", partner_profile_link[0]);
        setValue("partner_profile_link2", partner_profile_link[1]);
        setValue("partner_profile_link3", partner_profile_link[2]);
        setValue("recent_performance_url", recent_performance_url);
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
                    <div className="text-2xl font-bold">Performer</div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        {/* <InputStar />  */}
                        Do you have a standard tango partner?
                      </label>
                      {/* <RHFMultiSelect
                        name="partner_profile_link"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City name is required.",
                        }}
                        className={'bg-background-color text-xs text-[#949393] '}
                        multiple={true}
                      >

                        {countryList?.map((item, index) => (
                          <MenuItem key={index} value={item?.name}>{item?.name}</MenuItem>
                        ))}
                      </RHFMultiSelect> */}
                      <RHFTextField
                        type={"text"}
                        name="partner_profile_link1"
                        control={control}
                        // errors={errors}
                        // rules={{
                        //   required: "Partner profile is required.",
                        // }}
                        placeholder="Enter Partner's Facebook Url"
                        className={`${selectedBox} py-2 `}
                      />
                      <RHFTextField
                        type={"text"}
                        name="partner_profile_link2"
                        control={control}
                        // errors={errors}
                        // rules={{
                        //   required: "Partner profile is required.",
                        // }}
                        placeholder="Enter Partner's Facebook Url"
                        className={`${selectedBox} py-2 `}
                      />
                      <RHFTextField
                        type={"text"}
                        name="partner_profile_link3"
                        control={control}
                        // errors={errors}
                        // rules={{
                        //   required: "Partner profile is required.",
                        // }}
                        placeholder="Enter Partner's Facebook Url"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>
                        <InputStar />
                        Links to your recent performance.
                      </label>
                      <RHFTextField
                        type={"text"}
                        name="recent_performance_url"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "URL is required.",
                        }}
                        placeholder="Enter URL..."
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-between">
                  <button
                    type="button"
                    onClick={preForm}
                    className="bg-btn-color text-white px-10 py-3 rounded-xl "
                  >
                    <BackArrow />
                  </button>

                  <button className="bg-btn-color text-white w-32 rounded-xl flex items-center justify-center">
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

export default Performer;
