"use client";

import React from "react";

import ConfirmationHeader from "./ConfirmationHeader";
import NextArrow from "@/components/SVGs/NextArrow";
import { useRouter } from "next/navigation";
import { PATH_AUTH } from "@/routes/paths";

const ConfirmationScreen = () => {
  const { push } = useRouter();

  return (
    <div className="bg-background-color h-screen overflow-y-scroll">
      <ConfirmationHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div />

        <div className="mx-4 lg:mx-0">
          <div className="bg-white mt-5 rounded-xl p-6">
            <div className="flex items-center justify-center my-3">
              <img
                src="/images/confirmation/main_image.png"
                alt=""
                className="w-44 lg:w-72"
                loading="lazy"
              />
            </div>
            <div className="bg-background-color rounded-lg">
              <div className="text-[#64748B] px-6 py-3 hidden lg:block text-md text-center">
                The next pages will be data points that we can then use to
                understand what, where, and more about tango. We encourage you
                to add as much detail as you can about your life in tango so we
                can have a vibrant source of data.
              </div>
              <div className="text-[#64748B] p-3  block lg:hidden text-xs text-center">
                The next pages will be data points that we can then use to
                understand what, where, and more about tango. We encourage you
                to add as much detail as you can about your life in tango so we
                can have a vibrant source of data.
              </div>
            </div>
          </div>
          <div className="my-4 flex items-end justify-end">
            <button
              onClick={() => push(PATH_AUTH.questionnaire)}
              className="bg-btn-color text-white px-10 py-3 rounded-xl "
            >
              <NextArrow />
            </button>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
};

export default ConfirmationScreen;
