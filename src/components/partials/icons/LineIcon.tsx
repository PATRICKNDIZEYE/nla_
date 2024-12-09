import React from "react";

const LineIcon = ({ fill = "#FFB155" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="6"
      height="67"
      viewBox="0 0 6 67"
      fill="none"
    >
      <path
        d="M3 3.5L3 63.5"
        stroke={fill}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LineIcon;
