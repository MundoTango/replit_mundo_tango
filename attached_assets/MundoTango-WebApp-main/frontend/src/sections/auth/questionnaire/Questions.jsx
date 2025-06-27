"use client";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import InputStar from "@/components/Stars/InputStar";
import {
  useGetLanguagesQuery,
  useGetUserQuestionMutation,
  useUserQuestionsMutation,
} from "@/data/services/userFormsApi";
import { PATH_AUTH } from "@/routes/paths";
import { formatDate } from "@/utils/helper";
import { Menu, MenuItem, Slider } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import Checkbox from "./Checkbox";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import ModelComponent from "@/components/Modal/CustomModal";
import LanguageList from "@/components/FORMs/LanguagesList";
import { Country, State, City } from "country-state-city";
import CrossIcon from "@/components/SVGs/CrossIcon";
import SearchIcon from "@/components/SVGs/SearchIcon";
import { BiSkipNext } from "react-icons/bi";

export const options = [
  "None",
  "Just a few classes",
  "A little bit at milongas",
  "As much as I can",
  "All the time",
];

export const SiderStyles = {
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
];

const Questions = () => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const { push, back } = useRouter();

  const [flag, setFlag] = useState(false);
  const [openTwo, setOpenTwo] = useState(false);
  const [language, setlanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const { data: languages } = useGetLanguagesQuery();
  const [LanguageList, setLanguageList] = useState(languages?.data);
  const [userQuestions, { isLoading }] = useUserQuestionsMutation();
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [getUserQuestion, { isLoading: getUserLoading }] =
    useGetUserQuestionMutation();
  const inputRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [city, setCity] = useState([]);
  const [liveAnchorEl, setLiveAnchorEl] = useState(null);
  const openLive = Boolean(liveAnchorEl);
  const [lived_for_tango, setLived_for_tango] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickLived = (event) => {
    setLiveAnchorEl(event.currentTarget);
  };

  const handleCloseLived = () => {
    setLiveAnchorEl(null);
  };

  useEffect(() => {
    setLanguageList(languages?.data);
  }, [languages]);

  const handleFocus = () => {
    inputRef?.current?.focus();
  };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const handleFlag = () => setFlag((prev) => !prev);

  function valuetext(value) {
    return `${value}°C`;
  }

  const handleChangeSlider = async (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;
    setValue(inputName, inputValue);
  };

  const handleChangeCheckBox = async (e) => {
    try {
      const inputValue = e.target.checked;
      const inputName = e.target.name;
      setValue(inputName, inputValue);
      handleFlag();
    } catch (e) {
      console.log(e.message);
    }
  };

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        // languages: [record?.languages1, record?.languages2, record?.languages3],
        // city: record?.city[0],
        // lived_for_tango: [
        //   record?.lived_for_tango1,
        //   record?.lived_for_tango2,
        //   record?.lived_for_tango3,
        // ],
        // languages: [language],
        lived_for_tango:
          lived_for_tango?.length > 0
            ? lived_for_tango
            : Array.isArray(record?.lived_for_tango)
              ? record?.lived_for_tango
              : [record?.lived_for_tango],
        city:
          city?.length > 0
            ? city
            : Array.isArray(record?.city)
              ? record?.city
              : [record?.city],
        dance_role_leader: record?.dance_role_leader || 1,
        dance_role_follower: record?.dance_role_follower || 1,
      };
      delete body?.languages1;
      delete body?.languages2;
      delete body?.languages3;
      delete body?.lived_for_tango1;
      delete body?.lived_for_tango2;
      delete body?.lived_for_tango3;

      const response = await userQuestions(body);
      console.log(response);

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        toast.success("Question added successfully!");
        push(PATH_AUTH.whatdoyoudo);
        localStorage.setItem("type", 3);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getQuestionRecord = async () => {
    try {
      const response = await getUserQuestion();

      if (response?.data?.code === 200) {
        const {
          data: {
            about,
            city,
            dance_role_follower,
            dance_role_leader,
            guide_visitors,
            is_nomad,
            languages,
            lived_for_tango,
            start_dancing,
            website_url,
          },
        } = response?.data;

        // setValue("city", city);
        setCity(city);
        setValue("start_dancing", formatDate(start_dancing));
        setValue("guide_visitors", guide_visitors);
        setValue("is_nomad", is_nomad);
        // setValue("lived_for_tango", lived_for_tango);
        setLived_for_tango(lived_for_tango);
        // setValue("lived_for_tango2", lived_for_tango[1]);
        // setValue("lived_for_tango3", lived_for_tango[2]);
        setValue("languages", languages);
        // setValue("languages2", languages[1]);
        // setValue("languages3", languages[2]);
        setValue("website_url", website_url);
        setValue("dance_role_leader", dance_role_leader);
        setValue("dance_role_follower", dance_role_follower);
        setValue("about", about);
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      toast.error(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestionRecord();
  }, []);

  const handleOpenTwo = () => setOpenTwo(true);

  const handleCloseTwo = () => setOpenTwo(false);

  const searchUser = (e) => {
    try {
      inputRef?.current?.focus();
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
    <div className="bg-background-color h-screen overflow-y-auto">
      <ConfirmationHeader />

      <div className="grid grid-cols-12 ">
        <div className="hidden lg:block col-span-2" />

        <div className="col-span-12 lg:col-span-8 mt-5 px-10 lg:px-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            {loading ? (
              <div className="flex items-center justify-center py-64">
                <SpinnerLoading />
              </div>
            ) : (
              <div>
                <div className="bg-white p-5 rounded-lg mb-5">
                  <div className="flex justify-end w-full">
                    <button
                      className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 w-32 transition h-7 text-sm flex justify-center gap-2 items-center"
                      onClick={(e) => {e.preventDefault(); push(PATH_AUTH.whatdoyoudo)}}
                    >
                      Skip
                      <BiSkipNext size={18} />
                    </button>
                  </div>
                  <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5">
                    <div className="col-span-12 lg:col-span-6 px-2">
                      <label className={labelClass}>
                        <InputStar /> Where do you (live) dance tango the most?*
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
                        onClick={handleClick}
                      />
                      {/* <RHFMultiSelect
                        name="city"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City name is required.",
                        }}
                        className={
                          "bg-background-color text-xs text-[#949393] "
                        }
                        onChange={(e) => {
                          setCities(() => {
                            return [...cities, e.target.value];
                          });
                        }}
                        value={cities}
                        multiple
                        onClick={handleFocus}
                      >
                        <input
                          type="text" 
                          className="outline-none w-[95%] text-gray-text-color font-bold text-sm px-4 mx-3 h-10 border rounded-2xl"
                          placeholder="Search cities..."
                          onChange={searchUser}
                          value={search}
                          ref={inputRef}
                        />

                        {searchCities?.map((item, index) => (
                          // <option key={index} value={item}>
                          //   {item}
                          // </option>
                          <MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
                        ))}
                      </RHFMultiSelect> */}
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
                            ref={inputRef}
                          />
                          <div>
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

                        <div className="overflow-auto max-h-[200px] ">
                          {searchCities?.map((item, index) => (
                            <MenuItem
                              key={index}
                              value={item?.name}
                              onClick={() => {
                                setCity((prev) => {
                                  const currentCities = prev || [];
                                  if (
                                    currentCities.some(
                                      (city) => city === item?.name
                                    )
                                  ) {
                                    return currentCities;
                                  }
                                  return [...currentCities, item?.name];
                                });
                              }}
                              className="max-w-[300px]"
                            >
                              <div className="flex justify-between w-full">
                                <p
                                  className={`${city?.includes(item?.name) ? "font-semibold" : ""}`}
                                >
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
                                        prev.filter(
                                          (name) => name !== item.name
                                        )
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
                    </div>

                    <div className="col-span-12 lg:col-span-6 px-2">
                      <div>
                        <label className={labelClass}>
                          <InputStar /> When did you start dancing?
                        </label>

                        <RHFTextField
                          type={"date"}
                          name="start_dancing"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "Start dancing is required.",
                          }}
                          className={`${selectedBox} py-2 `}
                        />
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 px-2">
                      <div className="select-none flex items-center gap-1">
                        <Checkbox
                          name="guide_visitors"
                          checked={getValues("guide_visitors")}
                          onChange={handleChangeCheckBox}
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

                    <div className="col-span-12 lg:col-span-6 px-2">
                      <div className="select-none flex items-center gap-1">
                        <Checkbox
                          name="is_nomad"
                          checked={getValues("is_nomad")}
                          onChange={handleChangeCheckBox}
                          className="border-black border"
                        />
                        <div>Or are you a Nomad?</div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6" />

                    <div className="col-span-12 lg:col-span-6 px-2">
                      <label className={labelClass}>
                        <InputStar /> Where have you lived for Tango more than 6
                        months(Other than your current location)
                      </label>
                      <div className="space-y-3">
                        {/* <RHFMultiSelect
                          name="lived_for_tango"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "Location is required.",
                          }}
                          className={
                            "bg-background-color text-xs text-[#949393] "
                          }
                          multiple
                        >

                          {countryList?.map((item, index) => (
                            // <option key={index} value={item}>
                            //   {item}
                            // </option>
                            <MenuItem key={index} value={item?.name}>
                              {item?.name}
                            </MenuItem>
                          ))}
                        </RHFMultiSelect> */}
                        <RHFTextField
                          name="lived_for_tango"
                          type={"text"}
                          control={control}
                          // errors={errors}
                          placeholder="Select City Name"
                          className={
                            "bg-background-color text-sm text-gray-text-color"
                          }
                          // onChange={(e) => setCity(e.target.value)}
                          value={lived_for_tango?.join(", ")}
                          onClick={handleClickLived}
                        />

                        {/* <RHFSelect
                          name="lived_for_tango2"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "Location is required.",
                          }}
                          className={selectedBox}
                        >
                          <option value={""}>Select location name</option>

                          {["One", "Two", "Three"].map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                        </RHFSelect>

                        <RHFSelect
                          name="lived_for_tango3"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "Location is required.",
                          }}
                          className={selectedBox}
                        >
                          <option value={""}>Select location name</option>

                          {["One", "Two", "Three"].map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                        </RHFSelect> */}
                      </div>
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
                        anchorEl={liveAnchorEl}
                        open={openLive}
                        onClose={handleCloseLived}
                      >
                        <div className="flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
                          <input
                            type="text"
                            className="outline-none w-full text-gray-text-color font-bold text-sm "
                            placeholder="Search cities..."
                            onChange={searchUser}
                            value={search}
                            ref={inputRef}
                          />
                          <div>
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
                                setLived_for_tango((prev) => {
                                  const currentCities = prev || [];
                                  if (
                                    currentCities.some(
                                      (city) => city === item?.name
                                    )
                                  ) {
                                    return currentCities;
                                  }
                                  return [...currentCities, item?.name];
                                });
                              }}
                            >
                              <div className={`flex justify-between w-full`}>
                                <p
                                  className={`${lived_for_tango?.includes(item?.name) && "font-semibold"} text-sm`}
                                >
                                  {item?.name}
                                </p>
                                {lived_for_tango?.includes(item?.name) && (
                                  <p
                                    style={{
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLived_for_tango((prev) =>
                                        prev.filter(
                                          (name) => name !== item.name
                                        )
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
                    </div>

                    <div className="col-span-12 lg:col-span-6 px-2">
                      <label className={labelClass}>
                        <InputStar /> What languages do you speak?
                      </label>
                      <div className="space-y-3">
                        {/* <RHFTextField
                          type={"text"}
                          name="languages"
                          control={control}
                          // errors={errors}
                          // rules={{
                          //   required: "Language is required.",
                          // }}
                          placeholder="Enter here..."
                          className={selectedBox}
                          value={language}
                        /> */}
                        <RHFMultiSelect
                          name="languages"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "language is required.",
                          }}
                          className="bg-background-color text-xs text-[#949393]"
                          multiple
                        >
                          {LanguageList?.map(({ name, id }, index) => (
                            <MenuItem key={id} value={name}>
                              {name}
                            </MenuItem>
                          ))}
                        </RHFMultiSelect>

                        {/* // {/* <RHFTextField
                        //   type={"text"}
                        //   name="languages2"
                        //   control={control}
                        //   errors={errors}
                        //   rules={{
                        //     required: "Language is required.",
                        //   }}
                        //   placeholder="Enter here..."
                        //   className={selectedBox}
                        // />

                        // <RHFTextField
                        //   type={"text"}
                        //   name="languages3"
                        //   control={control}
                        //   errors={errors}
                        //   rules={{
                        //     required: "Language is required.",
                        //   }}
                        //   placeholder="Enter here..."
                        //   className={selectedBox}
                        // /> */}
                      </div>
                    </div>

                    <div className="col-span-12 px-2">
                      <label className={labelClass}>
                        <InputStar /> What website or Facebook group do you use
                        to find your local events
                      </label>
                      <RHFTextField
                        type="text"
                        name="website_url"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "Add url is required.",
                        }}
                        placeholder="Add url..."
                        className={selectedBox}
                      />
                    </div>

                    <div className="col-span-6 px-2">
                      <div>
                        <label className={labelClass}>
                          <InputStar /> What role do you dance?
                        </label>

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
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6" />

                    <div className="col-span-12 px-2">
                      <div>
                        <label className={labelClass}>
                          <InputStar /> Introduction
                        </label>
                        <RHFTextArea
                          type="text"
                          name="about"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "Description is required.",
                          }}
                          placeholder="Write here...."
                          className={`${selectedBox} text-sm h-36 `}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between">
                    <button
                      type="button"
                      className="bg-[#BEBEBE] text-white px-10 py-3 rounded-xl "
                    >
                      <BackArrow />
                    </button>

                    <button className="bg-btn-color text-white w-32  rounded-xl flex items-center justify-center ">
                      {isLoading ? <SpinnerLoading /> : <NextArrow />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="hidden lg:block col-span-3" />
      </div>
      <ModelComponent
        open={openTwo}
        handleClose={handleCloseTwo}
        className={"w-[95%] md:w-[410px]"}
      >
        <LanguageList
          handleClose={handleCloseTwo}
          setlanguage={setlanguage}
          setValue={setValue}
        />
      </ModelComponent>
    </div>
  );
};

export default Questions;
