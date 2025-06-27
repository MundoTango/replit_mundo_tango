import React, { useEffect, useRef, useState } from "react";
import PlayVideoIcon from "@/components/SVGs/PlayVideoIcon";

const VideoComponent = ({ VideoBanner }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="rounded-xl bg-background-color p-4 cursor-pointer">
      {/* <div className="relative"> */}
        <video
          ref={videoRef}
          controls
          className="h-40 w-full rounded-2xl object-cover md:h-52"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <source src={VideoBanner?.media_url} type="video/mp4" />
        </video>

        {/* <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-30 opacity-100">
          <div
            className="flex space-x-6 cursor-pointer"
            onClick={handlePlayPause}
          >
            <div className="flex flex-col space-y-3">
              {!isPlaying && <PlayVideoIcon color="white" />}

            </div>
          </div>
        </div> */}
      {/* </div> */}

      {/* <button
        onClick={handlePlayPause}
        className="my-4 w-full rounded-xl bg-btn-color px-10 py-3 text-xl font-bold text-white"
      >
        {isPlaying ? "Pause Video" : "Watch Video"}
      </button> */}
    </div>
  );
};

export default VideoComponent;
