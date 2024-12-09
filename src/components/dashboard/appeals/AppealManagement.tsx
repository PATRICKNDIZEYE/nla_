import React, { useEffect, useState } from "react";
import { ConfigProvider, Input, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSearch } from "@/components/hooks/search";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import {
  clearDispute,
  getAllDisputes,
} from "@/redux/features/dispute/dispute.slice";
import { IDispute } from "@/@types/dispute.type";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { useSearchParams } from "next/navigation";
import StatusFilter from "../dispute/filter/StatusFilter";
import AppealForm from "./AppealForm";
import { useTranslation } from "react-i18next";

const { Search } = Input;

interface DataType {
  key: string;
  name: string;
  caseType: string;
  address: string;
  status: string;
}

const AppealManagement: React.FC = () => {
  const { t } = useTranslation("common");
  const params = useSearchParams();
  const { data, loading } = useAppSelector((state) => state.dispute);
  const { search, debouncedSearch, setSearch } = useSearch();
  const dispatch = useAppDispatch();

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<DataType>
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      dispatch(clearDispute());
    }
  };

  const fetchData = () => {
    dispatch(
      getAllDisputes({
        ...tableParams,
        search: debouncedSearch,
        status: tableParams.status ?? params.get("status")?.toString(),
      })
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), debouncedSearch]);

  const columns: ColumnsType<IDispute> = [
    {
      title: t("Claimant Name"),
      dataIndex: ["claimant", "profile", "Surnames"],
      render: (_, record) => (
        <Link href={`/dispute/${record._id}`}>
          {record.claimant?.profile?.Surnames ?? ""}{" "}
          {record.claimant?.profile?.ForeName ?? ""}
        </Link>
      ),
    },
    {
      title: t("Dispute Type"),
      dataIndex: "disputeType",
      ellipsis: true,
      render: (_, record) => (
        <Link className="text-blue-500" href={`/dispute/${record._id}`}>
          {record.disputeType}
        </Link>
      ),
    },

    {
      title: t("UPI Number"),
      dataIndex: "upiNumber",
    },
    {
      title: "Parcel Address",
      dataIndex: "land.",
      render: (_, record) => <span>{record.land?.address?.string ?? ""}</span>,
      ellipsis: true,
    },

    {
      title: t("Defendant Name"),
      dataIndex: ["defendant", "fullName"],
    },
    {
      title: t("Defendant Phone Number"),
      dataIndex: ["defendant", "phoneNumber"],
      render: (phoneNumber: string) => (
        <Link
          href={`tel:${phoneNumber}`}
          className="text-gray-900 hover:underline"
        >
          {formatPhoneNumber(`0${phoneNumber}`)}
        </Link>
      ),
    },
    {
      title: t("Status"),
      key: "status",
      dataIndex: "status",
      render: (status: string, record) => (
        <>
          <Tag color={status === "open" ? "blue" : "green"}>
            {status.toUpperCase()}
          </Tag>
          {(record.overdueDays ?? 0) > 0 && (
            <Tag color="#f50">
              {t("Overdue")} {record.overdueDays} {t("days")}
            </Tag>
          )}
        </>
      ),
      ellipsis: true,
    },
  ];
  return (
    <>
      <div className="flex items-center mb-4 gap-2">
        <Search
          placeholder={t("Search appeal...")}
          loading={loading}
          className="flex-grow mr-4"
          allowClear
          onSearch={setSearch}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTableParams((prev) => ({
              ...prev,
              pagination: {
                ...prev.pagination,
                current: 1,
              },
            }));
          }}
        />
        <StatusFilter
          onChange={(value) => {
            setTableParams((prev) => ({
              ...prev,
              status: value,
              pagination: {
                ...prev.pagination,
                current: 1,
              },
            }));
          }}
          defaultValue={params.get("status")?.toString()}
          title={t("Filter appeals by status")}
        />
        <AppealForm />
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
          rowKey={(record) => `${record._id}`}
          loading={loading}
          pagination={{
            position: ["none", "bottomRight"],
            pageSize: tableParams.pagination?.pageSize,
            current: tableParams.pagination?.current,
            total: data.pagination.totalItems,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t("of")} ${total} ${t("disputes")}`,
            onChange(page, pageSize) {
              handleTableChange(
                { ...tableParams.pagination, current: page },
                {},
                {}
              );
            },
          }}
          dataSource={data.data}
          scroll={{ x: 1600 }}
          className="whitespace-nowrap"
        />
      </ConfigProvider>
    </>
  );
};

export default AppealManagement;
