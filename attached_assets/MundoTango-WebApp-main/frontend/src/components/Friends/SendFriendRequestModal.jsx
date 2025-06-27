import React, { useEffect, useRef, useState } from "react";
import Button from "../Buttons/Button";
import RHFSelect from "../FORMs/RHFSelect";
import RHFTextArea from "../FORMs/RHFTextArea";
import RHFTextField from "../FORMs/RHFTextField";
import InputStar from "../Stars/InputStar";
import CrossIcon from "../SVGs/CrossIcon";
import PlusIcon from "../SVGs/PlusIcon";
import SpinnerLoading from "../Loadings/Spinner";
import { City } from "country-state-city";
import { Menu, MenuItem } from "@mui/material";
import SearchIcon from "../SVGs/SearchIcon";
import { useGeteventWeMeetQuery } from "@/data/services/friendApi";
import { useSearchParams } from "next/navigation";

const SendFriendRequestModal = ({
  handleClose,
  control,
  errors,
  imagesList,
  handleChangeFile,
  removeImageFile,
  onDecline,
  isLoading,
  setCities,
  cities
}) => {
  const labelClass = "flex gap-1 mb-1 font-bold ";
  const textAreaLabel = "flex gap-1 mb-1 ";
  const inputClass = "bg-background-color p-2 text-[#94A3B8]";

  const [cityList, setCityList] = useState(City.getAllCities());
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();
  const id = useSearchParams()?.get("q")
  const { data: meetevent, error } = useGeteventWeMeetQuery(id);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCity = () => {
    setAnchorEl(null);
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

  // const uploadImages = async () => {
  //   var formData = new FormData();
  //   imagesList?.map((item) => {
  //     if (item?.image && item?.objectUrl) {
  //       formData.append("file", item?.image);
  //     }
  //   });
  // };

  console.log(cities)

  return (
    <div className="px-8 py-5 my-4 h-[90vh] overflow-y-auto">
      <div className="absolute right-5 top-5">
        <CrossIcon className="cursor-pointer" onClick={handleClose} />
      </div>

      <div>
        <div className="font-bold text-xl">Send Connect request</div>
        <div className="text-light-gray-color text-base">
          How do you know this person? These details will be shared with them in
          the request.
        </div>
      </div>

      <br />
      <hr />
      <br />
      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>
            <InputStar /> Have we danced?
          </label>
          <RHFSelect
            name="have_we_danced"
            control={control}
            errors={errors}
            rules={{
              required: "Danced is required.",
            }}
            className={inputClass}
          >
            <option value={""} disabled>
              Select
            </option>

            {["Yes", "No"].map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </RHFSelect>
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>
            <InputStar /> Which city did we meet in?
          </label>
          <RHFTextField
            name="cities"
            type={"text"}
            control={control}
            // errors={errors}
            placeholder="Select City Name"
            className={"bg-background-color text-sm text-gray-text-color"}
            // onChange={(e) => setCity(e.target.value)}
            value={cities}
            onClick={handleClick}
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
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseCity}
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
              {searchCities?.length > 0 ? (
                <>
                  {searchCities?.map((item, index) => (
                    <MenuItem
                      key={index}
                      value={item?.name}
                      onClick={() => {
                        setCities(item?.name);
                        setAnchorEl(null);
                      }}
                    >
                      {item?.name}
                    </MenuItem>
                  ))}
                </>
              ) : (
                <p className="text-xs text-gray-text-color w-full flex justify-center">
                  add Country in profile to see Cities
                </p>
              )}
            </div>
          </Menu>
          {/* <RHFSelect
            name="which_city_did_we_meet_in"
            control={control}
            errors={errors}
            rules={{
              required: "City meet is required.",
            }}
            className={inputClass}
          >
            <option value={""} disabled>
              Public Event
            </option>

            {["One", "Two", "Three"].map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </RHFSelect> */}
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>
            <InputStar /> When did we meet?
          </label>
          <RHFTextField
            type={"date"}
            name="when_did_we_meet"
            control={control}
            errors={errors}
            className={inputClass}
            rules={{
              required: "Meet is required.",
            }}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <label className={labelClass}>Did we meet at an event?</label>
          <RHFTextField
            name="did_we_meet_in_event"
            type={"text"}
            control={control}
            placeholder="Type here.."
            className={inputClass}
            defaultValue={meetevent?.data[0]?.event?.name}
          />
        </div>

        <div className="col-span-12">
          <br />
          <hr />
        </div>

        <div className="col-span-12">
          <label className={`${textAreaLabel} font-medium `}>
            <InputStar /> Why do you want to connect? Did we have an interesting
            conversation topic, did we go on an adventure, etc
          </label>
          <RHFTextArea
            numberLength={false}
            name="connect_reason"
            type={"text"}
            control={control}
            errors={errors}
            rules={{
              required: "Topic is required.",
            }}
            placeholder="Type here.."
            className={"bg-background-color p-2 h-28 text-[#94A3B8]"}
          />
        </div>

        <div className="col-span-12">
          <label className={`${labelClass} mb-4`}>Add Photos if any</label>
          <div className="flex w-full gap-5 select-none">
            {!!imagesList?.length &&
              imagesList.map(({ objectUrl }, index) => (
                <div key={index}>
                  {objectUrl ? (
                    <div className="relative">
                      <img
                        src={objectUrl}
                        className="h-32 rounded-2xl w-32"
                        loading="lazy"
                      />
                      <CrossIcon
                        className="absolute z-50 top-0 right-0 m-2 cursor-pointer"
                        onClick={() => removeImageFile(index)}
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id={`fileInput_${index}`}
                        className="hidden"
                        onChange={(e) => handleChangeFile(e, index)}
                      />
                      <label htmlFor={`fileInput_${index}`}>
                        <PlusIcon className="cursor-pointer" />
                      </label>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="col-span-12">
          <label
            className={`${textAreaLabel} italic text-[#217FC3] text-lg font-bold`}
          >
            “Notes for yourself to remember this person. They will not see what
            you write here.”
          </label>
          <RHFTextArea
            numberLength={false}
            name="your_notes"
            type={"text"}
            control={control}
            placeholder="Type here....."
            className={"bg-background-color p-2 h-28 text-[#94A3B8]"}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-5">
        {/* <Button
          text={"Decline"}
          className={
            "w-full rounded-xl text-white h-10 bg-tag-color text-sm font-medium"
          }
          onClick={onDecline}
        /> */}
        <Button
          disabled={isLoading}
          text={isLoading ? <SpinnerLoading /> : "Send Connection Request"}
          className={
            "w-full rounded-xl text-white h-10 text-sm font-medium flex items-center justify-center"
          }
        />
      </div>
    </div>
  );
};

export default SendFriendRequestModal;
