"use client";
import RHFTextField from "@/components/FORMs/RHFTextField";
import { setForgotPassword, setUserData } from "@/data/features/authSlice";
import { useForgotPasswordMutation } from "@/data/services/userAuthApi";
import { PATH_AUTH } from "@/routes/paths";
import LoginSideImage from "@/sections/auth/LoginSideImage";
import { BackIcon, LoginLogo } from "@/utils/Images";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

function ForgotPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { push , back} = useRouter();

  const dispatch = useDispatch();

  const onSubmit = async (record) => {
    const response = await forgotPassword(record);

    if (response?.error?.status) {
      const { message } = response?.error?.data;
      toast.error(message);
      return;
    }

    const { code, message } = response?.data;

    if (code === 200) {
      toast.success(message);
      dispatch(setUserData(record));
      dispatch(setForgotPassword(true));
      push(PATH_AUTH.otp);
    }
  };

  return (
    <div className="bg-background-color">
      <div className="flex justify-center items-center w-full h-screen">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2">
          <LoginSideImage /> */}
          <div className="w-full md:w-[40vw] pt-8 pb-8 max-h-fit bg-white">
            <div className="flex items-center justify-center">
              <img alt="" src={"/images/login/mundotangologo.gif"} className="w-60 h-32 object-cover" />
            </div>
            <div className="px-8 md:px-24 mt-2">
              <div
                className="cursor-pointer select-none"
                onClick={back}
              >
                <img src={BackIcon} alt="" className="w-10" />
              </div>
              <div className="mt-6 mb-3">
                <h1 className="font-bold text-4xl">Forgot Password</h1>
                <div className="mt-3 leading-tight font-normal font-lato">
                  In order to reset your password you need to enter your registered email address.
                </div>
              </div>
              <form
                className="flex flex-col justify-between gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <RHFTextField
                    name="email"
                    type={"email"}
                    control={control}
                    errors={errors}
                    placeholder="Write email address"
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
                  <button
                    type="submit"
                    className={`w-full p-3 rounded-lg outline-none bg-btn-color text-white mt-4 flex items-center justify-center`} //opacity-15
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                      <>Continue</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        {/* </div> */}
      </div>
    </div>
  );
}

export default ForgotPassword;
