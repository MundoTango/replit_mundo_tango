import { LoginImage } from "@/utils/Images";
import Image from "next/image";
import React from "react";

export default function LoginSideImage() {
  return (
    <div className="hidden lg:block md:p-12 ">
      <div className="bg-white p-12 rounded-xl text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Passionate About Tango?</h2>
          <div className="text-lg mb-6">Discover the perfect dance partner</div>
        </div>
        <div className="flex items-center justify-center mb-6">
          <img src={"/images/login/mundotangologo.gif"} className="w-[400px]" />
        </div>
        <div className="text-lg">Listen to tango rhythms on the go.</div>
      </div>
    </div>
  );
}
