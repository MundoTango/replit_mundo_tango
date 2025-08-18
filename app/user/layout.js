"use client";

import { AuthProvider } from "@/auth/JwtContext";
import { store } from "@/store";
import { Provider } from "react-redux";
import { useRef, useState } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSearch = () => {
    if (headerRef.current) {
      headerRef.current.handleSearchBox();
    }
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="min-h-screen bg-background-color">
          {/* Header */}
          <Header 
            ref={headerRef}
            isOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          <div className="flex">
            {/* Sidebar */}
            <Sidebar 
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              toggleSidebar={toggleSidebar}
              handleCloseSearch={handleCloseSearch}
            />

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 bg-[#f8f8f8] min-h-screen ${sidebarOpen ? 'lg:ml-64' : ''}`}>
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Provider>
  );
}