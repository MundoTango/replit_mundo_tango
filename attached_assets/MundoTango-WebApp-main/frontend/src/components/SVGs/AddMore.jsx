import React from "react";

const AddMore = ({ width = "343", height = "49", ...other }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 343 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...other}
  >
    <rect
      x="0.776595"
      y="0.776595"
      width="340.939"
      height="47.4468"
      rx="6.98936"
      stroke="#D9D9D9"
      strokeWidth="1.55319"
      strokeDasharray="6.21 6.21"
    />
    <path
      d="M180 25.3193H172.467V33H169.495V25.3193H162V22.6446H169.495V15H172.467V22.6446H180V25.3193Z"
      fill="#D9D9D9"
    />
  </svg>
);

export default AddMore;
