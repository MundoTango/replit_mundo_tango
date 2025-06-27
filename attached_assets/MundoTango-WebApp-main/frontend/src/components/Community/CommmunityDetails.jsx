"use client";
import { useGetCommunityAboutDetailsQuery } from "@/data/services/communityApi";
import TabContent from "@/sections/profile/components/Tabs/TabContent";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SpinnerLoading from "../Loadings/Spinner";
import CommunityAboutContent from "./AboutTab/CommunityAboutContent";
import CommunityEvents from "./CommunityEvents";
import CommunityGroup from "./CommunityGroup";
import TopBanner from "./TopBanner";

const CommunityDetail = () => {
  const id = useSearchParams()?.get("q");

  let { data, isLoading } = useGetCommunityAboutDetailsQuery(id);
  data = data?.data;

  const tabs = [
    { id: 1, title: "About", content: <CommunityAboutContent record={data} /> },
    {
      id: 2,
      title: "Groups",
      content: <CommunityGroup city={data?.location?.city} />,
    },
    {
      id: 3,
      title: "Events",
      content: <CommunityEvents city={data?.location?.city} />,
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[86vh] bg-white m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <main className="container-fluid md:mt-6 flex w-full flex-col bg-background-color">
      <div className="rounded-2xl bg-white animate-fade-down">
        <TopBanner
          city={data?.location?.city}
          country={data?.location?.country}
          image_url={data?.location?.image_url}
          location={data?.location?.location}
        />

        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row p-4 md:p-8">
            <div className="flex md:flex-wrap w-full md:w-2/3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-8 py-2 text-base font-semibold ${activeTab === tab.id ? "bg-black text-white transition-all " : "text-black transition-all "}`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <TabContent tabs={tabs} activeTab={activeTab} />
    </main>
  );
};

export default CommunityDetail;
