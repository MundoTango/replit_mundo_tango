"use client";

import React, { useEffect, useState } from "react";
// import { useGetActiveSubscribeQuery } from "@/data/services/stripeApi";

const AdBanner = ({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
  maxheight,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  // const { data: subscription } = useGetActiveSubscribeQuery();
  // const currntdate = new Date();

  useEffect(() => {
    // Load the Google AdSense script only if it's not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.onload = () => setAdLoaded(true);
      script.onerror = () => console.error("Error loading Google Ads script.");
      document.head.appendChild(script);
    } else {
      setAdLoaded(true);
    }
  }, []);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (window.adsbygoogle) {
          // Push the ad to the adsbygoogle queue only if it is loaded
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("Error loading AdSense ad:", error.message);
      }
    };

    // Only load the ad when the script is loaded and container is ready
    if (adLoaded) {
      loadAd();
    }
  }, [adLoaded]);

  // Display fallback video while ad is loading
  if (!adLoaded) {
    return (
      <video
        className="w-full max-h-[80vh] object-contain rounded-md"
        muted
        loop
        autoPlay
        poster="/images/uploads/ad-Banner.png"
        controls={false}
        playsInline
      >
        <source src={""} type="video/mp4" />
      </video>
    );
  }

  return (
    <>
      {/* {subscription?.data?.expiry_date <= currntdate ||
        (subscription?.data?.status !== "active" && ( */}
      <div className="ad-container" style={{ width: "100%", maxWidth: "100%" }}>
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            maxHeight: maxheight || "250px", // Adjust max height
          }}
          data-ad-client={
            process.env.NODE_ENV === "production"
              ? process.env.PUBLIISH_ID_GOOGLE
              : "ca-pub-7838078349094645" // Example test client ID
          }
          data-ad-slot={dataAdSlot || "8549002459"} // Fallback test slot ID
          data-ad-format={dataAdFormat || "auto"}
          data-full-width-responsive={dataFullWidthResponsive || "true"}
        ></ins>
      </div>
      {/* ))} */}
    </>
  );
};

export default AdBanner;

// "0000000000"
// "ca-pub-0000000000000000"
