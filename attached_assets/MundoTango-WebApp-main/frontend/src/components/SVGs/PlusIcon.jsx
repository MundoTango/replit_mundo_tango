import React from "react";

const PlusIcon = ({ height = "128", width = "129", ...other }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 129 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...other}
  >
    <rect
      x="2.59632"
      y="1.68421"
      width="124.632"
      height="124.632"
      rx="15.1579"
      stroke="#D9D9D9"
      strokeWidth="3.36842"
      strokeDasharray="13.47 13.47"
    />
    <path
      d="M87.3676 66.8125H69.0424V86.456H61.8124V66.8125H43.5781V59.9719H61.8124V40.4209H69.0424V59.9719H87.3676V66.8125Z"
      fill="#D9D9D9"
    />
  </svg>
);

export default PlusIcon;
