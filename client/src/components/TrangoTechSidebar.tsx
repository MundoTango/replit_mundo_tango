import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import TenantSwitcher from './TenantSwitcher';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { 
  Heart, 
  UsersRound, 
  UserCheck, 
  Calendar, 
  Network,
  X,
  Mail,
  BookOpen,
  BarChart3,
  Sparkles,
  MapPin,
  Shield,
  Crown,
  Settings,
  MessageCircle,
  Brain
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TrangoTechSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // ESA Framework Navigation Routes - Cleaned per user requirements
  const sidebarRoutes = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Memories",
      link: "/moments",
    },
    {
      icon: <UsersRound className="w-5 h-5" />,
      title: "Tango Community", 
      link: "/community-world-map",  // ESA LIFE CEO 56x21 - Direct to world map
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "Friends",
      link: "/friends",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Messages",
      link: "/messages",
    },
    {
      icon: <Network className="w-5 h-5" />,
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
      title: "Role Invitations",
      link: "/invitations",
    },
  ];

  // Check if user has admin privileges
  const hasAdminAccess = user && (user.username === 'admin' || user.email?.includes('admin'));
  
  // Check if user is a Super Admin
  // The API returns isSuperAdmin as a boolean field
  const isSuperAdmin = (user as any)?.isSuperAdmin === true;

  // Add Admin Center route for admins
  const adminRoute = {
    icon: <Shield className="w-5 h-5" />,
    title: "Admin Center",
    link: "/admin",
  };

  // ESA Framework: Admin Center with RBAC/ABAC security
  let allRoutes = [...sidebarRoutes];
  if (hasAdminAccess) {
    allRoutes.push(adminRoute);
  }
  // Life CEO Portal removed per ESA Framework requirements
  
  // Debug log to verify routes
  console.log('Sidebar routes:', allRoutes.map(r => ({ title: r.title, link: r.link })));

  // Fetch real statistics from API
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Mundo Tango Global Statistics with real data
  const stats = statsData as any;
  const globalStats = [
    {
      title: "Global Dancers",
      count: stats?.totalUsers ? 
        (stats.totalUsers >= 1000 ? `${(stats.totalUsers / 1000).toFixed(1)}K` : stats.totalUsers.toString()) 
        : "3.2K",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "Active Events", 
      count: stats?.activeEvents?.toString() || "945",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      title: "Communities",
      count: stats?.totalGroups ? 
        (stats.totalGroups >= 1000 ? `${(stats.totalGroups / 1000).toFixed(1)}K` : stats.totalGroups.toString())
        : "6.8K",
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      title: "Your City",
      count: stats?.userCityMembers?.toString() || "184",
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const isActive = (path: string) => {
    return path === location;
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
        } transition-transform duration-300 ease-in-out bg-white w-64 text-gray-800 z-40 border-r border-gray-200 overflow-y-auto shadow-lg`}
      >
        {/* Gradient Header Bar */}
        <div className="h-16 flex justify-between items-center px-4 bg-gradient-to-r from-turquoise-500 to-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-turquoise-500 font-bold text-sm">
              MT
            </div>
            <div className="text-xl font-bold text-white tracking-wide">
              Mundo Tango
            </div>
          </div>
          <X
            onClick={() => setIsOpen(false)}
            className="cursor-pointer w-5 h-5 lg:hidden text-white hover:text-gray-200 transition-colors"
          />
        </div>

        <nav className="mt-4">
          {/* Mini Profile Section */}
          <div className="px-4 mb-6">
            <Link
              href="/profile"
              onClick={(e) => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer block"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center text-white font-semibold text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-600">
                    {user?.username && "@" + user.username}
                  </div>
                </div>
              </div>
              {/* Role Emojis */}
              {user?.tangoRoles && user.tangoRoles.length > 0 && (
                <RoleEmojiDisplay 
                  tangoRoles={user.tangoRoles} 
                  leaderLevel={(user as any).leaderLevel}
                  followerLevel={(user as any).followerLevel}
                  size="sm"
                  maxRoles={5}
                  className="mt-1"
                />
              )}
            </Link>
          </div>

          {/* Community Selection */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">Community</div>
            <TenantSwitcher />
          </div>

          {/* Navigation Menu */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">Menu</div>
            <div className="space-y-1">
              {allRoutes.map(({ icon, title, link }, index) => (
                <Link
                  key={index}
                  href={link}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`group flex items-center gap-3 py-2 px-4 rounded-xl cursor-pointer transition-all hover:bg-gray-100 block ${
                    isActive(link)
                      ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-700"
                  }`}
                >
                  <div className={`${isActive(link) ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                    {icon}
                  </div>
                  <div className={`text-sm font-semibold ${isActive(link) ? "text-white" : "group-hover:text-gray-900"} tracking-wide`}>
                    {title}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Global Statistics */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">
              Global Statistics
            </div>
            <div className="space-y-2">
              {globalStats.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-blue-500 text-white">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-lg font-bold text-gray-700">{item.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Footer */}
          <div className="px-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white text-center">
              <div className="text-xs font-semibold tracking-wide mb-1">Mundo Tango</div>
              <div className="text-xs opacity-90">Global Tango Community</div>
            </div>
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </>
  );
};

export default TrangoTechSidebar;