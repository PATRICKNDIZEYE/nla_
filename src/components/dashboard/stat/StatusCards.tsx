import DocIcon from "@/components/partials/icons/DocIcon";
import { IStat } from "@/redux/features/statistics.slice";
import { useAppSelector } from "@/redux/store";
import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";

const StatusCards = ({ status, level }: Pick<IStat, "level" | "status">) => {
  const { t } = useTranslation("common");
  const {
    data: { level: userLevel },
  } = useAppSelector((state) => state.profile);
  return (
    <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-green-700 to-green-700 text-gray-700 shadow-md">
        <div className="flex items-center ">
          <DocIcon />
          <p className="flex items-center text-white ml-1 font-bold ">
            {t("Open Disputes")}
          </p>
        </div>
        <h2 className="font-bold text-white text-2xl my-4">
          {(status?.open ?? 0).toLocaleString()}
        </h2>
        <Link
          href={"/dispute?status=open"}
          className="text-center mt-auto rounded-full bg-green-500 bg-opacity-50 text-white mx-3 hover:bg-opacity-60 p-2 rounded-fill"
        >
          {t("View all")}
        </Link>
      </div>
      {userLevel?.role === "admin" && (
        <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-cyan-700 to-cyan-700 text-gray-700 shadow-md">
          <div className="flex items-center ">
            <DocIcon />
            <p className="flex items-center text-white ml-1 font-bold ">
              {t("Appealed Disputes")}
            </p>
          </div>
          <h2 className="font-bold text-white text-2xl my-4">
            {(status?.appealed ?? 0).toLocaleString()}
          </h2>
          <Link
            href={"/dispute?status=appealed"}
            className="text-center mt-auto rounded-full bg-cyan-500 bg-opacity-50 text-white mx-3 hover:bg-opacity-60 p-2 rounded-fill"
          >
            {t("View all")}
          </Link>
        </div>
      )}
      <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-gray-700 shadow-md">
        <div className="flex items-center">
          <DocIcon />
          <p className="flex items-center text-white font-bold">
            {t("Processing Disputes")}
          </p>
        </div>
        <h2 className="font-bold text-white text-2xl my-4">
          {(status?.processing ?? 0).toLocaleString()}
        </h2>
        <Link
          href="/dispute?status=processing"
          className="text-center mt-auto rounded-full bg-blue-400 text-white mx-3 hover:bg-blue-600 p-2 rounded-fill"
        >
          {t("View all")}
        </Link>
      </div>
      <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-yellow-600 to-yellow-400 text-gray-700 shadow-md">
        <div className="flex items-center ">
          <DocIcon />
          <p className="flex items-center mr-3 text-white ml-1 font-bold ">
            {t("Resolved Disputes")}
          </p>
        </div>
        <h2 className="font-bold text-white text-2xl my-4">
          {(status?.resolved ?? 0).toLocaleString()}
        </h2>

        <Link
          href="/dispute?status=resolved"
          style={{ borderRadius: 50 }}
          className="text-center mt-auto rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-60 p-2 rounded-fill"
        >
          {t("View all")}
        </Link>
      </div>

      <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-pink-200 to-pink-100 text-gray-700 shadow-md">
        <div className="flex items-center">
          <p className="flex items-center text-red-600 ml-1 mr-4 font-bold ">
            {t("Closed Disputes")}
          </p>
        </div>

        <h2 className="font-bold text-red-500 text-2xl my-4">
          {(status?.closed ?? 0).toLocaleString()}
        </h2>

        <Link
          href="/dispute?status=closed"
          className="text-center mt-auto rounded-full bg-red-500 bg-opacity-30 text-red-600 hover:bg-opacity-50 p-2 rounded-fill"
        >
          {t("View all")}
        </Link>
      </div>

      <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-pink-200 to-pink-100 text-gray-700 shadow-md">
        <div className="flex items-center">
          <p className="flex items-center text-red-600 ml-1 mr-4 font-bold ">
            {t("Rejected Disputes")}
          </p>
        </div>

        <h2 className="font-bold text-red-500 text-2xl my-4">
          {(status?.rejected ?? 0).toLocaleString()}
        </h2>

        <Link
          href="/dispute?status=rejected"
          className="text-center mt-auto rounded-full bg-red-500 bg-opacity-30 text-red-600 hover:bg-opacity-50 p-2 rounded-fill"
        >
          {t("View all")}
        </Link>
      </div>

      {userLevel?.role === "admin" && (
        <>
          <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-green-600 to-green-400 text-gray-700 shadow-md">
            <div className="flex items-center">
              <DocIcon />
              <p className="flex items-center text-white ml-1 font-bold ">
                {t("District level Disputes")}
              </p>
            </div>

            <h2 className="font-bold text-white text-2xl my-4">
              {(level?.district ?? 0).toLocaleString()}
            </h2>

            <Link
              href="/dispute?level=district"
              className="text-center mt-auto rounded-full bg-green-400 text-white hover:bg-green-600 p-2 rounded-fill"
            >
              {t("View all")}
            </Link>
          </div>
          <div className="relative p-5 flex flex-col bg-clip-border rounded-xl bg-gradient-to-tr from-violet-600 to-violet-400 text-gray-700 shadow-md">
            <div className="flex items-center">
              <DocIcon />
              <p className="flex items-center text-white ml-1 font-bold ">
                {t("NLA level Disputes")}
              </p>
            </div>

            <h2 className="font-bold text-white text-2xl my-4">
              {(level?.nla ?? 0).toLocaleString()}
            </h2>

            <Link
              href="/dispute?level=nla"
              className="text-center mt-auto rounded-full bg-violet-400 text-white hover:bg-violet-600 p-2 rounded-fill"
            >
              {t("View all")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusCards;
