"use client";

import SpinnerLoading from "@/components/Loadings/Spinner";

import NextArrow from "@/components/SVGs/NextArrow";

import PlusIcon from "@/components/SVGs/PlusIcon";

import { ImageFive, ImageFour, ImageOne, ImageThree } from "@/utils/Images";

import React from "react";

function UploadImagesView({
  imagesList,
  setIndex,
  handleChangeFile,
  isLoading,
  uploadImages,
  removeFiles
}) {
  return (
    <div className="min-h-screen bg-background-color overflow-y-scroll">
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
              src={ImageFour}
              alt=""
              className="w-36 absolute bottom-32 left-0"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-center flex-col">
            <div className="text-3xl font-lato font-bold">Upload Photo</div>
            <div className="w-96 text-center text-[#64748B] leading-tight mt-5">
              Now let's add some other photos so people get to know who you are.
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {!!imagesList?.length &&
                  imagesList.map(({ objectUrl, media_url }, index) => (
                    <div key={index}>
                      {objectUrl || media_url ? (
                        <div className="relative">
                          <img
                            src={objectUrl ? objectUrl : media_url}
                            className="h-32 rounded-2xl w-32"
                            loading="lazy"
                          />
                          <button
                            className="absolute top-1 right-1 text-white bg-gray-400 p-1 rounded-full text-xs"
                            onClick={() => removeFiles(index)}
                            style={{
                              width: "20px",
                              height: "20px",
                              padding: "2px",
                            }}
                          >
                            &#10005;
                          </button>
                        </div>
                      ) : (
                        <React.Fragment>
                          <input
                            type="file"
                            id={`fileInput_${index}`}
                            className="hidden"
                            onChange={handleChangeFile}
                            accept="image/jpeg, image/png, image/jpg"
                          />
                          <label
                            htmlFor={`fileInput_${index}`}
                            onClick={() => setIndex(index)}
                          >
                            <PlusIcon className="cursor-pointer" />
                          </label>
                        </React.Fragment>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="w-full mt-24 flex justify-end">
              <button
                onClick={uploadImages}
                className="bg-btn-color text-white w-32 h-10 rounded-xl flex items-center justify-center"
              >
                {isLoading ? <SpinnerLoading /> : <NextArrow />}
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={ImageThree}
              alt=""
              className="w-44 absolute top-20 right-32"
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

export default UploadImagesView;
