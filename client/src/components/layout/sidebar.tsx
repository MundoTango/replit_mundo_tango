import { 
  Home, 
  Calendar, 
  MessageCircle, 
  User, 
  Users, 
  Settings,
  Menu,
  Heart,
  MapPin,
  Trophy
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose?: () => void;
}

const SIDEBAR_ROUTES = [
  {
    title: "Feed",
    icon: <Home className="w-5 h-5" />,
    link: "/",
  },
  {
    title: "Profile", 
    icon: <User className="w-5 h-5" />,
    link: "/profile",
  },
  {
    title: "Events",
    icon: <Calendar className="w-5 h-5" />,
    link: "/events",
  },
  {
    title: "Messages",
    icon: <MessageCircle className="w-5 h-5" />,
    link: "/messages",
  },
  {
    title: "Friends",
    icon: <Users className="w-5 h-5" />,
    link: "/friends",
  },
  {
    title: "Groups",
    icon: <Users className="w-5 h-5" />,
    link: "/groups",
  },
];

export default function Sidebar({ isOpen, setIsOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mundoTangoDetails, setMundoTangoDetails] = useState({
    dancer_count: 1250,
    events_count: 45,
    user_count: 2890,
    dancer_city_count: 89
  });

  const GROUPS = [
    {
      title: "Dancers around world",
      count: mundoTangoDetails.dancer_count,
    },
    {
      title: "Events around world", 
      count: mundoTangoDetails.events_count,
    },
    {
      title: "Users around world",
      count: mundoTangoDetails.user_count,
    },
    {
      title: "Dancers in your city",
      count: mundoTangoDetails.dancer_city_count,
    },
  ];

  const isActive = (path: string) => {
    return path === location;
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
    onClose?.();
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
    <div onClick={onClose}>
      <div
        className={cn(
          "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out bg-white w-64 text-gray-800 z-20 border-r-2 border-gray-200 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex justify-center items-center border-b-2 border-gray-200 text-red-600 font-bold text-xl gap-6">
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div>Mundo Tango</div>
        </div>

        <nav className="mt-8">
          <div className="pl-8 space-y-10 mt-10 mb-5">
            <Link href="/profile">
              <div className="text-black flex items-center gap-4 cursor-pointer" onClick={handleLinkClick}>
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.profileImage || "/images/user-placeholder.jpeg"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-red-600 text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{user?.name || "User"}</div>
                  <div className="text-sm text-gray-500">
                    {user?.username ? `@${user.username}` : "@user"}
                  </div>
                </div>
              </div>
            </Link>

            <div className="text-gray-400 font-bold text-sm">MENU</div>
          </div>

          {SIDEBAR_ROUTES.map(({ icon, title, link }, index) => (
            <Link href={link} key={index}>
              <div className="py-2 cursor-pointer select-none">
                <div
                  onClick={handleLinkClick}
                  className={cn(
                    "group flex gap-3 items-center py-1 transition duration-200 hover:bg-blue-50 hover:text-red-600 mr-4 rounded-r-lg",
                    isActive(link)
                      ? "text-red-600 bg-blue-50 font-semibold"
                      : "text-gray-600"
                  )}
                >
                  <div
                    className={cn(
                      "border-r-[6px] rounded-r-md h-9 transition-all group-hover:border-red-600",
                      isActive(link) ? "border-red-600" : "border-white"
                    )}
                  />

                  <div className="pl-5 flex gap-3 items-center">
                    <div className="group-hover:text-red-600 w-6">{icon}</div>
                    <div className="group-hover:text-red-600">{title}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div className="pl-8 my-5 text-black space-y-4">
            <div className="uppercase text-gray-400 font-bold text-sm">
              Mundo Tango Details
            </div>
            {GROUPS.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="bg-gray-500 text-white rounded-lg">
                  <div className="w-12 h-10 flex items-center justify-center text-sm font-medium">
                    {item.count}
                  </div>
                </div>
                <div className="text-sm font-medium">{item.title}</div>
              </div>
            ))}
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </div>
  );
}