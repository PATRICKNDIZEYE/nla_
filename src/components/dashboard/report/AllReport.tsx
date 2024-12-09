import React, { useEffect, useState } from "react";
import { ConfigProvider, DatePicker, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { IDistrictData, ISectorData } from "@/@types/pagination";
import {
  getDistrictStats,
  getSectorStats,
} from "@/redux/features/statistics.slice";
import ExportLink from "@/components/partials/ExportLink";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

const AllReport = () => {
  const { t } = useTranslation("common");
  const [date, setDate] = useState<{
    startDate?: string;
    endDate?: string;
  }>();
  const { data: user } = useAppSelector((state) => state.profile);
  const {
    data: { sectors, districts },
    loading,
  } = useAppSelector((state) => state.stat);
  const dispatch = useAppDispatch();

  const fetchData = () => {
    if (user?.level?.district) {
      dispatch(
        getSectorStats({ startDate: date?.startDate, endDate: date?.endDate })
      );
    } else {
      dispatch(
        getDistrictStats({ startDate: date?.startDate, endDate: date?.endDate })
      );
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const columns: ColumnsType<ISectorData | IDistrictData> = [
    {
      title: t(user?.level?.district ? "Sector Name" : "District Name"),
      dataIndex: user?.level?.district ? "sectorName" : "district",
      key: user?.level?.district ? "sectorName" : "district",
    },
    {
      title: t("Processing Cases"),
      dataIndex: "processing",
      key: "processing",
    },
    {
      title: t("Closed Cases"),
      dataIndex: "closed",
      key: "closed",
    },
    {
      title: t("Resolved Cases"),
      dataIndex: "resolved",
      key: "resolved",
    },
    {
      title: t("Rejected Cases"),
      dataIndex: "rejected",
      key: "rejected",
    },
    {
      title: t("Submitted Cases"),
      dataIndex: "open",
      key: "open",
    },
  ];

  return (
    <>
      <div className="flex items-center flex-wrap justify-between gap-2 mb-3">
        <h2 className="font-bold text-xl text-brand-gray">{t("Report")}</h2>
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
            href={
              (user?.level?.district ? sectors : districts)?.length
                ? `/api/disputes/report?userId=${user?._id}&${
                    date?.startDate
                      ? `startDate=${date.startDate}&endDate=${date.endDate}`
                      : ""
                  }`
                : "#"
            }
          />
        </div>
      </div>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#EAECF0",
              rowHoverBg: "#F9FAFB",
            },
          },
        }}
      >
        <Table
          columns={columns}
          loading={loading}
          dataSource={user?.level?.district ? sectors : districts}
          scroll={{ x: 900 }}
          className="whitespace-nowrap"
          rowKey={(record) =>
            (user?.level?.district ? sectors : districts).indexOf(record as any)
          }
        />
      </ConfigProvider>
    </>
  );
};

export default AllReport;
