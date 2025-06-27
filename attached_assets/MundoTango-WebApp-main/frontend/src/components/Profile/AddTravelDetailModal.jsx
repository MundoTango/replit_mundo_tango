"use client";

import RHFTextField from "@/components/FORMs/RHFTextField";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useForm } from "react-hook-form";
import { useAuthContext } from "@/auth/useAuthContext";
import { useEffect, useRef, useState } from "react";
import {
  useAddTravelDetailMutation,
  useGetEventTypesQuery,
  useUpdateTravelDetailMutation,
} from "@/data/services/friendApi";
import toast from "react-hot-toast";
import RHFDateTimeField from "../FORMs/RDFDateAndTime";
import RHFSelect from "../FORMs/RHFSelect";
import SpinnerLoading from "../Loadings/Spinner";
import { Country, State, City } from "country-state-city";
import RHFMultiSelect from "../FORMs/RFHMultiSelect";
import { FormControl, Menu, MenuItem } from "@mui/material";
import SearchIcon from "../SVGs/SearchIcon";
import { useGetAllEventsQuery } from "@/data/services/eventAPI";
import { formatDate } from "@/utils/helper";

const AddTravelDetailModal = ({ setTravelModal, refetch, timelineRecord, timelinerefetch, modalData}) => {
  console.log(modalData);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });
  const [addTravelDetail, { isLoading, isError, error }] =
    useAddTravelDetailMutation();
    const [updateTravelDetail, { isLoading: updateloading }] =
    useUpdateTravelDetailMutation();
  const { data: event_type, isLoading: typeLoading } = useGetEventTypesQuery();
  const { data: event_name } = useGetAllEventsQuery();
  const [countryList, setCountryList] = useState(Country.getAllCountries());
  const [search, setSearch] = useState("");
  const selectedBox = "bg-background-color text-[#949393] text-sm";
  const inputRef = useRef(null);
  const countryfind = countryList.find(
    (x) => x?.name === timelineRecord?.user?.country
  );
  const CountryCode = countryfind?.isoCode;
  // const [cityList, setCityList] = useState(
  //   City.getCitiesOfCountry(CountryCode)
  // );
  const [cityList, setCityList] = useState(City.getAllCities());
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [city, setCity] = useState("");
  const [searchError, setSearchError] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSubmit = async (data) => {
    try {
      const body = {
        ...data, city: city,
      }
      let result; 
      if (modalData?.id) {
        result = await updateTravelDetail({id:modalData?.id, body:body}).unwrap();
      } else {
        result = await addTravelDetail({body:body}).unwrap();
      }
      if (result?.code === 200) {
        toast.success("Travel Details added successfully!");
        setTravelModal(false);
        refetch();
        timelinerefetch();
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleFocus = () => {
    inputRef?.current?.focus();
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
        ).map((name) => list.find((city) => city?.name?.toLowerCase() === name));
        
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
    if (modalData){
      setValue("start_date", formatDate(modalData.start_date));
      setValue("end_date",  formatDate(modalData.end_date));
      setValue("event_name", Number(modalData.event_name));
      // setValue("city", modalData.city);
      setCity(modalData.city);
      setValue("event_type", modalData.event_type);
      setValue("event_type_id", modalData.event_type_id);
    }

  },[modalData]);

  return (
    <div>
      <div className="card select-none">
        <form className="pr-5">
          <div className="flex justify-between">
            <div className="text-black flex items-center gap-4">
              <div className="text-xl font-semibold">{modalData ? "Update" : "Add"} Travel Details</div>
            </div>
            <div
              className="flex items-center justify-end  gap-2 cursor-pointer "
              onClick={() => setTravelModal(false)}
            >
              <CrossIcon color="black" />
            </div>
          </div>

          <div className="flex space-x-4 mt-6 mb-6">
            <div className="w-1/2">
              <label className={"flex text-sm gap-1 font-bold"}>From</label>
              <RHFDateTimeField
                name="start_date"
                control={control}
                type="date"
                errors={errors}
                rules={{ required: "from Date is required" }}
                className={"bg-background-color text-sm text-gray-text-color"}
                placeholder="From"
              />
            </div>
            <div className="w-1/2">
              <label className={"flex text-sm gap-1 font-bold"}>To</label>
              <RHFDateTimeField
                name="end_date"
                control={control}
                type="date"
                errors={errors}
                rules={{ required: "to Date is required" }}
                className={"bg-background-color text-sm text-gray-text-color"}
                placeholder="To"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 mb-6 relative">
            <div className="w-1/3">
              <label className={"flex text-sm gap-1 font-bold"}>City</label>
              {/* <RHFTextField
                name="city"
                type={"text"}
                control={control}
                errors={errors}
                placeholder="Enter City Name"
                rules={{
                  required: "city is required.",
                }}
                className={"bg-background-color text-sm text-gray-text-color"}
              /> */}
              {/* <RHFMultiSelect
                name="city"
                control={control}
                className={`${selectedBox} px-4`}
                errors={errors}
                placeholder="Enter City Name"
                rules={{
                  required: "city is required.",
                }}
                onClick={handleFocus}
                
              > */}
              <RHFTextField
                name="city"
                type={"text"}
                control={control}
                // errors={errors}
                placeholder="Select City Name"
                className={"bg-background-color text-sm text-gray-text-color"}
                // onChange={searchUser}
                value={city}
                onClick={handleClick}
              />
              {/* <input
                  type="text" 
                  className="outline-none w-[95%] text-gray-text-color font-bold text-sm px-4 mx-3 h-10 border rounded-2xl"
                  placeholder="Search cities..."
                  onChange={searchUser}
                  value={search}
                  ref={inputRef}
                /> */}
              {/* </RHFMultiSelect> */}
            </div>
            <div className="w-1/3">
              <label className={"flex text-sm gap-1 font-bold"}>
                Name of Event
              </label>
              {/* <RHFTextField
                name="event_name"
                type={"text"}
                control={control}
                errors={errors}
                placeholder="Enter Name"
                rules={{
                  required: "name is required.",
                }}
                className={"bg-background-color text-sm text-gray-text-color"}
              /> */}
              <RHFSelect
                name="event_name"
                control={control}
                className={selectedBox}
                placeholder="Select"
              >
                <option value={""}>Select</option>

                {event_name?.data?.map((item, index) => (
                  <option key={index} value={item?.id}>
                    {item?.name}
                  </option>
                ))}
              </RHFSelect>
            </div>
            <div className="w-1/3">
              <label className={"flex text-sm gap-1 font-bold"}>
                Event Type
              </label>
              <RHFSelect
                name="event_type_id"
                control={control}
                className={selectedBox}
                placeholder="Select"
              >
                <option value={""}>Select</option>

                {event_type?.data?.map((item, index) => (
                  <option key={index} value={item?.id}>
                    {item?.name}
                  </option>
                ))}
              </RHFSelect>
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
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
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
              {searchCities?.length > 0  ? (
                <>
              {searchCities?.map((item, index) => (
                <MenuItem key={index} value={item?.name} onClick={() => {setCity(item?.name);setAnchorEl(null)}}>
                  {item?.name}
                </MenuItem>
              ))}
              </>
              ): <p className="text-xs text-gray-text-color w-full flex justify-center">add Country in profile to see Cities</p>}
              </div>
            </Menu> 
          </div>

          <button
            className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white w-full"
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading || updateloading ? (
              <div className="w-100 flex justify-center items-center">
                <SpinnerLoading />
              </div>
            ) : (
              `${modalData ? "Update" : "Add"} Travel`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTravelDetailModal;
