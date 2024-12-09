import React from "react";

const CardIcon = ({ fill = "#FFB155", className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="15"
      viewBox="0 0 21 15"
      fill="none"
      className={className}
    >
      <path
        d="M16.4125 14H4.53751C3.32938 14 2.35001 13.0206 2.35001 11.8125V3.6875C2.35001 2.47938 3.32938 1.5 4.53751 1.5H16.4125C17.6206 1.5 18.6 2.47938 18.6 3.6875V11.8125C18.6 13.0206 17.6206 14 16.4125 14Z"
        stroke={fill}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.623444 10.3125H20.3266M4.41251 5.98828H6.68594V5.1875H4.41251V5.98828Z"
        stroke={fill}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CardIcon;
