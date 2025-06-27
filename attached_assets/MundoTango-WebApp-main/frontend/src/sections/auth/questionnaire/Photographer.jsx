"use client";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import SearchIcon from "@/components/SVGs/SearchIcon";
import {
  useAddPhotographerExperienceMutation,
  useGetPhotographerExperienceMutation,
} from "@/data/services/userFormsApi";
import { Menu, MenuItem } from "@mui/material";
import { City, Country } from "country-state-city";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";

const Photographer = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393]";
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const [loading, setLoading] = useState(true);
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [cities, setCities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();

  const [addPhotographerExperience, { isLoading: storeLoading }] =
    useAddPhotographerExperienceMutation();

  const [getPhotographerExperience, {}] =
    useGetPhotographerExperienceMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSubmit = async (record) => {
    try {
      const body = {
        ...record,
        cities: cities?.length > 0 ? cities : [record?.cities],
      };

      delete record?.city1;
      delete record?.city2;
      delete record?.city3;

      const response = await addPhotographerExperience(body);

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
        toast.success("Photographer experience added successfully");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getPhotographerExperience();

      if (response?.data?.code === 200) {
        const {
          data: { cities, role, facebook_profile_url, videos_taken_count },
        } = response?.data;

        // setValue("city", cities);
        setCities(cities);
        // setValue("city1", cities[0]);
        // setValue("city2", cities[1]);
        // setValue("city3", cities[2]);
        setValue("role", role);
        setValue("facebook_profile_url", facebook_profile_url);
        setValue("videos_taken_count", videos_taken_count);
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
                    <div className="text-2xl font-bold">
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
                        How many events have you taken photos or videos of in
                        the past 12 months?
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

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>
                        <InputStar /> Which cities do you take photos/videos the
                        most?
                      </label>
                      {/* <RHFMultiSelect
                        name="cities"
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
                        onClick={handleClick}
                      />
                      {/* <RHFTextField
                        type={"text"}
                        name="city1"
                        control={control}
                        errors={errors}
                        placeholder="Enter here..."
                        rules={{
                          required: "City Name is required.",
                        }}
                        className={`${selectedBox} py-2 mb-3`}
                      />

                      <RHFTextField
                        type={"text"}
                        name="city2"
                        control={control}
                        errors={errors}
                        placeholder="Enter here..."
                        rules={{
                          required: "City Name is required.",
                        }}
                        className={`${selectedBox} py-2 mb-3`}
                      />

                      <RHFTextField
                        type={"text"}
                        name="city3"
                        control={control}
                        errors={errors}
                        placeholder="Enter here..."
                        rules={{
                          required: "City Name is required.",
                        }}
                        className={`${selectedBox} py-2 mb-3`}
                      /> */}
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
                          <div
                            onClick={handleSearch}
                            className="cursor-pointer"
                          >
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

export default Photographer;
