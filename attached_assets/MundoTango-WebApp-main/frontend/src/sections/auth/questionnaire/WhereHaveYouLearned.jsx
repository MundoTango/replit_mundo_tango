"use client";
import RHFTextField from "@/components/FORMs/RHFTextField";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddLearningSourceMutation,
  useGetLearningSourceQuery,
} from "@/data/services/userFormsApi";
import { formatDate } from "@/utils/helper";
import { Slider } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import { SiderStyles } from "./Questions";
import { PATH_AUTH } from "@/routes/paths";
import SpinnerLoading from "@/components/Loadings/Spinner";
import { BiSkipNext } from "react-icons/bi";

const options = [
  "No",
  "Some classes",
  "Can dance some",
  "Like to dance it ",
  "Love it",
  "Teach",
  "Perform",
];

const marks = [
  // {
  //   value: 0,
  //   label: <div className="text-xs mt-2">0</div>,
  // },
  {
    value: 1,
    label: <div className="text-xs mt-2">1</div>,
  },
  {
    value: 2,
    label: <div className="text-xs mt-2">2</div>,
  },
  {
    value: 3,
    label: <div className="text-xs mt-2">3</div>,
  },
  {
    value: 4,
    label: <div className="text-xs mt-2">4</div>,
  },
  {
    value: 5,
    label: <div className="text-xs mt-2">5</div>,
  },
  {
    value: 6,
    label: <div className="text-xs mt-2">6</div>,
  },
  {
    value: 7,
    label: <div className="text-xs mt-2">7</div>,
  },
];

const WhereHaveYouLearned = () => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const { push, back } = useRouter();

  const [months, setMonths] = useState(1);
  const [showDate, setShowDate] = useState(false);

  function valuetext(value) {
    return `${value}°C`;
  }

  const [sections, setSections] = useState({
    first_teacher: "",
    leading_teachers: [],
    chacarera_skill: 1,
    tango_story: "",
    zamba_skill: 1,
    visited_buenos_aires: false,
    visited_buenos_aires_at: [""],
    visited_buenos_aires_end_at: [""],
    id: "",
  });

  const addNewSection = () => {
    const newSections = { ...sections };
    console.log(newSections);
    newSections?.visited_buenos_aires_at?.push("");
    newSections?.visited_buenos_aires_end_at?.push("");
    setSections(newSections);
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const handleCount = (slug) => {
    try {
      if (slug === "plus") {
        if (months < 12) {
          setMonths((number) => number + 1);
        }
      } else if (slug === "minus") {
        if (months != 1) setMonths((number) => number - 1);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const transformLeadingTeachers = (data) => {
    try {
      return {
        ...data,
        zamba_skill: data?.zamba_skill || 1,
        leading_teachers: data.leading_teachers
          .split(",")
          .map((teacher) => teacher.trim()),
        visited_buenos_aires_at: data?.visited_buenos_aires_at
          .split(",")
          .map((teacher) => teacher.trim()),
        visited_buenos_aires_end_at: data?.visited_buenos_aires_end_at
          .split(",")
          .map((teacher) => teacher.trim()),
        visited_buenos_aires: data.visited_buenos_aires,
        chacarera_skill: data?.chacarera_skill || 1,
        tango_story: data?.tango_story || "",
      };
    } catch (e) {
      console.log(e.message);
    }
  };

  const { data, isLoading: getLoading } = useGetLearningSourceQuery();

  useEffect(() => {
    if (data && data.code === 200) {
      const transformedData = transformLeadingTeachers(data.data);
      if (transformedData) {
        setSections(transformedData);
      }
    }
  }, [data]);

  const [addOrUpdateData, { isLoading: addOrUpdateLoading }] =
    useAddLearningSourceMutation();

  const onSubmit = async (record) => {
    try {
      const body = {
        ...sections,
        // visited_buenos_aires_at: [sections?.visited_buenos_aires_at],
        zamba_skill: sections?.zamba_skill || 1,
        chacarera_skill: sections?.chacarera_skill || 1,
      };
      const response = await addOrUpdateData(body);

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        toast.success("Info added successfully!");
        push(PATH_AUTH.review);
      }
    } catch (e) {
      console.log(e.message);
    }
  };


  useEffect(() => {
      setShowDate(sections.visited_buenos_aires)
  } ,[sections.visited_buenos_aires])

  return (
    <div className="bg-background-color h-screen overflow-y-scroll">
      <ConfirmationHeader />
      <div className="grid grid-cols-12 ">
        <div className="hidden lg:block col-span-3" />

        <div className="col-span-12 lg:col-span-6 mt-5 px-10 lg:px-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-5 rounded-lg">
              <div className="flex justify-end w-full">
                <button
                  className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 w-32 transition h-7 text-sm flex justify-center gap-2 items-center"
                  onClick={(e) => {e.preventDefault(); push(PATH_AUTH.review)}}
                >
                  Skip
                  <BiSkipNext size={18} />
                </button>
              </div>
              <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5 mb-10">
                {
                  // ----
                }
                <React.Fragment>
                  {/* {sectionIndex > 0 ? (
                        <div className="col-span-12 px-2">
                          <br></br>
                          <hr></hr>
                          <br></br>
                        </div>
                      ) : null} */}
                  <div className="col-span-12 mb-1 px-2">
                    <div className="text-2xl font-bold">
                      Final Details
                    </div>
                  </div>
                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        Who was your first teacher(s)
                      </label>
                      <RHFTextField
                        type={"text"}
                        name={`first_teacher_1`}
                        control={control}
                        placeholder="First teacher"
                        className={`${selectedBox} py-2 `}
                        value={sections.first_teacher}
                        onChange={(e) => {
                          const value = e.target.value;
                          sections.first_teacher = value;
                          let temp = { ...sections };
                          temp.first_teacher = value;
                          setSections(temp);
                          setValue(`first_teacher_1`, value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        Which teachers have you learned from the most?
                      </label>
                      <div className="space-y-2">
                        <RHFTextField
                          type={"text"}
                          name={`learned_teacher_1`}
                          control={control}
                          errors={errors}
                          placeholder="Enter URL"
                          className={`${selectedBox} py-2 `}
                          value={sections.leading_teachers[0]}
                          onChange={(e) => {
                            const value = e.target.value;
                            let temp = { ...sections };
                            temp.leading_teachers[0] = value;
                            setSections(temp);
                            setValue(`learned_teacher_1`, value);
                          }}
                        />
                        <RHFTextField
                          type={"text"}
                          name={`learned_teacher_2`}
                          control={control}
                          errors={errors}
                          placeholder="Enter URL"
                          className={`${selectedBox} py-2 `}
                          value={sections.leading_teachers[1]}
                          onChange={(e) => {
                            const value = e.target.value;
                            let temp = { ...sections };
                            temp.leading_teachers[1] = value;
                            setSections(temp);
                            setValue(`learned_teacher_2`, value);
                          }}
                        />
                        <RHFTextField
                          type={"text"}
                          name={`learned_teacher_3`}
                          control={control}
                          errors={errors}
                          placeholder="Enter URL"
                          className={`${selectedBox} py-2 `}
                          value={sections.leading_teachers[2]}
                          onChange={(e) => {
                            const value = e.target.value;
                            let temp = { ...sections };
                            temp.leading_teachers[2] = value;
                            setSections(temp);
                            setValue(`learned_teacher_3`, value);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        Tell us your tango story?
                      </label>
                      <RHFTextField
                        type={"text"}
                        name={`tango_story`}
                        control={control}
                        errors={errors}
                        placeholder="How did you start"
                        className={`${selectedBox} py-2 `}
                        value={sections.tango_story}
                        onChange={(e) => {
                          const value = e.target.value;
                          let temp = { ...sections };
                          temp.tango_story = value;
                          setSections(temp);
                          setValue(`tango_story`, value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        Do you dance “Chacarera”?
                      </label>
                      {/* <RHFTextField
                        type={"text"}
                        name={`chacarera_skill`}
                        control={control}
                        // errors={errors}
                        value={sections.chacarera_skill}
                        placeholder="How did you start"
                        className={`${selectedBox} py-2 `}
                        onChange={(e) => {
                          const value = e.target.value;
                          let temp = { ...sections };
                          temp.chacarera_skill = value;
                          setSections(temp);
                          setValue(`chacarera_skill`, value);
                        }}
                      /> */}
                      <div className="flex w-full flex-wrap gap-4">
                        {options.map((item, index) => (
                          <div
                            key={index}
                            className="text-[13px] flex gap-2 text-[#949393]"
                          >
                            <div>{index + 1}. </div>
                            <div key={index}>{item}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2">
                        <Slider
                          defaultValue={1}
                          // getAriaValueText={valuetext}
                          shiftStep={2}
                          step={1}
                          min={1}
                          max={7}
                          marks={marks}
                          value={sections.chacarera_skill}
                          valueLabelDisplay="off"
                          sx={SiderStyles}
                          onChange={(e) => {
                            console.log(e.target.value);
                            let temp = { ...sections };
                            temp.chacarera_skill = e.target.value;
                            setSections(temp);
                          }}
                          // name="slider"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        Do you dance “Zamba”?
                      </label>

                      <div className="flex w-full flex-wrap gap-4">
                        {options.map((item, index) => (
                          <div
                            key={index}
                            className="text-[13px] flex gap-2 text-[#949393]"
                          >
                            <div>{index + 1}. </div>
                            <div key={index}>{item}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2">
                        <Slider
                          defaultValue={1}
                          // getAriaValueText={valuetext}
                          shiftStep={2}
                          step={1}
                          min={1}
                          max={7}
                          marks={marks}
                          value={sections.zamba_skill}
                          valueLabelDisplay="off"
                          sx={SiderStyles}
                          onChange={(e) => {
                            console.log(e.target.value);
                            let temp = { ...sections };
                            temp.zamba_skill = e.target.value;
                            setSections(temp);
                          }}
                          // name="slider"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        Have you been to Buenos Aires” yes or no. (If yes
                        “Please enter the dates you’ve visited” multi date
                        entry.)
                      </label>

                      <select
                        // defaultValue={
                        //   section.visited_buenos_aires !== undefined
                        //     ? section.visited_buenos_aires
                        //     : ""
                        // }
                        value={sections?.visited_buenos_aires}
                        onChange={(e) => {
                          let temp = { ...sections };
                          temp.visited_buenos_aires = e.target.value === 'true';
                          setSections(temp);
                          setShowDate(e.target.value === 'true');
                        }}
                        // name="visited_buenos_aires"
                        className={`w-full rounded-lg p-3 text-base outline-none ${selectedBox}`}
                      >
                        <option value="" disabled hidden>
                          Select
                        </option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                    </div>
                  </div>
                  {showDate ? (
                    <>
                    <div className="col-span-6">
                    <label className={labelClass}>
                      Arrival Date
                    </label>
                    {sections?.visited_buenos_aires_at !== "" &&
                    sections?.visited_buenos_aires_at?.length > 0
                      ? sections?.visited_buenos_aires_at?.map((x, index) => {
                          // console.log(x);
                          // let temp = { ...sections };
                          // console.log(temp);
                          return (
                            <div className="mb-2 relative" key={index}>
                              <RHFTextField
                                type={"date"}
                                name={`visited_buenos_aires_at_${index}`}
                                control={control}
                                errors={errors}
                                value={x}
                                onChange={(e) => {
                                  const date = e?.target?.value;
                                  let temp = { ...sections };
                                  temp.visited_buenos_aires_at[index] = date;
                                  setSections(temp);
                                  setValue(
                                    `visited_buenos_aires_at_${index}`,
                                    date
                                  );
                                }}
                                placeholder="Enter Date"
                                className={`${selectedBox} py-2 `}
                              />
                              {/* {index !== 0 && (
                                <button
                                  className="absolute top-3 right-10 text-gray-text-color  p-1 rounded-full text-xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    let temp = { ...sections };
                                    temp.visited_buenos_aires_at.splice(
                                      index,
                                      1
                                    );
                                    temp.visited_buenos_aires_end_at.splice(
                                      index,1
                                    )
                                    setSections(temp);
                                    setValue(`visited_buenos_aires_at`, [
                                      ...sections.visited_buenos_aires_at.slice(
                                        0,
                                        index
                                      ),
                                      ...sections.visited_buenos_aires_at.slice(
                                        index + 1
                                      ),
                                    ]);
                                  }}
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    padding: "2px",
                                  }}
                                >
                                  &#10005;
                                </button>
                              )} */}
                            </div>
                          );
                        })
                      : null}
                  </div>
                  <div className="col-span-6">
                  <label className={labelClass}>
                    Departure Date
                  </label>
                    {sections?.visited_buenos_aires_end_at !== "" &&
                    sections?.visited_buenos_aires_end_at?.length > 0
                      ? sections?.visited_buenos_aires_end_at?.map(
                          (x, index) => {
                            return (
                              <div
                                className="mb-2 col-span-6 relative"
                                key={index}
                              >
                                <RHFTextField
                                  type={"date"}
                                  name={`visited_buenos_aires_end_at_${index}`}
                                  control={control}
                                  errors={errors}
                                  value={x}
                                  onChange={(e) => {
                                    const date = e?.target?.value;
                                    let temp = { ...sections };
                                    temp.visited_buenos_aires_end_at[index] =
                                      date;
                                    setSections(temp);
                                    setValue(
                                      `visited_buenos_aires_end_at_${index}`,
                                      date
                                    );
                                  }}
                                  placeholder="Enter Date"
                                  className={`${selectedBox} py-2 `}
                                />
                                {index !== 0 && (
                                  <button
                                    className="absolute top-3 right-[-18px] text-gray-text-color p-1 rounded-full text-xs"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      let temp = { ...sections };
                                      temp.visited_buenos_aires_end_at.splice(
                                        index,
                                        1
                                      );
                                      temp.visited_buenos_aires_at.splice(
                                        index,
                                        1
                                      );

                                      setSections(temp);
                                      setValue(`visited_buenos_aires_at_${index}`, "");
                                      setValue(`visited_buenos_aires_end_at_${index}`, "");
                                      setValue("visited_buenos_aires_at", temp.visited_buenos_aires_at);
                                      setValue("visited_buenos_aires_end_at", temp.visited_buenos_aires_end_at);
                                      // setValue(`visited_buenos_aires_end_at`, [
                                      //   ...sections.visited_buenos_aires_end_at.slice(
                                      //     0,
                                      //     index
                                      //   ),
                                      //   ...sections.visited_buenos_aires_end_at.slice(
                                      //     index + 1
                                      //   ),
                                      // ]);
                                      // setValue(`visited_buenos_aires_at`, [
                                      //   ...sections.visited_buenos_aires_at.slice(
                                      //     0,
                                      //     index
                                      //   ),
                                      //   ...sections.visited_buenos_aires_at.slice(
                                      //     index + 1
                                      //   ),
                                      // ]);
                                      
                                    }}
                                    style={{
                                      width: "18px",
                                      height: "18px",
                                      padding: "2px",
                                    }}
                                  >
                                    &#10005;
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )
                      : null}
                  </div>
                    </>
                  ) : null}

                </React.Fragment>
                {
                  // ----
                }
                {showDate ? (
                  <div className="col-span-12 px-2 ">
                    <div
                      className="border-[#D1D1D1] border-2 rounded-lg p-2 text-center text-btn-color cursor-pointer"
                      onClick={addNewSection}
                    >
                      + Add Another Date
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex justify-between">
                <button
                  type="button"
                  onClick={back}
                  className="bg-btn-color text-white px-10 py-3 rounded-xl "
                >
                  <BackArrow />
                </button>

                <button className="bg-btn-color text-white px-10 py-3 rounded-xl ">
                  {addOrUpdateLoading ? <SpinnerLoading /> : <NextArrow />}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="hidden lg:block col-span-3" />
      </div>
    </div>
  );
};

export default WhereHaveYouLearned;
