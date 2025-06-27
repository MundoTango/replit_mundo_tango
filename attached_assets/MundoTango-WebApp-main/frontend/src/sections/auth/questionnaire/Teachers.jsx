"use client";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import RHFTextField from "@/components/FORMs/RHFTextField";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddTeacherExperienceMutation,
  useGetTeacherExperienceMutation,
  useGetTeacherExperienceQuery,
} from "@/data/services/userFormsApi";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import toast from "react-hot-toast";
import SpinnerLoading from "@/components/Loadings/Spinner";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import { City, Country } from "country-state-city";
import { Menu, MenuItem } from "@mui/material";
import SearchIcon from "@/components/SVGs/SearchIcon";

const Teachers = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [loading, setLoading] = useState(true);
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [addTeacherExperience, { isLoading: storeLoading }] =
    useAddTeacherExperienceMutation();
  const [cityList, setCityList] = useState(City.getAllCities());
  const [getTeacherExperience, {}] = useGetTeacherExperienceMutation();
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [liveAnchorEl, setLiveAnchorEl] = useState(null);
  const openLive = Boolean(liveAnchorEl);
  const [cities, setCities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const handleClickLived = (event) => {
    setLiveAnchorEl(event.currentTarget);
  };

  const handleCloseLived = () => {
    setLiveAnchorEl(null);
  };

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        // cities: [record?.cities1, record?.cities2, record?.cities3],
        cities:
          cities?.length > 0
            ? cities
            : Array.isArray(record?.cities)
              ? record?.cities
              : [record?.cities],
        online_platforms: Array.isArray(record?.online_platforms)
          ? record?.online_platforms
          : [record?.online_platforms],
      };

      const response = await addTeacherExperience(body);

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }
      if (response?.data?.code === 200) {
        nextForm();
        toast.success("Teacher experience added successfully");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getTeacherExperience();

      if (response?.data?.code === 200) {
        const {
          data: {
            about_tango_future,
            cities,
            online_platforms,
            partner_facebook_url,
            teaching_reason,
          },
        } = response?.data;
        setValue("partner_facebook_url", partner_facebook_url);
        // setValue("cities", cities);
        setCities(cities);
        // setValue("cities1", cities[0]);
        // setValue("cities2", cities[1]);
        // setValue("cities3", cities[2]);
        setValue("online_platforms", online_platforms);
        // setValue("online_platforms1", online_platforms[0]);
        // setValue("online_platforms2", online_platforms[1]);
        // setValue("online_platforms3", online_platforms[2]);
        setValue("about_tango_future", about_tango_future);
        setValue("teaching_reason", teaching_reason);
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    }
  };

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
                <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5">
                  <div className="col-span-12 px-2 mb-1">
                    <div className="text-2xl font-bold">Teacher</div>
                  </div>

                  <div className="col-span-12  px-2">
                    <div className="">
                      <label className={labelClass}>
                        Do you have a standard tango partner?
                      </label>
                      <RHFTextField
                        type={"text"}
                        name="partner_facebook_url"
                        control={control}
                        errors={errors}
                        placeholder="Enter Partner's Facebook Url"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        <InputStar /> Where do you teach the most?
                      </label>
                      <RHFTextField
                        name="cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        // onChange={(e) => setCity(e.target.value)}
                        value={cities?.join(", ")}
                        onClick={handleClickLived}
                      />
                      {/* <RHFMultiSelect
                        name="cities"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City name is required.",
                        }}
                        className={'bg-background-color text-xs text-[#949393] '}
                      >

                        {countryList?.map((item, index) => (
                          <MenuItem key={index} value={item?.name}>{item?.name}</MenuItem>
                        ))}
                      </RHFMultiSelect> */}
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
                        <div onClick={handleSearch} className="cursor-pointer">
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
                              setCities((prev) => {
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
                                className={`${cities?.includes(item?.name) && "font-semibold"} text-sm`}
                              >
                                {item?.name}
                              </p>
                              {cities?.includes(item?.name) && (
                                <p
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCities((prev) =>
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
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        {/* <InputStar /> */}
                        Do you teach online?
                      </label>
                      {/* <RHFTextField
                        type={"text"}
                        name="online_platforms1"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "Platform is required.",
                        }}
                        placeholder="Write here...."
                        className={`${selectedBox} py-2 `}
                      />
                      <RHFTextField
                        type={"text"}
                        name="online_platforms2"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "Platform is required.",
                        }}
                        placeholder="Write here...."
                        className={`${selectedBox} py-2 `}
                      />
                      <RHFTextField
                        type={"text"}
                        name="online_platforms3"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "Platform is required.",
                        }}
                        placeholder="Write here...."
                        className={`${selectedBox} py-2 `}
                      /> */}
                      <RHFTextField
                        type={"text"}
                        name="online_platforms"
                        control={control}
                        errors={errors}
                        placeholder="add your website"
                        className={`${selectedBox} py-2 `}
                      />
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div>
                      <label className={labelClass}>Why do you teach?</label>
                      <RHFTextArea
                        type={"text"}
                        name="teaching_reason"
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
                        className={`${selectedBox} py-2 h-36`}
                        placeholder="Write here..."
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

                  <button className="bg-btn-color text-white w-32  py-2 rounded-xl flex items-center justify-center">
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

export default Teachers;
