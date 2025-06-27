import React, { useState } from "react";
import { useForm } from "react-hook-form";
import RHFTextField from "@/components/FORMs/RHFTextField";
import Gallery from "@/components/SVGs/Gallery";
import Location from "@/components/SVGs/Location";
import StarOutline from "@/components/SVGs/StarOutline";
import { POST_CREATION_TYPE } from "@/utils/enum";
import { ImageFour } from "@/utils/Images";
import { useCreatePostMutation } from "@/data/services/postApi";

const CreatePostComponent = ({ setVisibility, handleModalOpen }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  return (
    <div className="card pr-6">
      <div className="flex w-full flex-row justify-between">
        <img src={ImageFour} alt="" className="w-12 rounded-full" />
        <RHFTextField
          type="text"
          name="description"
          control={control}
          errors={errors}
          placeholder="What’s on your mind?"
          className="input-text ml-4 mr-6"
        />
      </div>
      <br />
      <hr />
      <br />

      <div className="flex flex-col md:flex-row w-full items-center justify-between pr-6">
        <div className="flex h-6 w-auto justify-between gap-8">
          <button
            type="button"
            className="text-light-gray-color text-md inline-flex h-6 items-center text-center text-sm font-medium"
            onClick={() => handleModalOpen(POST_CREATION_TYPE.LOCATION)}
          >
            <span className="px-2">
              <Location />
            </span>
            Location
          </button>
          <button
            type="button"
            className="text-light-gray-color text-md inline-flex h-6 items-center text-center text-sm font-medium"
            onClick={() => handleModalOpen()}
          >
            <span className="px-2">
              <Gallery />
            </span>
            Image/Video
          </button>
          <button
            type="button"
            className="text-light-gray-color text-md inline-flex h-6 items-center text-center text-sm font-medium"
            onClick={() => handleModalOpen(POST_CREATION_TYPE.ACTIVITY)}
          >
            <span className="px-2">
              <StarOutline />
            </span>
            Activity
          </button>

        </div>
        <div className="mt-3 md:m-0 w-full md:w-fit flex justify-end">
          <button className="rounded-xl bg-btn-color px-10 py-2 text-sm font-bold text-white">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostComponent;
