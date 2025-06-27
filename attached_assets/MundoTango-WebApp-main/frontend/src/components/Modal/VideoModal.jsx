import { Box, Modal } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import AdBanner from "../Adsense/AdBanner";

const VideoModal = ({ videoUrl, size, isOpen, setIsOpen, setNoMoreAddMoreOpen }) => {
  const closeModal = () => {
    setIsOpen(false);
  };

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPause, setShowPause] = useState(false); // Only show pause button on hover

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.controls = true;
    }
  }, []);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "670px",
    bgcolor: "black",
    border: "none",
    boxShadow: 24,
    borderRadius: "27px",
    outline: "none",
    maxHeight: "75vh",
    height: "516px"
  };

  return (
    <Modal
      open={isOpen}
    //   onClose={closeModal}
      aria-labelledby="contained-modal-title-vcenter"
      className="flex items-center justify-center"
    >
      <Box className="relative bg-transparent p-0" sx={style}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-[27px]"
          // onClick={closeModal} // Uncomment if you want to close on click outside
        >
          <div className="relative bg-black p-0 rounded-lg w-full max-w-4xl shadow-lg min-h-[75vh] ad-container">
            {/* Skip Ad Button */}
            <button
              className="absolute top-[70%] right-0 mt-5 mr-4 flex items-center justify-center border-0 outline-0 w-[107px] h-[33px] rounded-[42px] bg-white font-semibold text-[13px] cursor-pointer hover:scale-95 hover:border-b-2 border-tag-color z-50 delay-100"
              onClick={() => {
                setIsOpen(false);
                setNoMoreAddMoreOpen(true);
              }}
            >
              skip ad
            </button>

            {/* Ad Banner */}
            <div className="flex justify-center" style={{ width: '100%' }}>
              <AdBanner
                dataAdFormat="auto"
                dataFullWidthResponsive={true}
                dataAdSlot={process.env.TEST_ADD_SLOT_HORIZANTAl}
                maxheight={"80vh"}
              />
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default VideoModal;
