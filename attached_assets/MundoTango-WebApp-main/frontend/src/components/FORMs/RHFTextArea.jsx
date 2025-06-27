import React from "react";
import { Controller } from "react-hook-form";

export default function RHFTextArea({
  name,
  helperText,
  control,
  errors,
  rules,
  className,
  defaultValue,
  counts,
  numberLength = true,
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <React.Fragment>
          <textarea
            {...field}
            {...other}
            value={field.value || defaultValue || ""}
            className={`w-full resize-none rounded-lg p-3 pl-5 text-base  outline-none ${className}`}
          ></textarea>

          <div className="flex items-center justify-between">
            <div className="text-sm font text-[#dc3545]">
              {errors?.hasOwnProperty(name) ? errors[name]?.message : null}
            </div>
            {numberLength && (
              <div className="flex items-end justify-end text-xs">
                {!field?.value?.length ? 0 : field?.value?.length} / 200
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    />
  );
}
