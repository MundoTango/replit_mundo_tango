"use client";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import RHFTextField from "@/components/FORMs/RHFTextField";
import { styled } from '@mui/material/styles';
import {
  useAddDanceExperienceMutation,
  useAddLearningSourceMutation,
  useAddTeacherExperienceMutation,
  useGetLanguagesQuery,
  useStoreTrangoActivityMutation,
  useUserQuestionsMutation,
} from "@/data/services/userFormsApi";
import { formatDate } from "@/utils/helper";
import { Checkbox, FormControlLabel, MenuItem, Slider, Switch } from "@mui/material";
import { Country } from "country-state-city";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAboutPrivacyMutation } from "@/data/services/friendApi";

const AboutTabContentUser = forwardRef(({ data, loading, getAboutRefetch, userProfile }, ref) => {
  const [aboutDetail, setAboutDetail] = useState(null);
  const [isChecked, setIsChecked] = useState(userProfile?.is_privacy);
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const { data: lang, isLoading } = useGetLanguagesQuery();
  const [aboutPrivacy, {}] =
  useAboutPrivacyMutation();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: data || {},
  });
  const options = [
    "Just a few classes",
    "A little bit at milongas",
    "As much as I can",
    "All the time",
  ];
  const SiderStyles = {
    height: 4,
    "& .MuiSlider-thumb": {
      width: 18,
      height: 18,
    },
    "& .MuiSlider-track": {
      border: "none",
    },
    "& .MuiSlider-rail": {
      opacity: 0.5,
      backgroundColor: "#bfbfbf",
    },
    "& .MuiSlider-mark": {
      backgroundColor: "#bfbfbf",
      height: 14,
      width: 2,
      marginTop: 1.7,
    },
    "& .MuiSlider-markLabel": {
      color: "#bfbfbf",
    },
  };
  const marks = [
    {
      value: 1,
      label: <div className="mt-2 text-xs">1</div>,
    },
    {
      value: 2,
      label: <div className="mt-2 text-xs">2</div>,
    },
    {
      value: 3,
      label: <div className="mt-2 text-xs">3</div>,
    },
    {
      value: 4,
      label: <div className="mt-2 text-xs">4</div>,
    },
  ];
  function valuetext(value) {
    return `${value}°C`;
  }

  const [userQuestionsMutation] = useUserQuestionsMutation();
  const [addDanceExperienceMutation] = useAddDanceExperienceMutation();
  const [storeTrangoActivityMutation] = useStoreTrangoActivityMutation();
  const [addTeacherExperienceMutation] = useAddTeacherExperienceMutation();
  const [addLearningSourceMutation] = useAddLearningSourceMutation();

  useEffect(() => {
    if (!loading && data) {
      setAboutDetail(data);
      if (!aboutDetail) {
        reset(data);
      }
    }
  }, [data, loading, reset]);

  const handleChangeSlider = async (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    setValue(inputName, inputValue);
  };

  useEffect(() => {
    if (aboutDetail) {
      setValue("live_city", aboutDetail?.user_questions?.city);
      setValue("start_date", aboutDetail?.user_questions?.start_dancing);
      setValue(
        "guide_visitors",
        aboutDetail?.user_questions?.guide_visitors || false
      );
      setValue("is_nomad", aboutDetail?.user_questions?.is_nomad || false);
      setValue("dance_role_follower", aboutDetail?.user_questions?.dance_role_follower);
      setValue("dance_role_leader", aboutDetail?.user_questions?.dance_role_leader);
      setValue("website_url", aboutDetail?.user_questions?.website_url);
      // setValue(
      //   "city1",
      //   aboutDetail?.user_questions?.lived_for_tango?.split(",")[0]
      // );
      // setValue(
      //   "city2",
      //   aboutDetail?.user_questions?.lived_for_tango?.split(",")[1]
      // );
      // setValue(
      //   "city3",
      //   aboutDetail?.user_questions?.lived_for_tango?.split(",")[2]
      // );
      setValue("city", aboutDetail?.user_questions?.lived_for_tango?.split(","));
      setValue("language", aboutDetail?.user_questions?.languages);
      // setValue(
      //   "language2",
      //   aboutDetail?.user_questions?.languages?.split(",")[1]
      // );
      // setValue(
      //   "language3",
      //   aboutDetail?.user_questions?.languages?.split(",")[2]
      // );
      // setValue("website_url", aboutDetail?.user_questions?.website_url);
      setValue("about", aboutDetail?.user_questions?.about);

      setValue(
        "facebook_partner",
        aboutDetail?.teacher_experience?.partner_facebook_url
      );
      setValue("teach_city", aboutDetail?.teacher_experience?.cities?.split(","));
      // setValue(
      //   "teach_city2",
      //   aboutDetail?.teacher_experience?.cities?.split(",")[1]
      // );
      // setValue(
      //   "teach_city3",
      //   aboutDetail?.teacher_experience?.cities?.split(",")[2]
      // );
      setValue(
        "preferred_size",
        aboutDetail?.teacher_experience?.preferred_size
      );
      setValue("why_teach", aboutDetail?.teacher_experience?.teaching_reason);
      setValue(
        "about_tango_future",
        aboutDetail?.teacher_experience?.about_tango_future
      );

      // setValue(
      //   "social_dancing_cities1",
      //   aboutDetail?.dance_experience?.social_dancing_cities?.split(",")[0]
      // );
      // setValue(
      //   "social_dancing_cities2",
      //   aboutDetail?.dance_experience?.social_dancing_cities?.split(",")[1]
      // );
      setValue(
        "social_dancing_cities",
        aboutDetail?.dance_experience?.social_dancing_cities?.split(",")
      );
      setValue(
        "recent_workshop_cities",
        aboutDetail?.dance_experience?.recent_workshop_cities?.split(",")
      );
      // setValue(
      //   "recent_workshop_cities1",
      //   aboutDetail?.dance_experience?.recent_workshop_cities?.split(",")[0]
      // );
      // setValue(
      //   "recent_workshop_cities2",
      //   aboutDetail?.dance_experience?.recent_workshop_cities?.split(",")[1]
      // );
      // setValue(
      //   "recent_workshop_cities3",
      //   aboutDetail?.dance_experience?.recent_workshop_cities?.split(",")[2]
      // );
      setValue(
        "favourite_dancing_cities",
        aboutDetail?.dance_experience?.favourite_dancing_cities?.split(",")
      );
      // setValue(
      //   "favourite_dancing_cities2",
      //   aboutDetail?.dance_experience?.favourite_dancing_cities?.split(",")[1]
      // );
      // setValue(
      //   "favourite_dancing_cities3",
      //   aboutDetail?.dance_experience?.favourite_dancing_cities?.split(",")[2]
      // );
      setValue(
        "annual_event_count",
        aboutDetail?.dance_experience?.annual_event_count
      );

      setValue("first_teacher", aboutDetail?.learning_sources?.first_teacher);
      setValue(
        "chacarera_skill",
        aboutDetail?.learning_sources?.chacarera_skill
      );
      setValue("zamba_skill", aboutDetail?.learning_sources?.zamba_skill);
      setValue("tango_story", aboutDetail?.learning_sources?.tango_story);
      setValue("leading_teacher1", aboutDetail?.learning_sources?.leading_teachers?.split(",")[0]);
      setValue(
        "leading_teachers2",
        aboutDetail?.learning_sources?.leading_teachers?.split(",")[1]
      );
      setValue(
        "leading_teacher3",
        aboutDetail?.learning_sources?.leading_teachers?.split(",")[2]
      );
    }
  }, [aboutDetail, setValue]);

  const onSubmit = async (formData) => {
    console.log("save chnages called", formData);

    // Construct the payload
    const apiPayload = {
      user_questions: {
        city: [formData?.live_city],
        start_dancing: formData.start_date,
        guide_visitors: formData.guide_visitors ? true : false,
        is_nomad: formData.is_nomad ? true : false,
        lived_for_tango: formData.city,
        // .filter(Boolean)
        // .join(","),
        languages: [formData.language],
        // .filter(Boolean)
        // .join(","),
        website_url: formData.website_url,
        about: formData.about,
        dance_role_leader: formData.dance_role_leader,
        dance_role_follower: formData.dance_role_follower,
      },
      dance_experience: {
        social_dancing_cities: formData.social_dancing_cities,
        // .filter(Boolean)
        // .join(","),
        recent_workshop_cities: 
          formData.recent_workshop_cities,
        // .filter(Boolean)
        // .join(","),
        favourite_dancing_cities:
          formData.favourite_dancing_cities,
        // .filter(Boolean)
        // .join(","),
        annual_event_count: formData.annual_event_count,
      },
      teacher_experience: {
        partner_facebook_url: formData.facebook_partner,
        cities: 
          formData.teach_city,
        // .filter(Boolean)
        // .join(","),
        preferred_size: formData.preferred_size,
        teaching_reason: formData.why_teach,
        about_tango_future: formData.about_tango_future,
        online_platforms:
          aboutDetail?.teacher_experience?.online_platforms?.split(","),
      },
      learning_sources: {
        first_teacher: formData.first_teacher,
        chacarera_skill: formData.chacarera_skill,
        zamba_skill: formData.zamba_skill,
        tango_story: formData.tango_story,
        leading_teachers: [
          formData.leading_teachers1,
          formData.leading_teachers2,
          formData.leading_teachers3,
        ].filter(Boolean),
        // .join(","),
      },
    };

    console.log(apiPayload);

    try {
      const apiCalls = [];

      const userQuestionsChanged =
        formData.live_city !== aboutDetail?.user_questions?.city ||
        formData.start_date !== formatDate(aboutDetail?.user_questions?.start_dancing || '') ||
        formData.guide_visitors !==
          aboutDetail?.user_questions?.guide_visitors ||
        formData.is_nomad !== aboutDetail?.user_questions?.is_nomad ||
        formData.city !==
          aboutDetail?.user_questions?.lived_for_tango ||
        formData.language !== aboutDetail?.user_questions?.languages ||
        formData.website_url !== aboutDetail?.user_questions?.website_url ||
        formData.about !== aboutDetail?.user_questions?.about;

      if (userQuestionsChanged) {
        apiCalls.push(userQuestionsMutation(apiPayload.user_questions));
      }

      const danceExperienceChanged =
          formData.social_dancing_cities !== aboutDetail?.dance_experience?.social_dancing_cities ||
          formData.recent_workshop_cities !== aboutDetail?.dance_experience?.recent_workshop_cities ||
          formData.favourite_dancing_cities !== aboutDetail?.dance_experience?.favourite_dancing_cities ||
          formData.annual_event_count !== aboutDetail?.dance_experience?.annual_event_count;

      if (danceExperienceChanged) {
        apiCalls.push(addDanceExperienceMutation(apiPayload.dance_experience));
      }

      const teacherExperienceChanged =
        formData.facebook_partner !==
          aboutDetail?.teacher_experience?.partner_facebook_url ||
        formData.teach_city !== aboutDetail?.teacher_experience?.cities ||
        formData.preferred_size !==
          aboutDetail?.teacher_experience?.preferred_size ||
        formData.why_teach !==
          aboutDetail?.teacher_experience?.teaching_reason ||
        formData.about_tango_future !==
          aboutDetail?.teacher_experience?.about_tango_future;

      if (teacherExperienceChanged) {
        apiCalls.push(
          addTeacherExperienceMutation(apiPayload.teacher_experience)
        );
      }

      const learningSourcesChanged =
        formData.first_teacher !==
          aboutDetail?.learning_sources?.first_teacher ||
        formData.chacarera_skill !==
          aboutDetail?.learning_sources?.chacarera_skill ||
        formData.zamba_skill !== aboutDetail?.learning_sources?.zamba_skill ||
        formData.tango_story !== aboutDetail?.learning_sources?.tango_story ||
        [
          formData.leading_teachers1,
          formData.leading_teachers2,
          formData.leading_teachers3,
        ].join(",") !== aboutDetail?.learning_sources?.leading_teachers;

      console.log(learningSourcesChanged);

      if (learningSourcesChanged) {
        apiCalls.push(addLearningSourceMutation(apiPayload.learning_sources));
      }

      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        toast.success("Changes have been successfully saved.");
        getAboutRefetch();
      }

      if (apiCalls.length === 0) {
        toast.error("No changes detected. No Changes were made.");
        return;
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

//   useImperativeHandle(ref, () => ({
//     triggerOnSubmit: handleSubmit(onSubmit),
//   }));

  const clearForm = () => {
    if (aboutDetail) {
      reset(aboutDetail);
    }
  };

//   const onPrivacySet = async (val) => {
//     console.log(val, "onPrivacySet", userProfile?.id );
//     try {
//       const result = await aboutPrivacy({id:userProfile?.id, is_privacy: val});
//       const { code } = result?.data;
//       if (code === 200) {
//         toast.success("About Privacy set successfully");
//       }
//     } catch (e) {
//       console.log(e.message);
//     }
//   };

  const labelClass = "flex gap-1 mb-2 text-lg";
  const selectedBox = "bg-background-color py-3 text-md text-black ";
  return (
    <div className="md:mx-10 md:my-8">
      <div className="flex justify-between">
        <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">Overview</h2>
        {/* <div className="flex gap-3 items-center">
        <p className="font-semibold">Make my Info Private </p>
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} 
          checked={isChecked}
          onChange={() => {
            setIsChecked((prev) => !prev)
            onPrivacySet(isChecked)}}
           />}
        />
        </div> */}
      </div>
      {
        // First Form
      }
      <div className="card">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mt-5 px-0">
            <div className="rounded-lg bg-white p-5">
              <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="">
                    <label className={labelClass}>
                      Where do you (live) dance tango the most?
                    </label>
                    {/* <RHFTextField
                      type={"text"}
                      name="live_city"
                      control={control}
                      placeholder="city"
                    //   defaultValue={aboutDetail?.user_questions?.city}
                      className={`${selectedBox}`}
                      value={aboutDetail?.user_questions?.live_city}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.user_questions?.city || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2 lg:col-span-6">
                  <div>
                    <label className={labelClass}>
                      When did you start dancing?
                    </label>
                    {/* <RHFTextField
                      type={"date"}
                      name="start_date"
                      control={control}
                      // defaultValue={aboutDetail?.user_questions?.start_dancing}
                      className={`${selectedBox} py-2`}
                      value={aboutDetail?.user_questions?.start_dancing}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{formatDate(aboutDetail?.user_questions?.start_dancing || "N/A")}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="flex select-none items-center gap-1">
                    <Checkbox
                      checked={
                        aboutDetail?.user_questions?.guide_visitors !== null
                      }
                      className="border-black border"
                    />
                    <div>
                      Would you be interested in showing/
                      <br />
                      guiding visitors around your community?
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6" />

                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="flex select-none items-center gap-1">
                    <Checkbox
                      checked={aboutDetail?.user_questions?.is_nomad !== null}
                      className="border-black border"
                    />
                    <div>Or are you a Nomad?</div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6" />

                <div className="col-span-12 px-2 lg:col-span-6">
                  <div>
                    <label className={labelClass}>
                      Where have you lived for Tango (more than 6 months)?
                    </label>
                    {/* <RHFTextField
                      type={"text"}
                      name="city1"
                      control={control}
                      className={selectedBox}
                      // defaultValue={
                      //   aboutDetail?.user_questions?.lived_for_tango?.split(
                      //     ","
                      //   )[0]
                      // }
                    /> */}
                    {/* <RHFMultiSelect
                      name="city"
                      control={control}
                      errors={errors}
                      className={"bg-background-color text-xs text-[#949393] "}
                      multiple
                      value={aboutDetail?.user_questions?.city}
                    >
                      {countryList
                        // ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.user_questions?.lived_for_tango || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2 lg:col-span-6">
                  <div>
                    <label className={labelClass}>
                      What languages do you speak?
                    </label>
                    {/* <RHFTextField
                      type={"text"}
                      name="language1"
                      control={control}
                      className={selectedBox}
                      // defaultValue={
                      //   aboutDetail?.user_questions?.languages?.split(",")[0]
                      // }
                    /> */}
                    {/* <RHFMultiSelect
                      name="language"
                      control={control}
                      errors={errors}
                      className={"bg-background-color text-xs text-[#949393] "}
                      multiple
                      value={aboutDetail?.user_questions?.language}
                    >
                      {lang?.data?.map((item, index) => (
                        <MenuItem key={index} value={item?.name}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </RHFMultiSelect> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.user_questions?.language || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2 lg:col-span-6">
                  <div>
                    <label className={labelClass}>
                      What role do you dance?
                    </label>
                    {/* <RHFTextField
                      type="text"
                      name="dance_role_leader"
                      control={control}
                      // defaultValue="Tango Dance"
                      className={selectedBox}
                    /> */}
                    <p className="ps-3 text-gray-text-color"><span className="font-semibold">Follower:</span> {options[aboutDetail?.user_questions?.dance_role_follower]|| "N/A"}</p>
                    <p className="ps-3 text-gray-text-color"><span className="font-semibold">Leader:</span> {options[aboutDetail?.user_questions?.dance_role_leader] || "N/A"}</p>
                    {/* <div className="col-span-6 px-2">
                      <div>
                        <div className="flex w-60 flex-wrap gap-2">
                          {options.map((item, index) => (
                            <div
                              key={index}
                              className="text-[10px] flex gap-1 text-[#949393]"
                            >
                              <div>{index + 1}. </div>
                              <div key={index}>{item}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2">
                          <div>Leader</div>
                          <div>
                            <Slider
                              defaultValue={getValues("dance_role_leader")}
                              getAriaValueText={valuetext}
                              shiftStep={2}
                              step={1}
                              min={1}
                              max={4}
                              marks={marks}
                              valueLabelDisplay="off"
                              sx={SiderStyles}
                              onChange={handleChangeSlider}
                              name="dance_role_leader"
                            />
                          </div>

                          <br />
                          <div>Follower</div>
                          <div>
                            <Slider
                              defaultValue={getValues("dance_role_follower")}
                              getAriaValueText={valuetext}
                              shiftStep={2}
                              step={1}
                              min={1}
                              max={4}
                              marks={marks}
                              valueLabelDisplay="off"
                              sx={SiderStyles}
                              onChange={handleChangeSlider}
                              name="dance_role_follower"
                            />
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      Do you have a personal website?
                    </label>
                    {/* <RHFTextField
                      type="text"
                      name="website_url"
                      control={control}
                      // defaultValue={aboutDetail?.user_questions?.website_url}
                      className={selectedBox}
                      value={aboutDetail?.user_questions?.website_url}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.user_questions?.website_url || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>Introduction</label>
                    {/* <RHFTextArea
                      type="text"
                      name="about"
                      control={control}
                      className={`${selectedBox} h-36 text-sm`}
                      value={aboutDetail?.user_questions?.about}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.user_questions?.about || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br></br>
      <br></br>
      <hr></hr>
      <br></br>
      <br></br>
      {
        // Second Form
      }
      <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">What do you do in Tango?</h2>
      <div className="card">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mt-5 px-0">
            <div className="rounded-lg bg-white p-5">
              <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                <div className="col-span-12 mb-1 px-2">
                  <div className="text-4xl font-bold">Teacher</div>
                </div>
                <div className="col-span-12 px-2">
                  <div className="">
                    <label className={labelClass}>
                      Do you have a standard tango partner?
                    </label>
                    {/* <RHFTextField
                      type={"text"}
                      name="facebook_partner"
                      control={control}
                      placeholder="Enter Partner's Facebook Url"
                      value={
                        aboutDetail?.teacher_experience?.partner_facebook_url
                      }
                      className={`${selectedBox} py-2`}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.teacher_experience?.partner_facebook_url || "N/A"}</p>
                  </div>
                  {/* <p className="mt-2 text-sm text-gray-700">
                    Link your partner's Facebook profile for better partner
                    suggestions.
                  </p> */}
                </div>
                <div className="col-span-12 px-2">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Where do you teach ?</label>

                    {/* <RHFMultiSelect
                      name="teach_city"
                      control={control}
                      errors={errors}
                      className={"bg-background-color text-xs text-[#949393] "}
                      multiple
                    >
                      {aboutDetail?.teacher_experience?.cities
                        ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                    {/* <RHFMultiSelect
                      name="teach_city"
                      control={control}
                      errors={errors}
                      className={"bg-background-color text-xs text-[#949393] "}
                      multiple
                      value={aboutDetail?.teacher_experience?.teach_city}
                    >
                      {countryList
                        // ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.teacher_experience?.cities || "N/A"}</p>

                    {/* <RHFSelect
                      type={"text"}
                      name="teach_city1"
                      control={control}
                      errors={errors}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-1 py-2`}
                    >
                      <option value={""}>
                        {aboutDetail?.teacher_experience?.cities?.split(",")[0]}
                      </option>

                      {aboutDetail?.teacher_experience?.cities
                        ?.split(",")
                        ?.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                    </RHFSelect>

                    <RHFSelect
                      type={"text"}
                      name="teach_city2"
                      control={control}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-1 py-2`}
                    >
                      <option value={""}>
                        {aboutDetail?.teacher_experience?.cities?.split(",")[1]}
                      </option>

                      {aboutDetail?.teacher_experience?.cities
                        ?.split(",")
                        ?.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                    </RHFSelect>

                    <RHFSelect
                      type={"text"}
                      name="teach_city3"
                      control={control}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-1 py-2`}
                    >
                      <option value={""}>
                        {aboutDetail?.teacher_experience?.cities?.split(",")[2]}
                      </option>

                      {aboutDetail?.teacher_experience?.cities
                        ?.split(",")
                        ?.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                    </RHFSelect> */}
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Preferred size</label>
                    {/* <RHFMultiSelect
                      type={"text"}
                      name="preferred_size"
                      control={control}
                      placeholder="Select"
                      className={`${selectedBox} my-1 py-2`}
                      value={aboutDetail?.teacher_experience?.preferred_size}
                    >
                      <MenuItem
                        value={aboutDetail?.teacher_experience?.preferred_size}
                      >
                        {""}
                      </MenuItem>

                      {["1", "2", "3"]?.map((item, index) => (
                        <MenuItem key={index} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </RHFMultiSelect> */}
                     <p className="ps-3 text-gray-text-color">{aboutDetail?.teacher_experience?.preferred_size || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>Why do you teach?</label>
                    {/* <RHFTextArea
                      type={"text"}
                      name="why_teach"
                      control={control}
                      errors={errors}
                      className={`${selectedBox} h-36 py-2`}
                      placeholder="Write here..."
                      value={
                        aboutDetail?.teacher_experience?.teaching_reason
                      }
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.teacher_experience?.teaching_reason || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      What do you hope for as a future for tango in your
                      community and/or as a whole?
                    </label>
                    {/* <RHFTextArea
                      type={"text"}
                      name="about_tango_future"
                      control={control}
                      errors={errors}
                      className={`${selectedBox} h-36 py-2`}
                      //   placeholder="Write here..."
                      value={
                        aboutDetail?.teacher_experience?.about_tango_future
                      }
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.teacher_experience?.about_tango_future || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br></br>
      <br></br>
      <hr></hr>
      <br></br>
      <br></br>
      {
        // Third Form
      }
      <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">Where have you danced?</h2>
      <div className="card">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mt-5 px-0">
            <div className="rounded-lg bg-white p-5">
              <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="">
                    <label className={labelClass}>
                      Which cities have you danced in (except for marathon or
                      festival etc.)
                    </label>

                    {/* <RHFMultiSelect
                      type={"text"}
                      name="social_dancing_cities"
                      control={control}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                      multiple
                      value={aboutDetail?.dance_experience?.social_dancing_cities}
                    >
                      {countryList
                        // ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.dance_experience?.social_dancing_cities || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="">
                    <label className={labelClass}>
                      Most recent cities you have danced in (not including
                      marathon or festival etc)
                    </label>

                    {/* <RHFMultiSelect
                      type={"text"}
                      name="recent_workshop_cities"
                      control={control}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                      multiple
                      value={aboutDetail?.dance_experience?.recent_workshop_cities}
                    >
                      {countryList
                        // ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                  <p className="ps-3 text-gray-text-color">{aboutDetail?.dance_experience?.recent_workshop_cities || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2 lg:col-span-6">
                  <div className="">
                    <label className={labelClass}>
                      Not including your home city, which cities are your
                      favourite to dance in?
                    </label>

                    {/* <RHFMultiSelect
                      type={"text"}
                      name="favourite_dancing_cities"
                      control={control}
                      placeholder="Enter city name"
                      className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                      multiple
                      value={aboutDetail?.dance_experience?.favourite_dancing_cities}
                    >

                      {countryList
                        // ?.split(",")
                        ?.map((item, index) => (
                          <MenuItem MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                    </RHFMultiSelect> */}
                  <p className="ps-3 text-gray-text-color">{aboutDetail?.dance_experience?.favourite_dancing_cities || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      How many marathons, festivials, etc have you been to in
                      the last 12 months?
                    </label>
                    {/* <RHFTextField
                      type="text"
                      name="annual_event_count"
                      control={control}
                      // defaultValue="92a9980a7&rlz=1C1GCEU_enPK1104PK1104&q= 92a9980a7&rlz=1C1GCEU_enPK1104PK1104&q="
                      className={`${selectedBox}`}
                      value={aboutDetail?.dance_experience?.annual_event_count}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.dance_experience?.annual_event_count || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>
      <hr></hr>
      <br></br>
      <br></br>
      {
        // Third Form
      }
      <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">
        Who have you learned from?
      </h2>
      <div className="card">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mt-5 px-0">
            <div className="rounded-lg bg-white p-5">
              <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      Who was your first teacher(s)
                    </label>
                    {/* <RHFTextField
                      type="text"
                      name="first_teacher"
                      control={control}
                      className={`${selectedBox}`}
                      value={
                        aboutDetail?.learning_sources?.first_teacher
                      }
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.learning_sources?.first_teacher || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      Do you dance “Chacarera”?
                    </label>
                    {/* <RHFTextArea
                      type={"text"}
                      name="chacarera_skill"
                      control={control}
                      className={`${selectedBox} h-36 py-2`}
                      placeholder="How did you start"
                      value={
                        aboutDetail?.learning_sources?.chacarera_skill
                      }
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.learning_sources?.chacarera_skill || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>Do you dance “Zamba?</label>
                    {/* <RHFTextArea
                      type={"text"}
                      name="zamba_skill"
                      control={control}
                      className={`${selectedBox} h-36 py-2`}
                      placeholder="How did you start"
                      value={aboutDetail?.learning_sources?.zamba_skill}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.learning_sources?.zamba_skill || "N/A"}</p>
                  </div>
                </div>
                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      Tell us your tango story
                    </label>
                    {/* <RHFTextArea
                      type={"text"}
                      name="tango_story"
                      control={control}
                      className={`${selectedBox} h-36 py-2`}
                      placeholder="How did you start"
                      value={aboutDetail?.learning_sources?.tango_story}
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.learning_sources?.tango_story || "N/A"}</p>
                  </div>
                </div>

                <div className="col-span-12 px-2">
                  <div>
                    <label className={labelClass}>
                      Which teachers have you learned from the most?
                    </label>
                    {/* <RHFTextField
                      type="text"
                      name="leading_teachers1"
                      control={control}
                      placeholder="Enter URL"
                      className={`${selectedBox} my-2`}
                    //   value={aboutDetail?.learning_sources?.leading_teachers}
                      value={
                        aboutDetail?.learning_sources?.leading_teachers?.split(
                          ","
                        )[0]
                      }
                    />
                    <RHFTextField
                      type="text"
                      name="leading_teachers2"
                      control={control}
                      placeholder="Enter URL"
                      className={`${selectedBox} my-2`}
                      value={
                        aboutDetail?.learning_sources?.leading_teachers?.split(
                          ","
                        )[1]
                      }
                    />
                    <RHFTextField
                      type="text"
                      name="leading_teacher3"
                      control={control}
                      placeholder="Enter URL"
                      className={`${selectedBox} my-2`}
                      value={
                        aboutDetail?.learning_sources?.leading_teachers?.split(
                          ","
                        )[2]
                      }
                    /> */}
                    <p className="ps-3 text-gray-text-color">{aboutDetail?.learning_sources?.leading_teachers || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AboutTabContentUser;

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#44ad45',
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#2ECA45',
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D',
    }),
  },
}));
