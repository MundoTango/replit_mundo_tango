"use client";

import React, { useState, useRef } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import "swiper/css";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import { SwipperComponent } from "../Swiper";
import { default_placeholder } from "@/app/svg/default_placeholder";

const PreviewImages = ({ images, user_name, setImageModal, setSliderImages }) => {
  const mainSwiperRef = useRef(null);
  const [activeImage, setActiveImage] = useState("");
  const [activeVideo, setActiveVideo] = useState("");

  if (!images || images.length === 0) return <div>No images available.</div>;

  const goNext = () => {
    if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
      mainSwiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
      mainSwiperRef.current.swiper.slidePrev();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg">Preview Images / Videos</h4>
        <div>
          <button
            className="text-black"
            onClick={() => setImageModal(false)}
          >
            <FaTimes />
          </button>
        </div>
      </div>
      <div className="mt-4">
        {/* Main Image Slider */}
        <div className="w-full">
          <SwipperComponent
            ref={mainSwiperRef}
            spaceBetween={10}
            loop={true}
            className="main-slider"
            freeMode={true}
            watchSlidesProgress={true}
          >
            {images.map((image, index) => (
              <>
                {image?.media_type === "video" ? (
                  <video
                    className="w-full h-auto"
                    controls
                    src={activeVideo ? activeVideo : image?.media_url}
                    alt={`Uploaded Video ${index}`}
                    autoPlay={images.length === 1}
                    loop={images.length === 1}
                    style={{
                      maxHeight: "450px",
                      objectFit: "contain",
                      backgroundColor: "black",
                      height:"350px"
                    }}
                  ></video>
                ) : (
                  <img
                    className="w-full h-auto"
                    src={activeImage ? activeImage : image?.media_url}
                    alt={`Main Image ${index}`}
                    key={index}
                    loading="lazy"
                    placeholder={default_placeholder}
                    width={100}
                    style={{
                      maxHeight: "450px",
                      objectFit: "contain",
                      backgroundColor: "black",
                      height:"350px"
                    }}
                  />
                )}
              </>
            ))}
          </SwipperComponent>
        </div>
      </div>

      {images.length > 1 && (
        <div className="hidden md:flex mt-2 w-full">
          {/* Thumbnails Slider */}
          <div className="w-full">
            <SwipperComponent
              spaceBetween={5}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              className="thumb-slider"
            >
              {images.map((image, index) => (
                <>
                  {image?.media_type === "video" ? (
                    <video
                      className="w-full h-28 object-contain hover:scale-90 transition-all duration-75"
                      controls
                      src={image?.media_url}
                      alt={`Uploaded Video ${index}`}
                      autoPlay={images.length === 1}
                      loop={images.length === 1}
                      onClick={() => setActiveVideo(image?.media_url)}
                    ></video>
                  ) : (
                    <img
                      src={image?.media_url}
                      alt={`Thumbnail ${index}`}
                      className="w-full h-28 object-contain hover:scale-90 transition-all duration-75"
                      onClick={() => setActiveImage(image?.media_url)}
                      key={index}
                    />
                  )}
                </>
              ))}
            </SwipperComponent>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewImages;
