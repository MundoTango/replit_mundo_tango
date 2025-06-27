"use client";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import SpinnerLoading from "@/components/Loadings/Spinner";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useGetTrangoActivityMutation,
  useStoreTrangoActivityMutation,
} from "@/data/services/userFormsApi";
import { PATH_AUTH } from "@/routes/paths";
import { formatDate } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import Checkbox from "./Checkbox";
import { setRouter } from "@/data/features/authSlice";
import { RHFTextFieldNullValue } from "@/components/FORMs/RHFTextField";
import { BiSkipNext } from "react-icons/bi";

const keys = [
  "teacher_at",
  "organizer_at",
  "dj_at",
  "creator_at",
  "photographer_at",
  "performer_at",
  "host_at",
  "tour_operator_at",
];

const WhatDoYoDo = () => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [flag, setFlag] = useState(false);

  const [loading, setLoading] = useState(true);

  const handleFlag = () => setFlag((prev) => !prev);

  const { push, back } = useRouter();

  const [storeTrangoActivities, { isLoading: storeLoading }] =
    useStoreTrangoActivityMutation();

  const [getTrangoActivities, { isLoading: getLoading }] =
    useGetTrangoActivityMutation();


  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      teacher_at: null,
      organizer_at: null,
      dj_at: null,
      creator_at: null,
      photographer_at: null,
      performer_at: null,
      host_at: null,
      tour_operator_at: null,
      other: null,
      social_dancer: false,
    },
  });

  const onSubmit = async (record) => {
    try {
      const response = await storeTrangoActivities(record);

      if (response?.error?.code) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        prepareForms(record);
        toast.success("Question added successfully!");
        push(PATH_AUTH.overview);
        localStorage.setItem("type", 4);
        localStorage.setItem('router', "push")
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getTrangoActivities();
      console.log(response);

      if (response?.data?.code === 200) {
        const {
          data: {
            teacher_at,
            organizer_at,
            dj_at,
            creator_at,
            photographer_at,
            performer_at,
            host_at,
            tour_operator_at,
            other,
            social_dancer,
          },
        } = response?.data;

        setValue("teacher_at", teacher_at && formatDate(teacher_at));
        setValue("organizer_at", organizer_at && formatDate(organizer_at));
        setValue("dj_at", dj_at && formatDate(dj_at));
        setValue("creator_at", creator_at && formatDate(creator_at));
        setValue("photographer_at", photographer_at && formatDate(photographer_at));
        setValue("performer_at", performer_at && formatDate(performer_at));
        setValue("host_at", host_at && formatDate(host_at));
        setValue("tour_operator_at", tour_operator_at && formatDate(tour_operator_at));
        setValue("other", other);
        setValue("social_dancer", social_dancer);

        delete response?.data?.data?.id;
        delete response?.data?.data?.user_id;
        delete response?.data?.data?.other;
        delete response?.data?.data?.social_dancer;

        prepareForms(response?.data?.data);

        localStorage.setItem("ch", JSON.stringify(object));
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    }
  };

  const prepareForms = (record) => {
    let object = [];
    Object.keys(record).map((item, index) => {
      if (
        keys.includes(item) &&
        !!record[item] &&
        record[item] != "Invalid date"
      ) {
        object.push(index + 1);
      }
    });
    try {
      localStorage.setItem("ch", JSON.stringify(object));
      localStorage.setItem("router", "push");
    } catch (e) {}
  };

  useEffect(() => {
    getTrangoActivity();
  }, []);

  return (
    <div
      className={`bg-background-color h-screen ${storeLoading ? "overflow-hidden" : "overflow-y-scroll"} `}
    >
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
                <div className="flex justify-end w-full">
                  <button
                    className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 w-32 transition h-7 text-sm flex justify-center gap-2 items-center"
                    onClick={(e) => {e.preventDefault(); push(PATH_AUTH.wheredoyoudance)}}
                  >
                    Skip
                    <BiSkipNext size={18} />
                  </button>
                </div>
                <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5">
                  <div className="col-span-12 px-2 mb-5">
                    <div className="text-2xl font-bold">
                      What do you do in Tango?
                    </div>
                    <p className="mt-2 text-md font-medium">
                      All of the following data relates to your experience with
                      Tango. Enter the date when you started the category,
                      you'll then be taken to each section to fill out more
                      data.
                    </p>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div className="">
                      <label className={labelClass}>Teacher</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="teacher_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>Organizer</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="organizer_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>DJ</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="dj_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>
                        Creator (Shoes, Clothing etc.)
                      </label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="creator_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>
                        Photographer/Videographer
                      </label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="photographer_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>Performer</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="performer_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>Housing Host</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="host_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 px-2">
                    <div>
                      <label className={labelClass}>Tour Operator</label>
                      <RHFTextFieldNullValue
                        type={"date"}
                        name="tour_operator_at"
                        control={control}
                        errors={errors}
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>Other</label>
                      <RHFTextArea
                        type="text"
                        name="other"
                        control={control}
                        errors={errors}
                        placeholder="Write here...."
                        className={`${selectedBox} text-sm h-36`}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 ">
                    <div className="select-none flex items-center gap-1">
                      <Checkbox
                        name="social_dancer"
                        checked={getValues("social_dancer")}
                        onChange={(e) => {
                          setValue("social_dancer", e.target.checked);
                          handleFlag();
                        }}
                        className={"border-black border"}
                      />
                      <div>Social dancer only</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-between">
                  <button
                    type="button"
                    onClick={() => push(PATH_AUTH.questionnaire)}
                    className="bg-btn-color text-white px-10 py-3 rounded-xl "
                  >
                    <BackArrow />
                  </button>
                  <button className="bg-btn-color text-white w-32  rounded-xl flex items-center justify-center ">
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

export default WhatDoYoDo;
