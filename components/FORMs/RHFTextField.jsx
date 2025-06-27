import React from "react";
import { Controller } from "react-hook-form";

export default function RHFTextField({
  name,
  helperText,
  control,
  errors,
  rules,
  className,
  value,
  defaultValue,
  type = "text",
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <React.Fragment>
          <input
            {...field}
            {...other}
            type={type}
            value={value ? value : field.value || defaultValue || ''}
            className={`w-full rounded-lg p-3 pl-5 text-base outline-none ${className}`}
          />
          <div className="text-sm font text-[#dc3545]">
            {errors?.hasOwnProperty(name) ? errors[name]?.message : null}
          </div>
        </React.Fragment>
      )}
    />
  );
}

export function RHFTextFieldNullValue({
  name,
  helperText,
  control,
  errors,
  rules,
  className,
  value,
  defaultValue,
  type = "text",
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <React.Fragment>
          <input
            {...field}
            {...other}
            type={type}
            value={value ? value : field.value || defaultValue || ''}
            className={`w-full rounded-lg p-3 pl-5 text-base outline-none ${className}`}
            onChange={(e) => {
              const newValue = e.target.value;
              if (type === "date") {
                field.onChange(newValue === "" ? null : newValue);
              } else {
                field.onChange(newValue);
              }
            }}
          />
          <div className="text-sm font text-[#dc3545]">
            {errors?.hasOwnProperty(name) ? errors[name]?.message : null}
          </div>
        </React.Fragment>
      )}
    />
  );
}