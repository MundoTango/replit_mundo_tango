import React from "react";

const Addition = ({...other}) => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...other}
  >
    <path d="M0 9H18" stroke="black" strokeWidth="3" />
    <path d="M9 0L9 18" stroke="black" strokeWidth="3" />
  </svg>
);

export default Addition;
