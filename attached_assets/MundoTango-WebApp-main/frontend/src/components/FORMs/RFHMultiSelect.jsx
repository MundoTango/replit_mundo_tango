import React from "react";
import { Controller } from "react-hook-form";
import { Select, MenuItem, FormControl, FormHelperText } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

export default function RHFMultiSelect({
  name,
  helperText,
  control,
  errors,
  rules,
  className,
  children,
  label,
  multiple = false,
  onClick,
  ...other
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <>
          <FormControl fullWidth error={!!errors?.[name]}>
            <Select
              {...field}
              {...other}
              value={multiple ? (Array.isArray(field.value) ? field.value : []) : field.value || ""}  
              onChange={(e) => {
                if (multiple) {
                  field.onChange(e.target.value);  
                } else {
                  field.onChange(e.target.value);  
                }
              }}
              multiple={multiple}  
              label={label}
              className={`w-full rounded-lg p-1 text-base outline-none border-none ${className}`}
              sx={{
                border: "none",
                outline: "none",
                "&:focus": {
                  outline: "none",
                  border: "none",
                },
              }}
              variant="standard"
              InputProps={{
                startAdornment: <AccountCircle />,
                disableUnderline: true, 
              }}
              onClick={onClick}
            >
              {children}
            </Select>

            {helperText && <div className="text-md text-gray-500">{helperText}</div>}

            {/* Error Handling */}
            {errors?.[name] && (
              <FormHelperText>{errors[name]?.message}</FormHelperText>
            )}
          </FormControl>
        </>
      )}
      oC
    />
  );
}
