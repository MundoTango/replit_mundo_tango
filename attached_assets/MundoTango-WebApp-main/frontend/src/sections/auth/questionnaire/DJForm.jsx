"use client";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import InputStar from "@/components/Stars/InputStar";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddDjExperienceMutation,
  useGetDjExperienceMutation,
} from "@/data/services/userFormsApi";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import Checkbox from "./Checkbox";
import toast from "react-hot-toast";
import SpinnerLoading from "@/components/Loadings/Spinner";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import { City, Country } from "country-state-city";
import { Menu, MenuItem } from "@mui/material";
import SearchIcon from "@/components/SVGs/SearchIcon";

const DJForm = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393]";

  const [loading, setLoading] = useState(true);
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const [flag, setFlag] = useState(true);
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [liveAnchorEl, setLiveAnchorEl] = useState(null);
  const openLive = Boolean(liveAnchorEl);
  const [cities, setCities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();

  const [addDjExperience, { isLoading: storeLoading }] =
    useAddDjExperienceMutation();

  const [getDjExperience, {}] = useGetDjExperienceMutation();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
    },
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
        cities: cities?.length > 0 ? cities : Array.isArray(record?.cities)
        ? record?.cities
        : [record?.cities],
        use_external_equipments:
          record?.use_external_equipments === "Yes" ? true : false,
      };

      const response = await addDjExperience(body);

      if (response?.data?.code === 200) {
        toast.success("DJ experience added successfully");
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
      const response = await getDjExperience();

      if (response?.data?.code === 200) {
        const {
          data: {
            cities,
            performed_events,
            favourite_orchestra,
            favourite_singer,
            milonga_size,
            use_external_equipments,
            dj_softwares,
          },
        } = response?.data;

        setValue("performed_events", performed_events);
        setValue("favourite_orchestra", favourite_orchestra);
        setValue("favourite_singer", favourite_singer);
        setValue("milonga_size", milonga_size);
        setValue(
          "use_external_equipments",
          use_external_equipments ? "Yes" : "No"
        );
        setValue("dj_softwares", dj_softwares);
        // setValue("cities", cities);
        setCities(cities);
        // setValue("cities1", cities[0]);
        // setValue("cities2", cities[1]);
        // setValue("cities3", cities[2]);
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
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
                    <div className="text-2xl font-bold">DJ</div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="">
                      <label className={labelClass}>
                        <InputStar /> How many events have you DJ'ed in the last
                        12 months?
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
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        <InputStar /> Which cities do you DJ the most?
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
                        placeholder="Select City Name"
                        className={
                          "bg-background-color text-sm text-gray-text-color"
                        }
                        // onChange={(e) => setCity(e.target.value)}
                        value={cities?.join(", ")}
                        onClick={handleClickLived}
                      />
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
                    <div className="">
                      <label className={labelClass}>Favorite Orchestra</label>
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
                        // errors={errors}
                        placeholder="Enter here..."
                        className={`${selectedBox} py-2 `}
                        // rules={{
                        //   required: "Software name is required.",
                        // }}
                      />
                      {/* <RHFSelect
                        name="dj_softwares"
                        control={control}
                        errors={errors}
                        rules={{
                          required: "City name is required.",
                        }}
                        className={selectedBox}
                      >
                        <option value={""}>Select dj software</option>

                        {["One", "Two", "Three"].map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </RHFSelect> */}
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

export default DJForm;
