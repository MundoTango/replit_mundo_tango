"use client";
import RHFTextArea from "@/components/FORMs/RHFTextArea";
import RHFTextField from "@/components/FORMs/RHFTextField";
import SpinnerLoading from "@/components/Loadings/Spinner";
import EmailIcon from "@/components/SVGs/EmailIcon";
import FaxIcon from "@/components/SVGs/FaxIcon";
import PhoneIcon from "@/components/SVGs/PhoneIcon";
import { useAddHelpSupportMutation } from "@/data/services/staticContentApi";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function Page() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      yourQuery: "",
    },
  });

  const [addHelpSupport, { isLoading }] = useAddHelpSupportMutation();

  const onSubmit = async (record) => {
    try {
      const body = {
        name: record?.name,
        email: record?.email,
        phone_number: record?.phoneNumber,
        query: record?.yourQuery,
      };

      const result = await addHelpSupport(body);

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Message submitted successfully");
        reset();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const contactClassOne = "text-[#B1B5B6] text-sm font-medium";
  const contactClassTwo = "text-[#39ACE7] text-sm";

  return (
    <div className="flex items-center justify-center h-full  my-6 lg:mt-0">
      <div className="bg-white w-[90%] lg:w-[70%] xl:w-[60%] px-10 py-10 lg:px-16 lg:py-16 rounded-3xl">
        <h1 className="font-extrabold text-4xl lg:text-6xl">
          Get in <span className="text-[#39ACE7]">Touch</span>
        </h1>
        <br />
        <p className="text-[#B1B5B6] font-medium">
          Enim tempor eget pharetra facilisis sed maecenas adipiscing. Eu leo
          molestie vel, ornare non id blandit netus.
        </p>

        <form
          className="flex flex-col gap-2 mt-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <RHFTextField
            control={control}
            errors={errors}
            name={"name"}
            className="input-text"
            placeholder="Name"
            rules={{
              required: "Name is required.",
            }}
          />

          <RHFTextField
            control={control}
            errors={errors}
            name={"email"}
            className="input-text"
            placeholder="Email"
            rules={{
              required: "Email is required.",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email address.",
              },
            }}
          />

          <RHFTextField
            control={control}
            errors={errors}
            name={"phoneNumber"}
            className="input-text"
            placeholder="Phone Number"
            rules={{
              required: "Phone number is required.",
            }}
          />

          <RHFTextArea
            control={control}
            errors={errors}
            name={"yourQuery"}
            className="input-text h-32"
            placeholder="Write your query here"
            numberLength={false}
            rules={{
              required: "Query is required.",
            }}
          ></RHFTextArea>

          <button
            disabled={isLoading}
            className="w-full text-white bg-[#39ACE7] h-10 rounded-lg text-sm font-semibold"
          >
            {isLoading ? "Loading..." : "SEND"}
          </button>

          <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between mt-5">
            <div className="flex items-center gap-2">
              <PhoneIcon />
              <div>
                <div className={contactClassOne}>PHONE</div>
                <div className={contactClassTwo}>03 5432 1234</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <FaxIcon />
              </div>
              <div>
                <div className={contactClassOne}>FAX</div>
                <div className={contactClassTwo}>03 5432 1234</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <EmailIcon />
              </div>
              <div>
                <div className={contactClassOne}>EMAIL</div>
                <div className={contactClassTwo}>info@marcc.com.au</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page;
