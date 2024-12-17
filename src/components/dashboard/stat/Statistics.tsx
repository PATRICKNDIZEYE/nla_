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
import UPISearch from '../dispute/UPISearch';
import { Card } from "antd";

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
    if (!user?._id) return;
    
    Promise.allSettled([
      dispatch(getStatusStats({ 
        startDate: date?.startDate, 
        endDate: date?.endDate,
        userId: user._id,
        role: user?.level?.role
      })),
      dispatch(getLevelStats({ 
        startDate: date?.startDate, 
        endDate: date?.endDate,
        userId: user._id,
        role: user?.level?.role
      })),
      dispatch(getMonthStats({ 
        startDate: date?.startDate, 
        endDate: date?.endDate,
        userId: user._id,
        role: user?.level?.role
      }))
    ]);
  }, [date, user]);

  if (loading) {
    return <Spinner />;
  }

  if (!status && !level && !month) {
    console.log('No statistics data available:', { status, level, month });
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">{t("No statistics available")}</p>
      </div>
    );
  }

  // Add role-based visibility for components
  const showAdminStats = user?.level?.role === 'admin' || user?.level?.role === 'manager';
  const showDistrictStats = showAdminStats || user?.level?.district;

  console.log('Statistics data:', { status, level, month, userRole: user?.level?.role });

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
          {showAdminStats && (
            <ExportLink
              href={`/api/disputes/report?userId=${user?._id}&${
                date?.startDate
                  ? `startDate=${date.startDate}&endDate=${date.endDate}`
                  : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* Add UPI Search for admin and manager users */}
      {showAdminStats && (
        <div className="mb-6">
          <Card title={t("Search Cases by UPI")} className="bg-white">
            <UPISearch />
          </Card>
        </div>
      )}

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
        {showDistrictStats && (
          <div className="flex flex-col bg-white justify-center">
            <LineCasesChart month={month} />
          </div>
        )}
        {showAdminStats && <RecentInvitation />}
      </div>

      <h3 className="font-bold text-lg my-3">{t("Recent Cases")}</h3>

      <CaseManagement />
    </>
  );
};

export default Statistics;
