import React from "react";
import { Controller } from "react-hook-form";

export default function RHFDateTimeField({
  name,
  label,
  control,
  errors,
  rules,
  type = "date", 
  className,
  value,
  defaultValue,
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <React.Fragment>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>

          <input
            {...field}
            {...other}
            type={type} 
            value={value ? value : field.value || ""}
            className={`w-full rounded-lg p-3 pl-5 text-base border-gray-300 outline-none focus:border-blue-500 ${className}`}
          />

          <div className="text-md text-[#dc3545]">
            {errors?.hasOwnProperty(name) ? errors[name]?.message : null}
          </div>
        </React.Fragment>
      )}
    />
  );
}
