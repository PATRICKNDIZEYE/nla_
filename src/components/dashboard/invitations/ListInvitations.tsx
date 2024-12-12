import React, { useEffect, useState } from "react";
import { ConfigProvider, Input, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { IInvitation } from "@/models/Invitation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  cancelInvitation,
  getAllInvitations,
  resetState,
} from "@/redux/features/invitation.slice";
import { useSearch } from "@/components/hooks/search";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getEffectiveRole, shouldShowAdminContent, canAccessContent } from "@/utils/helpers/roleCheck";

const { Search } = Input;

const ListInvitations = () => {
  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);
  const userRole = user?.level?.role ?? "user";
  const { data, loading } = useAppSelector((state) => state.invitation);
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
    sorter: SorterResult<IInvitation>
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      dispatch(resetState());
    }
  };

  const fetchData = () => {
    dispatch(
      getAllInvitations({
        ...tableParams,
        search: debouncedSearch,
        userId: user?.level?.isSwitch ? user._id : undefined,
        district: getEffectiveRole(user) === "manager" ? user?.level?.district : undefined,
      })
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), debouncedSearch, user]);

  const columns: ColumnsType<IInvitation> = [
    {
      title: t("Date Time"),
      dataIndex: "dateTime",
      key: "dateTime",
      render: (_, record) => new Date(record.dateTime).toLocaleString(),
    },
    {
      title: t("Location"),
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: t("Case ID"),
      dataIndex: "claimId",
      render: (_, record) => `
        ${
          Array.isArray(record?.dispute)
            ? record?.dispute[0].claimId
            : record.dispute.claimId ?? ""
        }`,
    },
    {
      title: t("Invitees"),
      dataIndex: "invitees",
      key: "invitees",
      render: (_, record) => (
        <Space>
          {record.invitees.map((invitee) => (
            <Tag key={invitee} className="uppercase">
              {invitee}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  if (["manager", "admin"].includes(userRole)) {
    columns.push({
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {shouldShowAdminContent(user) && (
            // Admin/Manager actions
          )}
        </Space>
      ),
    });
  }
  return (
    <>
      <div className="flex items-center mb-4">
        <Search
          placeholder={t("Search invitation...")}
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
          loading={loading}
          pagination={{
            position: ["none", "bottomRight"],
            pageSize: tableParams.pagination?.pageSize,
            current: tableParams.pagination?.current,
            total: data.pagination.totalItems,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t("of")} ${total} ${t("invitations")}`,
            onChange(page, pageSize) {
              handleTableChange(
                { ...tableParams.pagination, current: page },
                {},
                {}
              );
            },
          }}
          dataSource={data.data}
          scroll={{ x: 1500 }}
          className="whitespace-nowrap"
        />
      </ConfigProvider>
    </>
  );
};

export default ListInvitations;
