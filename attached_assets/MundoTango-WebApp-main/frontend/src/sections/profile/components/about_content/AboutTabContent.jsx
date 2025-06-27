"use client";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import RHFTextField from "@/components/FORMs/RHFTextField";
import { styled } from "@mui/material/styles";
import {
  useAddAttachmentHostExperienceMutation,
  useAddCreatorExperienceMutation,
  useAddDanceExperienceMutation,
  useAddDjExperienceMutation,
  useAddLearningSourceMutation,
  useAddOrganizerExperienceMutation,
  useAddPerformExperienceMutation,
  useAddPhotographerExperienceMutation,
  useAddTeacherExperienceMutation,
  useAddTourHostExperienceMutation,
  useGetLanguagesQuery,
  useGetTrangoActivityMutation,
  useStoreTrangoActivityMutation,
  useUserQuestionsMutation,
} from "@/data/services/userFormsApi";
import { formatDate } from "@/utils/helper";
import {
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Slider,
  Switch,
} from "@mui/material";
import { City, Country } from "country-state-city";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAboutPrivacyMutation } from "@/data/services/friendApi";
import SearchIcon from "@/components/SVGs/SearchIcon";
import { useAuthContext } from "@/auth/useAuthContext";
import InputStar from "@/components/Stars/InputStar";
import AddMore from "@/components/SVGs/AddMore";
import { DynamicError } from "@/sections/auth/questionnaire/HousingHost";
import PlusIcon from "@/components/SVGs/PlusIcon";

const AboutTabContent = forwardRef(
  ({ data, loading, getAboutRefetch, userProfile }, ref) => {
    const [aboutDetail, setAboutDetail] = useState(null);
    const [isChecked, setIsChecked] = useState(userProfile?.is_privacy);
    const [countryList, setCountryList] = useState(Country.getAllCountries());
    const { data: languages } = useGetLanguagesQuery();
    const [LanguageList, setLanguageList] = useState(languages?.data);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [city, setCity] = useState([]);
    const [live_cityAnchorEl, setlive_cityAnchorEl] = useState(null);
    const live_cityOpen = Boolean(live_cityAnchorEl);
    const [live_city, setLive_city] = useState([]);
    const [languageAnchor, setlanguageAnchor] = useState(null);
    const languageOpen = Boolean(languageAnchor);
    const [language, setLanguage] = useState([]);
    const [teachCityAnchor, setTeachCityAnchor] = useState(null);
    const teachCityeOpen = Boolean(teachCityAnchor);
    const [teach_city, setTeach_city] = useState([]);
    const [anchorElSocial, setAnchorElSocial] = useState(null);
    const [anchorElRecent, setAnchorElRecent] = useState(null);
    const [anchorElFav, setAnchorElFav] = useState(null);
    const openSocial = Boolean(anchorElSocial);
    const openRecent = Boolean(anchorElRecent);
    const openFav = Boolean(anchorElFav);
    const [social_dancing_cities, setSocial_dancing_cities] = useState([]);
    const [recent_workshop_cities, setRecent_workshop_cities] = useState([]);
    const [favourite_dancing_cities, setFavourite_dancing_cities] = useState(
      []
    );
    const [zamba_skill, setzamba_skill] = useState(0);
    const [chacarera_skill, setchacarera_skill] = useState(0);
    const [dance_role_leader, setdance_role_leader] = useState(0);
    const [dance_role_follower, setdance_role_follower] = useState(0);
    const [valuecheck, setValueCheck] = useState("");
    const [hostEvent, setHostEvent] = useState("");
    const [flag, setFlag] = useState(true);
    const [aboutPrivacy, {}] = useAboutPrivacyMutation();
    const [
      getTrangoActivities,
      { data: trongoactivity, isLoading: getLoading },
    ] = useGetTrangoActivityMutation();

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

    const { fields, append, remove } = useFieldArray({
      control,
      name: "housing",
    });

    const options = [
      "None",
      "Just a few classes",
      "A little bit at milongas",
      "As much as I can",
      "All the time",
    ];

    const danceoptions = [
      "No",
      "Some classes",
      "Can dance some",
      "Like to dance it ",
      "Love it",
      "Teach",
      "Perform",
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
      // {
      //   value: 0,
      //   label: <div className="text-xs mt-2">0</div>,
      // },
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
      {
        value: 5,
        label: <div className="text-xs mt-2">5</div>,
      },
    ];
    const dancemarks = [
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
      // {
      //   value: 8,
      //   label: <div className="text-xs mt-2">8</div>,
      // },
    ];
    function valuetext(value) {
      return `${value}°C`;
    }

    const eventsArray = [
      "practica",
      "milonga",
      "marathon",
      "festival",
      "encuentro",
      "competition",
      "workshop",
      "other",
    ];

    const [userQuestionsMutation] = useUserQuestionsMutation();
    const [addDanceExperienceMutation] = useAddDanceExperienceMutation();
    const [storeTrangoActivityMutation] = useStoreTrangoActivityMutation();
    const [addTeacherExperienceMutation] = useAddTeacherExperienceMutation();
    const [addLearningSourceMutation] = useAddLearningSourceMutation();
    const [addOrganizerExperience] = useAddOrganizerExperienceMutation();
    const [addDjExperience] = useAddDjExperienceMutation();
    const [addCreatorExperience] = useAddCreatorExperienceMutation();
    const [addPhotographerExperience] = useAddPhotographerExperienceMutation();
    const [addPerformExperience] = useAddPerformExperienceMutation();
    const [addAttachmentHostExperience] =
      useAddAttachmentHostExperienceMutation();
    const [addTourHostExperience] = useAddTourHostExperienceMutation();

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
      console.log(inputName, inputValue);
      setValue(inputName, inputValue);
      if (inputName === "chacarera_skill") {
        setchacarera_skill(inputValue);
      }
      if (inputName === "dance_role_leader") {
        setdance_role_leader(inputValue);
      }
      if (inputName === "dance_role_follower") {
        setdance_role_follower(inputValue);
      }
      if (inputName === "zamba_skill") {
        setzamba_skill(inputValue);
      }
    };

    const handleChangeCheckbox = async (e, option) => {
      try {
        setValue("use_external_equipments", option);
        setFlag(!flag);
      } catch (e) {
        console.log(e.message);
      }
    };

    useEffect(() => {
      if (languages) {
        setLanguageList(languages?.data);
      }
    }, [languages]);

    useEffect(() => {
      if (aboutDetail) {
        setValue("live_city", aboutDetail?.user_questions?.city.split(","));
        setValue(
          "start_date",
          formatDate(aboutDetail?.user_questions?.start_dancing)
        );
        setValue(
          "guide_visitors",
          aboutDetail?.user_questions?.guide_visitors || false
        );
        setValue("is_nomad", aboutDetail?.user_questions?.is_nomad || false);
        setValue(
          "dance_role_follower",
          aboutDetail?.user_questions?.dance_role_follower
        );
        setdance_role_follower(
          aboutDetail?.user_questions?.dance_role_follower
        );
        setValue(
          "dance_role_leader",
          aboutDetail?.user_questions?.dance_role_leader
        );
        setdance_role_leader(aboutDetail?.user_questions?.dance_role_leader);
        setValue("website_url", aboutDetail?.user_questions?.website_url);
        setValue(
          "city",
          aboutDetail?.user_questions?.lived_for_tango?.split(",")
        );
        setValue(
          "language",
          aboutDetail?.user_questions?.languages?.split(",")
        );
        setValue("about", aboutDetail?.user_questions?.about);

        setValue(
          "facebook_partner",
          aboutDetail?.teacher_experience?.partner_facebook_url
        );
        setValue(
          "teach_city",
          aboutDetail?.teacher_experience?.cities?.split(",")
        );
        setValue(
          "preferred_size",
          aboutDetail?.teacher_experience?.preferred_size
        );
        setValue("why_teach", aboutDetail?.teacher_experience?.teaching_reason);
        setValue(
          "about_tango_future",
          aboutDetail?.teacher_experience?.about_tango_future
        );
        setValue(
          "social_dancing_cities",
          aboutDetail?.dance_experience?.social_dancing_cities?.split(",")
        );
        setValue(
          "recent_workshop_cities",
          aboutDetail?.dance_experience?.recent_workshop_cities?.split(",")
        );
        setValue(
          "favourite_dancing_cities",
          aboutDetail?.dance_experience?.favourite_dancing_cities?.split(",")
        );
        setValue(
          "annual_event_count",
          aboutDetail?.dance_experience?.annual_event_count
        );

        // Organizers
        setValue(
          "hosted_events",
          aboutDetail?.organizer_experience?.hosted_events
        );
        setValue(
          "hosted_event_types",
          aboutDetail?.organizer_experience?.hosted_event_types?.split(",")
        );
        const checkValue = getValues("hosted_event_types");
        if (eventsArray?.some(x => !checkValue?.includes(x))) {
          setValueCheck("other");
          setValue(
            "other_event",
            aboutDetail?.organizer_experience?.hosted_event_types?.split(",")?.filter(
              (t) =>  !eventsArray?.includes(t)
            )[0]
          );
        }

        // Dj Form
        setValue(
          "performed_events",
          aboutDetail?.dj_experience?.performed_events
        );
        setValue(
          "favourite_orchestra",
          aboutDetail?.dj_experience?.favourite_orchestra
        );
        setValue(
          "favourite_singer",
          aboutDetail?.dj_experience?.favourite_singer
        );
        setValue("milonga_size", aboutDetail?.dj_experience?.milonga_size);
        setValue(
          "use_external_equipments",
          aboutDetail?.dj_experience?.use_external_equipments ? "Yes" : "No"
        );
        setValue("dj_softwares", aboutDetail?.dj_experience?.dj_softwares);

        // Creator
        setValue("shoes_url", aboutDetail?.creator_experience?.shoes_url);
        setValue("clothing_url", aboutDetail?.creator_experience?.clothing_url);
        setValue("jewelry", aboutDetail?.creator_experience?.jewelry);
        setValue(
          "vendor_activities",
          aboutDetail?.creator_experience?.vendor_activities
        );
        setValue("vendor_url", aboutDetail?.creator_experience?.vendor_url);

        // Photographer
        setValue("role", aboutDetail?.photographer_experience?.role);
        setValue(
          "facebook_profile_url",
          aboutDetail?.photographer_experience?.facebook_profile_url
        );
        setValue(
          "videos_taken_count",
          aboutDetail?.photographer_experience?.videos_taken_count
        );

        // Performer
        setValue(
          "partner_profile_link",
          aboutDetail?.performer_experience?.partner_profile_link
        );
        setValue(
          "partner_profile_link1",
          aboutDetail?.performer_experience?.partner_profile_link?.split(",")[0]
        );
        setValue(
          "partner_profile_link2",
          aboutDetail?.performer_experience?.partner_profile_link?.split(",")[1]
        );
        setValue(
          "partner_profile_link3",
          aboutDetail?.performer_experience?.partner_profile_link?.split(",")[2]
        );
        setValue(
          "recent_performance_url",
          aboutDetail?.performer_experience?.recent_performance_url
        );

        // Housing Host
        let record = [];
        for (let i = 0; i < 1; i++) {
          const { city, property_url, space, people } =
            aboutDetail?.housing_host;

          record.push({
            city: city.split(",") || [],
            property_url: property_url || "",
            space: space || "",
            people: people || 0,
          });
        }

        setValue("housing", record);

        // Tour
        setValue("theme", aboutDetail?.tour_operator?.theme);
        setValue("website_url", aboutDetail?.tour_operator?.website_url);
        setValue("vendor_url", aboutDetail?.tour_operator?.vendor_url);
        setValue(
          "vendor_activities",
          aboutDetail?.tour_operator?.vendor_activities
        );

        // Where do you learn
        setValue("first_teacher", aboutDetail?.learning_sources?.first_teacher);
        setValue(
          "chacarera_skill",
          aboutDetail?.learning_sources?.chacarera_skill
        );
        setchacarera_skill(
          Number(aboutDetail?.learning_sources?.chacarera_skill)
        );
        setValue("zamba_skill", aboutDetail?.learning_sources?.zamba_skill);
        setzamba_skill(aboutDetail?.learning_sources?.zamba_skill);
        setValue("tango_story", aboutDetail?.learning_sources?.tango_story);
        setValue(
          "leading_teachers1",
          aboutDetail?.learning_sources?.leading_teachers?.split(",")[0]
        );
        setValue(
          "leading_teachers2",
          aboutDetail?.learning_sources?.leading_teachers?.split(",")[1]
        );
        setValue(
          "leading_teachers3",
          aboutDetail?.learning_sources?.leading_teachers?.split(",")[2]
        );
      }
    }, [aboutDetail, setValue]);

    useEffect(() => {
      getTrangoActivities();
    }, []);

    const onSubmit = async (formData) => {
      console.log("save chnages called", formData);

      let body = formData.housing;
      let text = [];

      for (let i = 0; i < body.length; i++) {
        const { ...other } = body[i];
        text.push(other);
      }

      let event_types = [formData?.organizer_experience?.hosted_event_types];
      event_types?.push(formData?.other_event);
      const events = event_types;

      const apiPayload = {
        user_questions: {
          city:
            live_city?.length > 0
              ? live_city
              : formData?.live_city ||
                aboutDetail?.user_questions?.city.split(","),
          start_dancing: formData.start_date,
          guide_visitors: formData.guide_visitors ? true : false,
          is_nomad: formData.is_nomad ? true : false,
          lived_for_tango:
            city?.length > 0
              ? city
              : formData?.city ||
                aboutDetail?.user_questions?.lived_for_tango?.split(","),
          // .filter(Boolean)
          // .join(","),
          languages: formData.language,
          // .filter(Boolean)
          // .join(","),
          website_url: formData.website_url,
          about: formData.about,
          dance_role_leader: dance_role_leader,
          dance_role_follower: dance_role_follower,
        },
        dance_experience: {
          social_dancing_cities:
            social_dancing_cities?.length > 0
              ? social_dancing_cities
              : formData.social_dancing_cities ||
                aboutDetail?.dance_experience?.social_dancing_cities?.split(
                  ","
                ),
          // .filter(Boolean)
          // .join(","),
          recent_workshop_cities:
            recent_workshop_cities?.length > 0
              ? recent_workshop_cities
              : formData.recent_workshop_cities ||
                aboutDetail?.dance_experience?.recent_workshop_cities?.split(
                  ","
                ),
          // .filter(Boolean)
          // .join(","),
          favourite_dancing_cities:
            favourite_dancing_cities?.length > 0
              ? favourite_dancing_cities
              : formData.favourite_dancing_cities ||
                aboutDetail?.dance_experience?.favourite_dancing_cities?.split(
                  ","
                ),
          // .filter(Boolean)
          // .join(","),
          annual_event_count: formData.annual_event_count,
        },
        teacher_experience: {
          partner_facebook_url: formData.facebook_partner,
          cities:
            teach_city?.length > 0
              ? teach_city
              : formData?.teach_city ||
                aboutDetail?.teacher_experience?.cities?.split(","),
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
          chacarera_skill: chacarera_skill,
          zamba_skill: zamba_skill,
          tango_story: formData.tango_story,
          visited_buenos_aires: true,
          leading_teachers: [
            formData.leading_teachers1,
            formData.leading_teachers2,
            formData.leading_teachers3,
          ].filter(Boolean),
          // .join(","),
        },
        creator_experience: {
          shoes_url: formData.shoes_url,
          clothing_url: formData.clothing_url,
          jewelry: formData.jewelry,
          vendor_activities: formData.vendor_activities,
          vendor_url: formData.vendor_url,
        },
        dj_experience: {
          performed_events: formData.performed_events,
          use_external_equipments:
            formData?.use_external_equipments === "Yes" ? true : false,
          favourite_orchestra: formData?.favourite_orchestra,
          favourite_singer: formData?.favourite_singer,
          milonga_size: formData?.milonga_size,
          dj_softwares: formData?.dj_softwares,
          cities: [aboutDetail?.dj_experience?.cities],
        },
        housing_host: text,
        organizer_experience: {
          hosted_event_types: events,
          hosted_events: formData?.hosted_events,
          cities: [aboutDetail?.organizer_experience?.cities],
        },
        performer_experience: {
          recent_performance_url: formData?.recent_performance_url,
          partner_profile_link: [
            formData?.partner_profile_link1,
            formData?.partner_profile_link2,
            formData?.partner_profile_link3,
          ],
        },
        photographer_experience: {
          role: formData?.role,
          facebook_profile_url: formData?.facebook_profile_url,
          videos_taken_count: formData?.videos_taken_count,
          cities: [aboutDetail?.photographer_experience?.cities],
        },
        tour_operator: {
          website_url: formData?.website_url,
          theme: formData?.theme,
          vendor_activities: formData?.vendor_activities,
          vendor_url: formData?.vendor_url,
        },
      };

      console.log(apiPayload);

      try {
        const apiCalls = [];

        const userQuestionsChanged =
          formData.live_city !== aboutDetail?.user_questions?.city ||
          formData.start_date !==
            formatDate(aboutDetail?.user_questions?.start_dancing || "") ||
          formData.guide_visitors !==
            aboutDetail?.user_questions?.guide_visitors ||
          formData.is_nomad !== aboutDetail?.user_questions?.is_nomad ||
          formData.city !== aboutDetail?.user_questions?.lived_for_tango ||
          formData.language !== aboutDetail?.user_questions?.languages ||
          formData.website_url !== aboutDetail?.user_questions?.website_url ||
          formData.about !== aboutDetail?.user_questions?.about;

        if (userQuestionsChanged) {
          apiCalls.push(userQuestionsMutation(apiPayload.user_questions));
        }

        const danceExperienceChanged =
          formData.social_dancing_cities !==
            aboutDetail?.dance_experience?.social_dancing_cities ||
          formData.recent_workshop_cities !==
            aboutDetail?.dance_experience?.recent_workshop_cities ||
          formData.favourite_dancing_cities !==
            aboutDetail?.dance_experience?.favourite_dancing_cities ||
          formData.annual_event_count !==
            aboutDetail?.dance_experience?.annual_event_count;

        if (danceExperienceChanged) {
          apiCalls.push(
            addDanceExperienceMutation(apiPayload.dance_experience)
          );
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

        if (learningSourcesChanged) {
          apiCalls.push(addLearningSourceMutation(apiPayload.learning_sources));
        }

        const creatorExperienceChanged =
          formData.shoes_url !== aboutDetail?.creator_experience?.shoes_url ||
          formData.clothing_url !==
            aboutDetail?.creator_experience?.clothing_url ||
          formData.jewelry !== aboutDetail?.creator_experience?.jewelry ||
          formData.vendor_activities !==
            aboutDetail?.creator_experience?.vendor_activities ||
          formData.vendor_url !== aboutDetail?.creator_experience?.vendor_url;

        if (creatorExperienceChanged) {
          apiCalls.push(addCreatorExperience(apiPayload.creator_experience));
        }

        const djExperienceChanged =
          formData.performed_events !==
            aboutDetail?.dj_experience?.performed_events ||
          formData.favourite_orchestra !==
            aboutDetail?.dj_experience?.favourite_orchestra ||
          formData.favourite_singer !==
            aboutDetail?.dj_experience?.favourite_singer ||
          formData.milonga_size !== aboutDetail?.dj_experience?.milonga_size ||
          formData.dj_softwares !== aboutDetail?.dj_experience?.dj_softwares;

        if (djExperienceChanged) {
          apiCalls.push(addDjExperience(apiPayload.dj_experience));
        }

        const organizerExperienceChanged =
          formData.hosted_event_types !== events ||
          formData.hosted_events !==
            aboutDetail?.organizer_experience?.hosted_events;

        if (organizerExperienceChanged) {
          apiCalls.push(
            addOrganizerExperience(apiPayload.organizer_experience)
          );
        }
        let profile_link = [
          aboutDetail?.performer_experience?.performer_profile_link,
        ];
        const performerExperienceChanged =
          apiPayload.performer_experience.recent_performance_url !==
          aboutDetail?.performer_experience?.recent_performance_url;
        apiPayload.performer_experience.partner_profile_link !== profile_link;

        if (performerExperienceChanged) {
          apiCalls.push(addPerformExperience(apiPayload.performer_experience));
        }

        const photographerExperienceChanged =
          formData.role !== aboutDetail?.photographer_experience?.role ||
          formData.facebook_profile_url !==
            aboutDetail?.photographer_experience?.facebook_profile_url ||
          formData.videos_taken_count !==
            aboutDetail?.photographer_experience?.videos_taken_count;

        if (photographerExperienceChanged) {
          apiCalls.push(
            addPhotographerExperience(apiPayload.photographer_experience)
          );
        }

        const tourOperatorExperienceChanged =
          formData.website_url !== aboutDetail?.tour_operator?.website_url ||
          formData.theme !== aboutDetail?.tour_operator?.theme ||
          formData.vendor_activities !==
            aboutDetail?.tour_operator?.vendor_activities ||
          formData.vendor_url !== aboutDetail?.tour_operator?.vendor_url;

        if (tourOperatorExperienceChanged) {
          apiCalls.push(addTourHostExperience(apiPayload.tour_operator));
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

    useImperativeHandle(ref, () => ({
      triggerOnSubmit: handleSubmit(onSubmit),
    }));

    const clearForm = () => {
      if (aboutDetail) {
        reset(aboutDetail);
      }
    };

    const onPrivacySet = async (val) => {
      console.log(val, "onPrivacySet", userProfile?.id);
      try {
        const result = await aboutPrivacy({
          id: userProfile?.id,
          is_privacy: val,
        });
        const { code } = result?.data;
        if (code === 200) {
          toast.success("About Privacy set successfully");
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    useEffect(() => {
      const checkValue = getValues("hosted_event_types");
      if (checkValue?.includes("other")) {
        setValueCheck("other");
      } else {
        setValueCheck("");
      }
    }, [hostEvent === "other"]);

    const addAnOtherForm = async () => {
      append({
        property_url: "",
        city: [],
        space: "",
        people: "",
        image: [],
      });
    };

    const labelClass = "flex gap-1 mb-2 text-lg";
    const selectedBox = "bg-background-color py-3 text-md text-black ";
    return (
      <div className="md:mx-28 md:my-14">
        <div className="flex justify-between">
          <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">Overview</h2>
          <div className="flex gap-3 items-center">
            <p className="font-semibold">Make my Info Private </p>
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ m: 1 }}
                  checked={isChecked}
                  onChange={() => {
                    setIsChecked((prev) => !prev);
                    onPrivacySet(isChecked);
                  }}
                />
              }
            />
          </div>
        </div>
        {
          // First Form
        }
        <div className="card">
          <div className="grid grid-cols-12">
            <div className="col-span-12 mt-5 px-0">
              <div className="rounded-lg bg-white p-5">
                <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                  {/* <div className="col-span-12 px-2 lg:col-span-6">
                    <div className="">
                      <label className={labelClass}>
                        Where do you (live) dance tango the most?
                      </label>
                      <RHFTextField
                        name="live_city"
                        type={"text"}
                        control={control}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        value={live_city?.join(", ")}
                        onClick={(e) => setlive_cityAnchorEl(e.currentTarget)}
                      />
                    </div>
                    <MenuPop
                      handleClose={() => setlive_cityAnchorEl(null)}
                      anchorEl={live_cityAnchorEl}
                      open={live_cityOpen}
                      setCity={setLive_city}
                      city={live_city}
                    />
                  </div> */}
                  {/* <div className="col-span-12 lg:col-span-4" /> */}

                  <div className="col-span-12 px-2 lg:col-span-8">
                    <div>
                      <label className={labelClass}>
                        When did you start dancing?
                      </label>
                      <RHFTextField
                        type={"date"}
                        name="start_date"
                        control={control}
                        // defaultValue={aboutDetail?.user_questions?.start_dancing}
                        className={`${selectedBox} py-2`}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2 lg:col-span-12">
                    <div className="flex select-none items-center gap-1">
                      <Checkbox
                        checked={
                          aboutDetail?.user_questions?.guide_visitors !== null
                        }
                      />
                      <div>
                        Would you be interested in showing/
                        <br />
                        guiding visitors around your community?
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-12" />

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
                      <RHFTextField
                        name="city"
                        type={"text"}
                        control={control}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        value={city?.join(", ")}
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                      />
                    </div>
                    <MenuPop
                      handleClose={() => setAnchorEl(null)}
                      anchorEl={anchorEl}
                      open={open}
                      setCity={setCity}
                      city={city}
                    />
                  </div>

                  <div className="col-span-12 px-2 lg:col-span-6">
                    <div>
                      <label className={labelClass}>
                        What languages do you speak?
                      </label>
                      {/* <RHFTextField
                        name="language"
                        type={"text"}
                        control={control}
                        placeholder="Select City Name"
                        className={"bg-background-color text-sm text-gray-text-color"}
                        value={language?.join(", ")}
                        onClick={(e) => setlanguageAnchor(e.currentTarget)}
                      /> */}
                      <RHFMultiSelect
                        name="language"
                        control={control}
                        errors={errors}
                        className={
                          "bg-background-color text-xs text-[#949393] "
                        }
                        multiple
                      >
                        {LanguageList?.map((item, index) => (
                          <MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                      </RHFMultiSelect>
                    </div>
                    {/* <MenuPop
                      handleClose={() => setlanguageAnchor(null)}
                      anchorEl={languageAnchor}
                      open={languageOpen}
                      setCity={setLanguage}
                      city={language}
                    /> */}
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
                      <div className="col-span-6 px-2">
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
                                max={5}
                                marks={marks}
                                valueLabelDisplay="off"
                                sx={SiderStyles}
                                onChange={handleChangeSlider}
                                name="dance_role_leader"
                                value={dance_role_leader}
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
                                max={5}
                                marks={marks}
                                valueLabelDisplay="off"
                                sx={SiderStyles}
                                onChange={handleChangeSlider}
                                name="dance_role_follower"
                                value={dance_role_follower}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <p className="ps-3 text-gray-text-color">
                        <span className="font-semibold">Follower:</span>{" "}
                        {options[
                          aboutDetail?.user_questions?.dance_role_follower
                        ] || "N/A"}
                      </p>
                      <p className="ps-3 text-gray-text-color">
                        <span className="font-semibold">Leader:</span>{" "}
                        {options[
                          aboutDetail?.user_questions?.dance_role_leader
                        ] || "N/A"}
                      </p> */}
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        Do you have a personal website?
                      </label>
                      <RHFTextField
                        type="text"
                        name="website_url"
                        control={control}
                        // defaultValue={aboutDetail?.user_questions?.website_url}
                        className={selectedBox}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>Introduction</label>
                      <RHFTextArea
                        type="text"
                        name="about"
                        control={control}
                        className={`${selectedBox} h-36 text-sm`}
                        // defaultValue={aboutDetail?.user_questions?.about}
                      />
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
        {
          // Teacher
        }
        <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">
          What do you do in Tango?
        </h2>
        {trongoactivity?.data?.teacher_at && (
          <>
            {" "}
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
                          <RHFTextField
                            type={"text"}
                            name="facebook_partner"
                            control={control}
                            placeholder="Enter Partner's Facebook Url"
                            // value={
                            //   aboutDetail?.teacher_experience?.partner_facebook_url
                            // }
                            className={`${selectedBox} py-2`}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-700">
                          Link your partner's Facebook profile for better
                          partner suggestions.
                        </p>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>
                            Where do you teach ?
                          </label>
                          <RHFTextField
                            name="teach_city"
                            type={"text"}
                            control={control}
                            placeholder="Select City Name"
                            className={
                              "bg-background-color text-sm text-gray-text-color"
                            }
                            value={teach_city?.join(", ")}
                            onClick={(e) => setTeachCityAnchor(e.currentTarget)}
                          />
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
                        className={
                          "bg-background-color text-xs text-[#949393] "
                        }
                        multiple
                      >
                        {countryList
                          // ?.split(",")
                          ?.map((item, index) => (
                            <MenuItem MenuItem key={index} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          ))}
                      </RHFMultiSelect> */}
                        </div>
                        <MenuPop
                          handleClose={() => setTeachCityAnchor(null)}
                          anchorEl={teachCityAnchor}
                          open={teachCityeOpen}
                          setCity={setTeach_city}
                          city={teach_city}
                        />
                      </div>

                      {/* <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>Preferred size</label>
                      <RHFMultiSelect
                        type={"text"}
                        name="preferred_size"
                        control={control}
                        placeholder="Select"
                        className={`${selectedBox} my-1 py-2`}
                      >
                        <MenuItem
                          value={
                            aboutDetail?.teacher_experience?.preferred_size
                          }
                        >
                          {""}
                        </MenuItem>

                        {["1", "2", "3"]?.map((item, index) => (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </RHFMultiSelect>
                    </div>
                  </div> */}

                      <div className="col-span-12 px-2">
                        <div>
                          <label className={labelClass}>
                            Why do you teach?
                          </label>
                          <RHFTextArea
                            type={"text"}
                            name="why_teach"
                            control={control}
                            errors={errors}
                            className={`${selectedBox} h-36 py-2`}
                            placeholder="Write here..."
                            // defaultValue={
                            //   aboutDetail?.teacher_experience?.teaching_reason
                            // }
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div>
                          <label className={labelClass}>
                            What do you hope for as a future for tango in your
                            community and/or as a whole?
                          </label>
                          <RHFTextArea
                            type={"text"}
                            name="about_tango_future"
                            control={control}
                            errors={errors}
                            className={`${selectedBox} h-36 py-2`}
                            //   placeholder="Write here..."
                            // defaultValue={
                            //   aboutDetail?.teacher_experience?.about_tango_future
                            // }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Organizer
        }
        {trongoactivity?.data?.organizer_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">Organizer</div>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            How many events have you hosted in the last 12
                            months?
                          </label>
                          <RHFTextField
                            type={"number"}
                            name="hosted_events"
                            control={control}
                            errors={errors}
                            placeholder="Enter here Host Event..."
                            rules={{
                              required: "Host Event is required.",
                            }}
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            Type of events you host?
                          </label>
                          <RHFMultiSelect
                            name="hosted_event_types"
                            control={control}
                            errors={errors}
                            placeholder="Host Event Type here..."
                            rules={{
                              required: "Host Event Type is required.",
                            }}
                            className={
                              "bg-background-color text-xs text-[#949393] "
                            }
                            multiple
                          >
                            {eventsArray?.map((item, index) => (
                              <MenuItem
                                key={index}
                                value={item}
                                onClick={() =>
                                  setHostEvent((prev) =>
                                    prev === "other" ? "" : "other"
                                  )
                                }
                              >
                                {item}
                              </MenuItem>
                            ))}
                          </RHFMultiSelect>
                        </div>
                      </div>
                      <div className="col-span-12 px-2">
                        {valuecheck && (
                          <RHFTextField
                            type={"text"}
                            name="other_event"
                            control={control}
                            errors={errors}
                            placeholder="Enter other event"
                            className={`${selectedBox} py-2`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // DJForm
        }
        {trongoactivity?.data?.dj_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">DJ</div>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            <InputStar /> How many events have you DJ'ed in the
                            last 12 months?
                          </label>
                          <RHFTextField
                            type={"number"}
                            name="performed_events"
                            control={control}
                            // errors={errors}
                            placeholder="Enter here..."
                            // rules={{
                            //   required: "Performed Events is required.",
                            // }}
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            Favorite Orchestra
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="favourite_orchestra"
                            control={control}
                            errors={errors}
                            placeholder="Enter here..."
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>Favourite singer</label>
                          <RHFTextField
                            type={"text"}
                            name="favourite_singer"
                            control={control}
                            errors={errors}
                            placeholder="Enter here..."
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            Prefered milonga size
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="milonga_size"
                            control={control}
                            errors={errors}
                            placeholder="Enter here..."
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            <InputStar /> Do you use External Equipment
                          </label>
                          <div className="flex gap-10">
                            <div className="flex items-center">
                              <Checkbox
                                name="use_external_equipments"
                                onChange={(e) => handleChangeCheckbox(e, "Yes")}
                                checked={
                                  getValues("use_external_equipments") === "Yes"
                                }
                              />
                              <div>Yes</div>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                name="use_external_equipments"
                                onChange={(e) => handleChangeCheckbox(e, "No")}
                                checked={
                                  getValues("use_external_equipments") === "No"
                                }
                              />
                              <div>No</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            <InputStar />
                            DJ software used
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="dj_softwares"
                            control={control}
                            placeholder="Enter here..."
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Creator
        }
        {trongoactivity?.data?.creator_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">Creator</div>
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
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Photographer
        }
        {trongoactivity?.data?.photographer_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">
                          Photographer / Videographer
                        </div>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>
                            <InputStar /> Are You?
                          </label>
                          <RHFSelect
                            name="role"
                            control={control}
                            errors={errors}
                            rules={{
                              required: "Are You is required.",
                            }}
                            className={`${selectedBox}`}
                          >
                            <option>Select</option>
                            {["photographer", "videographer", "both"].map(
                              (item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              )
                            )}
                          </RHFSelect>
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            {/* <InputStar />  */}
                            Where do you post your photos/videos? Do you have a
                            dedicated website or Facebook profile?
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="facebook_profile_url"
                            control={control}
                            // errors={errors}
                            // rules={{
                            //   required:
                            //     "Enter Website or Facebook Link is required.",
                            // }}
                            placeholder="Enter Website Link/ Facebook Profile Link"
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            {/* <InputStar />  */}
                            How many events have you taken photos or videos of
                            in the past 12 months?
                          </label>
                          <RHFTextField
                            type={"number"}
                            name="videos_taken_count"
                            control={control}
                            // errors={errors}
                            // rules={{
                            //   required: "Video taken count is required.",
                            // }}
                            placeholder="Enter here..."
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Performer
        }
        {trongoactivity?.data?.performer_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">Performer</div>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="flex flex-col gap-1">
                          <label className={labelClass}>
                            Do you have a standard tango partner?
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="partner_profile_link1"
                            control={control}
                            placeholder="Enter Partner's Facebook Url"
                            className={`${selectedBox} py-2 `}
                          />
                          <RHFTextField
                            type={"text"}
                            name="partner_profile_link2"
                            control={control}
                            placeholder="Enter Partner's Facebook Url"
                            className={`${selectedBox} py-2 `}
                          />
                          <RHFTextField
                            type={"text"}
                            name="partner_profile_link3"
                            control={control}
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
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Host
        }
        {trongoactivity?.data?.host_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">Housing Host</div>
                      </div>
                      {fields.map((item, i) => {
                        return (
                          <React.Fragment key={item.id}>
                            <div className="col-span-12 px-2 relative">
                              <div className="">
                                <label className={labelClass}>
                                  Have you listed your property (Airbnb, VRBO,
                                  etc)?
                                </label>
                                <RHFTextField
                                  type={"text"}
                                  name={`housing.${i}.property_url`}
                                  control={control}
                                  errors={errors}
                                  placeholder="Enter Property Url"
                                  className={`${selectedBox} py-2 `}
                                />
                              </div>
                              {i !== 0 && (
                                <button
                                  className="absolute top-1 right-1 text-white bg-gray-400 p-1 rounded-full text-xs"
                                  onClick={() => removeForm(i)}
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

                            <div className="col-span-12 px-2">
                              <div className="">
                                <label className={labelClass}>
                                  {/* <InputStar />  */}
                                  What kind of Space?
                                </label>
                                <RHFTextField
                                  name={`housing.${i}.space`}
                                  type={"text"}
                                  control={control}
                                  className={
                                    "bg-background-color text-sm text-gray-text-color"
                                  }
                                />

                                <DynamicError
                                  errors={errors["housing"]}
                                  name={"space"}
                                  index={i}
                                />
                              </div>
                            </div>

                            <div className="col-span-12 px-2">
                              <div className="">
                                <label className={labelClass}>
                                  How many people?
                                </label>

                                <RHFTextField
                                  name={`housing.${i}.people`}
                                  type={"number"}
                                  control={control}
                                  className={
                                    "bg-background-color text-sm text-gray-text-color"
                                  }
                                />

                                <DynamicError
                                  errors={errors["housing"]}
                                  name={"people"}
                                  index={i}
                                />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {/* <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>Add Another</label>
                          <AddMore
                            className="cursor-pointer"
                            onClick={addAnOtherForm}
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>

        {
          // Tour Operator
        }
        {trongoactivity?.data?.tour_operator_at && (
          <>
            {" "}
            <div className="card">
              <div className="grid grid-cols-12">
                <div className="col-span-12 mt-5 px-0">
                  <div className="rounded-lg bg-white p-5">
                    <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                      <div className="col-span-12 mb-1 px-2">
                        <div className="text-4xl font-bold">Tour Operator</div>
                      </div>
                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            Do you have a website?
                          </label>
                          <RHFTextField
                            type={"text"}
                            name="website_url"
                            control={control}
                            errors={errors}
                            placeholder="Enter Website URL "
                            className={`${selectedBox} py-2 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>
                            What is your general theme? (Ex: Yoga & Tango, Tango
                            & Culture)
                          </label>
                          <RHFTextArea
                            type={"text"}
                            name="theme"
                            control={control}
                            errors={errors}
                            placeholder="Type here.."
                            className={`${selectedBox} py-2 h-28 `}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 px-2">
                        <div className="">
                          <label className={labelClass}>Other Vendor</label>
                          <div className="space-y-2">
                            <RHFTextField
                              type={"text"}
                              name="vendor_activities"
                              control={control}
                              errors={errors}
                              placeholder="Enter Other Vendor activities related to tango"
                              className={`${selectedBox} py-2 `}
                            />

                            <RHFTextField
                              type={"text"}
                              name="vendor_url"
                              control={control}
                              errors={errors}
                              placeholder="Website, Facebook/instagram URL"
                              className={`${selectedBox} py-2 `}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <br></br>
        <br></br>
        <hr></hr>
        <br></br>
        <br></br>
        {
          // fourth Form
        }
        <h2 className="ml-4 md:ml-0 mb-4 text-4xl font-semibold">
          Where have you danced?
        </h2>
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
                      <RHFTextField
                        name="social_dancing_cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        // onChange={(e) => setCity(e.target.value)}
                        value={social_dancing_cities?.join(", ")}
                        onClick={(e) => setAnchorElSocial(e.currentTarget)}
                      />

                      {/* <RHFMultiSelect
                        type={"text"}
                        name="social_dancing_cities"
                        control={control}
                        placeholder="Enter city name"
                        className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                        multiple
                      >
                        {countryList
                          // ?.split(",")
                          ?.map((item, index) => (
                            <MenuItem MenuItem key={index} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          ))}
                      </RHFMultiSelect> */}
                    </div>
                    <MenuPop
                      handleClose={() => setAnchorElSocial(null)}
                      anchorEl={anchorElSocial}
                      open={openSocial}
                      setCity={setSocial_dancing_cities}
                      city={social_dancing_cities}
                    />
                  </div>
                  <div className="col-span-12 px-2 lg:col-span-6">
                    <div className="">
                      <label className={labelClass}>
                        Most recent cities you have danced in (not including
                        marathon or festival etc)
                      </label>
                      <RHFTextField
                        name="recent_workshop_cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        // onChange={(e) => setCity(e.target.value)}
                        value={recent_workshop_cities?.join(", ")}
                        onClick={(e) => setAnchorElRecent(e.currentTarget)}
                      />
                      {/* <RHFMultiSelect
                        type={"text"}
                        name="recent_workshop_cities"
                        control={control}
                        placeholder="Enter city name"
                        className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                        multiple
                      >
                        {countryList
                          // ?.split(",")
                          ?.map((item, index) => (
                            <MenuItem MenuItem key={index} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          ))}
                      </RHFMultiSelect> */}
                    </div>
                    <MenuPop
                      handleClose={() => setAnchorElRecent(null)}
                      anchorEl={anchorElRecent}
                      open={openRecent}
                      setCity={setRecent_workshop_cities}
                      city={recent_workshop_cities}
                    />
                  </div>
                  <div className="col-span-12 px-2 lg:col-span-6">
                    <div className="">
                      <label className={labelClass}>
                        Not including your home city, which cities are your
                        favourite to dance in?
                      </label>
                      <RHFTextField
                        name="favourite_dancing_cities"
                        type={"text"}
                        control={control}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        value={favourite_dancing_cities?.join(", ")}
                        onClick={(e) => setAnchorElFav(e.currentTarget)}
                      />
                      {/* <RHFMultiSelect
                        type={"text"}
                        name="favourite_dancing_cities"
                        control={control}
                        placeholder="Enter city name"
                        className={`${selectedBox} my-2 py-2 max-w-[330px]`}
                        multiple
                      >
                        {countryList
                          // ?.split(",")
                          ?.map((item, index) => (
                            <MenuItem MenuItem key={index} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          ))}
                      </RHFMultiSelect> */}
                    </div>
                    <MenuPop
                      handleClose={() => setAnchorElFav(null)}
                      anchorEl={anchorElFav}
                      open={openFav}
                      setCity={setFavourite_dancing_cities}
                      city={favourite_dancing_cities}
                    />
                  </div>
                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        How many marathons, festivials, etc have you been to in
                        the last 12 months?
                      </label>
                      <RHFTextField
                        type="text"
                        name="annual_event_count"
                        control={control}
                        // defaultValue="92a9980a7&rlz=1C1GCEU_enPK1104PK1104&q= 92a9980a7&rlz=1C1GCEU_enPK1104PK1104&q="
                        className={`${selectedBox}`}
                        // value={aboutDetail?.dance_experience?.annual_event_count}
                      />
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
          // fourth Form
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
                      <RHFTextField
                        type="text"
                        name="first_teacher"
                        control={control}
                        className={`${selectedBox}`}
                        // defaultValue={
                        //   aboutDetail?.learning_sources?.first_teacher
                        // }
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        Do you dance “Chacarera”?
                      </label>
                      <div className="col-span-6 px-2">
                        <div>
                          <div className="flex w-60 flex-wrap gap-2">
                            {danceoptions.map((item, index) => (
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
                            <div>chacarera skill</div>
                            <div>
                              <Slider
                                defaultValue={getValues("chacarera_skill")}
                                getAriaValueText={valuetext}
                                shiftStep={2}
                                step={1}
                                min={1}
                                max={7}
                                marks={dancemarks}
                                valueLabelDisplay="off"
                                sx={SiderStyles}
                                onChange={handleChangeSlider}
                                name="chacarera_skill"
                                value={chacarera_skill}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <RHFTextArea
                        type={"text"}
                        name="chacarera_skill"
                        control={control}
                        className={`${selectedBox} h-36 py-2`}
                        placeholder="How did you start"
                        // defaultValue={
                        //   aboutDetail?.learning_sources?.chacarera_skill
                        // }
                      /> */}
                      {/* <p className="ps-3 text-gray-text-color">
                        <span className="font-semibold">Leader:</span>{" "}
                        {options[
                          aboutDetail?.learning_sources?.chacarera_skill
                        ] || "N/A"}
                      </p> */}
                    </div>
                  </div>
                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>Do you dance “Zamba?</label>
                      <div className="flex w-60 flex-wrap gap-2">
                        {danceoptions.map((item, index) => (
                          <div
                            key={index}
                            className="text-[10px] flex gap-1 text-[#949393]"
                          >
                            <div>{index + 1}. </div>
                            <div key={index}>{item}</div>
                          </div>
                        ))}
                      </div>
                      {/* <RHFTextArea
                        type={"text"}
                        name="zamba_skill"
                        control={control}
                        className={`${selectedBox} h-36 py-2`}
                        placeholder="How did you start"
                        // defaultValue={aboutDetail?.learning_sources?.zamba_skill}
                      /> */}
                      <br />
                      <div>Zamba</div>
                      <div>
                        <Slider
                          defaultValue={getValues("zamba_skill")}
                          getAriaValueText={valuetext}
                          shiftStep={2}
                          step={1}
                          min={1}
                          max={7}
                          marks={dancemarks}
                          valueLabelDisplay="off"
                          sx={SiderStyles}
                          onChange={handleChangeSlider}
                          name="zamba_skill"
                          value={zamba_skill}
                        />
                      </div>
                      {/* <p className="ps-3 text-gray-text-color">
                        <span className="font-semibold">Follower:</span>{" "}
                        {options[aboutDetail?.learning_sources?.zamba_skill] ||
                          "N/A"}
                      </p> */}
                    </div>
                  </div>
                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        Tell us your tango story
                      </label>
                      <RHFTextArea
                        type={"text"}
                        name="tango_story"
                        control={control}
                        className={`${selectedBox} h-36 py-2`}
                        placeholder="How did you start"
                        // defaultValue={aboutDetail?.learning_sources?.tango_story}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>
                        Which teachers have you learned from the most?
                      </label>
                      <RHFTextField
                        type="text"
                        name="leading_teachers1"
                        control={control}
                        placeholder="Enter URL"
                        className={`${selectedBox} my-2`}
                        // defaultValue={
                        //   aboutDetail?.learning_sources?.leading_teachers?.split(
                        //     ","
                        //   )[0]
                        // }
                      />
                      <RHFTextField
                        type="text"
                        name="leading_teachers2"
                        control={control}
                        placeholder="Enter URL"
                        className={`${selectedBox} my-2`}
                        // defaultValue={
                        //   aboutDetail?.learning_sources?.leading_teachers?.split(
                        //     ","
                        //   )[1]
                        // }
                      />
                      <RHFTextField
                        type="text"
                        name="leading_teachers3"
                        control={control}
                        placeholder="Enter URL"
                        className={`${selectedBox} my-2`}
                        // defaultValue={
                        //   aboutDetail?.learning_sources?.leading_teachers?.split(
                        //     ","
                        //   )[2]
                        // }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default AboutTabContent;

export const MenuPop = ({
  handleClose,
  anchorEl,
  open,
  setCity,
  options,
  city,
}) => {
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [cityList, setCityList] = useState(City.getAllCities());
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));

  const searchUser = (e) => {
    try {
      const value = e.target.value;
      setSearch(value);
      if (value?.length == "") {
        setSearchCities(cityList?.slice(0, 100));
        setSearchError(null);
        return;
      } else if (value?.length < 3 && value?.length > 0) {
        setSearchError("minimun 3 characters required");
        return;
      } else if (value?.length >= 3) {
        let list = cityList?.filter((v) =>
          v?.name?.toLowerCase()?.includes(search?.toLowerCase())
        );
        let uniqueCities = Array.from(
          new Set(list.map((city) => city?.name?.toLowerCase()))
        ).map((name) =>
          list.find((city) => city?.name?.toLowerCase() === name)
        );

        setSearchCities(uniqueCities?.slice(0, 300));
        setSearchError(null);
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleSearch = () => {
    if (search?.length >= 3) {
      let list = cityList?.filter((v) =>
        v?.name?.toLowerCase()?.includes(search?.toLowerCase())
      );
      console.log(list);
      setSearchCities(list);
    }
  };

  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          border: "1px solid lightgrey",
          overflow: "auto",
          height: "auto",
          borderRadius: 5,
          width: "300px !important",
          maxHeight: "400px",
        },
        boxShadow: 0,
      }}
      elevation={0}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      <div className="flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
        <input
          type="text"
          className="outline-none w-full text-gray-text-color font-bold text-sm "
          placeholder="Search cities..."
          onChange={searchUser}
          value={search}
        />
        <div onClick={handleSearch}>
          <SearchIcon />
        </div>
      </div>
      <div className="h-3">
        {searchError && (
          <p className="text-xs text-red-500 w-full flex justify-start ms-3 mt-1">
            {searchError}
          </p>
        )}
      </div>
      <div className="overflow-auto h-40">
        {searchCities?.map((item, index) => (
          <MenuItem
            key={index}
            value={item?.name}
            onClick={() => {
              setCity((prev) => {
                const currentCities = prev || [];
                if (currentCities.some((city) => city === item?.name)) {
                  return currentCities;
                }
                return [...currentCities, item?.name];
              });
            }}
          >
            <div className={`flex justify-between w-full`}>
              <p className={`${city?.includes(item?.name) && "font-semibold"}`}>
                {item?.name}
              </p>
              {city?.includes(item?.name) && (
                <p
                  style={{
                    marginLeft: 10,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCity((prev) =>
                      prev.filter((name) => name !== item.name)
                    );
                  }}
                  className="w-4 h-4 flex justify-center items-center bg-slate-100 rounded-full"
                >
                  x
                </p>
              )}
            </div>
          </MenuItem>
        ))}
      </div>
    </Menu>
  );
};

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#44ad45",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
