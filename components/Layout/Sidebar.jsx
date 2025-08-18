import { useAuthContext } from "@/auth/useAuthContext";
import { PATH_DASHBOARD, SIDEBAR_ROUTES } from "@/routes/paths";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DrawerIcon from "../SVGs/DrawerIcon";

const Sidebar = ({ isOpen, setIsOpen, toggleSidebar, handleCloseSearch }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthContext();

  // Mock data for Mundo Tango Details - in real app this would come from API
  const GROUPS = [
    {
      title: "Dancer around world",
      count: "2.4K",
    },
    {
      title: "Events around world", 
      count: "156",
    },
    {
      title: "Users around world",
      count: "8.9K",
    },
    {
      title: "Dancers in your city",
      count: "42",
    },
  ];

  const _isActive = (path) => {
    return path === pathname;
  };

  const handleLinkClick = () => {
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
    <div onClick={handleCloseSearch}>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out bg-[white] w-64 text-background-color z-20 border-r-2 border-border-color overflow-y-scroll sidebar`}
      >
        <div className="h-16 flex justify-center items-center border-b-2 border-border-color text-btn-color font-bold text-1xl gap-6">
          <div>
            <DrawerIcon
              onClick={() => setIsOpen(false)}
              className="cursor-pointer"
            />
          </div>
          <div>Mundo Tango</div>
        </div>

        <nav className="mt-8">
          <div className="pl-8 space-y-10 mt-10 mb-5">
            <Link
              href={PATH_DASHBOARD.profile.root}
              className="text-black flex items-center gap-4"
            >
              <div onClick={() => router.push(PATH_DASHBOARD.profile.root)}>
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{user?.name || "User Name"}</div>
                <div className="text-sm text-gray-text-color">
                  {user?.username ? "@" + user.username : "@username"}
                </div>
              </div>
            </Link>

            <div className="text-[#94A3B8] font-bold">MENU</div>
          </div>

          {SIDEBAR_ROUTES.map(({ icon, title, link }, index) => (
            <Link key={index} href={link}>
              <div className="py-2 cursor-pointer select-none">
                <div
                  onClick={handleLinkClick}
                  className={`group flex gap-3 items-center py-1 transition duration-200 hover:bg-[#f1f7ff] hover:text-btn-color mr-4 rounded-r-lg ${
                    _isActive(link)
                      ? "text-btn-color bg-[#f1f7ff] font-semibold"
                      : "text-[#738197]"
                  }`}
                >
                  <div
                    className={`border-r-[6px] rounded-r-md h-9 transition-all group-hover:border-btn-color ${
                      _isActive(link) ? "border-btn-color" : "border-white"
                    }`}
                  />

                  <div className="pl-5 flex gap-3 items-center">
                    <div className="group-hover:text-btn-color w-6">{icon}</div>
                    <div className="group-hover:text-btn-color">{title}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div className="pl-8 my-5 text-black space-y-4">
            <div className="uppercase text-[#94A3B8] font-bold">
              Mundo Tango Details
            </div>
            {GROUPS.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="bg-gray-text-color text-white rounded-lg">
                  <div className="w-12 h-10 flex items-center justify-center text-sm font-medium">
                    {item?.count}
                  </div>
                </div>
                <div className="text-sm font-[500]">{item?.title}</div>
              </div>
            ))}
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </div>
  );
};

export default Sidebar;