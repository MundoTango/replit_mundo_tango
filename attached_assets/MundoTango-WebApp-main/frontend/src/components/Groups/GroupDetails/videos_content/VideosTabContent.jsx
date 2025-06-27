import MenuIcon from "@/components/SVGs/MenuIcon";
import VideoComponent from "./VideoComponent";

const VideosTabContent = ({ videos, Loading }) => {
  return (
    <div className="card">
      <div className="flex flex-row items-start justify-between pr-6">
        <div className="flex flex-col">
          <h2>Group Videos</h2>
          <p className="text-light-gray-color">{videos?.length} Total Videos</p>
        </div>
        {/* <button>
          <MenuIcon />
        </button> */}
      </div>

      <br></br>
      <hr></hr>
      <br></br>

      {!!videos?.length ? (
        <div className="grid grid-cols-1 gap-4 pr-6 sm:grid-cols-2 lg:grid-cols-2">
          {videos.map((item, index) => {
            return <VideoComponent VideoBanner={item?.media_url} key={index} />;
          })}
        </div>
      ) : (
        <p className="text-center text-light-gray-color w-full">
          No videos found
        </p>
      )}
    </div>
  );
};

export default VideosTabContent;
