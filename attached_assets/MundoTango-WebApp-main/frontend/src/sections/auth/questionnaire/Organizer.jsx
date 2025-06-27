"use client";
import RHFTextField from "@/components/FORMs/RHFTextField";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddOrganizerExperienceMutation,
  useGetOrganizerExperienceMutation,
} from "@/data/services/userFormsApi";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import SpinnerLoading from "@/components/Loadings/Spinner";
import toast from "react-hot-toast";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import { Menu, MenuItem } from "@mui/material";
import { City, Country } from "country-state-city";
import SearchIcon from "@/components/SVGs/SearchIcon";

const Organizer = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [addOrganizerExperience, { isLoading: storeLoading }] =
    useAddOrganizerExperienceMutation();
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const [getOrganizerExperience, {}] = useGetOrganizerExperienceMutation();
  const [loading, setLoading] = useState(true);
  const [valuecheck, setValueCheck] = useState("");
  const [hostEvent, setHostEvent] = useState("");
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [cities, setCities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();
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
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
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
    record?.hosted_event_types?.push(record?.other_event);
    const events = record?.hosted_event_types;

    try {
      const body = {
        ...record,
        hosted_event_types: events,
        cities:
          cities?.length > 0
            ? cities
            : Array.isArray(record?.cities)
              ? record?.cities
              : [record?.cities],
      };

      delete body?.cities1;
      delete body?.cities2;
      delete body?.cities3;

      const response = await addOrganizerExperience(body);

      console.log(response);

      if (response?.data?.code === 200) {
        toast.success("Origanizer experience added successfully");
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
      const response = await getOrganizerExperience();

      if (response?.data?.code === 200) {
        const {
          data: { cities, hosted_events, hosted_event_types },
        } = response?.data;

        // setValue("cities", cities);
        setCities(cities);
        setValue("hosted_events", hosted_events);
        setValue("hosted_event_types", hosted_event_types);
        const checkValue = getValues("hosted_event_types");
        if (checkValue.includes("other")) {
          setValueCheck("other");
          setValue(
            "other_event",
            hosted_event_types?.filter((t) => t !== eventsArray)[0]
          );
        }
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

  useEffect(() => {
    const checkValue = getValues("hosted_event_types");
    if (checkValue?.includes("other")) {
      setValueCheck("other");
    } else {
      setValueCheck("");
    }
  }, [hostEvent === "other"]);

  return (
    <div className={`bg-background-color h-screen overflow-y-scroll `}>
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
                    <div className="text-2xl font-bold">Organizer</div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>
                        <InputStar /> How many events have you hosted in the
                        last 12 months?
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
                        <InputStar /> Type of events you host?
                      </label>
                      {/* <RHFTextField
                        type={"text"}
                        name="hosted_event_types"
                        control={control}
                        errors={errors}
                        placeholder="Host Event Type here..."
                        rules={{
                          required: "Host Event Type is required.",
                        }}
                        className={`${selectedBox} py-2 `}
                      /> */}
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

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        <InputStar /> Where do you host events?
                      </label>
                      {/* <RHFMultiSelect
                        name="cities"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City name is required.",
                        }}
                        className={"bg-background-color text-xs text-[#949393]"}
                        multiple
                      >
                        {countryList?.map((item, index) => (
                          <MenuItem key={index} value={item?.name}>
                            {item?.name}
                          </MenuItem>
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
                      {/* <RHFSelect
                          name="cities"
                          control={control}
                          errors={errors}
                          rules={{
                            required: "City name is required.",
                          }}
                          className={selectedBox}
                        >
                          <option value={""}>Select location name</option>

                          {countryList?.map((item, index) => (
                            <option key={index?.name} value={item?.name}>
                              {item?.name}
                            </option>
                          ))}
                        </RHFSelect> */}

                      {/* <RHFTextField
                        type={"text"}
                        name="cities1"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City is required.",
                        }}
                        placeholder="Enter city name"
                        className={`${selectedBox} py-2 `}
                      /> */}
                      {/* <RHFTextField
                        type={"text"}
                        name="cities2"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City is required.",
                        }}
                        placeholder="Enter city name"
                        className={`${selectedBox} py-2 `}
                      />
                      <RHFTextField
                        type={"text"}
                        name="cities3"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City is required.",
                        }}
                        placeholder="Enter city name"
                        className={`${selectedBox} py-2 `}
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
                    className="bg-btn-color text-white px-10 py-3 rounded-xl"
                    type="button"
                    onClick={preForm}
                  >
                    <BackArrow />
                  </button>

                  <button className="bg-btn-color text-white w-32 py-2  rounded-xl flex items-center justify-center">
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

export default Organizer;
