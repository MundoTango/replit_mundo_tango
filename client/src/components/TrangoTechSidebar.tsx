import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { 
  Heart, 
  Users, 
  UserPlus, 
  Calendar, 
  Star,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TrangoTechSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // TrangoTech Navigation Routes - Original TT Structure
  const sidebarRoutes = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Timeline",
      link: "/moments",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Tango Community", 
      link: "/community",
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Friends",
      link: "/friends",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Groups",
      link: "/groups",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Events",
      link: "/events",
    },
  ];

  // TT Mundo Tango Details - Original TT Stats
  const mundoTangoGroups = [
    {
      title: "Dancer around world",
      count: "2.5K",
    },
    {
      title: "Events around world", 
      count: "850",
    },
    {
      title: "Users around world",
      count: "5.2K",
    },
    {
      title: "Dancers in your city",
      count: "127",
    },
  ];

  const isActive = (path: string) => {
    return path === location;
  };

  const handleLinkClick = (link: string) => {
    setLocation(link);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsOpen]);

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out bg-white w-64 text-background-color z-20 border-r-2 border-border-color overflow-y-scroll sidebar`}
      >
        {/* TT Header */}
        <div className="h-16 flex justify-center items-center border-b-2 border-border-color text-btn-color font-bold text-xl gap-6">
          <div>
            <X
              onClick={() => setIsOpen(false)}
              className="cursor-pointer w-6 h-6 lg:hidden"
            />
          </div>
          <div>Mundo Tango</div>
        </div>

        <nav className="mt-8">
          {/* TT User Profile Section */}
          <div className="pl-8 space-y-10 mt-10 mb-5">
            <div
              onClick={() => handleLinkClick('/profile')}
              className="text-black flex items-center gap-4 cursor-pointer"
            >
              <div>
                <img
                  src={user?.profileImage || '/images/user-placeholder.jpeg'}
                  alt=""
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>
              <div>
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-sm text-gray-text-color">
                  {user?.username && "@" + user.username}
                </div>
              </div>
            </div>

            <div className="text-[#94A3B8] font-bold">MENU</div>
          </div>

          {/* TT Navigation Links */}
          {sidebarRoutes.map(({ icon, title, link }, index) => (
            <div key={index} className="py-2 cursor-pointer select-none">
              <div
                onClick={() => handleLinkClick(link)}
                className={`group flex gap-3 items-center py-1 transition duration-200 hover:bg-[#f1f7ff] hover:text-btn-color mr-4 rounded-r-lg ${
                  isActive(link)
                    ? "text-btn-color bg-[#f1f7ff] font-semibold"
                    : "text-[#738197]"
                }`}
              >
                <div
                  className={`border-r-[6px] rounded-r-md h-9 transition-all group-hover:border-btn-color ${
                    isActive(link) ? "border-btn-color" : "border-white"
                  }`}
                />

                <div className="pl-5 flex gap-3 items-center">
                  <div className="group-hover:text-btn-color w-6">{icon}</div>
                  <div className="group-hover:text-btn-color">{title}</div>
                </div>
              </div>
            </div>
          ))}

          {/* TT Mundo Tango Details */}
          <div className="pl-8 my-5 text-black space-y-4">
            <div className="uppercase text-[#94A3B8] font-bold">
              Mundo Tango Details
            </div>
            {mundoTangoGroups.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="bg-gray-text-color text-white rounded-lg">
                  <div className="w-12 h-10 flex items-center justify-center text-sm font-medium">
                    {item.count}
                  </div>
                </div>
                <div className="text-sm font-[500]">{item.title}</div>
              </div>
            ))}
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </>
  );
};

export default TrangoTechSidebar;