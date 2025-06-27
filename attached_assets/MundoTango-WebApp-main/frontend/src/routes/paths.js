import CalenderIcon from "@/components/SVGs/CalenderIcon";
import FriendIcon from "@/components/SVGs/FriendIcon";
import PhotoIcon from "@/components/SVGs/PhotoIcon";
import Star from "@/components/SVGs/Star";
import TimelineIcon from "@/components/SVGs/TimelineIcon";
import TrangoCommunity from "@/components/SVGs/TrangoCommunity";
import VideoIcon from "@/components/SVGs/VideoIcon";

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = "/auth";
export const FORM_PATH = "/forms";
const ROOTS_DASHBOARD = "/user";

// ----------------------------------------------------------------------

export const SIDEBAR_ROUTES = [
  {
    icon: <TimelineIcon />,
    title: "Timeline",
    link: ROOTS_DASHBOARD || '/user/timeline',
  },
  {
    icon: <TrangoCommunity />,
    title: "Tango Community",
    link: ROOTS_DASHBOARD + "/trango-community",
  },
  {
    icon: <FriendIcon />,
    title: "Friends",
    link: ROOTS_DASHBOARD + "/friend",
  },
  {
    icon: <Star />,
    title: "Groups",
    link: ROOTS_DASHBOARD + "/groups",
  },
  {
    icon: <CalenderIcon />,
    title: "Events",
    link: ROOTS_DASHBOARD + "/events",
  },
  // {
  //   icon: <PhotoIcon />,
  //   title: "Photos",
  //   link: ROOTS_DASHBOARD + "/photos",
  // },
  // {
  //   icon: <VideoIcon />,
  //   title: "Videos",
  //   link: ROOTS_DASHBOARD + "/videos",
  // },
];

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, "/login"),
  register: path(ROOTS_AUTH, "/register"),
  forgotPassword: path(ROOTS_AUTH, "/forgot-password"),
  otp: path(ROOTS_AUTH, "/otp"),
  newPassword: path(ROOTS_AUTH, "/set-new-password"),
  uploadPhotos: path(FORM_PATH, "/upload-photos"),
  confirmation: path(FORM_PATH, "/confirmation"),
  questionnaire: path(FORM_PATH, "/questionnaire"),
  whatdoyoudo: path(FORM_PATH, "/whatdoyoudo"),
  teachers: path(FORM_PATH, "/teacher"),
  dj: path(FORM_PATH, "/dj"),
  organizer: path(FORM_PATH, "/organizer"),
  performer: path(FORM_PATH, "/performer"),
  housinghost: path(FORM_PATH, "/housing-host"),
  creator: path(FORM_PATH, "/creator"),
  photographer: path(FORM_PATH, "/photographer"),
  tourOperator: path(FORM_PATH, "/tour-operator"),
  wheredoyoudance: path(FORM_PATH, "/wheredoyoudance"),
  wherehaveyoulearned: path(FORM_PATH, "/wherehaveyoulearned"),
  codeofconduct: path(FORM_PATH, "/codesofconduct"),
  overview: path(FORM_PATH, "/overview"),
  review: path(FORM_PATH, "/review"),
};

export const PATH_PAGE = {
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: `${ROOTS_DASHBOARD}/faqs`,
  page403: "/403",
  page404: "/404",
  page500: "/500",
  components: "/components",
  privacyPolicy: `${ROOTS_DASHBOARD}/privacy-policy`,
  termsCondition: `${ROOTS_DASHBOARD}/terms-condition`,
  helpSupport: `${ROOTS_DASHBOARD}/help-support`,
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  friends: {
    root: path(ROOTS_DASHBOARD, "/friend"),
    connectionRequest: path(ROOTS_DASHBOARD, "/connection-requests"),
    seeFullFriendShip: (id) =>
      path(ROOTS_DASHBOARD, `/friend/full-friendship/?q=${id}`),
  },
  profile: {
    root: path(ROOTS_DASHBOARD, "/myprofile"),
    userProfile: (id) => path(ROOTS_DASHBOARD, `/profile/?q=${id}`),
  },
  group: {
    root: path(ROOTS_DASHBOARD, "/groups"),
    groupDetail: (id) => path(ROOTS_DASHBOARD, `/group/?q=${id}`),
  },
  event: {
    root: path(ROOTS_DASHBOARD, "/events"),
    eventDetail: (id) => path(ROOTS_DASHBOARD, `/event/?q=${id}`),
  },
  trangoCommunity: {
    root: path(ROOTS_DASHBOARD, "/trango-community"),
    communityDetail: (id) => path(ROOTS_DASHBOARD, `/community/?q=${id}`),
  },
  message: path(ROOTS_DASHBOARD, "/messages"),
  post: {
    postDetail: (id) => path(ROOTS_DASHBOARD, `/post/?q=${id}`),
  },
};
