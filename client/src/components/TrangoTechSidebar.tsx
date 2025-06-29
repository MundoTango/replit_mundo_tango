import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { 
  Heart, 
  UsersRound, 
  UserCheck, 
  Calendar, 
  Sitemap,
  X,
  Mail,
  BarChart3,
  Sparkles,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TrangoTechSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Mundo Tango Navigation Routes - Updated Modern Structure
  const sidebarRoutes = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Moments",
      link: "/moments",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community", 
      link: "/community",
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "Friends",
      link: "/friends",
    },
    {
      icon: <UsersRound className="w-5 h-5" />,
      title: "Groups",
      link: "/groups",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Events",
      link: "/events",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Invitations",
      link: "/invitations",
    },
  ];

  // Mundo Tango Global Statistics
  const globalStats = [
    {
      title: "Global Dancers",
      count: "3.2K",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "Active Events", 
      count: "945",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      title: "Communities",
      count: "6.8K",
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Your City",
      count: "184",
      icon: <MapPin className="w-4 h-4" />,
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
        } transition-transform duration-300 ease-in-out bg-white w-64 text-gray-800 z-20 border-r border-gray-200 overflow-y-auto shadow-lg`}
      >
        {/* Modern Header */}
        <div className="h-16 flex justify-between items-center px-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-blue-50">
          <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
            Mundo Tango
          </div>
          <X
            onClick={() => setIsOpen(false)}
            className="cursor-pointer w-5 h-5 lg:hidden text-gray-600 hover:text-gray-800 transition-colors"
          />
        </div>

        <nav className="mt-6">
          {/* User Profile Section */}
          <div className="px-4 mb-6">
            <div
              onClick={() => handleLinkClick('/profile')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-red-50 to-blue-50 hover:from-red-100 hover:to-blue-100 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <img
                  src={user?.profileImage || '/images/user-placeholder.jpeg'}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-600">
                  {user?.username && "@" + user.username}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">Menu</div>
            <div className="space-y-1">
              {sidebarRoutes.map(({ icon, title, link }, index) => (
                <div
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isActive(link)
                      ? "bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className={`${isActive(link) ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                    {icon}
                  </div>
                  <div className={`text-sm font-medium ${isActive(link) ? "text-white" : "group-hover:text-gray-900"}`}>
                    {title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Statistics */}
          <div className="px-4 my-6 space-y-3">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
              Global Statistics
            </div>
            {globalStats.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-500 text-white">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-lg font-bold text-gray-700">{item.count}</div>
                </div>
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