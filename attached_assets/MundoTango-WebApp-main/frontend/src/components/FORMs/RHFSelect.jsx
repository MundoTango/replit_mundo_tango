import React from "react";
import { Controller } from "react-hook-form";

export default function RHFSelect({
  name,
  helperText,
  control,
  errors,
  rules,
  className,
  children,
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <React.Fragment>
          <select
            {...field}
            {...other}
            value={field.value || ""}
            className={`w-full rounded-lg p-3 text-base outline-none ${className}`}
          >
            {children}
          </select>

          <div className="text-sm font text-[#dc3545]">
            {errors?.hasOwnProperty(name) ? errors[name]?.message : null}
          </div>
        </React.Fragment>
      )}
    />
  );
}
