"use client";

import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from "@/data/services/friendApi";
import RHFTextField from "../FORMs/RHFTextField";
import CrossIcon from "../SVGs/CrossIcon";
import Gallery from "@/components/SVGs/Gallery";
import { useAuthContext } from "@/auth/useAuthContext";
import RHFTextArea from "../FORMs/RHFTextArea";
import toast from "react-hot-toast";
import InputStar from "../Stars/InputStar";
import GooglePlacesAutocomplete from "react-google-autocomplete";

export default function EditProfile({
  userProfile,
  setEditProfileModal,
  refetch,
  timelinerefetch,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { user } = useAuthContext();
  const [profileImage, setProfileImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [first_name, setFirst_name] = useState(null);
  const [last_name, setLast_name] = useState(null);
  const { data: recent } = useGetUserProfileQuery();
  const [profileStatus, setProfileStatus] = useState(recent?.status);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [country, setCountry] = useState("");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("first_name", data?.first_name);
      formData.append("last_name", data?.last_name);
      formData.append("email", data?.email);
      // formData.append("mobile_no", data?.mobile_no);
      formData.append("address", location);
      formData.append("country", country);
      formData.append("city", city);
      // formData.append("zip_code", data?.zip_code);
      formData.append("bio", data?.description);
      profileImageFile && formData.append("image_url", profileImageFile);
      bannerImageFile && formData.append("background_url", bannerImageFile);
      formData.append("is_private", profileStatus);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      const result = await updateProfile(formData);
      if (result?.data?.code === 200) {
        toast.success("Profile Changed Successfully");
        refetch();
        timelinerefetch();
        setEditProfileModal(false);
        setBannerImageFile(null);
        setProfileImageFile(null);
        setProfileImage("");
        setBannerImage("");
      }
    } catch (e) {
      console.error("Error:", e.response ? e.response.data : e.message);
      setProfileImage("");
      setBannerImage("");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleProfileUpload = (e) => {
    const image = e.target.files[0];
    setProfileImage(URL.createObjectURL(image));
    setProfileImageFile(image);
  };

  const handleBannerUpload = (e) => {
    const image = e.target.files[0];
    setBannerImage(URL.createObjectURL(image));
    setBannerImageFile(image);
  };

  // Handle location changes from Google Places
  // const handleLocationChange = (place) => {
  //   const fullAddress = place.formatted_address;
  //   console.log(fullAddress);
  //   setLocation(fullAddress);
  //   setValue("location", fullAddress);

  //   const lat = place.geometry.location.lat();
  //   const lng = place.geometry.location.lng();
  //   setLatitude(lat);
  //   setLongitude(lng);

  //   let city = "",
  //     country = "";
  //   place.address_components.forEach((component) => {
  //     if (component.types.includes("locality")) city = component.long_name;
  //     if (component.types.includes("country")) country = component.long_name;
  //   });

  //   setCity(city);
  //   setCountry(country);
  // };
  const handleLocationChange = (place) => {
    if (
      !place ||
      !place.formatted_address ||
      !place.geometry ||
      !place.address_components
    ) {
      console.error("Invalid place data received.");
      return;
    }
    // const place = autoEventRef.current.getPlace();
    if (place && place.geometry) {
      const { lat, lng } = place.geometry.location;

      // Extract the address components
      const addressComponents = place.address_components;

      console.log(addressComponents);

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
        console.log(types);
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
    }

    if (!city) {
      console.warn("City not found in address components.");
    }
    if (!country) {
      console.warn("Country not found in address components.");
    }
  };

  useEffect(() => {
    if (user) {
      setValue("first_name", user?.first_name || user?.name);
      setValue("last_name", user?.last_name);
      setValue("email", user?.email);
      setValue("mobile_no", user?.mobile_no);
      setValue("address", user?.address);
      setValue("country", user?.country);
      setValue("city", user?.city);
      setValue("zip_code", user?.zip_code);
      setValue("bio", user?.bio);
      setProfileImage(user?.image_url);
      setBannerImage(user?.background_url);
      setValue("location", user?.location);
    }
  }, [user, setValue]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-y-auto h-[90vh]">
      <div className="flex justify-between mb-4">
        <div className="text-black flex items-center gap-4">
          <div className="text-xl font-semibold">Edit Profile</div>
        </div>
        <div
          className="flex items-center justify-end  gap-2 cursor-pointer "
          onClick={() => setEditProfileModal(false)}
        >
          <CrossIcon color="black" />
        </div>
      </div>
      <div className="relative">
        <div
          className="w-full h-36 bg-cover bg-center rounded-lg"
          style={{
            backgroundImage: `url(${bannerImage || userProfile?.background_url || "/images/user-placeholder.jpeg"})`,
          }}
        >
          <div
            className="absolute top-[82%] left-[94%]"
            onClick={() => document.getElementById("imageUploadBanner").click()}
          >
            <Gallery />
          </div>
          <input
            id="imageUploadBanner"
            type="file"
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
            onChange={handleBannerUpload}
          />
        </div>

        <div className="absolute top-1/2 left-4">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white relative">
              <img
                src={
                  profileImage ||
                  userProfile?.image_url ||
                  "/images/user-placeholder.jpeg"
                }
                // alt="Profile"
                className="w-full h-full object-cover"
              />
              <div
                className="cursor-pointer absolute top-12 left-12"
                onClick={() => document.getElementById("imageUpload").click()}
              >
                <Gallery />
              </div>
              <input
                id="imageUpload"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleProfileUpload}
              />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white">
              {first_name ? first_name : user?.first_name}{" "}
              {last_name ? last_name : user?.last_name}
            </p>
            <p className="text-sm text-white">{userProfile?.email}</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 mt-16" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="w-full">
            <label className="block text-sm font-bold mb-2">First Name</label>
            <RHFTextField
              name="first_name"
              control={control}
              errors={errors}
              placeholder="First name"
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-bold mb-2">Last Name</label>
            <RHFTextField
              name="last_name"
              control={control}
              errors={errors}
              placeholder="Last name"
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-bold mb-2">Email Address</label>
          <RHFTextField
            name="email"
            control={control}
            errors={errors}
            placeholder="Email Address"
            className="bg-gray-100 text-sm p-3 rounded-lg w-full"
          />
        </div>

        {/* <div className="w-full">
          <label className="block text-sm font-bold mb-2">Phone Number</label>
          <RHFTextField
            name="mobile_no"
            control={control}
            errors={errors}
            placeholder="Phone Number"
            className="bg-gray-100 text-sm p-3 rounded-lg w-full"
          />
        </div> */}

        {/* Location (Google Places) */}
        {/* <div className="w-full">
          <label className="text-sm mb-2 flex gap-1 font-bold">
            <InputStar /> Location
          </label>
          <Controller
            name="location"
            control={control}
            defaultValue={location}
            render={({ field }) => (
              <div className="">
                <GooglePlacesAutocomplete
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  selectprops={{
                    value: location,
                    onChange: (e) => handleLocationChange(e),
                    placeholder: "Type Here...",
                    ...field,
                    className:
                      "w-full rounded-lg p-3 pl-5 text-base outline-none bg-background-color",
                  }}
                  onPlaceSelected={handleLocationChange}
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
                />
              </div>
            )}
          />
        </div> */}

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="w-full">
            <label className="block text-sm font-bold mb-2">Country</label>
            <RHFTextField
              name="country"
              control={control}
              errors={errors}
              placeholder="Country"
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-bold mb-2">City</label>
            <RHFTextField
              name="city"
              control={control}
              errors={errors}
              placeholder="City"
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
              rules={{ required: "City is required." }}
            />
          </div>
        </div> */}

        {/* <div className="w-full">
          <label className="block text-sm font-bold mb-2">Zip Code</label>
          <RHFTextField
            name="zip_code"
            control={control}
            errors={errors}
            placeholder="Zip Code"
            className="bg-gray-100 text-sm p-3 rounded-lg w-full"
          />
        </div> */}

        {/* <div className="w-full">
          <label className="block text-sm font-bold mb-2">Description</label>
          <RHFTextArea
            name="description"
            control={control}
            className="bg-gray-100 text-sm p-3 rounded-lg w-full h-32"
            placeholder="Write a bio..."
            rows={5}
          />
        </div> */}

        <div className="w-full mt-6">
          <button
            type="submit"
            className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white w-full"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
