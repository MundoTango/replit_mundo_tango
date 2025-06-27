"use client";
import RHFSelect from "@/components/FORMs/RHFSelect";
import SpinnerLoading from "@/components/Loadings/Spinner";
import InputStar from "@/components/Stars/InputStar";
import Addition from "@/components/SVGs/Addition";
import BackArrow from "@/components/SVGs/BackArrow";
import Minus from "@/components/SVGs/Minus";
import NextArrow from "@/components/SVGs/NextArrow";
import {
  useAddDanceExperienceMutation,
  useGetDanceExperienceQuery,
} from "@/data/services/userFormsApi";
import { PATH_AUTH } from "@/routes/paths";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import RHFMultiSelect from "@/components/FORMs/RFHMultiSelect";
import { Menu, MenuItem } from "@mui/material";
import { City, Country } from "country-state-city";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SearchIcon from "@/components/SVGs/SearchIcon";
import { useDispatch } from "react-redux";
import { setRouter } from "@/data/features/authSlice";
import { BiSkipNext } from "react-icons/bi";

const WhereDoYouDance = () => {
  const labelClass = "flex gap-1 mb-2";
  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";
  const { push, back } = useRouter();
  const [months, setMonths] = useState(1);
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [anchorElSocial, setAnchorElSocial] = useState(null);
  const [anchorElRecent, setAnchorElRecent] = useState(null);
  const [anchorElFav, setAnchorElFav] = useState(null);
  const openSocial = Boolean(anchorElSocial);
  const openRecent = Boolean(anchorElRecent);
  const openFav = Boolean(anchorElFav);
  const [social_dancing_cities, setSocial_dancing_cities] = useState([]);
  const [recent_workshop_cities, setRecent_workshop_cities] = useState([]);
  const [favourite_dancing_cities, setFavourite_dancing_cities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      annual_event_count: 0
    },
  });
  const dispatch = useDispatch();

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

  const [addOrUpdateData, { isLoading: addOrUpdateLoading }] =
    useAddDanceExperienceMutation();

  const handleClickSocial = (event) => {
    setAnchorElSocial(event.currentTarget);
  };

  const handleCloseSocial = () => {
    setAnchorElSocial(null);
  };

  const handleClickRecent = (event) => {
    setAnchorElRecent(event.currentTarget);
  };

  const handleCloseRecent = () => {
    setAnchorElRecent(null);
  };

  const handleClickFav = (event) => {
    setAnchorElFav(event.currentTarget);
  };

  const handleCloseFav = () => {
    setAnchorElFav(null);
  };

  const onSubmit = async (record) => {
    const payload = {
      ...record,
      social_dancing_cities: social_dancing_cities?.length > 0 ? social_dancing_cities : [] ,
      recent_workshop_cities: recent_workshop_cities?.length > 0 ? recent_workshop_cities : [] ,
      favourite_dancing_cities: favourite_dancing_cities?.length > 0 ? favourite_dancing_cities : [],
      // social_dancing_cities: [
      //   record.social_dancing_cities_1,
      //   record.social_dancing_cities_2,
      //   record.social_dancing_cities_3,
      // ],
      // recent_workshop_cities: [
      //   record.recent_workshop_cities_1,
      //   record.recent_workshop_cities_2,
      //   record.recent_workshop_cities_3,
      // ],
      // favourite_dancing_cities: [
      //   record.favourite_dancing_cities_1,
      //   record.favourite_dancing_cities_2,
      //   record.favourite_dancing_cities_3,
      // ],
      annual_event_count: record?.annual_event_count || 0,
    };


    try {
      // console.log(record);
      const response = await addOrUpdateData(payload);

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
        push(PATH_AUTH.wherehaveyoulearned);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const { data, isLoading: getLoading } = useGetDanceExperienceQuery();

  useEffect(() => {
    try {
      if (data && data.code === 200) {
        // console.log(data.data);
        const {
          social_dancing_cities,
          recent_workshop_cities,
          favourite_dancing_cities,
          annual_event_count,
        } = data.data;

        // setValue("social_dancing_cities", social_dancing_cities);
        setSocial_dancing_cities(social_dancing_cities || []);
        // setValue("recent_workshop_cities", recent_workshop_cities);
        setRecent_workshop_cities(recent_workshop_cities || []);
        // setValue("favourite_dancing_cities", favourite_dancing_cities);
        setFavourite_dancing_cities(favourite_dancing_cities || []);
        setValue("annual_event_count", annual_event_count || 0);
        // setValue("social_dancing_cities_1", social_dancing_cities[0]);
        // setValue("social_dancing_cities_2", social_dancing_cities[1]);
        // setValue("social_dancing_cities_3", social_dancing_cities[2]);
        // setValue("recent_workshop_cities_1", recent_workshop_cities[0]);
        // setValue("recent_workshop_cities_2", recent_workshop_cities[1]);
        // setValue("recent_workshop_cities_3", recent_workshop_cities[2]);
        // setValue("favourite_dancing_cities_1", favourite_dancing_cities[0]);
        // setValue("favourite_dancing_cities_2", favourite_dancing_cities[1]);
        // setValue("favourite_dancing_cities_3", favourite_dancing_cities[2]);
        setMonths(annual_event_count || 0);
      }
    } catch (e) {
      console.log(e.message);
    }
  }, [data]);

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
    <div className="h-screen overflow-y-scroll bg-background-color">
      <ConfirmationHeader />
      <div className="grid grid-cols-12">
        <div className="col-span-3 hidden lg:block" />
        <div className="col-span-12 mt-5 px-10 lg:col-span-6 lg:px-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            {getLoading ? (
              <div className="flex items-center justify-center py-64">
                <SpinnerLoading />
              </div>
            ) : (
              <div className="rounded-lg bg-white p-5">
                <div className="flex justify-end w-full">
                  <button
                    className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 w-32 transition h-7 text-sm flex justify-center gap-2 items-center"
                    onClick={(e) => {e.preventDefault(); push(PATH_AUTH.wherehaveyoulearned)}}
                  >
                    Skip
                    <BiSkipNext size={18} />
                  </button>
                </div>
                <div className="grid gap-x-0 gap-y-5 md:gap-x-10 lg:grid-cols-12">
                  <div className="col-span-12 mb-1 px-2">
                    <div className="text-2xl font-bold">
                      Where have you danced?
                    </div>
                  </div>

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        <InputStar /> Most recent cities you've been to for
                        social dancing only?
                      </label>
                      {/* <RHFMultiSelect
                        name="social_dancing_cities"
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
                        name="social_dancing_cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={"bg-background-color text-sm text-gray-text-color"}
                        // onChange={(e) => setCity(e.target.value)}
                        value={social_dancing_cities?.join(", ")}
                        onClick={handleClickSocial}
                      />
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
                        anchorEl={anchorElSocial}
                        open={openSocial}
                        onClose={handleCloseSocial}
                      >
                        <div className="w-full flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
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
                                setSocial_dancing_cities((prev) => {
                                  const currentCities = prev || [];
                                  if (currentCities.some((city) => city === item?.name)) {
                                    return currentCities;
                                  }
                                  return [...currentCities, item?.name];
                                });
                              }}
                            >
                              <div className={`flex justify-between w-full`}>
                                <p
                                  className={`${social_dancing_cities?.includes(item?.name) && "font-semibold"}`}
                                >
                                  {item?.name}
                                </p>
                                {social_dancing_cities?.includes(item?.name) && (
                                  <p
                                    style={{
                                      marginLeft: 10,
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSocial_dancing_cities((prev) =>
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

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                      <InputStar />Most recent cities you've visited for workshop,
                        marathon, festivals?
                      </label>
                      {/* <RHFMultiSelect
                        name="recent_workshop_cities"
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
                        name="recent_workshop_cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={"bg-background-color text-sm text-gray-text-color"}
                        // onChange={(e) => setCity(e.target.value)}
                        value={recent_workshop_cities?.join(", ")}
                        onClick={handleClickRecent}
                      />
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
                        anchorEl={anchorElRecent}
                        open={openRecent}
                        onClose={handleCloseRecent}
                      >
                        <div className="w-full flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
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
                                setRecent_workshop_cities((prev) => {
                                  const currentCities = prev || [];
                                  if (currentCities.some((city) => city === item?.name)) {
                                    return currentCities;
                                  }
                                  return [...currentCities, item?.name];
                                });
                              }}
                            >
                              <div className={`flex justify-between w-full`}>
                                <p
                                  className={`${recent_workshop_cities?.includes(item?.name) && "font-semibold"}`}
                                >
                                  {item?.name}
                                </p>
                                {recent_workshop_cities?.includes(
                                  item?.name
                                ) && (
                                  <p
                                    style={{
                                      marginLeft: 10,
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRecent_workshop_cities((prev) =>
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

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                      <InputStar />Not including your home city, which cities are your
                        favourite to dance in?
                      </label>
                      {/* <RHFMultiSelect
                        name="favourite_dancing_cities"
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
                        name="favourite_dancing_cities"
                        type={"text"}
                        control={control}
                        // errors={errors}
                        placeholder="Select City Name"
                        className={"bg-background-color text-sm text-gray-text-color"}
                        // onChange={(e) => setCity(e.target.value)}
                        value={favourite_dancing_cities?.join(", ")}
                        onClick={handleClickFav}
                      />
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
                        anchorEl={anchorElFav}
                        open={openFav}
                        onClose={handleCloseFav}
                      >
                        <div className="w-full flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
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
                                setFavourite_dancing_cities((prev) => {
                                  const currentCities = prev || [];
                                  if (currentCities.some((city) => city === item?.name)) {
                                    return currentCities;
                                  }
                                  return [...currentCities, item?.name];
                                });
                              }}
                            >
                              <div className={`flex justify-between w-full`}>
                                <p
                                  className={`${favourite_dancing_cities?.includes(item?.name) && "font-semibold"}`}
                                >
                                  {item?.name}
                                </p>
                                {favourite_dancing_cities?.includes(
                                  item?.name
                                ) && (
                                  <p
                                    style={{
                                      marginLeft: 10,
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFavourite_dancing_cities((prev) =>
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

                  <div className="col-span-12 px-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>
                        How many marathons, festivials, etc have you been to in
                        the last 12 months?
                      </label>
                      <RHFTextField
                        type={"number"}
                        name="annual_event_count"
                        control={control}
                        placeholder="Enter here..."
                        className={`${selectedBox} py-2 `}
                      />
                      {/* <div className="flex select-none items-center justify-between rounded-lg bg-[#F8FAFC] p-3">
                        <div>
                          <Minus
                            onClick={() => handleCount("minus")}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="text-sm underline">{months}</div>
                        <div>
                          <Addition
                            onClick={() => handleCount("plus")}
                            className="cursor-pointer"
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('router', "back")
                      dispatch(setRouter('back'));
                      back();
                    }}
                    className="rounded-xl bg-btn-color px-10 py-3 text-white"
                  >
                    <BackArrow />
                  </button>

                  <button className="bg-btn-color text-white w-32  py-2 rounded-xl flex items-center justify-center">
                    {addOrUpdateLoading ? <SpinnerLoading /> : <NextArrow />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="col-span-3 hidden lg:block" />
      </div>
    </div>
  );
};

export default WhereDoYouDance;
