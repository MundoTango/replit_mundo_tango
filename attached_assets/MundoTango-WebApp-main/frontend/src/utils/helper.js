import { PATH_AUTH } from "@/routes/paths";
import moment from "moment";

const formatDate = (date) => {
  return moment(date).format("yyyy-MM-DD");
};

const formatDateMonth = (date) => {
  return moment(date).format("ll");
};

const formatTime = (time) => {
  return moment(time).format("LT");
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return null; 
  }
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};


const FormStatePath = (formStatus) => {
  console.log(formStatus);
  if (formStatus <= 1) {
    return PATH_AUTH.uploadPhotos;
  } else if (formStatus == 2) {
    return PATH_AUTH.questionnaire;
  } else if (formStatus == 3) {
    return PATH_AUTH.whatdoyoudo;
  } else if (formStatus > 3 && formStatus < 10) {
    return PATH_AUTH.overview;
  } else if (formStatus == 11) {
    return PATH_AUTH.wheredoyoudance;
  } else if (formStatus == 12) {
    return PATH_AUTH.wherehaveyoulearned;
  }
  // } else if (formStatus == 13) {
  //   return PATH_AUTH.wherehaveyoulearned;
  // }
};

function timeAgo(timestamp) {
  const now = new Date();
  const messageTime = new Date(timestamp);

  const diff = now - messageTime;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? `${years} year ago` : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? `${months} month ago` : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? `${days} day ago` : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
  } else {
    // return seconds === 1 ? `${seconds} second ago` : `${seconds} seconds ago`;
    return seconds === 1 ? `just now` : `just now`;
  }
}

const formatNumber = (number) => {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + "k";
  }
  return number;
};

const StringSplice = (text, length) => {
  if (!text) {
    return "";
  }

  if (!length) {
    return "Please mention length !";
  }

  return text?.length > length ? text.slice(0, length) + "..." : text;
};

const firstUpperCase = (string, flag = false) => {
  let temp = string.split(" ");
  let arr = [];

  if (temp.length > 1 && flag) {
    for (let i = 0; i < temp.length; i++) {
      const item = temp[i];
      arr.push(item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
    }
    return arr.join(" ");
  }

  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const validation = {
  emailMax: 322,
  passwordMin: 12,
  passwordMax: 32,
  nameMin: 5,
  nameMax: 60,
  descriptionMax: 255,
  text: 120,
  amount: 10,
};

 const validationText = {
  general: "Required",
  emailRequired: "Email is required",
  titleRequired: "Title is required",
  nameemailMax: `Max length is ${validation.emailMax}`,
  invalidEmail: "Invalid email pattern",
  amountMax: `Max length is ${validation.amount}`,
  currentPasswordRequired: "Current password is required",
  newPasswordRequired: "New Password is required",
  confirmNewPasswordRequired: "Confirm new password is required",
  passwordRequired: "Password is required",
  passwordMin: `Max length is ${validation.passwordMin}`,
  passwordMax: `Max length is ${validation.passwordMax}`,

  nameRequired: "Name is required",
  nameMin: `Max length is ${validation.nameMin}`,
  nameMax: `Max length is ${validation.nameMax}`,

  descriptionRequired: "Description is required",
  descriptionMax: `Max length is ${validation.descriptionMax}`,

  numberAllowed: "Only numbers are allowed",
  numberAndDecimalAllowed: "Only numbers and decimal are allowed",

  questionRequired: "Question is required",
  answerRequired: "Answer is required",
};

export {
  formatDate,
  FormStatePath,
  timeAgo,
  formatNumber,
  formatDateMonth,
  formatTime,
  StringSplice,
  firstUpperCase,
  formatTimestamp,
  validation,
  validationText
};
