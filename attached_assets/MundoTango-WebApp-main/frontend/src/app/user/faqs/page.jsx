"use client";

import SpinnerLoading from "@/components/Loadings/Spinner";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useGetFaqsQuestionsQuery } from "@/data/services/staticContentApi";
import { useState } from "react";

function Page() {
  let { data, isLoading } = useGetFaqsQuestionsQuery();

  data = data?.data;

  const [showHide, setShowHide] = useState({});

  const handleOpenClose = async (index) => {
    try {
      const temp = { ...showHide };
      temp[index] = !temp[index];
      setShowHide(temp);
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh] bg-white my-5 mr-2  rounded-xl">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl my-5 mr-2 px-10 py-6">
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <h1 className="text-3xl font-bold">Frequently Ask Questions</h1>
        </div>
        {!!data?.length &&
          data.map(({ question, answer }, index) => {
            const condition = showHide[index];

            return (
              <div
                key={index}
                className={`col-span-12 py-10 select-none ${condition ? "" : "border-b-[1px]"} `}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleOpenClose(index)}
                >
                  <div className="text-lg font-semibold">{question}</div>
                  <div
                    className={`${condition ? "rotate-180" : "rotate-45"} transition-all`}
                  >
                    <CrossIcon />
                  </div>
                </div>
                {condition && (
                  <p className="animate-fade-down text-gray-text-color px-2 mt-4 w-[90%]">
                    {answer}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Page;
