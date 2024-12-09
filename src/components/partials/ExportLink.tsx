import Link from "next/link";
import React from "react";

const ExportLink = ({ href = "#" }) => {
  return (
    <Link
      href={href}
      passHref
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center px-3 py-2 text-sm font-medium leading-4 text-white bg-brand-green rounded-md hover:bg-brand-green-dark focus:outline-none focus:bg-brand-green-dark active:bg-brand-green-dark"
    >
      <svg
        className="w-4 h-4 mr-2 text-white fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M17 3h-4V1H7v2H3a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1zM7 2h6v2H7V2zm9 16H4V6h12v12z" />
      </svg>
      Export
    </Link>
  );
};

export default ExportLink;
