"use client";
import { useEffect, useRef, useState } from "react";
import {
  useAddGroupMutation,
  useGetAllMembersQuery,
} from "@/data/services/groupApi";
import { Box, Menu, MenuItem, Modal } from "@mui/material";
import GooglePlacesAutocomplete from "react-google-autocomplete";
import { Controller, useForm } from "react-hook-form";
import InputStar from "../Stars/InputStar";
import RHFDateTimeField from "../FORMs/RDFDateAndTime";
import RHFTextField from "../FORMs/RHFTextField";
import RHFSelect from "../FORMs/RHFSelect";
import RHFTextArea from "../FORMs/RHFTextArea";
import toast from "react-hot-toast";
import {
  useAddEventMutation,
  useGetEventTypesQuery,
  useGetNonTangoActivitiesQuery,
} from "@/data/services/eventAPI";
import SpinnerLoading from "../Loadings/Spinner";
import SearchIcon from "../SVGs/SearchIcon";
import PlusIcon from "../SVGs/PlusIcon";
import {
  useAddActivityMutation,
  useNonTangoActivityMutation,
} from "@/data/services/activityApi";
import { useAuthContext } from "@/auth/useAuthContext";
import CustomInfiniteScroll from "../InfiniteScroll/InfiniteScroll";
import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";

const CreateModal = ({
  open,
  handleClose,
  title,
  description,
  type,
  group_id,
  refetch,
}) => {
  const [addOptions, setAddOptions] = useState([]);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [country, setCountry] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElAct, setAnchorElAct] = useState(null);
  const [memberType, setMemberTypes] = useState("");
  const [selectedMembers, setSelectedMembers] = useState({
    "Co-host": [],
    Teacher: [],
    DJ: [],
    "Photographer/videographer": [],
    Musicians: [],
  });
  // "co-host",
  // "teacher",
  // "dj",
  // "photographer",
  // "musician",
  const [nonTangoActivities, setNonTangoActivities] = useState([]);
  const autoEventRef = useRef(null);

  const handleAssignRole = (userId, role, action) => {
    setSelectedMembers((prev) => {
      const updatedMembers = { ...prev };

      if (!updatedMembers[role]) {
        updatedMembers[role] = [];
      }

      if (action === "add") {
        if (!updatedMembers[role].includes(userId)) {
          updatedMembers[role] = [...updatedMembers[role], userId];
        }
      } else if (action === "remove") {
        updatedMembers[role] = updatedMembers[role].filter(
          (id) => id !== userId
        );
      }

      return updatedMembers;
    });
  };

  const handleSelectType = (event, type) => {
    setMemberTypes(type);
    setAnchorEl(event.currentTarget);
  };

  const [addGroup, { isLoading: groupLoading }] = useAddGroupMutation();
  const [addEvent, { isLoading: eventLoading }] = useAddEventMutation();
  const { data: eventTypes } = useGetEventTypesQuery();

  // RHF form setup
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const labelClass = "flex gap-1 font-bold";
  const selectedBox = "bg-background-color py-3 text-xs text-[#949393]";

  const membermenu = Boolean(anchorEl);
  const activitiesmenu = Boolean(anchorElAct);

  const handleMmembersClose = () => {
    setAnchorEl(null);
  };

  const handleActivitiesClose = () => {
    setAnchorElAct(null);
  };

  const handleSelectActivities = (event) => {
    setAnchorElAct(event.currentTarget);
  };

  useEffect(() => {
    document.addEventListener("mousedown", () => setAnchorElAct(null));

    return () => {
      document.removeEventListener("mousedown", () => setAnchorElAct(null));
    };
  }, [anchorElAct]);

  // setAnchorElAct((prevAnchorEl) =>
  //   prevAnchorEl ? null : event.currentTarget
  // );

  // Handle file upload
  const handleBannerUpload = (e) => {
    const image = e.target.files[0];
    setBannerImageFile(image);
    setBannerImage(URL?.createObjectURL(image));
  };

  // Form submission handler
  const onSubmit = async (data) => {
    if (type === "group") {
      if (data.group_type === '' ) {
        toast.error("Please select a group type");
        return;
      } else if (data.name === '') {
        toast.error("Please enter a group name");
        return;
      } else if (data.about === '') {
        toast.error("Please enter a group description");
        return;
      } else if (data.privacy === '') {
        toast.error("Please select a group privacy");
        return;
      } else {
        if (!bannerImageFile) {
          toast.error("Please select a group banner");
          return;
        }
      }
      try {
        const formData = new FormData();
        formData.append("media", bannerImageFile);
        formData.append("group_type", data?.group_type);
        formData.append("name", data?.name);
        formData.append("description", data?.about);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("members", []);
        formData.append("privacy", data?.privacy);

        // Submit the form data
        const result = await addGroup(formData);
        if (result?.data?.code === 200) {
          toast.success("Group Created Successfully");
          setBannerImage("");
          setBannerImageFile(null);
          handleClose();
          refetch();
          reset();
        }
        if (result?.error?.data?.code === 500) {
          toast.error("Seems like something went wrong");
          return;
        }
        if (result?.error?.data) {
          toast.error(result?.error?.data?.message);
          return;
        }
      } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
        setBannerImage("");
      }
    } else if (type === "event") {
      try {
        const formData = new FormData();
        formData.append("media", bannerImageFile);
        formData.append("event_type_id", data.event_type_id);
        formData.append("name", data.name);
        formData.append("description", data.about);
        formData.append("city", city);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("country", country);
        formData.append("start_date", data.startDate);
        formData.append("end_date", data.endDate);
        formData.append("location", location);
        formData.append("visibility", data.visibility);
        formData.append("about_space", data.about_space);

        if (group_id) {
          formData.append("city_group_id", group_id);
        }
        let index = 0;
        Object.keys(selectedMembers).forEach((role, roleIndex) => {
          selectedMembers[role].forEach((userId, userIndex) => {
            formData.append(`participants[${index}][user_id]`, userId);
            formData.append(
              `participants[${index}][user_type]`,
              role.toLowerCase()
            );
            index++;
          });
        });
        nonTangoActivities.forEach((act, actIndex) => {
          formData.append(`non_tango_activities[${actIndex}]`, act?.id);
        });

        // Submit the form data
        const result = await addEvent(formData);
        if (result?.data?.code === 200) {
          toast.success("Event Created Successfully");
          setBannerImage("");
          setBannerImageFile(null);
          handleClose();
          refetch();
          reset();
          setSelectedMembers({
            "Co-host": [],
            Teacher: [],
            DJ: [],
            "Photographer/videographer": [],
            Musicians: [],
          });
          setAddOptions([]);
        }
        if (result?.error?.data?.code === 500) {
          toast.error("Seems like something went wrong");
          return;
        }
        if (result?.error?.data) {
          toast.error(result?.error?.data?.message);
          return;
        }
      } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
        setBannerImage("");
      }
    }
  };

  // function submit() {
  //   console.log("function called");
  //   handleSubmit(onSubmit());
  // }

  // Handle location changes from Google Places
  const handleLocationChange = (place) => {
    console.log("call handleLocationChange")
    // const place = autoEventRef.current.getPlace();
    if (place && place.geometry) {
      const { lat, lng } = place.geometry.location;

      // Extract the address components
      const addressComponents = place.address_components;

      let streetNumber = "";
      let streetName = "";
      let block = "";
      let city = "";
      let state = "";
      let country = "";
      let postalCode = "";
      let sublocality_level_1 = "";
      let area = "";

      // Iterate through address components to get relevant details
      addressComponents.forEach((component) => {
        const types = component.types;
        if (types.includes("neighborhood")) {
          streetNumber = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_2")) {
          block = component.long_name;
        } else if (types.includes("sublocality_level_1")) {
          sublocality_level_1 = component.long_name;
        } else if (types.includes("administrative_area_level_3")) {
          area = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name;
        } else if (types.includes("plus_code")) {
          postalCode = component.long_name;
        }
      });

      // Combine the parts to form the full address
      const fullAddress = `${streetNumber} ${streetName}, ${block} ${sublocality_level_1} ${area}, ${city}, ${state}, ${country}, ${postalCode}`;
      console.log(fullAddress);

      setCity(city);
      setCountry(country);
      setLocation(fullAddress);
      setLatitude(lat);
      setLongitude(lng);
    }
  };

  const onPlaceSelected = () => {
    const place = autoEventRef.current.getPlace();

    if (place && place.geometry) {
      const { lat, lng } = place.geometry.location;

      // Extract the address components
      const addressComponents = place.address_components;


      let streetNumber = '';
      let streetName = '';
      let block = '';
      let city = '';
      let state = '';
      let country = '';
      let postalCode = '';
      let sublocality_level_1 = '';
      let area = '';

      // Iterate through address components to get relevant details
      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes("neighborhood")) {
          streetNumber = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_2")) {
          block = component.long_name;
        } else if (types.includes("sublocality_level_1")) {
          sublocality_level_1 = component.long_name;
        } else if (types.includes("administrative_area_level_3")) {
          area = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name || '';
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name || '';
        } else if (types.includes("plus_code")) {
          postalCode = component.long_name;
        }
      });

      // Combine the parts to form the full address
      const fullAddress = `${streetNumber} ${streetName} ${block} ${sublocality_level_1} ${area}  ${city} ${state}, ${country}, ${postalCode}`;
      console.log(fullAddress);
      const address = fullAddress?.split(",").join(" ");
      // Pass the full address and other location details to the parent component
      setCity(city);
      setCountry(country);
      setLocation(fullAddress);
      setLatitude(lat);
      setLongitude(lng);
    }
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        className="m-auto w-[90vw] md:max-w-[600px] bg-white rounded-xl space-y-4 h-[90vh]"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
          outline: "none",
          border: "none",
        }}
      >
        <div className="h-full overflow-auto p-8">
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <p>{description}</p>
          <form className="relative" onSubmit={handleSubmit(onSubmit)}>
            {/* Banner Image Upload */}
            <div
              className="border-2 border-dashed bg-background-color border-gray-300 rounded-lg w-full h-[219px] flex flex-col items-center justify-center mb-4 mt-3 overflow-hidden object-contain"
              onClick={() =>
                document.getElementById("imageUploadBanner").click()
              }
              // style={{ backgroundImage: `url(${bannerImage})`, objectFit:"contain" }}
            >
              {bannerImage && (
                <img
                  src={bannerImage}
                  className="object-contain w-full h-full"
                />
              )}
              {!bannerImage && <img src="/images/uploaderimg.svg" />}
              <input
                id="imageUploadBanner"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleBannerUpload}
              />
              {!bannerImage && (
                <>
                  <p className="text-btn-color mt-2">Add image/Video </p>
                  <p className="text-btn-color mt-2">530/220</p>
                </>
              )}
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>
                  <InputStar /> {type === "group" ? "Group" : "Event"} Name
                </label>
                <RHFTextField
                  name="name"
                  control={control}
                  errors={errors}
                  rules={{ required: "Name is required." }}
                  placeholder="Type Here.."
                  className={`${selectedBox} bg-background-color p-2`}
                />
              </div>

              {/* Event Fields (Start and End Date/Time) */}
              {type === "event" && (
                <>
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> Start Date
                      </label>
                      <RHFDateTimeField
                        name="startDate"
                        control={control}
                        type="date"
                        errors={errors}
                        rules={{ required: "Start Date is required" }}
                        className="bg-background-color"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> Start Time
                      </label>
                      <RHFDateTimeField
                        name="startTime"
                        control={control}
                        type="time"
                        errors={errors}
                        rules={{ required: "Start Time is required" }}
                        className="bg-background-color"
                      />
                    </div>
                  </div>

                  {/* End Date and End Time */}
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> End Date
                      </label>
                      <RHFDateTimeField
                        name="endDate"
                        control={control}
                        type="date"
                        errors={errors}
                        rules={{ required: "End Date is required" }}
                        className="bg-background-color"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> End Time
                      </label>
                      <RHFDateTimeField
                        name="endTime"
                        control={control}
                        type="time"
                        errors={errors}
                        rules={{ required: "End Time is required" }}
                        className="bg-background-color"
                      />
                    </div>
                  </div>
                </>
              )}
              {/* {type === "event" && ( */}
              <div>
                <label className={labelClass}>
                {type === "event" && <InputStar />} Location
                </label>
                <Controller
                  name="location"
                  control={control}
                  defaultValue={location}
                  render={({ field }) => (
                    <div className="">
                      {/* <GooglePlacesAutocomplete
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                        selectprops={{
                          value: location,
                          onChange: (e) => handleLocationChange(e),
                          placeholder: "Type Here...",
                          ...field,
                          className:
                            "w-full rounded-lg p-3 pl-5 text-base outline-none bg-background-color",
                        }}
                        onPlaceSelected={handleLocationChange} // Use the updated function here
                        className="w-full rounded-lg p-3 pl-5 text-base outline-none bg-background-color"
                        debounce={500}
                        styles={{
                          zIndex: 110000,
                          root: {
                            position: "relative",
                          },
                          input: {
                            paddingLeft: "20px",
                          },
                          autocompleteContainer: {
                            position: "absolute",
                            top: "100%",
                            left: "0",
                            right: "0",
                            zIndex: 1100000,
                          },
                        }}
                        ref={autoEventRef}
                      /> */}
                      <LoadScript
                        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                        libraries={["places"]}
                      >
                        <Autocomplete
                          onLoad={(autocomplete) => (autoEventRef.current = autocomplete)}
                          onPlaceChanged={onPlaceSelected}
                        >
                          <input
                            type="text"
                            placeholder="Search a place"
                            className="w-full rounded-lg p-3 pl-5 text-base outline-none bg-background-color"
                          />
                        </Autocomplete>
                      </LoadScript>
                    </div>
                  )}
                />
              </div>
              {/* )} */}

              {/* Group-Specific Fields (Privacy and Type) */}
              {type === "group" && (
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className={labelClass}>
                      <InputStar /> Privacy
                    </label>
                    <RHFSelect
                      name="privacy"
                      control={control}
                      errors={errors}
                      rules={{ required: "Privacy is required." }}
                      className={`${selectedBox} pe-2`}
                      placeholder={"Privacy"}
                    >
                      <option value={""}>Select Privacy</option>
                      {["public", "private", "friends"].map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </RHFSelect>
                  </div>
                  <div className="w-1/2">
                    <label className={labelClass}>
                      <InputStar /> Group Type
                    </label>
                    <RHFSelect
                      name="group_type"
                      control={control}
                      errors={errors}
                      rules={{ required: "Group Type is required." }}
                      className={`${selectedBox} pe-2`}
                      placeholder={"Group Type"}
                    >
                      <option value={""}>Select Group Type</option>
                      {["privacy", "public"].map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </RHFSelect>
                  </div>
                </div>
              )}

              {/* Event-Specific Fields (Privacy and Type) */}
              {type === "event" && (
                <>
                  {/* <div className="flex gap-3">
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> City Name
                      </label>
                      <RHFSelect
                        name="city"
                        control={control}
                        errors={errors}
                        rules={{ required: "city is required." }}
                        className={`${selectedBox} pe-2`}
                        placeholder={"Select"}
                      >
                        {["public", "private", "friends"].map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </RHFSelect>
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>
                        <InputStar /> Visibility
                      </label>
                      <RHFSelect
                        name="visibility"
                        control={control}
                        errors={errors}
                        rules={{ required: "Visibility is required." }}
                        className={`${selectedBox} pe-2`}
                        placeholder={"Select"}
                      >
                        {["city-group", "normal"].map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </RHFSelect>
                    </div>
                  </div> */}
                  <div className="w-full">
                    <label className={labelClass}>
                      <InputStar /> Visibility
                    </label>
                    <RHFSelect
                      name="visibility"
                      control={control}
                      errors={errors}
                      rules={{ required: "Visibility is required." }}
                      className={`${selectedBox} pe-2`}
                      placeholder={"Select"}
                    >
                      <option value={""}>Select Visibility</option>
                      {["public", "private", "friends"].map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </RHFSelect>
                  </div>
                  <div className="w-full">
                    <label className={labelClass}>
                      <InputStar /> Event Type
                    </label>
                    <RHFSelect
                      name="event_type_id"
                      control={control}
                      errors={errors}
                      rules={{ required: "Event Type is required." }}
                      className={`${selectedBox} pe-2`}
                      placeholder={"Select"}
                    >
                      <option value={""}>Select Event Type</option>
                      {eventTypes?.data?.map((item, index) => (
                        <option key={index} value={item?.id}>
                          {item?.name}
                        </option>
                      ))}
                    </RHFSelect>
                  </div>
                </>
              )}

              {/* About the Group/Event */}
              <div>
                <label className={labelClass}>
                  <InputStar /> About the {type === "event" ? "Event" : "Group"}
                </label>
                <RHFTextArea
                  name="about"
                  control={control}
                  errors={errors}
                  rules={{ required: "About is required" }}
                  className={`${selectedBox} h-36 bg-background-color`}
                  placeholder="Write here...."
                />
              </div>

              {type === "event" && (
                <div>
                  <label className="font-bold">
                    What do new people need to know about your space?{" "}
                    <span className="text-gray-500 text-xs font-normal">
                      (Ex: “Go through the red door on the right, you need to be
                      part of our association, etc”)
                    </span>
                  </label>
                  <RHFTextArea
                    type="text"
                    name="about_space"
                    control={control}
                    errors={errors}
                    placeholder="Type here.."
                    className={`${selectedBox} text-sm h-36 bg-background-color `}
                  />
                </div>
              )}

              {type === "event" && (
                <>
                  {/* Participants and Activities */}
                  <div>
                    <label className={labelClass}>
                      Add Participants and Activities
                    </label>
                    <div className="flex gap-4 items-center flex-wrap mt-3">
                      {[
                        "Co-host",
                        "Teacher",
                        "Dj",
                        "Photographer",
                        "Musician",
                      ].map((x) => (
                        <div
                          className="resize-none rounded-lg text-base flex gap-2 items-center outline-none w-fit cursor-pointer"
                          key={x}
                          onClick={(event) => handleSelectType(event, x)}
                        >
                          <img
                            src="/images/addoption.svg"
                            className="w-[21px]"
                          />
                          <h4 className="text-nowrap text-btn-color font-semibold">
                            {x}
                          </h4>
                        </div>
                      ))}
                    </div>
                    <MenuPop
                      handleClose={handleMmembersClose}
                      anchorEl={anchorEl}
                      open={membermenu}
                      setAddOptions={setAddOptions}
                      memberType={memberType}
                      handleAssignRole={handleAssignRole}
                      selectedMembers={selectedMembers}
                    />
                  </div>

                  {/* Participants */}
                  <div>
                    <label className={labelClass}>Partcipants</label>
                    <div className="w-full resize-none rounded-lg p-3 text-base shadow-sm outline-none flex gap-4 items-center flex-wrap bg-background-color min-h-10">
                      {addOptions.map((user) => {
                        const userMemberType = Object.keys(
                          selectedMembers
                        ).find((role) =>
                          selectedMembers[role].includes(user?.id)
                        );

                        return (
                          <div className="relative w-fit" key={`${user?.id}-${user?.memberType}`}>
                            <p className="bg-[#282828] px-3 py-1 text-white w-fit rounded-3xl text-sm">
                              {user?.username}

                              {/* Display the member type (role) on hover */}
                              <span className="ml-2 text-xs text-light-gray">
                                {user?.memberType ? `(${user?.memberType})` : ""}
                              </span>

                              <button
                                className="bg-gray-text-color absolute w-4 h-4 rounded-full flex justify-center items-center right-[3px] -top-[5px]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Remove the user from the addOptions list
                                  setAddOptions((prev) =>
                                    prev.filter(
                                      (item) => item?.id !== user?.id || item?.memberType !== user?.memberType
                                    )
                                  );

                                  // Remove the user from the corresponding memberType
                                  handleAssignRole(
                                    user?.id,
                                    user?.memberType,
                                    "remove"
                                  );
                                }}
                              >
                                x
                              </button>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Non-tango Activities */}
              {/* {type === "event" && (
                <div>
                  <label className={labelClass}>Non-tango Activities</label>
                  <div
                    className="w-full resize-none rounded-lg p-3 text-base shadow-sm outline-none flex gap-4 items-center flex-wrap bg-background-color min-h-10 "
                    onClick={handleSelectActivities}
                  >
                    {nonTangoActivities.map((user) => {
                      return (
                        <div className="relative w-fit" key={user?.id}>
                          <p className="bg-[#282828] px-3 py-1 text-white w-fit rounded-3xl text-sm">
                            {user?.name}
                            <button
                              className="bg-gray-text-color absolute w-4 h-4 rounded-full flex justify-center items-center right-[3px] -top-[5px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNonTangoActivities((prev) =>
                                  prev.filter((item) => item?.id !== user?.id)
                                );
                              }}
                            >
                              x
                            </button>
                          </p>
                        </div>
                      );
                    })}
                    <MenuNonTango
                      handleActivitiesClose={handleActivitiesClose}
                      anchorEl={anchorElAct}
                      open={activitiesmenu}
                      setNonTangoActivities={setNonTangoActivities}
                      setAnchorElAct={setAnchorElAct}
                    />
                  </div>
                </div>
              )} */}
            </div>

            {/* Form Action Buttons */}
            <div className="flex gap-2 pt-2 w-full">
              <button
                className="bg-btn-color text-white rounded-xl p-2.5 text-sm font-semibold w-full"
                onClick={() => {
                  handleClose();
                  setBannerImage("");
                  setBannerImageFile(null);
                  reset();
                  setAddOptions([]);
                  setSelectedMembers({
                    "Co-host": [],
                    Teacher: [],
                    DJ: [],
                    "Photographer/videographer": [],
                    Musicians: [],
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="bg-tag-color text-white rounded-xl p-2.5 text-sm font-semibold w-full flex justify-center"
                type="submit"
                // onClick={(e) => { e.preventDefault(); submit()}}
                // disabled={bannerImageFile == null}
              >
                {groupLoading || eventLoading ? (
                  <div className="w-full text-center flex justify-center">
                    <SpinnerLoading />
                  </div>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
};

export default CreateModal;

export const MenuPop = ({
  handleClose,
  anchorEl,
  open,
  setAddOptions,
  memberType,
  handleAssignRole,
  selectedMembers,
}) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { data: members, isLoading } = useGetAllMembersQuery({
    page: pages,
    limit: 10,
    // search: search,
  });
  const searchRef = useRef();
  const { user } = useAuthContext();

  useEffect(() => {
    if (pages !== 1) {
      setUsers([...users, ...members?.data]);
    } else {
      const data = members?.data?.filter((x) => x.id !== user.id);
      setUsers(data || []);
    }
    setPagination(members?.links);
  }, [members, pages]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handlePageChange = (page) => {
    setPages(pages + 1);
  };

  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          border: "1px solid lightgrey",
          overflow: "hidden",
          height: "230px",
          width: "250px",
          bottom: "0px",
          position: "absolute",
          borderRadius: 5,
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
          placeholder="Search People…"
          onChange={(e) => {
            setSearch(e.target.value);
            setUsers(
              members?.data?.filter((item) =>
                item?.name.toLowerCase().includes(e.target.value.toLowerCase())
              )
            );
          }}
          value={search}
          ref={searchRef}
        />
        {search && (
          <div
            className="cursor-pointer me-2"
            onClick={() => {
              setSearch("");
              setUsers(members?.data);
            }}
          >
            x
          </div>
        )}
        <div className="cursor-pointer">
          <SearchIcon />
        </div>
      </div>
      {/* {members?.data?.map((x, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            // setAddOptions((prev) => {
            //   const isNew = !prev.some((item) => item === x?.username);
            //   if (isNew) {
            //     const newState = [...prev, x?.username];
            //     handleClose();
            //     return newState;
            //   } else {
            //     return prev;
            //   }
            // });
            // handleAssignRole(x?.id, memberType, 'add');
            setAddOptions((prev) => {
              if (!prev.some((item) => item.id === x?.id)) {
                return [...prev, { id: x?.id, username: x?.username }];
              }
              return prev; 
            });
            
            handleAssignRole(x?.id, memberType, "add");
          }}
        >
          <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center ">
            <div> {x?.username}</div>
          </div>
        </MenuItem>
      ))} */}
      <div
        style={{
          overflow: "auto",
          maxHeight: "180px",
        }}
        id="scroll"
      >
        <CustomInfiniteScroll
          dataLength={users?.length}
          LoadingScreen={
            isLoading && (
              <div className="flex items-center justify-center">
                <SpinnerLoading />
              </div>
            )
          }
          endMessage={
            <div className="flex items-center justify-center">
              No more users
            </div>
          }
          getRecords={handlePageChange}
          hasMore={users?.length <= pagination?.total_records}
          scrollableTarget="scroll"
        >
          {users?.length > 0 ? (
            users?.map((x, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  if (!selectedMembers[memberType]?.includes(x?.id)) {
                  setAddOptions((prev) => {
                    // if (!prev.some((item) => item.id === x?.id)) {
                      return [...prev, { id: x?.id, username: x?.username, memberType: memberType}];
                    // }
                    // return prev;
                  });
                    } else {
                    console.log(
                      `${x?.username} is already in the ${memberType} role.`
                    );
                    toast.error(`${x?.username} is already in the ${memberType} role.`)
                  }
                  // if (!selectedMembers[memberType]?.includes(x?.id)) {
                  //   setAddOptions((prev) => {
                  //     if (!prev.some((item) => item.id === x?.id)) {
                  //       return [...prev, { id: x?.id, username: x?.username }];
                  //     }
                  //     return prev;
                  //   });
                  // } else {
                  //   console.log(
                  //     `${x?.username} is already in the ${memberType} role.`
                  //   );
                  //   toast.error(`${x?.username} is already in the ${memberType} role.`)
                  // }
                  handleAssignRole(x?.id, memberType, "add");
                }}
              >
                <div className="flex gap-3">
                <img
                  src={x?.user_images?.length > 0 ? x?.user_images[0]?.image_url : ''}
                  alt=""
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                />
                <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center ">
                  <div>{x?.username}</div>
                </div>
                </div>
              </MenuItem>
            ))
          ) : (
            <div className="flex items-center justify-center p-1">
              User Not Found
            </div>
          )}
        </CustomInfiniteScroll>
      </div>
    </Menu>
  );
};

export const MenuNonTango = ({
  handleActivitiesClose,
  anchorEl,
  open,
  setNonTangoActivities,
  setAnchorElAct,
}) => {
  const { data: activities, refetch } = useGetNonTangoActivitiesQuery();

  const [nonTangoActivity, { isLoading: addingloading }] =
    useNonTangoActivityMutation();

  const [search, setSearch] = useState("");

  const addAcctivity = async (data) => {
    try {
      const result = await nonTangoActivity({
        name: search,
        parent_id: 1,
        icon: "/images/user-placeholder.jpeg",
      });
      if (result?.data?.code === 200) {
        setSearch("");
        refetch();
        // setActivityList(result?.data?.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };
  const non = useRef();

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [anchorEl, open]);

  const handleOutsideClick = (event) => {
    const Div = document.getElementById("non-trango");

    if (!Div?.contains(event.target)) {
      handleActivitiesClose();
    }
  };

  useEffect(() => {
    setActivity(activities?.data);
  }, [activities]);

  useEffect(() => {
    non.current?.focus();
  }, []);

  const searchUser = (e) => {
    setSearch(e.target.value);
    setActivity(
      activities?.data?.filter((item) =>
        item?.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };
  return (
    <div>
      <Menu
        sx={{
          "& .MuiMenu-paper": {
            background: "#FFFFFF",
            border: "1px solid lightgrey",
            width: "250px",
            bottom: "0px",
            position: "absolute",
            left: "100%",
            borderRadius: 5,
            maxHeight: "230px",
            minHeight: "230px",
          },
          boxShadow: 0,
        }}
        elevation={0}
        anchorEl={anchorEl}
        open={open}
        onClose={handleActivitiesClose}
        id="non-trango"
      >
        <div className="flex justify-between items-center max-w-[95%] px-4 mx-3 h-10 border rounded-2xl">
          <input
            type="text"
            className="outline-none w-full text-gray-text-color font-bold text-sm "
            placeholder="Search Activities..."
            onChange={searchUser}
            value={search}
            ref={non}
          />
          <div className="cursor-pointer">
            {activity?.length > 0 ? (
              <SearchIcon />
            ) : (
              <p onClick={() => addAcctivity()}>
                {addingloading ? <SpinnerLoading /> : "+"}
              </p>
            )}
          </div>
        </div>
        <div
          style={{
            overflow: "auto",
            maxHeight: "150px",
          }}
        >
          {activity?.map((x, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                setNonTangoActivities((prev) => {
                  const isNew = !prev.some((item) => item?.id === x?.id);
                  if (isNew) {
                    const newState = [...prev, { id: x?.id, name: x?.name }];
                    handleActivitiesClose();
                    return newState;
                  } else {
                    handleActivitiesClose();
                    return prev;
                  }
                });
              }}
            >
              <div className="font-[Gilroy] px-1 flex gap-3 items-center m-1 justify-center">
                <img
                  src={x?.icon_url || "/images/icon_placeholder.png"}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div>{x?.name}</div>
              </div>
            </MenuItem>
          ))}
        </div>
      </Menu>
    </div>
  );
};
