import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/store";
import { useSystemTour } from "../hooks/tour";
import { Tour } from "antd";

const LeftSideNav = () => {
  const router = useRouter();

  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);

  const [showTour, setShowTour] = React.useState(true);

  const disputeManagementRef = React.useRef(null);
  const dashboardRef = React.useRef(null);

  const systemTour = useSystemTour();
  systemTour.addStep("new-case", {
    id: "dashboard-menu",
    title: t("dashboard"),
    target: () => dashboardRef.current,
    description: "Click here for the dashboard",
  }, 0);
  systemTour.addStep("new-case", {
    id: "dispute-management-menu",
    title: t("Dispute Management"),
    target: () => disputeManagementRef.current,
    description: "Click here to view all disputes",
    nextButtonProps: {
      onClick: (e) => {
        window.location.href = "/dispute";
      }
    }
  }, 1);

  return (
    <>
      <aside className="bg-white -translate-x-80 fixed inset-0 z-50 border border-r-gray h-[calc(100vh)] w-72  transition-transform duration-300 xl:translate-x-0">
        <div className="relative border-b border-white/20">
          <Link className="flex items-center gap-4 py-6 px-8" href="/">
            <center>
              <Image alt="NLA" height={70} width={150} src="/images/logo.png" />
            </center>
          </Link>
        </div>
        <div className="ml-4">
          <ul className="mb-4 flex flex-col gap-1">
            <li>
              <Link aria-current="page" className="active" href="/home">
                <button
                  className={`${
                    router.asPath === "/home"
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                  ref={dashboardRef}
                >
                  <svg
                    height={26}
                    color={`${router.asPath === "/" ? "white" : "#1C274C"}`}
                    viewBox="0 0 24 24"
                    fill={`${router.asPath === "/" ? "white" : "#1C274C"}`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.33537 7.87495C1.79491 9.00229 1.98463 10.3208 2.36407 12.9579L2.64284 14.8952C3.13025 18.2827 3.37396 19.9764 4.54903 20.9882C5.72409 22 7.44737 22 10.8939 22H13.1061C16.5526 22 18.2759 22 19.451 20.9882C20.626 19.9764 20.8697 18.2827 21.3572 14.8952L21.6359 12.9579C22.0154 10.3208 22.2051 9.00229 21.6646 7.87495C21.1242 6.7476 19.9738 6.06234 17.6731 4.69181L16.2882 3.86687C14.199 2.62229 13.1543 2 12 2C10.8457 2 9.80104 2.62229 7.71175 3.86687L6.32691 4.69181C4.02619 6.06234 2.87583 6.7476 2.33537 7.87495ZM12 18.75C11.5858 18.75 11.25 18.4142 11.25 18V15C11.25 14.5858 11.5858 14.25 12 14.25C12.4142 14.25 12.75 14.5858 12.75 15V18C12.75 18.4142 12.4142 18.75 12 18.75Z"
                        fill={`${router.asPath === "/" ? "white" : "#1C274C"}`}
                      ></path>{" "}
                    </g>
                  </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    {t("dashboard")}
                  </p>
                </button>
              </Link>
            </li>
            <li>
              <Link className="" href="/dispute">
                <button
                  className={`${
                    router.asPath.includes("/dispute")
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                  ref={disputeManagementRef}
                >
                  <svg
                    height={26}
                    viewBox="0 0 24 24"
                    fill={`${
                      router.asPath.includes("/dispute") ? "white" : "#1C274C"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M13 3L13.7071 2.29289C13.5196 2.10536 13.2652 2 13 2V3ZM19 9H20C20 8.73478 19.8946 8.48043 19.7071 8.29289L19 9ZM13.109 8.45399L14 8V8L13.109 8.45399ZM13.546 8.89101L14 8L13.546 8.89101ZM10 13C10 12.4477 9.55228 12 9 12C8.44772 12 8 12.4477 8 13H10ZM8 16C8 16.5523 8.44772 17 9 17C9.55228 17 10 16.5523 10 16H8ZM8.5 9C7.94772 9 7.5 9.44772 7.5 10C7.5 10.5523 7.94772 11 8.5 11V9ZM9.5 11C10.0523 11 10.5 10.5523 10.5 10C10.5 9.44772 10.0523 9 9.5 9V11ZM8.5 6C7.94772 6 7.5 6.44772 7.5 7C7.5 7.55228 7.94772 8 8.5 8V6ZM9.5 8C10.0523 8 10.5 7.55228 10.5 7C10.5 6.44772 10.0523 6 9.5 6V8ZM17.908 20.782L17.454 19.891L17.454 19.891L17.908 20.782ZM18.782 19.908L19.673 20.362L18.782 19.908ZM5.21799 19.908L4.32698 20.362H4.32698L5.21799 19.908ZM6.09202 20.782L6.54601 19.891L6.54601 19.891L6.09202 20.782ZM6.09202 3.21799L5.63803 2.32698L5.63803 2.32698L6.09202 3.21799ZM5.21799 4.09202L4.32698 3.63803L4.32698 3.63803L5.21799 4.09202ZM12 3V7.4H14V3H12ZM14.6 10H19V8H14.6V10ZM12 7.4C12 7.66353 11.9992 7.92131 12.0169 8.13823C12.0356 8.36682 12.0797 8.63656 12.218 8.90798L14 8C14.0293 8.05751 14.0189 8.08028 14.0103 7.97537C14.0008 7.85878 14 7.69653 14 7.4H12ZM14.6 8C14.3035 8 14.1412 7.99922 14.0246 7.9897C13.9197 7.98113 13.9425 7.9707 14 8L13.092 9.78201C13.3634 9.92031 13.6332 9.96438 13.8618 9.98305C14.0787 10.0008 14.3365 10 14.6 10V8ZM12.218 8.90798C12.4097 9.2843 12.7157 9.59027 13.092 9.78201L14 8V8L12.218 8.90798ZM8 13V16H10V13H8ZM8.5 11H9.5V9H8.5V11ZM8.5 8H9.5V6H8.5V8ZM13 2H8.2V4H13V2ZM4 6.2V17.8H6V6.2H4ZM8.2 22H15.8V20H8.2V22ZM20 17.8V9H18V17.8H20ZM19.7071 8.29289L13.7071 2.29289L12.2929 3.70711L18.2929 9.70711L19.7071 8.29289ZM15.8 22C16.3436 22 16.8114 22.0008 17.195 21.9694C17.5904 21.9371 17.9836 21.8658 18.362 21.673L17.454 19.891C17.4045 19.9162 17.3038 19.9539 17.0322 19.9761C16.7488 19.9992 16.3766 20 15.8 20V22ZM18 17.8C18 18.3766 17.9992 18.7488 17.9761 19.0322C17.9539 19.3038 17.9162 19.4045 17.891 19.454L19.673 20.362C19.8658 19.9836 19.9371 19.5904 19.9694 19.195C20.0008 18.8114 20 18.3436 20 17.8H18ZM18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362L17.891 19.454C17.7951 19.6422 17.6422 19.7951 17.454 19.891L18.362 21.673ZM4 17.8C4 18.3436 3.99922 18.8114 4.03057 19.195C4.06287 19.5904 4.13419 19.9836 4.32698 20.362L6.10899 19.454C6.0838 19.4045 6.04612 19.3038 6.02393 19.0322C6.00078 18.7488 6 18.3766 6 17.8H4ZM8.2 20C7.62345 20 7.25117 19.9992 6.96784 19.9761C6.69617 19.9539 6.59545 19.9162 6.54601 19.891L5.63803 21.673C6.01641 21.8658 6.40963 21.9371 6.80497 21.9694C7.18864 22.0008 7.65645 22 8.2 22V20ZM4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673L6.54601 19.891C6.35785 19.7951 6.20487 19.6422 6.10899 19.454L4.32698 20.362ZM8.2 2C7.65645 2 7.18864 1.99922 6.80497 2.03057C6.40963 2.06287 6.01641 2.13419 5.63803 2.32698L6.54601 4.10899C6.59545 4.0838 6.69617 4.04612 6.96784 4.02393C7.25117 4.00078 7.62345 4 8.2 4V2ZM6 6.2C6 5.62345 6.00078 5.25117 6.02393 4.96784C6.04612 4.69617 6.0838 4.59545 6.10899 4.54601L4.32698 3.63803C4.13419 4.01641 4.06287 4.40963 4.03057 4.80497C3.99922 5.18864 4 5.65645 4 6.2H6ZM5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803L6.10899 4.54601C6.20487 4.35785 6.35785 4.20487 6.54601 4.10899L5.63803 2.32698Z"
                        fill={`${
                          router.asPath.includes("/dispute") ? "white" : "#1C274C"
                        }`}
                      ></path>{" "}
                    </g>
                  </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    {t("Dispute Management")}
                  </p>
                </button>
              </Link>
            </li>
            <li
              className={`${
                ["admin", "manager"].includes(user?.level?.accountRole!)
                  ? "block"
                  : "hidden"
              }`}
            >
              <Link  href="/report"  className={`${
                ["admin" , "manager"].includes(user?.level?.accountRole!)
                  ? "block"
                  : "hidden"
              }`}>
                <button
                  className={`${
                    router.asPath.includes("/report")
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                >
                  <svg
                    height={26}
                    viewBox="0 0 24 24"
                    fill={`${
                      router.asPath.includes("/report") ? "white" : "#1C274C"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.9553 1.25C18.5224 1.24995 18.1256 1.24991 17.8028 1.29331C17.4473 1.3411 17.0716 1.45355 16.7626 1.76257C16.4535 2.07159 16.3411 2.44732 16.2933 2.8028C16.2499 3.12561 16.25 3.52244 16.25 3.95525V17.0448C16.25 17.4776 16.2499 17.8744 16.2933 18.1972C16.3411 18.5527 16.4535 18.9284 16.7626 19.2374C17.0716 19.5465 17.4473 19.6589 17.8028 19.7067C18.1256 19.7501 18.5224 19.7501 18.9553 19.75H19.0448C19.4776 19.7501 19.8744 19.7501 20.1972 19.7067C20.5527 19.6589 20.9284 19.5465 21.2374 19.2374C21.5465 18.9284 21.6589 18.5527 21.7067 18.1972C21.7501 17.8744 21.7501 17.4776 21.75 17.0448V3.95526C21.7501 3.52245 21.7501 3.12561 21.7067 2.8028C21.6589 2.44732 21.5465 2.07159 21.2374 1.76257C20.9284 1.45355 20.5527 1.3411 20.1972 1.29331C19.8744 1.24991 19.4776 1.24995 19.0448 1.25H18.9553ZM17.8257 2.82187L17.8232 2.82324L17.8219 2.82568C17.8209 2.82761 17.8192 2.83093 17.8172 2.83597C17.8082 2.85775 17.7929 2.90611 17.7799 3.00267C17.7516 3.21339 17.75 3.5074 17.75 4.00001V17C17.75 17.4926 17.7516 17.7866 17.7799 17.9973C17.7929 18.0939 17.8082 18.1423 17.8172 18.164C17.8192 18.1691 17.8209 18.1724 17.8219 18.1743L17.8232 18.1768L17.8257 18.1781C17.8265 18.1786 17.8276 18.1791 17.8289 18.1797C17.8307 18.1806 17.8331 18.1817 17.836 18.1828C17.8578 18.1918 17.9061 18.2071 18.0027 18.2201C18.2134 18.2484 18.5074 18.25 19 18.25C19.4926 18.25 19.7866 18.2484 19.9973 18.2201C20.0939 18.2071 20.1423 18.1918 20.164 18.1828C20.1691 18.1808 20.1724 18.1792 20.1743 18.1781L20.1768 18.1768L20.1781 18.1743C20.1792 18.1724 20.1808 18.1691 20.1828 18.164C20.1918 18.1423 20.2071 18.0939 20.2201 17.9973C20.2484 17.7866 20.25 17.4926 20.25 17V4.00001C20.25 3.5074 20.2484 3.21339 20.2201 3.00267C20.2071 2.90611 20.1918 2.85775 20.1828 2.83597C20.1808 2.83093 20.1792 2.82761 20.1781 2.82568L20.1768 2.82324L20.1743 2.82187C20.1724 2.82086 20.1691 2.81924 20.164 2.81717C20.1423 2.80821 20.0939 2.79291 19.9973 2.77993C19.7866 2.7516 19.4926 2.75001 19 2.75001C18.5074 2.75001 18.2134 2.7516 18.0027 2.77993C17.9061 2.79291 17.8578 2.80821 17.836 2.81717C17.8309 2.81924 17.8276 2.82086 17.8257 2.82187Z"
                        fill={`${
                          router.asPath.includes("/report") ? "white" : "#1C274C"
                        }`}
                      ></path>{" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.9553 4.25H12.0448C12.4776 4.24995 12.8744 4.24991 13.1972 4.29331C13.5527 4.3411 13.9284 4.45355 14.2374 4.76257C14.5465 5.07159 14.6589 5.44732 14.7067 5.8028C14.7501 6.12561 14.7501 6.52243 14.75 6.95524V17.0448C14.7501 17.4776 14.7501 17.8744 14.7067 18.1972C14.6589 18.5527 14.5465 18.9284 14.2374 19.2374C13.9284 19.5465 13.5527 19.6589 13.1972 19.7067C12.8744 19.7501 12.4776 19.7501 12.0448 19.75H11.9553C11.5225 19.7501 11.1256 19.7501 10.8028 19.7067C10.4473 19.6589 10.0716 19.5465 9.76257 19.2374C9.45355 18.9284 9.3411 18.5527 9.29331 18.1972C9.24991 17.8744 9.24995 17.4776 9.25 17.0448V6.95526C9.24995 6.52244 9.24991 6.12561 9.29331 5.8028C9.3411 5.44732 9.45355 5.07159 9.76257 4.76257C10.0716 4.45355 10.4473 4.3411 10.8028 4.29331C11.1256 4.24991 11.5224 4.24995 11.9553 4.25ZM10.8232 5.82324L10.8257 5.82187L10.8234 18.1768L10.8219 18.1743C10.8209 18.1724 10.8192 18.1691 10.8172 18.164C10.8082 18.1423 10.7929 18.0939 10.7799 17.9973C10.7516 17.7866 10.75 17.4926 10.75 17V7.00001C10.75 6.5074 10.7516 6.21339 10.7799 6.00267C10.7929 5.90611 10.8082 5.85775 10.8172 5.83597C10.8192 5.83093 10.8209 5.82761 10.8219 5.82568L10.8232 5.82324ZM10.8234 18.1768L10.8257 5.82187L10.8295 5.81999L10.836 5.81717C10.8578 5.80821 10.9061 5.79291 11.0027 5.77993C11.2134 5.7516 11.5074 5.75001 12 5.75001C12.4926 5.75001 12.7866 5.7516 12.9973 5.77993C13.0939 5.79291 13.1423 5.80821 13.164 5.81717C13.1691 5.81924 13.1724 5.82086 13.1743 5.82187L13.1768 5.82324L13.1781 5.82568C13.1792 5.82761 13.1808 5.83093 13.1828 5.83597C13.1918 5.85775 13.2071 5.90611 13.2201 6.00267C13.2484 6.21339 13.25 6.5074 13.25 7.00001V17C13.25 17.4926 13.2484 17.7866 13.2201 17.9973C13.2071 18.0939 13.1918 18.1423 13.1828 18.164C13.1808 18.1691 13.1792 18.1724 13.1781 18.1743L13.1768 18.1768L13.1743 18.1781C13.1731 18.1788 13.1712 18.1797 13.1686 18.1809C13.1673 18.1815 13.1658 18.1821 13.164 18.1828C13.1423 18.1918 13.0939 18.2071 12.9973 18.2201C12.7866 18.2484 12.4926 18.25 12 18.25C11.5074 18.25 11.2134 18.2484 11.0027 18.2201C10.9061 18.2071 10.8578 18.1918 10.836 18.1828C10.8309 18.1808 10.8276 18.1792 10.8257 18.1781L10.8234 18.1768Z"
                        fill={`${
                          router.asPath.includes("/report") ? "white" : "#1C274C"
                        }`}
                      ></path>{" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.95526 8.25C4.52244 8.24995 4.12561 8.24991 3.8028 8.29331C3.44732 8.3411 3.07159 8.45355 2.76257 8.76257C2.45355 9.07159 2.3411 9.44732 2.29331 9.8028C2.24991 10.1256 2.24995 10.5224 2.25 10.9553V17.0448C2.24995 17.4776 2.24991 17.8744 2.29331 18.1972C2.3411 18.5527 2.45355 18.9284 2.76257 19.2374C3.07159 19.5465 3.44732 19.6589 3.8028 19.7067C4.12561 19.7501 4.52245 19.7501 4.95526 19.75H5.04475C5.47757 19.7501 5.8744 19.7501 6.19721 19.7067C6.5527 19.6589 6.92842 19.5465 7.23744 19.2374C7.54647 18.9284 7.65891 18.5527 7.70671 18.1972C7.75011 17.8744 7.75006 17.4776 7.75001 17.0448V10.9553C7.75006 10.5224 7.75011 10.1256 7.70671 9.8028C7.65891 9.44732 7.54647 9.07159 7.23744 8.76257C6.92842 8.45355 6.5527 8.3411 6.19721 8.29331C5.8744 8.24991 5.47757 8.24995 5.04476 8.25H4.95526ZM3.82568 9.82187L3.82324 9.82324L3.82187 9.82568C3.82086 9.82761 3.81924 9.83093 3.81717 9.83597C3.80821 9.85775 3.79291 9.90611 3.77993 10.0027C3.7516 10.2134 3.75001 10.5074 3.75001 11V17C3.75001 17.4926 3.7516 17.7866 3.77993 17.9973C3.79291 18.0939 3.80821 18.1423 3.81717 18.164C3.81924 18.1691 3.82086 18.1724 3.82187 18.1743L3.82284 18.1761L3.82568 18.1781C3.82761 18.1792 3.83093 18.1808 3.83597 18.1828C3.85775 18.1918 3.90611 18.2071 4.00267 18.2201C4.21339 18.2484 4.5074 18.25 5.00001 18.25C5.49261 18.25 5.78662 18.2484 5.99734 18.2201C6.0939 18.2071 6.14226 18.1918 6.16404 18.1828C6.16909 18.1808 6.1724 18.1792 6.17434 18.1781L6.17677 18.1768L6.17815 18.1743L6.18036 18.1698L6.18285 18.164C6.19181 18.1423 6.2071 18.0939 6.22008 17.9973C6.24841 17.7866 6.25001 17.4926 6.25001 17V11C6.25001 10.5074 6.24841 10.2134 6.22008 10.0027C6.2071 9.90611 6.19181 9.85775 6.18285 9.83597C6.18077 9.83093 6.17916 9.82761 6.17815 9.82568L6.17677 9.82324L6.17434 9.82187C6.1724 9.82086 6.16909 9.81924 6.16404 9.81717C6.14226 9.8082 6.0939 9.79291 5.99734 9.77993C5.78662 9.7516 5.49261 9.75001 5.00001 9.75001C4.5074 9.75001 4.21339 9.7516 4.00267 9.77993C3.90611 9.79291 3.85775 9.8082 3.83597 9.81717C3.83093 9.81924 3.82761 9.82086 3.82568 9.82187Z"
                        fill={`${
                          router.asPath.includes("/report") ? "white" : "#1C274C"
                        }`}
                      ></path>{" "}
                      <path
                        d="M3.00001 21.25C2.58579 21.25 2.25001 21.5858 2.25001 22C2.25001 22.4142 2.58579 22.75 3.00001 22.75H21C21.4142 22.75 21.75 22.4142 21.75 22C21.75 21.5858 21.4142 21.25 21 21.25H3.00001Z"
                        fill={`${
                          router.asPath.includes("/report") ? "white" : "#1C274C"
                        }`}
                      ></path>{" "}
                    </g>
                  </svg>
                  <p  className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    Reports & analytics
                  </p>
                </button>
              </Link>
            </li>
            <li>
              <Link className="" href="/invitations">
                <button
                  className={`${
                    router.asPath.includes("/invitations")
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                >
                  <svg
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                        stroke={`${
                          router.asPath.includes("/invitations")
                            ? "white"
                            : "#1C274C"
                        }`}
                        strokeWidth="2"
                        strokeLinecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    {t("Invitations")}
                  </p>
                </button>
              </Link>
            </li>
            <li
              className={`${
                ["admin"].includes(user?.level?.accountRole!)
                  ? "block"
                  : "hidden"
              }`}
            >
              <Link className="" href="/users">
                <button
                  className={`${
                    router.asPath.includes("/users")
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                >
                  <svg
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M10.1992 12C12.9606 12 15.1992 9.76142 15.1992 7C15.1992 4.23858 12.9606 2 10.1992 2C7.43779 2 5.19922 4.23858 5.19922 7C5.19922 9.76142 7.43779 12 10.1992 12Z"
                        stroke={`${
                          router.asPath.includes("/users") ? "white" : "#1C274C"
                        }`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M1 22C1.57038 20.0332 2.74795 18.2971 4.36438 17.0399C5.98081 15.7827 7.95335 15.0687 10 15C14.12 15 17.63 17.91 19 22"
                        stroke={`${
                          router.asPath.includes("/users") ? "white" : "#1C274C"
                        }`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M17.8205 4.44006C18.5822 4.83059 19.1986 5.45518 19.579 6.22205C19.9594 6.98891 20.0838 7.85753 19.9338 8.70032C19.7838 9.5431 19.3674 10.3155 18.7458 10.9041C18.1243 11.4926 17.3302 11.8662 16.4805 11.97"
                        stroke={`${
                          router.asPath.includes("/users") ? "white" : "#1C274C"
                        }`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M17.3203 14.5701C18.6543 14.91 19.8779 15.5883 20.8729 16.5396C21.868 17.4908 22.6007 18.6827 23.0003 20"
                        stroke={`${
                          router.asPath.includes("/users") ? "white" : "#1C274C"
                        }`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    {t("Users")}
                  </p>
                </button>
              </Link>
            </li>
            <li
              className={`${
                ["admin"].includes(user?.level?.accountRole!)
                  ? "block"
                  : "hidden"
              }`}
            >
              <Link className="" href="logs">
                <button
                  className={`${
                    router.asPath.includes("/logs")
                      ? "middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-l-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                      : "middle none font-sans font-bold center transition-all disabled:opacity-50  disabled:pointer-events-none text-xs py-3 rounded-l-full  text-black    hover:bg-blue-500/10 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize"
                  }`}
                  type="button"
                >
                  <svg
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g id="System / Terminal">
                        {" "}
                        <path
                          id="Vector"
                          d="M17 15H12M7 10L10 12.5L7 15M3 15.8002V8.2002C3 7.08009 3 6.51962 3.21799 6.0918C3.40973 5.71547 3.71547 5.40973 4.0918 5.21799C4.51962 5 5.08009 5 6.2002 5H17.8002C18.9203 5 19.4796 5 19.9074 5.21799C20.2837 5.40973 20.5905 5.71547 20.7822 6.0918C21 6.5192 21 7.07899 21 8.19691V15.8031C21 16.921 21 17.48 20.7822 17.9074C20.5905 18.2837 20.2837 18.5905 19.9074 18.7822C19.48 19 18.921 19 17.8031 19H6.19691C5.07899 19 4.5192 19 4.0918 18.7822C3.71547 18.5905 3.40973 18.2837 3.21799 17.9074C3 17.4796 3 16.9203 3 15.8002Z"
                          stroke={`${
                            router.asPath.includes("/logs") ? "white" : "#1C274C"
                          }`}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>{" "}
                    </g>
                  </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                    {t("System Logs")}
                  </p>
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      {/* <Tour open={showTour} onClose={() => setShowTour(false)} steps={systemTour.getTour('new-case')?.steps} /> */}
    </>
  );
};

export default LeftSideNav;
