import React, { useState } from "react";
import ChangeProfileImage from "./ChangeProfileImage";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/store";
import Image from "next/image";
import { getEffectiveRole, canSwitchAccount } from "@/utils/helpers/roles";

const MyProfile = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const { data: user } = useAppSelector((state) => state.profile);
  const { t } = useTranslation("common");

  const effectiveRole = getEffectiveRole(user);
  const canSwitch = canSwitchAccount(user);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-6 rounded-md">
        <h3 className="text-2xl font-bold pb-3">{t("Profile details")}</h3>
        <div className="flex mb-5 gap-2 flex-wrap">
          {/* <ChangeProfileImage /> */}
          <Image
            width={120}
            height={120}
            alt="profile image"
            className="rounded-full"
            src={`data:image/jpeg;base64,${user.profile?.Photo} `}
          />
          <div className="flex flex-col">
            <h3 className="text-xl font-medium">
              {user?.profile?.Surnames} {user?.profile?.ForeName}
            </h3>
            <p className="text-gray-500">
              {formatPhoneNumber(`0${user?.phoneNumber}`)}
            </p>

            <button className="py-3 mt-3 px-5 bg-blue-500 rounded-md text-white">
              {t("Change Password")}
            </button>
          </div>
        </div>
        <hr />
        <form className="mt-5">
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div className="col-span-full">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"
              >
                {t("Full Name")}
              </label>
              <input
                style={{ background: "#E8F6F3" }}
                type="text"
                id="name"
                className="bg-#E8F6F3-50 border border-#E8F6F3-300 text-#E8F6F3-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-#E8F6F3-700 dark:border-#E8F6F3-600 dark:placeholder-#E8F6F3-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="John"
                required
                disabled
                readOnly
                value={user?.profile?.Surnames + " " + user?.profile?.ForeName}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"
              >
                {t("Phone Number")}
              </label>
              <input
                style={{ background: "#E8F6F3" }}
                type="tell"
                id="phone"
                className="bg-#E8F6F3-50 border border-#E8F6F3-300 text-#E8F6F3-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-#E8F6F3-700 dark:border-#E8F6F3-600 dark:placeholder-#E8F6F3-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                value={
                  user?.phoneNumber
                    ? formatPhoneNumber(`0${user?.phoneNumber}`)
                    : ""
                }
              />
            </div>
            <div>
              <label
                htmlFor="nationalId"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"
              >
                {t("National ID")}
              </label>
              <input
                style={{ background: "#E8F6F3" }}
                type="text"
                id="nationalId"
                value={user?.nationalId}
                className="bg-#E8F6F3-50 border border-#E8F6F3-300 text-#E8F6F3-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-#E8F6F3-700 dark:border-#E8F6F3-600 dark:placeholder-#E8F6F3-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                {t("Role")}
              </label>
              <select
                style={{ background: "#E8F6F3" }}
                id="role"
                disabled
                value={effectiveRole ?? "user"}
                className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="admin">ADMIN</option>
                <option value="manager">MANAGER</option>
                <option value="user">USER</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="nationality"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray"
              >
                {t("Nationality")}
              </label>
              <select
                style={{ background: "#E8F6F3" }}
                id="nationality"
                value={user?.profile?.Nationality ?? "Rwandan"}
                className=" text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option selected>{t("Choose a nationality")}</option>
                <option value="Rwandan">Rwandan</option>
              </select>
            </div>
          </div>

          {!["admin", "manager"].includes(effectiveRole!) && (
            <>
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    style={{ background: "#E8F6F3" }}
                    id="remember"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 border border-#E8F6F3-300 rounded bg-#E8F6F3-50 focus:ring-3 focus:ring-blue-300 dark:bg-#E8F6F3-700 dark:border-#E8F6F3-600 dark:focus:ring-blue-600 dark:ring-offset-#E8F6F3-800"
                    required
                  />
                </div>
                <label
                  htmlFor="remember"
                  className="ms-2 text-sm font-medium text-#E8F6F3-900 dark:text-#E8F6F3-300"
                >
                  {t("Are you sure you want to change?")}
                </label>
              </div>

              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {t("Update changes")}
              </button>
              <button
                type="submit"
                className="text-gray-500 bg-white-700 border border-gray-300 ml-2 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-blue-800"
              >
                Cancel
              </button>
            </>
          )}
        </form>
      </div>
      <div
        className={`bg-white  rounded-md p-4 ${
          ["admin", "manager"].includes(effectiveRole!) ? "hidden" : "block"
        }`}
      >
        <h3 className="text-2xl font-bold ">{t("Deactivate Account")}</h3>

        <div
          className="flex items-center p-4  mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-white-800 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <div>
            <span className="font-bold">
              {t("Are you sure you want to delete your account?")}
            </span>
            <p className="text-yellow-500">
              {t(
                "Once you deactivate your account, there is no going back.Please be certain."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input
              style={{ background: "#E8F6F3" }}
              id="remember"
              type="checkbox"
              value=""
              className="w-4 h-4 border border-#E8F6F3-300 rounded bg-#E8F6F3-50 focus:ring-3 focus:ring-blue-300 dark:bg-#E8F6F3-700 dark:border-#E8F6F3-600 dark:focus:ring-blue-600 dark:ring-offset-#E8F6F3-800"
              required
            />
          </div>
          <label
            htmlFor="remember"
            className="ms-2 text-sm font-medium text-#E8F6F3-900 dark:text-#E8F6F3-300"
          >
            {t("I confirm with my account deactivation")}
          </label>
        </div>

        <button className="py-3 px-5 bg-red-500 rounded-md text-white">
          {t("Deactivate Account")}
        </button>
      </div>

      {canSwitch && (
        <div className="col-span-2 bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-600">
            {t("Currently viewing as")}: {effectiveRole.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
