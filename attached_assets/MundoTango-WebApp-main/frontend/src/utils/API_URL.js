// MARK: BETA ONE ROUTES
const ROOT = "/user";
const LOGIN = ROOT + "/login";
const SOCIAL_LOGIN = ROOT + "/social-login";
const LOGOUT = ROOT + "/logout";
const VERIFY_OTP = ROOT + "/verify-otp/register";
const SEND_OTP = ROOT + "/send-otp/mail";
const FORGOT_OTP = ROOT + "/verify-otp/forgot-password";
const SET_NEW_PASSWORD = ROOT + "/set-password";
const CREATE_USER_IMAGE = ROOT + "/add-user-images";
const GET_USER_IMAGES = ROOT + "/get-user-images";
const DELETE_ACC = ROOT;
const CHANGE_PASSWORD = ROOT + "/change-password";

// MARK: USER QUESTIONS
const USER_QUESTIONS = ROOT + "/user-questions/store";
const GET_USER_QUESTION = ROOT + "/user-questions/get";
const STORE_ACTIVITIES = ROOT + "/tango-activities/store";
const GET_ACTIVITIES = ROOT + "/tango-activities/get";
const GET_LANGUAGES = "/language/get"

// MARK: DANCE EXPERIENCE FORM
const ADD_EXPERIENCE = ROOT + "/dance-experience/store";
const GET_EXPERIENCE = ROOT + "/dance-experience/get";

// MARK: TEACHER EXPERIENCE FORM
const TEACHER_EXPERIENCE = ROOT + "/teaching-experience/store";
const GET_TEACHER_EXPERIENCE = ROOT + "/teaching-experience/get";

// MARK: DJ EXPERIENCE FORM
const DJ_EXPERIENCE = ROOT + "/dj-experience/store";
const GET_DJ_EXPERIENCE = ROOT + "/dj-experience/get";

// MARK: ORGANIZAR EXPERIENCE FORM
const ORGANIZAR_EXPERIENCE = ROOT + "/organizer-experience/store";
const GET_ORGANIZAR_EXPERIENCE = ROOT + "/organizer-experience/get";

// MARK: PERFORMER EXPERIENCE FORM
const PERFORMER_EXPERIENCE = ROOT + "/performer-experience/store";
const GET_PERFORMER_EXPERIENCE = ROOT + "/performer-experience/get";

// MARK: HOST EXPERIENCE FORM
const HOST_EXPERIENCE = ROOT + "/host-experience/store";
const GET_HOST_EXPERIENCE = ROOT + "/host-experience/get";
const ATTACHMENT_HOST_EXPERIENCE = ROOT + "/host-experience/add-attachments";

// MARK: CREATOR EXPERIENCE FORM
const CREATOR_EXPERIENCE = ROOT + "/creator-experience/store";
const GET_CREATOR_EXPERIENCE = ROOT + "/creator-experience/get";

// MARK: PHOTOGRAPHER EXPERIENCE FORM
const PHOTOGRAPHER_EXPERIENCE = ROOT + "/photographer-experience/store";
const GET_PHOTOGRAPHER_EXPERIENCE = ROOT + "/photographer-experience/get";

// MARK: TOUR EXPERIENCE FORM
const TOUR_OPERATOR = ROOT + "/tour-operator-experience/store";
const GET_TOUR_OPERATOR = ROOT + "/tour-operator-experience/get";

// MARK: LEARNING EXPERIENCE FORM
const LEARNING_SOURCE = ROOT + "/learning-source/store";
const GET_LEARNING_SOURCE = ROOT + "/learning-source/get";

// MARK: CODE OF CONDUCT 
const CODE_OF_CONDUCT = ROOT + "/code-of-conduct";

export {
  VERIFY_OTP,
  ADD_EXPERIENCE,
  CREATE_USER_IMAGE,
  FORGOT_OTP,
  GET_EXPERIENCE,
  GET_USER_IMAGES,
  GET_USER_QUESTION,
  LOGIN,
  LOGOUT,
  ROOT,
  SEND_OTP,
  SET_NEW_PASSWORD,
  SOCIAL_LOGIN,
  USER_QUESTIONS,
  STORE_ACTIVITIES,
  GET_ACTIVITIES,
  TEACHER_EXPERIENCE,
  GET_TEACHER_EXPERIENCE,
  DJ_EXPERIENCE,
  GET_DJ_EXPERIENCE,
  ORGANIZAR_EXPERIENCE,
  GET_ORGANIZAR_EXPERIENCE,
  PERFORMER_EXPERIENCE,
  GET_PERFORMER_EXPERIENCE,
  HOST_EXPERIENCE,
  GET_HOST_EXPERIENCE,
  CREATOR_EXPERIENCE,
  GET_CREATOR_EXPERIENCE,
  PHOTOGRAPHER_EXPERIENCE,
  GET_PHOTOGRAPHER_EXPERIENCE,
  TOUR_OPERATOR,
  GET_TOUR_OPERATOR,
  LEARNING_SOURCE,
  GET_LEARNING_SOURCE,
  ATTACHMENT_HOST_EXPERIENCE,
  GET_LANGUAGES,
  DELETE_ACC,
  CHANGE_PASSWORD,
  CODE_OF_CONDUCT
};
