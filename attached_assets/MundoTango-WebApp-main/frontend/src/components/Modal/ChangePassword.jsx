"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useChangePasswordMutation } from "@/data/services/userAuthApi";
import toast from "react-hot-toast";
import { validation, validationText } from "@/utils/helper";
import RHFTextField from "../FORMs/RHFTextField";
import CrossIcon from "../SVGs/CrossIcon";

export default function ChangePassword({ setChangePassword }) {
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [changePassword, {isLoading}] = useChangePasswordMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    try {
      const result = await changePassword(data);
      if (result?.data?.code === 200) {
        toast.success("Password Changed Successfully");
        setChangePassword(false);
        setShowPasswordCurrent(false);
        setShowPasswordNew(false);
        setShowPasswordConfirm(false);
      }
    } catch (e) {
      console.error("Error:", e.response ? e.response.data : e.message);
    }
  };

  const handleShowPasswordCurrnt = () => {
    setShowPasswordCurrent(!showPasswordCurrent);
  };
  const handleShowPasswordNew = () => {
    setShowPasswordNew(!showPasswordNew);
  };
  const handleShowPasswordConfirm = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };


  return (
    <div className="ChangePassword max-w-lg mx-auto p-6">
      <div className="mb-4">
        <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <div
          className="flex items-center justify-end  gap-2 cursor-pointer "
          onClick={() => setChangePassword(false)}
        >
          <CrossIcon color="black" />
        </div>
        </div>
        <h6 className="mt-2 mb-4 text-gray-500 text-sm">
          In order to change the password, you need to enter the current password.
        </h6>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <div className="relative mt-2">
            <RHFTextField
              name="current_password"
              control={control}
            //   errors={errors}
              placeholder="Current Password"
              type={showPasswordCurrent ? "text" : "password"}
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
              rules={{
                required: {
                  value: true,
                  message: validationText.passwordRequired,
                },
                // minLength: {
                //   value: validation.passwordMin,
                //   message: validationText.passwordMin,
                // },
                // maxLength: {
                //   value: validation.passwordMax,
                //   message: validationText.passwordMax,
                // },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
                  message: "Password must contain at least one letter and one number",
                },
              }}
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-xl"
              onClick={handleShowPasswordCurrnt}
            >
              {showPasswordCurrent ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
            {errors.current_password && (
              <p className="mt-1 text-sm text-red-600">{errors.current_password.message}</p>
            )}
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative mt-2">
            <RHFTextField
              name="new_password"
              control={control}
            //   errors={errors}
              placeholder="New Password"
              type={showPasswordNew ? "text" : "password"}
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
              rules={{
                required: {
                  value: true,
                  message: validationText.passwordRequired,
                },
                minLength: {
                  value: validation.passwordMin,
                  message: validationText.passwordMin,
                },
                // maxLength: {
                //   value: validation.passwordMax,
                //   message: validationText.passwordMax,
                // },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
                  message: "Password must contain at least one letter and one number",
                },
              }}
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-xl"
              onClick={handleShowPasswordNew}
            >
              {showPasswordNew ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative mt-2">
            <RHFTextField
              name="confirm_password"
              control={control}
            //   errors={errors}
              placeholder="Confirm Password"
              type={showPasswordConfirm ? "text" : "password"}
              className="bg-gray-100 text-sm p-3 rounded-lg w-full"
              rules={{
                required: {
                  value: true,
                  message: validationText.passwordRequired,
                },
                minLength: {
                  value: validation.passwordMin,
                  message: validationText.passwordMin,
                },
                // maxLength: {
                //   value: validation.passwordMax,
                //   message: validationText.passwordMax,
                // },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
                  message: "Password must contain at least one letter and one number",
                },
              }}
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-xl"
              onClick={handleShowPasswordConfirm}
            >
              {showPasswordConfirm ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
            )}
          </div>
        </div>

        {/* Password Requirement Text */}
        <div className="text-center mt-4">
          <h6 className="text-sm text-gray-500">
            Minimum of 6 characters, at least one special character, one uppercase, and one lowercase letter.
          </h6>
        </div>

        {/* Submit Button */}
        <div className="w-full mt-6 mb-6">
          <button
            type="submit"
            className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white w-full"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
