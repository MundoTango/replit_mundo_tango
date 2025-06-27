"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import BlockScreen from "@/components/Block/BlockScreen";
import RHFTextField from "@/components/FORMs/RHFTextField";
import { setUserData } from "@/data/features/authSlice";
import {
  setAuthToken,
  storeToken,
  storeUser,
} from "@/data/services/localStorageService";
import {
  useLoginUserMutation,
  useSocialLoginMutation,
} from "@/data/services/userAuthApi";
import { FaceBookAuth, GoogleAuth } from "@/firebase/firebase";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
import LoginSideImage from "@/sections/auth/LoginSideImage";
import { FormStatePath } from "@/utils/helper";
import { FacebookIcon, GoogleIcon, LoginLogo } from "@/utils/Images";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

function Login({ setLoading, loading }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      device_type: "web",
      device_token: "123123",
    },
  });

  const { push } = useRouter();
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const [socialLoginUser, { isLoading: isSocialLoading }] =
    useSocialLoginMutation();

  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const dispatch = useDispatch();

  const { dispatch: contextDispatch } = useAuthContext();

  const onSubmit = async (record) => {
    const result = await loginUser(record);

    if (result?.error?.status === 428) {
      dispatch(setUserData({ email: result?.error?.data?.data?.email }));
      push(PATH_AUTH.otp);
      return;
    }

    if (result?.error?.status) {
      toast.error(result?.error?.data?.message);
      return;
    }

    if (result?.error?.data?.code === 400) {
      toast.error(result?.error?.data?.message);
      return;
    }

    if (result?.error?.data?.code === 500) {
      toast.error("Seems like something went wrong");
      return;
    }

    const { code, data } = result?.data;

    if (code === 200) {
      localStorage.setItem("type", data.form_status);
      if (data.form_status < 13) {
        setAuthToken(data.api_token);
        storeUser(data?.id);
        let url = FormStatePath(data.form_status);
        push(url);
        return;
      } else {
        console.log(data);
        storeToken(data.api_token);
        storeUser(data?.id);
        contextDispatch({
          type: "LOGIN",
          payload: {
            user: data,
          },
        });
      }
    }
  };

  const LoginWithGoogle = async () => {
    setIsPopUpOpen(true);
    const userAuth = await GoogleAuth();

    if (userAuth != {} && userAuth != undefined && userAuth != null) {
      const record = {
        name: userAuth.user.displayName,
        email: userAuth.user.email,
        device_type: "web",
        device_token: "123",
        platform_type: "google",
        platform_id: userAuth.user.uid,
      };
      try {
        const result = await socialLoginUser(record);

        if (result?.error?.data?.code === 400) {
          setIsPopUpOpen(false);
          toast.error(result?.error?.data?.message);
          return;
        }

        if (result?.error?.data?.code === 500) {
          setIsPopUpOpen(false);
          toast.error("Seems like something went wrong");
          return;
        }
        const { code, data } = result?.data;
        // if (code === 200) {
        //   setIsPopUpOpen(false);
        //   storeToken(data.api_token);
        //   storeUser(data?.id);
        //   if (!loading && setLoading) {
        //     setLoading(true);
        //   } else {
        //     push(PATH_DASHBOARD.root);
        //   }
        // }
        if (code === 200) {
          localStorage.setItem("type", data.form_status);
          if (data.form_status < 13) {
            setAuthToken(data.api_token);
            setIsPopUpOpen(false);
            storeUser(data?.id);
            let url = FormStatePath(data.form_status);
            push(url);
            return;
          } else {
            console.log(data);
            storeToken(data.api_token);
            storeUser(data?.id);
            setIsPopUpOpen(false);
            contextDispatch({
              type: "LOGIN",
              payload: {
                user: data,
              },
            });
          }
        }
      } catch (err) {
        console.log(err);
        setIsPopUpOpen(false);
      }
    } else {
      setIsPopUpOpen(false);
    }
  };

  const LoginWithFB = async () => {
    setIsPopUpOpen(true);
    const userAuth = await FaceBookAuth();
  
    if (userAuth != {} && userAuth != undefined && userAuth != null) {
      const record = {
        name: userAuth.user.displayName,
        email: userAuth.user.email,
        device_type: "web",
        device_token: "123",
        platform_type: "facebook",
        platform_id: userAuth.user.uid,
      };
      console.log(record);
      try {
        const result = await socialLoginUser(record);

        if (result?.error?.data?.code === 400) {
          toast.error(result?.error?.data?.message);
          setIsPopUpOpen(false);
          return;
        }

        if (result?.error?.data?.code === 500) {
          toast.error("Seems like something went wrong");
          setIsPopUpOpen(false);
          return;
        }

        const { code, data } = result.data;
        // if (code === 200) {
        //   setIsPopUpOpen(false);
        //   storeToken(data.api_token);
        //   storeUser(data?.id);
        //   if (!loading && setLoading) {
        //     setLoading(true);
        //   } else {
        //     push(PATH_DASHBOARD.root);
        //   }
        // }
        if (code === 200) {
          localStorage.setItem("type", data.form_status);
          if (data.form_status < 13) {
            setAuthToken(data.api_token);
            storeUser(data?.id);
            setIsPopUpOpen(false);
            let url = FormStatePath(data.form_status);
            push(url);
            return;
          } else {
            console.log(data);
            storeToken(data.api_token);
            storeUser(data?.id);
            setIsPopUpOpen(false);
            contextDispatch({
              type: "LOGIN",
              payload: {
                user: data,
              },
            });
          }
        }
        if (result?.error?.data?.code === 400) {
          toast.error(result?.error?.data?.message);
          return;
        }

        if (result?.error?.data?.code === 500) {
          toast.error("Seems like something went wrong");
          return;
        }
      } catch (err) {
        console.log(err);
        setIsPopUpOpen(false);
      }
    } else {
      setIsPopUpOpen(false);
    }
  };

  const handleOutsideClick = (event) => {
    const wind = document.getElementById("window-dialogue");

    if (wind) {
      if (!wind.contains(event.target)) {
        setIsPopUpOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPopUpOpen]);


  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/fb-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  return (
    <>
      {isPopUpOpen && <BlockScreen />}
      <div className="relative">
        <div className="bg-background-color overflow-auto">
          <div
            className="flex justify-center items-center w-full h-screen"
            // max-w-screen-2xl mx-auto
          >
            {/* <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
              <LoginSideImage /> */}
            <div className="w-full md:w-[40vw] mt-8 mb-8 ml-4 mr-4 h-[600px] md:h-[580px] bg-white">
              <div className="flex items-center justify-center">
                <img
                  alt=""
                  src={"/images/login/mundotangologo.gif"}
                  className="w-60 h-32 object-cover"
                />
              </div>
              <div className="mt-6 px-8 md:px-24">
                <div className="mb-3 mt-6">
                  <div>Hello there,</div>
                  <h1 className="text-4xl font-medium">Welcome Back</h1>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col justify-between gap-4"
                >
                  <div>
                    <RHFTextField
                      name="email"
                      type={"email"}
                      control={control}
                      errors={errors}
                      placeholder="Enter email address"
                      rules={{
                        required: "Email is required.",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Enter a valid email address.",
                        },
                      }}
                    />
                  </div>

                  <div>
                    <RHFTextField
                      type="password"
                      name="password"
                      control={control}
                      errors={errors}
                      placeholder="Enter password"
                      rules={{
                        required: "Password is required.",
                      }}
                    />
                    <div
                      onClick={() => {
                        push(PATH_AUTH.forgotPassword);
                      }}
                      className="mt-2 cursor-pointer select-none text-end text-sm text-[#0D448A]"
                    >
                      Forget Password
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className={`mt-4 flex w-full items-center justify-center rounded-lg bg-btn-color p-3 text-white outline-none`} //opacity-15
                      disabled={isLoading || isSocialLoading}
                    >
                      {isLoading ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="h-6 w-6 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <div>Login</div>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    Not a member?{" "}
                    <Link
                      href={PATH_AUTH.register}
                      className="text-bold cursor-pointer select-none text-sm font-bold text-[#0D448A]"
                    >
                      Sign up now
                    </Link>
                  </div>
                  <div className="flex items-center justify-center gap-8 mt-3">
                    <div
                      className="cursor-pointer rounded-xl bg-[#EEEEEE] p-3"
                      onClick={LoginWithGoogle}
                    >
                      <img alt="" src={GoogleIcon} className="w-8" />
                    </div>
                    {
                      // <div
                      //   className="cursor-pointer rounded-xl bg-[#EEEEEE] p-3"
                      //   onClick={LoginWithInstagram}
                      // >
                      //   <img alt="" src={InstagramIcon} className="w-8" />
                      // </div>
                    }
                    <div
                      className="cursor-pointer rounded-xl bg-[#EEEEEE] p-3"
                      onClick={LoginWithFB}
                    >
                      <img alt="" src={FacebookIcon} className="w-8" />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
