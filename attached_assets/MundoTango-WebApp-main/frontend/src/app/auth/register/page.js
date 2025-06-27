"use client";

import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import InputStar from "@/components/Stars/InputStar";
import { setUserData } from "@/data/features/authSlice";
import { useRegisterUserMutation } from "@/data/services/userAuthApi";
import { PATH_AUTH } from "@/routes/paths";
import LoginSideImage from "@/sections/auth/LoginSideImage";
import { LoginLogo } from "@/utils/Images";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

function Register() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const dispatch = useDispatch();

  const [showHide, setShowHide] = useState({
    password: false,
    confirmPassword: false,
  });

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const { push } = useRouter();

  const onSubmit = async (record) => {
    const result = await registerUser(record);

    if (result?.error?.data?.code) {
      toast.error(result?.error?.data?.message);
      return;
    }

    const { code, data } = result?.data || {};
    if (code === 200) {
      toast.success("User sign up successfully");
      dispatch(setUserData({ email: data.email , id : data.id }));
      push(PATH_AUTH.otp);
    }

    reset();
  };

  const handleShowHidePassword = (type) => {
    let temp = { ...showHide };
    if (type === "password") {
      temp.password = !temp.password;
    } else if (type === "confirm_password") {
      temp.confirmPassword = !temp.confirmPassword;
    }
    setShowHide(temp);
  };

  const labelClass = "flex gap-1 mb-1 font-bold ";

  return (
    <div className="bg-background-color overflow-y-auto h-screen ">
      <div className="flex justify-center items-center w-full overflow-y-auto">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
          <LoginSideImage /> */}
          <div className="w-full md:w-[45vw] mt-8 mb-8 ml-4 mr-4 bg-white h-full">
            <div className="flex items-center justify-center">
              <img alt="" src={"/images/login/mundotangologo.gif"} className="w-60 h-32 object-cover" />
            </div>
            <div className="mt-6 px-8 md:px-20">
              <div className="mt-1 mb-3">
                <div>Hello there,</div>
                <h1 className="font-medium text-4xl">Register Yourself</h1>
              </div>
              <form
                className="flex flex-col justify-between gap-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label className={labelClass}>
                    <InputStar />
                    Full Name
                  </label>
                  <RHFTextField
                    type="text"
                    name="name"
                    control={control}
                    errors={errors}
                    placeholder="Full Name"
                    rules={{
                      required: "Full name is required.",
                    }}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <InputStar />
                    Username
                  </label>
                  <RHFTextField
                    type="text"
                    name="username"
                    control={control}
                    errors={errors}
                    placeholder="Username"
                    rules={{
                      required: "User name is required.",
                    }}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClass}>Facebook url</label>
                  <RHFTextField
                    type="text"
                    name="facebook_url"
                    control={control}
                    errors={errors}
                    placeholder="Facebook Profile URL"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <InputStar />
                    Email
                  </label>
                  <RHFTextField
                    type="email"
                    name="email"
                    control={control}
                    errors={errors}
                    placeholder="Email"
                    rules={{
                      required: "Email is required.",
                    }}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <InputStar />
                    Password
                  </label>
                  <Controller
                    name={"password"}
                    control={control}
                    rules={{
                      required: "Password is required.",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <React.Fragment>
                        <div className="flex bg-white rounded-lg items-center pr-2">
                          <input
                            type={showHide.password ? "text" : "password"}
                            {...field}
                            value={field.value || ""}
                            className={`w-full rounded-lg p-3 pl-5 text-base outline-none `}
                            placeholder="Create Password"
                            autoComplete="off"
                          />
                          {showHide.password ? (
                            <VisibilityOffIcon
                              className="cursor-pointer"
                              onClick={() => handleShowHidePassword("password")}
                            />
                          ) : (
                            <RemoveRedEyeIcon
                              className="cursor-pointer"
                              onClick={() => handleShowHidePassword("password")}
                            />
                          )}
                        </div>
                        <div className="text-md font text-[#dc3545]">
                          {errors?.hasOwnProperty("password")
                            ? errors["password"]?.message
                            : null}
                        </div>
                      </React.Fragment>
                    )}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <InputStar />
                    Confirm Password
                  </label>
                  {/* <RHFTextField
                    type="password"
                    name="confirm_password"
                    control={control}
                    errors={errors}
                    placeholder="Confirm Your Password"
                    rules={{
                      required: "Confirm Password is required.",
                    }}
                  /> */}

                  <Controller
                    name={"confirm_password"}
                    control={control}
                    rules={{
                      required: "Confirm Password is required.",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <React.Fragment>
                        <div className="flex bg-white rounded-lg items-center pr-2">
                          <input
                            type={
                              showHide.confirmPassword ? "text" : "password"
                            }
                            {...field}
                            value={field.value || ""}
                            className={`w-full rounded-lg p-3 pl-5 text-base outline-none `}
                            placeholder="Create Password"
                            autoComplete="off"
                          />
                          {showHide.confirmPassword ? (
                            <VisibilityOffIcon
                              className="cursor-pointer"
                              onClick={() =>
                                handleShowHidePassword("confirm_password")
                              }
                            />
                          ) : (
                            <RemoveRedEyeIcon
                              className="cursor-pointer"
                              onClick={() =>
                                handleShowHidePassword("confirm_password")
                              }
                            />
                          )}
                        </div>
                        <div className="text-md font text-[#dc3545]">
                          {errors?.hasOwnProperty("confirm_password")
                            ? errors["confirm_password"]?.message
                            : null}
                        </div>
                      </React.Fragment>
                    )}
                  />
                </div>

                <div className="flex items-center md:justify-between gap-3 text-sm leading-tight mt-2">
                  <div>
                    <div className="inline-flex items-center">
                      <label
                        className="relative flex items-center p-3 rounded-full cursor-pointer"
                        htmlFor="checkbox"
                      >
                        <input
                          type="checkbox"
                          className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#0D448A] checked:bg-btn-color checked:before:bg-btn-color hover:before:opacity-10 border-black"
                          id="checkbox"
                        />
                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    Agree to Mundo Tango Terms and Conditions & Privacy Policy
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`w-full p-3 rounded-lg outline-none bg-btn-color text-white mt-4 flex items-center justify-center`}
                    disabled={isLoading}
                  >
                    {isLoading ? <SpinnerLoading /> : <>Register</>}
                  </button>
                </div>
                <div className="text-center mb-4">
                  Already a member?{" "}
                  <Link
                    href={PATH_AUTH.login}
                    className="text-[#0D448A]  text-sm font-bold cursor-pointer select-none text-bold"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}

export default Register;