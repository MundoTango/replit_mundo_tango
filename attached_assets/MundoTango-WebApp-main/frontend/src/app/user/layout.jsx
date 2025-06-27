"use client";
import AuthGuard from "@/auth/AuthGuard";
import { AuthProvider } from "@/auth/JwtContext";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import ModelComponent from "@/components/Modal/CustomModal";
import { NoMoreAd } from "@/components/Modal/NoMoreAd";
import VideoModal from "@/components/Modal/VideoModal";
import CrossIcon from "@/components/SVGs/CrossIcon";
import { useGetActiveSubscriptionsQuery } from "@/data/services/subscriptionApi";
import { store } from "@/store";
import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const headerRef = useRef();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleCloseSearch = async () => {
    try {
      headerRef.current?.handleSearchBox();
    } catch (e) {}
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <AuthGuard>
          <div className="flex bg-background-color h-screen">
            <Sidebar
              handleCloseSearch={handleCloseSearch}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />

            <div className="flex-1 flex flex-col ">
              <Header
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                toggleSidebar={toggleSidebar}
                ref={headerRef}
              />
              <main
                onClick={handleCloseSearch}
                className="md:pl-6 bg-[#f8f8f8]"
              >
                {children}
                <BannerModal/>
              </main>
            </div>
          </div>
        </AuthGuard>
      </AuthProvider>
    </Provider>
  );
}

function BannerModal() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [noMoreAdOpen, setNoMoreAddMoreOpen] = useState(false);
  const { data: subscription } = useGetActiveSubscriptionsQuery();

  
  // Update `isSubscribed` whenever `subscription` changes
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (subscription?.data?.status !== "active") {
      setIsSubscribed(true);
    } else {
      setIsSubscribed(false);
    }
  }, [subscription]);

  useEffect(() => {
    if (isSubscribed && !noMoreAdOpen) {
      const intervalId = setInterval(() => {
        setIsVideoOpen(true);
      }, 40000);

      return () => clearInterval(intervalId);
    }
  }, [isSubscribed]);

  return (
    <>
      {/* Video Modal */}
      <VideoModal
        videoUrl="/images/uploads/reel.mp4"
        // size="lg"
        isOpen={isVideoOpen}
        setIsOpen={setIsVideoOpen}
        setNoMoreAddMoreOpen={setNoMoreAddMoreOpen}
      />

      {/* No More Ad Modal */}
      <ModelComponent
        width={"670px"}
        open={noMoreAdOpen}
        handleClose={() => setNoMoreAddMoreOpen(false)}
      >
        <div className="absolute right-3 top-3">
          <CrossIcon
            className="cursor-pointer"
            onClick={() => setNoMoreAddMoreOpen(false)}
          />
        </div>
        <NoMoreAd isOpen={noMoreAdOpen} setIsOpen={setNoMoreAddMoreOpen} />
      </ModelComponent>
    </>
  );
};