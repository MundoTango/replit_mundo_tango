"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/auth/useAuthContext";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
import { getToken } from "@/data/services/localStorageService";
import localStorageAvailable from "@/utils/localStorageAvailable";

function UserClient() {
  return (
    <div className="grid grid-cols-12 gap-5 overflow-hidden">
      <div className="col-span-12 lg:col-span-9">
        <div className="px-2 py-2">
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <button className="text-gray-600 hover:text-red-600">Photo</button>
                <button className="text-gray-600 hover:text-red-600">Video</button>
                <button className="text-gray-600 hover:text-red-600">Event</button>
              </div>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                Post
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Mundo Tango!</h3>
            <p className="text-gray-600 mb-6">Start following people to see their posts in your timeline.</p>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
              Discover People
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 h-screen">
        <div className="bg-white rounded-xl p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
          <p className="text-gray-600 text-sm">No upcoming events</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Friend Suggestions</h3>
          <p className="text-gray-600 text-sm">No suggestions available</p>
        </div>
      </div>
    </div>
  );
}

export default function UserPage() {
  const { push } = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthContext();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getToken();
      if (!accessToken || (!isAuthenticated && isInitialized)) {
        push(PATH_AUTH.login);
      }
    };

    const storageAvailable = localStorageAvailable();
    if (storageAvailable) {
      checkAuth();
    }
  }, [isAuthenticated, isInitialized, user, push]);

  if (!isInitialized) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  return <UserClient />;
}