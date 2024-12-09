import React, { useEffect, useState } from "react";
import { ConfigProvider, Input, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSearch } from "@/components/hooks/search";
import { clearLogs, getAllLogs } from "@/redux/features/log/log.slice";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { ILog } from "@/@types/log.type";
import { useTranslation } from "react-i18next";

const { Search } = Input;

const ListLogs: React.FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { search, debouncedSearch, setSearch } = useSearch();
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const {
    data: { data, pagination },
    loading,
  } = useAppSelector((state) => state.log);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<ILog>
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      dispatch(clearLogs());
    }
  };

  

  const fetchData = () => {
    dispatch(
      getAllLogs({
        ...tableParams,
        search: debouncedSearch,
      })
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), debouncedSearch]);

  const columns: ColumnsType<ILog> = [
    {
      title: t("Date Time"),
      dataIndex: "createdAt",
      ellipsis: true,
      render: (_, record) =>
        record.createdAt?.toLocaleString() || "No date created",
    },
    {
      title: t("User"),
      dataIndex: "user",
      ellipsis: true,
      render: (_, record) => (
        <span>
          {record.user?.profile?.Surnames || ""}{" "}
          {record.user?.profile?.ForeName || ""}
        </span>
      ),
    },
    {
      title: t("Role"),
      dataIndex: "role",
      key: "role",
      ellipsis: true,
      render: (_, record) => (
        <Tag color="blue">
          {record.user?.level?.role.toUpperCase()}
          {record.user?.level?.role === "admin"
            ? " (NLA)"
            : record.user?.level?.role === "manager"
            ? ` (${record.user?.level.district})`
            : ""}
        </Tag>
      ),
    },
    {
      title: t("Action"),
      key: "action",
      dataIndex: "action",
      ellipsis: true,
    },
    {
      title: t("Target"),
      key: "targettype",
      dataIndex: "targettype",
      ellipsis: true,
    },
  ];
  return (
    <>
      <div className="flex items-center mb-4">
        <Search
          placeholder={t("Search log...")}
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
          loading={loading && !data.length}
          pagination={{
            position: ["none", "bottomRight"],
            pageSize: tableParams.pagination?.pageSize,
            current: tableParams.pagination?.current,
            total: pagination.totalItems,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t("of")} ${total} ${t("logs")}`,
            onChange(page, pageSize) {
              handleTableChange(
                { ...tableParams.pagination, current: page },
                {},
                {}
              );
            },
          }}
          dataSource={data}
          scroll={{ x: 900 }}
          className="whitespace-nowrap"
        />
      </ConfigProvider>
    </>
  );
};

export default ListLogs;
