// Authentication paths
export const PATH_AUTH = {
  root: "/auth",
  login: "/auth/login",
  register: "/auth/register",
  verify: "/auth/verify",
  resetPassword: "/auth/reset-password",
};

// Dashboard paths
export const PATH_DASHBOARD = {
  root: "/user",
  profile: {
    root: "/user/profile",
    edit: "/user/profile/edit",
  },
  posts: "/user/posts",
  events: "/user/events",
  groups: "/user/groups",
  friends: "/user/friends",
  messages: "/user/messages",
  timeline: "/user/timeline",
  photos: "/user/photos",
  videos: "/user/videos",
  community: "/user/community",
  myprofile: "/user/myprofile",
};

// Page paths
export const PATH_PAGE = {
  faqs: "/user/faqs",
  helpSupport: "/user/help-support",
  privacyPolicy: "/user/privacy-policy",
  termsCondition: "/user/terms-condition",
};

// Sidebar routes with icons
import { 
  FiHome, 
  FiUser, 
  FiCalendar, 
  FiMessageCircle, 
  FiUsers, 
  FiGrid,
  FiCamera,
  FiVideo,
  FiStar,
  FiSettings
} from "react-icons/fi";

export const SIDEBAR_ROUTES = [
  {
    title: "Timeline",
    icon: <FiHome />,
    link: PATH_DASHBOARD.timeline,
  },
  {
    title: "My Profile",
    icon: <FiUser />,
    link: PATH_DASHBOARD.myprofile,
  },
  {
    title: "Events",
    icon: <FiCalendar />,
    link: PATH_DASHBOARD.events,
  },
  {
    title: "Messages",
    icon: <FiMessageCircle />,
    link: PATH_DASHBOARD.messages,
  },
  {
    title: "Friends",
    icon: <FiUsers />,
    link: PATH_DASHBOARD.friends,
  },
  {
    title: "Groups",
    icon: <FiGrid />,
    link: PATH_DASHBOARD.groups,
  },
  {
    title: "Photos",
    icon: <FiCamera />,
    link: PATH_DASHBOARD.photos,
  },
  {
    title: "Videos",
    icon: <FiVideo />,
    link: PATH_DASHBOARD.videos,
  },
  {
    title: "Community",
    icon: <FiStar />,
    link: PATH_DASHBOARD.community,
  },
];