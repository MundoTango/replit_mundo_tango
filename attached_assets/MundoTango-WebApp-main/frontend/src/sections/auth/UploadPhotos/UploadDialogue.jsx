"use client";

import {
  ImageFive,
  ImageFour,
  ImageOne,
  ImageThree,
  ImageTwo,
  UploadIcon,
} from "@/utils/Images";

function UploadDialogue({ handleChangeFile }) {
  return (
    <div className="min-h-screen bg-background-color overflow-hidden">
      <div className="max-w-screen-xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-screen">
          <div className="hidden lg:block relative h-screen">
            <img
              src={ImageOne}
              alt=""
              className="w-24 absolute top-20 left-10"
              loading="lazy"
            />
            <img
              src={ImageTwo}
              alt=""
              className="w-36 absolute top-80 left-56"
              loading="lazy"
            />
            <img
              src={ImageFour}
              alt=""
              className="w-36 absolute bottom-7  left-20"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-center flex-col gap-4 cursor-pointer">
            <div className="border-[4px] border-[#D9D9D9] rounded-3xl border-dashed p-8">
              <img src={UploadIcon} alt="" className="w-36" loading="lazy" />
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleChangeFile}
              />
            </div>

            <div className="w-72 text-center text-[#64748B] leading-tight mt-5 ">
              Upload a photo of you that includes your face to be your profile
              photo.
            </div>

            <div className="w-72 flex items-center justify-center">
              <label
                className="bg-btn-color text-white px-10 py-3 rounded-xl cursor-pointer"
                htmlFor="fileInput"
              >
                Upload Photo
              </label>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={ImageThree}
              alt=""
              className="w-36 absolute top-20 right-32"
              loading="lazy"
            />
            <img
              src={ImageFive}
              alt=""
              className="w-24 absolute bottom-24 right-32"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDialogue;
