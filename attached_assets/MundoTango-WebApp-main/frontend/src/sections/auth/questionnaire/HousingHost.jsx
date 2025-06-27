"use client";
import RHFSelect from "@/components/FORMs/RHFSelect";
import RHFTextField from "@/components/FORMs/RHFTextField";
import InputStar from "@/components/Stars/InputStar";
import AddMore from "@/components/SVGs/AddMore";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import PlusIcon from "@/components/SVGs/PlusIcon";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ConfirmationHeader from "../confirmation/ConfirmationHeader";
import toast from "react-hot-toast";
import {
  useAddAttachmentHostExperienceMutation,
  useAddHostExperienceMutation,
  useGetHostExperienceMutation,
} from "@/data/services/userFormsApi";
import SpinnerLoading from "@/components/Loadings/Spinner";
import { City } from "country-state-city";
import { Menu, MenuItem } from "@mui/material";
import SearchIcon from "@/components/SVGs/SearchIcon";

const HousingHost = ({ nextForm, preForm }) => {
  const labelClass = "flex gap-1 mb-2 ";

  const selectedBox = "bg-background-color py-3 text-xs text-[#949393] ";

  const [cityList, setCityList] = useState(City.getAllCities());
  const [loading, setLoading] = useState(true);
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 100));
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [cities, setCities] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef();

  const [uiUpdate, setUiUpdate] = useState(false);

  const [addHostExperience, { isLoading: storeLoading }] =
    useAddHostExperienceMutation();

  const [getHostExperience, {}] = useGetHostExperienceMutation();

  const [addAttachmentHostExperience, { isLoading: attachmentLoading }] =
    useAddAttachmentHostExperienceMutation();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,

    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      housing: [
        {
          property_url: "",
          city: [],
          space: "",
          people: 0,
          image: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "housing",
  });

  const [updateUi, setUpdateUi] = useState(false);

  const handleOnChangeFile = async (event, i) => {
    try {
      if (event.target.files[0]?.type?.startsWith("image")) {
        const files = event.target.files[0];
        let temp = [...getValues("housing")];

        if (temp.length < 10) {
          let record = {
            image_file: files,
            object_url: URL.createObjectURL(event.target.files[0]),
          };
          temp[i].image.push(record);
          setValue("housing", temp);
          setUpdateUi((pre) => !pre);
        }
      } else {
        toast.error("Only Photos (Image files) are allowed");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const removeFiles = async (index, i) => {
    try {
      let temp = [...getValues("housing")];
      if (temp.length > 0) {
        temp[i].image[index].object_url = null;
        // temp.splice(index, 1);
        setValue("housing", temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const onSubmit = async (record) => {
    try {
      // let temp = record.housing;
      // temp[0].city = cities;
      // let body = [...temp];
      // let text = [];
      let body = record.housing;
      let text = [];

      for (let i = 0; i < body.length; i++) {
        const { image, ...other } = body[i];
        // if (!image?.length) {
        //   toast.error("Image is required");
        //   return;
        // } else {
        text.push(other);
        // }
      }

      const response = await addHostExperience(text);

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        const { data } = response?.data;

        let formData = new FormData();
        for (let i = 0; i < body.length; i++) {
          const { image } = body[i];
          console.log(image);
          let host_id = data[i].id;

          formData.append(`host_id[${i}]`, host_id);
          image.map(({ image_file }) => {
            console.log(image_file);
            if (image_file) {
              formData.append(`image[${i}]`, image_file || object_url);
            }
          });
        }


        await addAttachmentHostExperience(formData);

        // for (const pair of formData.entries()) {
        //   console.log(pair[0], pair[1]);
        // }

        nextForm();
        toast.success("Housing Host experience added successfully");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const addAnOtherForm = async () => {
    append({
      property_url: "",
      city: [],
      space: "",
      people: "",
      image: [],
    });
  };

  const removeForm = async (index) => {
    remove(index);
  };

  const getTrangoActivity = async () => {
    try {
      const response = await getHostExperience();

      if (response?.data?.code === 200) {
        const { data } = response?.data;

        let record = [];
        for (let i = 0; i < data.length; i++) {
          let image = [];
          const { city, property_url, space, people, attachments } = data[i];

          for (let j = 0; j < attachments?.length; j++) {
            const { media_url } = attachments[j];
            image.push({ object_url: media_url });
          }

          record.push({
            city: city.split(",") || [],
            property_url: property_url || "",
            space: space ||"",
            people: people || 0,
            image: image || [],
          });
        }

        setValue("housing", record);
        setUiUpdate(!uiUpdate);
      }
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTrangoActivity();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item, i) => {
    let temp = [...getValues("housing")];
    const currentCities = temp[i].city || [];

    if (currentCities.some((city) => city === item?.name)) {
      temp[i].city = currentCities;
    }
    temp[i].city = [...currentCities, item?.name];
    setValue("housing", temp);
    setCities(temp);
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

  const handleCitySelect = (item, i) => {
    let temp = [...getValues("housing")];
    const currentCities = temp[i]?.city || [];

    if (!currentCities.includes(item?.name)) {
      temp[i].city = [...currentCities, item?.name];
    } else {
      temp[i].city = currentCities.filter((city) => city !== item?.name);
    }

    setValue("housing", temp);
    handleClose();
  };

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
                <div className="grid lg:grid-cols-12 gap-x-0 md:gap-x-10 gap-y-5 mb-5">
                  <div className="col-span-12 px-2 mb-1">
                    <div className="text-2xl font-bold">Housing Host</div>
                  </div>
                  {fields.map((item, i) => {
                    console.log(i);
                    return (
                      <React.Fragment key={item.id}>
                        <div className="col-span-12 px-2 relative">
                          <div className="">
                            <label className={labelClass}>
                              Have you listed your property (Airbnb, VRBO, etc)?
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
                          <div className="relative">
                            <label className={labelClass}>
                              {/* <InputStar />  */}
                              Where?
                            </label>
                            {/* <RHFSelect
                            name={`housing.${i}.city`}
                            control={control}
                            errors={errors}
                            placeholder="Select city"
                            rules={{
                              required: "City is required.",
                            }}
                            className={`${selectedBox} py-2 text-[#949393]`}
                          >
                            <option>Select City</option>
                            {["One", "Two", "Three"].map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                          </RHFSelect> */}
                            <RHFTextField
                              name={`housing.${i}.city`}
                              type="text"
                              control={control}
                              placeholder="Select City Name"
                              className="bg-background-color text-sm text-gray-text-color"
                              value={getValues(`housing.${i}.city`)}
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
                                  position: "absolute",
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
                                  className="outline-none w-full text-gray-text-color font-bold text-sm"
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
                                    onClick={() => handleCitySelect(item, i)}
                                  >
                                    <div
                                      className={`flex justify-between w-full`}
                                    >
                                      <p
                                        className={`${
                                          getValues("housing")[
                                            i
                                          ]?.city?.includes(item?.name)
                                            ? "font-semibold"
                                            : "font-normal"
                                        } text-sm`}
                                      >
                                        {item?.name}
                                      </p>
                                      {getValues("housing")[i]?.city?.includes(
                                        item?.name
                                      ) && (
                                        <p
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCitySelect(item, i);
                                          }}
                                          className="w-4 h-4 flex justify-center items-center bg-slate-100 rounded-full cursor-pointer"
                                        >
                                          x
                                        </p>
                                      )}
                                    </div>
                                  </MenuItem>
                                ))}
                              </div>
                            </Menu>

                            {/* <DynamicError
                            errors={errors["housing"]}
                            name={"city"}
                            index={i}
                          /> */}
                          </div>
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
                              // errors={errors}
                              // rules={{
                              //   required: "Space is required.",
                              // }}
                              className={
                                "bg-background-color text-sm text-gray-text-color"
                              }
                            />
                            {/* <RHFSelect
                            name={`housing.${i}.space`}
                            control={control}
                            errors={errors}
                            rules={{
                              required: "Space is required.",
                            }}
                            className={`${selectedBox} py-2 text-[#949393]`}
                          >
                            <option>Select</option>
                            {["One", "Two", "Three"].map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                          </RHFSelect> */}
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
                              {/* <InputStar />  */}
                              How many people?
                            </label>
                            {/* <RHFSelect
                            name={`housing.${i}.people`}
                            control={control}
                            errors={errors}
                            rules={{
                              required: "People is required.",
                            }}
                            className={`${selectedBox}`}
                          >
                            <option>Select</option>
                            {["One", "Two", "Three"].map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                          </RHFSelect> */}
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

                        <div className="col-span-12 px-2">
                          <div className="">
                            <label
                              className={`${labelClass} flex items-center`}
                            >
                              {/* <InputStar /> */}
                              <div> Add Photos</div>{" "}
                              <div className="text-[#949393] text-sm">
                                ({getValues("housing")[i]?.image?.length}/10)
                              </div>
                            </label>

                            <input
                              type="file"
                              id={`fileInput${i}`}
                              className="hidden"
                              onChange={(e) => handleOnChangeFile(e, i)}
                              accept="image/png, image/jpeg, image/jpg"
                            />

                            <div className="flex items-center gap-3 flex-wrap">
                              {getValues("housing")[i]?.image?.map(
                                ({ object_url }, index) =>
                                  object_url && (
                                    <div key={index} className="relative">
                                      <img
                                        src={object_url}
                                        alt=""
                                        className="h-14 w-14 rounded-lg"
                                      />
                                      <button
                                        className="absolute top-1 right-1 text-white bg-gray-400 p-1 rounded-full text-xs"
                                        onClick={() => removeFiles(index, i)}
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          padding: "2px",
                                        }}
                                      >
                                        &#10005;
                                      </button>
                                    </div>
                                  )
                              )}

                              <label htmlFor={`fileInput${i}`}>
                                <PlusIcon
                                  className="cursor-pointer"
                                  width="55"
                                  height="55"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="col-span-12 px-2">
                  <div className="">
                    <label className={labelClass}>Add Another</label>
                    <AddMore
                      className="cursor-pointer"
                      onClick={addAnOtherForm}
                    />
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

                  <button className="bg-btn-color text-white w-32 py-2 rounded-xl flex items-center justify-center">
                    {storeLoading || attachmentLoading ? (
                      <SpinnerLoading />
                    ) : (
                      <NextArrow />
                    )}
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

export default HousingHost;

export const DynamicError = ({ errors, name, index }) => {
  return (
    <div className="text-sm font text-[#dc3545]">
      {!!errors?.length && errors[index]?.hasOwnProperty(name)
        ? errors[index][name]?.message
        : null}
    </div>
  );
};
