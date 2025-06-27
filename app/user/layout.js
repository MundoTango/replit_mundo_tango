"use client";

import { AuthProvider } from "@/auth/JwtContext";
import { store } from "@/store";
import { Provider } from "react-redux";

export default function DashboardLayout({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="flex bg-background-color h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-border-color shadow-sm hidden lg:block">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-profile-name-color">User Name</h3>
                  <p className="text-sm text-gray-text">@username</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <a href="/user" className="flex items-center px-3 py-2 text-red-color bg-red-50 rounded-md">
                  <span className="ml-3">Timeline</span>
                </a>
                <a href="/user/myprofile" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">My Profile</span>
                </a>
                <a href="/user/events" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Events</span>
                </a>
                <a href="/user/messages" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Messages</span>
                </a>
                <a href="/user/friend" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Friends</span>
                </a>
                <a href="/user/photos" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Photos</span>
                </a>
                <a href="/user/videos" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Videos</span>
                </a>
                <a href="/user/groups" className="flex items-center px-3 py-2 text-gray-text hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Groups</span>
                </a>
              </nav>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-border-color shadow-sm">
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-red-color">Mundo Tango</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-10 pr-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-red-color"
                      />
                      <div className="absolute left-3 top-2.5 w-4 h-4 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="text-sm font-medium text-profile-name-color">User Name</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="md:pl-6 bg-[#f8f8f8] flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </Provider>
  );
}