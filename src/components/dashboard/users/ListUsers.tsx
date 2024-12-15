import React, { useEffect, useState } from "react";
import { ConfigProvider, Form, Input, Modal, Select, Table, Tag, Space, Tooltip, Badge, Button, Popconfirm } from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined, SwapOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { IAuthRegister } from "@/@types/auth.type";
import { changeUserLevel, getAllUsers, getCaseCounts } from "@/redux/features/user/user.slice";
import Link from "next/link";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { clearUser } from "@/redux/features/user/user.slice";
import { useSearch } from "@/components/hooks/search";
import { useTranslation } from "react-i18next";
import Address from "@/utils/lib/address";
import { toast } from "react-toastify";
import {
  updateUser,
  suspendAccount,
  reactivateAccount,
  switchAccount,
} from "@/redux/features/user/user.slice";

const { Search } = Input;

const ListUsers: React.FC = () => {
  const {
    data: { level },
  } = useAppSelector((state) => state.profile);
  const [current, setCurrent] = useState<IAuthRegister | null>(null);
  const [form] = Form.useForm();
  const roleValue = Form.useWatch("role", form);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const { t } = useTranslation("common");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const { data, loading } = useAppSelector((state) => state.user);
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
    sorter: SorterResult<IAuthRegister>
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      dispatch(clearUser());
    }
  };

  const fetchData = () => {
    dispatch(getAllUsers({ ...tableParams, search: debouncedSearch }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), debouncedSearch]);

  useEffect(() => {
    if (data.data.length > 0) {
      // Fetch case counts for all users
      data.data.forEach(user => {
        dispatch(getCaseCounts(user._id));
      });
    }
  }, [data.data, dispatch]);

  const handleSuspend = async (values: { reason: string }) => {
    try {
      await dispatch(
        suspendAccount({
          userId: current?._id!,
          reason: values.reason,
        })
      ).unwrap();
      toast.success(t("Account suspended successfully"));
      setIsSuspendModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await dispatch(reactivateAccount(userId)).unwrap();
      toast.success(t("Account reactivated successfully"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSwitchRole = async (userId: string, currentRole: string) => {
    try {
      const targetRole = currentRole === 'manager' ? 'user' : 'manager';
      await dispatch(
        switchAccount({
          userId,
          targetRole,
        })
      ).unwrap();
      toast.success(t("Account role switched successfully"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateRole = async (values: any) => {
    try {
      await dispatch(
        updateUser({
          ...current!,
          level: {
            role: values.role,
            district: values.district,
          },
        })
      ).unwrap();
      toast.success(t("Role updated successfully"));
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const { caseCounts } = useAppSelector(state => ({
    caseCounts: state.user?.caseCounts || {}
  }));

  const columns: ColumnsType<IAuthRegister> = [
    {
      title: t("Name"),
      dataIndex: ["profile", "Surnames"],

      render: (_, record: IAuthRegister) => (
        <Link
          href={`/user/${record._id}`}
          className="text-blue-500 hover:underline"
        >{`${record.profile.Surnames} ${record.profile.ForeName}`}</Link>
      ),
    },

    {
      title: t("Phone number"),
      dataIndex: "phoneNumber",

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
      title: t("National ID"),
      dataIndex: "nationalId",
    },
    {
      title: t("Address"),
      dataIndex: ["profile", "Address"],
      key: "address",

      render: (_, record) => (
        <span>
          {record.profile?.District}, {record.profile?.Sector}
        </span>
      ),
    },
    {
      title: t("Gender"),
      dataIndex: ["profile", "Sex"],
    },
    {
      title: t("Role"),
      dataIndex: "role",
      render: (_, record) => (
        <Tag
          onClick={() => {
            if (level?.role !== "admin") return;
            showModal();
            setCurrent(record);
            form.setFieldsValue({
              role: record.level?.role,
              district: record.level?.district,
              sector: record.level?.sector,
            });
          }}
          className="cursor-pointer"
          color={
            record.level?.role === "admin"
              ? "blue"
              : record.level?.role === "manager"
              ? "green"
              : "orange"
          }
        >
          {level?.role === "admin" && <EditOutlined className="mr-1" />}
          {record.level?.role.toUpperCase()}
          {record.level?.role === "admin"
            ? " (NLA)"
            : record.level?.role === "manager"
            ? ` (${record.level.district})`
            : ""}
        </Tag>
      ),
    },
    {
      title: t("Status"),
      key: "status",
      render: (_, record: IAuthRegister) => (
        <Tag color={record.accountStatus === 'active' ? 'green' : 'red'}>
          {record.accountStatus?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t("Cases"),
      key: "cases",
      render: (_, record) => {
        const counts = caseCounts[record._id] || {};
        
        if (!Object.keys(counts).length) {
          return <span>-</span>;
        }

        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        return (
          <div>
            <Badge count={total} overflowCount={999} style={{ backgroundColor: '#52c41a' }} />
            <div className="mt-2">
              {Object.entries(counts).map(([status, count]) => (
                <div key={status} className="text-xs text-gray-500 capitalize">
                  {status}: {count}
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      title: t("Actions"),
      key: "action",
      render: (_, record: IAuthRegister) => (
        <Space size="middle">
          <Tooltip title={t("Change Role")}>
            <Button
              type="link"
              onClick={() => {
                setCurrent(record);
                setIsModalOpen(true);
                form.setFieldsValue({
                  role: record.level?.role,
                  district: record.level?.district,
                });
              }}
            >
              {t("Change Role")}
            </Button>
          </Tooltip>

          {record.level?.role === 'manager' && (
            <Tooltip title={t("Switch Account")}>
              <Button
                type="link"
                icon={<SwapOutlined />}
                onClick={() => handleSwitchRole(record._id!, record.level?.role!)}
              >
                {t("Switch Role")}
              </Button>
            </Tooltip>
          )}

          {record.accountStatus === 'active' ? (
            <Tooltip title={t("Suspend Account")}>
              <Button
                type="link"
                danger
                icon={<LockOutlined />}
                onClick={() => {
                  setCurrent(record);
                  setIsSuspendModalOpen(true);
                }}
              >
                {t("Suspend")}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={t("Reactivate Account")}>
              <Popconfirm
                title={t("Are you sure you want to reactivate this account?")}
                onConfirm={() => handleReactivate(record._id!)}
                okText={t("Yes")}
                cancelText={t("No")}
              >
                <Button type="link" icon={<UnlockOutlined />}>
                  {t("Reactivate")}
                </Button>
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center mb-4">
        <Search
          placeholder="Search user..."
          loading={loading}
          className="flex-grow mr-4"
          allowClear
          onSearch={setSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* <ManageUser /> */}
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
              `${range[0]}-${range[1]} of ${total} users`,
            onChange(page, pageSize) {
              handleTableChange(
                { ...tableParams.pagination, current: page },
                {},
                {}
              );
            },
          }}
          dataSource={data.data}
          scroll={{ x: 900 }}
        />
      </ConfigProvider>
      <Modal
        title={t("Change Role")}
        open={isModalOpen}
        onOk={() => {
          form.submit();
        }}
        onCancel={handleCancel}
        okButtonProps={{
          className: "bg-blue-500",
          loading: loading,
          disabled: loading,
        }}
        okText={t("Update")}
        cancelText={t("Cancel")}
      >
        <Form
          layout="vertical"
          requiredMark
          form={form}
          onFinish={handleUpdateRole}
        >
          <Form.Item
            name="role"
            label={t("Role")}
            rules={[{ required: true, message: t("Please select role") }]}
          >
            <Select
              placeholder={t("Select role")}
              defaultValue={current?.level?.role}
              options={[
                {
                  label: t("Select role"),
                  value: "",
                },
                { label: t("User"), value: "user" },
                { label: t("District Manager"), value: "manager" },
                { label: t("NLA Admin"), value: "admin" },
              ]}
            />
          </Form.Item>

          {roleValue === "manager" ? (
            <>
              <Form.Item
                name="district"
                label={t("District")}
                rules={[
                  { required: true, message: t("Please select district") },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t("Select district")}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  options={[
                    {
                      label: t("Select district"),
                      value: "",
                    },
                    ...Address.getDistricts().map((item) => ({
                      label: item.name,
                      value: item.id,
                    })),
                  ]}
                />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>

      <Modal
        title={t("Suspend Account")}
        open={isSuspendModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsSuspendModalOpen(false)}
        okButtonProps={{ danger: true }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSuspend}
        >
          <Form.Item
            name="reason"
            label={t("Suspension Reason")}
            rules={[
              { required: true, message: t("Please provide suspension reason") },
              { min: 10, message: t("Reason must be at least 10 characters") },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListUsers;
