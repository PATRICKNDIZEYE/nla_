import React, { useEffect, useState } from "react";
import StatusCards from "./StatusCards";
import CaseManagement from "../dispute/DisputeManagement";
import CasesChart from "./CasesChart";
import LineCasesChart from "./LineCasesChart";
import RecentInvitation from "./RecentInvitation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Spinner from "@/components/partials/Spinner";
import { useTranslation } from "react-i18next";
import {
  getLevelStats,
  getMonthStats,
  getStatusStats,
} from "@/redux/features/statistics.slice";
import { DatePicker } from "antd";
import ExportLink from "@/components/partials/ExportLink";

const { RangePicker } = DatePicker;

const Statistics = () => {
  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);
  const [date, setDate] = useState<{
    startDate?: string;
    endDate?: string;
  }>();

  const {
    data: { status, level, month },
    loading,
  } = useAppSelector((state) => state.stat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    Promise.allSettled([
      dispatch(
        getStatusStats({ startDate: date?.startDate, endDate: date?.endDate })
      ),
      dispatch(
        getLevelStats({ startDate: date?.startDate, endDate: date?.endDate })
      ),
      dispatch(
        getMonthStats({ startDate: date?.startDate, endDate: date?.endDate })
      ),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap mb-3 gap-2">
        <h2 className="font-bold text-xl text-brand-gray">
          {t("Welcome back")}, {user?.profile?.Surnames}
        </h2>
        <div className="flex items-center space-x-3">
          <RangePicker
            onChange={(value) => {
              if (!value) {
                setDate({});
                return;
              }
              setDate({
                startDate: value[0]?.format("YYYY-MM-DD"),
                endDate: value[1]?.format("YYYY-MM-DD"),
              });
            }}
          />
          <ExportLink
            href={`/api/disputes/report?userId=${user?._id}&${
              date?.startDate
                ? `startDate=${date.startDate}&endDate=${date.endDate}`
                : ""
            }`}
          />
        </div>
      </div>
      <StatusCards {...{ status, level }} />
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="flex flex-col bg-white justify-center">
          <CasesChart
            data={[
              { name: t("Closed"), value: status?.closed ?? 0 },
              { name: t("Resolved"), value: status?.resolved ?? 0 },
              { name: t("Open"), value: status?.open ?? 0 },
              {
                name: t("Processing"),
                value: status?.processing ?? 0,
              },
              {
                name: t("Rejected"),
                value: status?.rejected ?? 0,
              },
              {
                name: t("Appealed"),
                value: status?.appealed ?? 0,
              },
            ]}
          />
        </div>
        <div className="flex flex-col bg-white justify-center">
          <LineCasesChart month={month} />
        </div>
        <RecentInvitation />
      </div>

      <h3 className="font-bold text-lg my-3">{t("Recent Cases")}</h3>

      <CaseManagement />
    </>
  );
};

export default Statistics;
