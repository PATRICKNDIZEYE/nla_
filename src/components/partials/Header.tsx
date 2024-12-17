import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Avatar, Modal, Popover } from "antd";
import { FiUser } from "react-icons/fi";
import { languages } from "@/utils/constants/languages";
import { useTranslation } from "react-i18next";
import Secure from "@/utils/helpers/secureLS";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import Keys from "@/utils/constants/keys";
import { HiMenu } from "react-icons/hi";
import LeftSideNavPopup from "./LeftSideNavPopup";
import axios from "axios";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { ExclamationCircleFilled } from "@ant-design/icons";
import TourButton from "@/components/common/TourButton";

const { confirm } = Modal;

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
    setVisible(false);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setVisible(false);
    Secure.removeToken();
    Secure.deleteUserId();
    router.replace("/login");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setVisible(false);
  };
  const [visible, setVisible] = useState(false);
  const hideOrShow = () => {
    setVisible(!visible);
  };
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);
   const isAdmin=["admin","manager"].includes(user?.level?.accountRole!)
  const profile = user?.profile;
  const dispatch = useAppDispatch();

  // Get Anew Acess token for another account
  const switchAccount = async () => {
    try {
      Secure.removeToken();
      const res = await axios.post("/api/auth/switch", {
        user: user,
        newRole: ["admin", "manager"].includes(user.level?.role!) 
          ? "user"
          : user.level?.accountRole,
        accountRole: user.level?.accountRole || user.level?.role
      });
      
      if (res.status === 200) {
        const {token} = res.data;
        Secure.setToken(token);
        // Force reload to refresh user context
        router.reload();
      }
    } catch (error) {
      console.error("Error switching account:", error);
    }
  }

  // Get current page tour ID based on route
  const getCurrentTourId = () => {
    const path = router.pathname;
    if (path.includes('/dispute')) return 'disputes';
    if (path.includes('/invitations')) return 'invitations';
    if (path.includes('/appeals')) return 'appeals';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  return (
    <>
      <nav className=" bg-white w-full border border-gray flex relative justify-between items-center mx-auto px-4 h-[50px]">
        <div className="inline-flex items-center space-x-2">
          <LeftSideNavPopup />
          <Link className=" text-gray-500" href="/">
            <Image alt="NLA" height={40} width={80} src="/images/logo.png" />
          </Link>
        </div>

        <div className="flex-initial">
          <div className="flex justify-end items-center relative">
            <div className="flex mr-4 items-center">
              <Link
                className={
                  router.asPath === "/notification"
                    ? `hidden py-2 text-white px-3 bg-blue-500 hover:bg-blue-800 rounded-full`
                    : `hidden py-2 text-gray-800 px-3 hover:bg-gray-200 rounded-full`
                }
                href="notification"
              >
                <svg
                  width={20}
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
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.31317 12.463C6.20006 9.29213 8.60976 6.6252 11.701 6.5C14.7923 6.6252 17.202 9.29213 17.0889 12.463C17.0889 13.78 18.4841 15.063 18.525 16.383C18.525 16.4017 18.525 16.4203 18.525 16.439C18.5552 17.2847 17.9124 17.9959 17.0879 18.029H13.9757C13.9786 18.677 13.7404 19.3018 13.3098 19.776C12.8957 20.2372 12.3123 20.4996 11.701 20.4996C11.0897 20.4996 10.5064 20.2372 10.0923 19.776C9.66161 19.3018 9.42346 18.677 9.42635 18.029H6.31317C5.48869 17.9959 4.84583 17.2847 4.87602 16.439C4.87602 16.4203 4.87602 16.4017 4.87602 16.383C4.91795 15.067 6.31317 13.781 6.31317 12.463Z"
                      stroke={
                        router.asPath === "/notification" ? "white" : "#000000"
                      }
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M9.42633 17.279C9.01212 17.279 8.67633 17.6148 8.67633 18.029C8.67633 18.4432 9.01212 18.779 9.42633 18.779V17.279ZM13.9757 18.779C14.3899 18.779 14.7257 18.4432 14.7257 18.029C14.7257 17.6148 14.3899 17.279 13.9757 17.279V18.779ZM12.676 5.25C13.0902 5.25 13.426 4.91421 13.426 4.5C13.426 4.08579 13.0902 3.75 12.676 3.75V5.25ZM10.726 3.75C10.3118 3.75 9.97601 4.08579 9.97601 4.5C9.97601 4.91421 10.3118 5.25 10.726 5.25V3.75ZM9.42633 18.779H13.9757V17.279H9.42633V18.779ZM12.676 3.75H10.726V5.25H12.676V3.75Z"
                      fill={
                        router.asPath === "/notification" ? `white` : `#000000`
                      }
                    ></path>{" "}
                  </g>
                </svg>
              </Link>
              <Popover
                content={languages
                  .filter((item) => item.code !== router.locale)
                  .map((item) => (
                    <Link
                      key={item.code}
                      locale={item.code}
                      href={router.asPath}
                      className="flex items-center cursor-pointer py-1"
                      onClick={() => {
                        setOpen(false);
                        Secure.set(Keys.LANG_KEY, item.code);
                      }}
                    >
                      <p className="P100 text-N800">
                        {item.name}({item.code.toUpperCase()})
                      </p>
                    </Link>
                  ))}
                trigger="click"
                open={open}
                onOpenChange={setOpen}
                className="flex justify-center items-center cursor-pointer"
              >
                <button
                  type="button"
                  title={
                    languages.find((item) => item.code === router.locale)?.name
                  }
                  className="inline-block py-2 space-x-1 px-3 hover:bg-gray-200 rounded-full relative "
                >
                  <Image
                    src={`/images/flags/${router.locale ?? "en"}.svg`}
                    alt="Language"
                    width={16}
                    height={16}
                  />
                  <span className="font-medium">
                    {languages.find((item) => item.code === router.locale)
                      ?.name ?? "English"}
                  </span>
                </button>
              </Popover>
            </div>

            <Popover
              content={
                <div
                  style={{ zIndex: 9999 }}
                  className=" absolute top-50 right-0  bg-gray-100"
                >
                  <div className="w-full max-w-sm rounded-lg bg-white p-3 drop-shadow-xl divide-y divide-gray-200">
                    <div
                      aria-label="header"
                      className="flex space-x-4 items-center p-4"
                    >
                      <div
                        aria-label="avatar"
                        className="flex mr-auto items-center space-x-4"
                      >
                        <Avatar
                          size={64}
                          src={`data:image/jpeg;base64,${profile?.Photo}`}
                          icon={<FiUser size={32} />}
                          className="flex flex-col items-center justify-center"
                        />
                        <div className="space-y-2 flex flex-col flex-1 truncate">
                          <div className="font-medium relative text-xl leading-tight text-gray-900">
                            <span className="flex">
                              <span className="truncate relative pr-8">
                                {profile?.ForeName} {profile?.Surnames}
                                <span
                                  aria-label="verified"
                                  className="absolute top-1/2 -translate-y-1/2 right-0 inline-block rounded-full"
                                ></span>
                              </span>
                            </span>
                          </div>
                          <p className="font-normal text-base leading-tight text-gray-500 truncate">
                            {formatPhoneNumber(`0${user?.phoneNumber}`)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div aria-label="navigation" className="py-2">
                      <nav className="grid gap-1">
                        <Link
                          href="/profile"
                          onClick={() => {
                            setVisible(false);
                          }}
                          className="whitespace-nowrap flex items-center leading-6 space-x-3 py-3 px-4 w-full text-lg text-gray-600 focus:outline-none hover:bg-hovermubaptiste-900 rounded-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="w-7 h-7"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path
                              stroke="none"
                              d="M0 0h24v24H0z"
                              fill="none"
                            ></path>
                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                          </svg>
                          <span>{t("My Profile")}</span>
                        </Link>
                      </nav>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={async () => {
                          await switchAccount();
                        }}
                        className="whitespace-nowrap flex gap-2 items-center leading-6 space-x-3 py-3 px-4 w-full text-lg text-gray-600 focus:outline-none hover:bg-hovermubaptiste-900 rounded-md"
                      >
                       <FaRegArrowAltCircleUp className="h-6 w-6"/>  Switch to {"  "}
                        {["admin", "manager"].includes(user.level?.role!)
                          ? `User`
                          : `${user.level?.accountRole} `}
                        Account
                      </button>
                    )}

                    <div aria-label="footer" className="pt-2">
                      <button
                        type="button"
                        onClick={showModal}
                        className="flex items-center space-x-3 py-3 px-4 w-full leading-6 text-lg text-gray-600 focus:outline-none hover:bg-gray-100 rounded-md"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          className="w-7 h-7"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                          ></path>
                          <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
                          <path d="M9 12h12l-3 -3"></path>
                          <path d="M18 15l3 -3"></path>
                        </svg>
                        <span>{t("Logout")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              }
              trigger="click"
              open={visible}
              onOpenChange={hideOrShow}
            >
              <button
                type="button"
                className="flex items-center border rounded-full hover:shadow-lg"
              >
                <Avatar
                  src={`data:image/jpeg;base64,${profile?.Photo}`}
                  icon={<FiUser size={24} />}
                  className="flex flex-col items-center justify-center"
                />
              </button>
            </Popover>
          </div>
        </div>
      </nav>
      <Modal
        title={t("Logout")}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          danger: true,
        }}
        okText={t("Logout")}
        cancelText="Cancel"
      >
        <p>{t("Are you sure you want to logout?")}</p>
      </Modal>
    </>
  );
};

export default Header;
