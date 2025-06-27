import SpinnerLoading from "@/components/Loadings/Spinner";
import MenuIcon from "@/components/SVGs/MenuIcon";
import { useState } from "react";
import PhotoTabsContent from "../Tabs/PhotoTabsContent";
import PhotosAboutYou from "./PhotosAboutYou";

const PhotosTabContent = ({
  PhotoAboutYouImages,
  YourPhotosImages,
  Loading,
}) => {
  console.log(PhotoAboutYouImages)
  const tabs = [
    {
      id: 1,
      title: "Photos",
      content: <PhotosAboutYou PhotoAboutYouImages={PhotoAboutYouImages} />,
      counts: PhotoAboutYouImages?.length,
    },
    // {
    //   id: 2,
    //   title: "Your Photos",
    //   content: <YourPhotos YourPhotosImages={YourPhotosImages} />,
    //   counts: YourPhotosImages?.length,
    // },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  let record = tabs.find((i) => i?.id === activeTab);

  if (Loading) {
    return (
      <div className="flex items-center justify-center m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-row items-start justify-between pr-6">
        <div className="flex flex-col">
          <h2>Group Photos</h2>
          <p className="text-light-gray-color">
            {record?.counts || 0 } Photos
          </p>
        </div>
        {/* <button>
          <MenuIcon />
        </button> */}
      </div>

      {/* <br></br>
      <hr></hr>
      <br></br> */}

      {/* <PhotoTabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} /> */}

      <PhotoTabsContent tabs={tabs} activeTab={activeTab} />
    </div>
  );
};

export default PhotosTabContent;
