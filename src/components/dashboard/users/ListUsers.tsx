import React, { useEffect, useState } from "react";
import { ConfigProvider, Form, Input, Modal, Select, Table, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { IAuthRegister } from "@/@types/auth.type";
import { changeUserLevel, getAllUsers } from "@/redux/features/user/user.slice";
import Link from "next/link";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { clearUser } from "@/redux/features/user/user.slice";
import { useSearch } from "@/components/hooks/search";
import { useTranslation } from "react-i18next";
import Address from "@/utils/lib/address";
import { toast } from "react-toastify";

const { Search } = Input;

const ListUsers: React.FC = () => {
  const {
    data: { level },
  } = useAppSelector((state) => state.profile);
  const [current, setCurrent] = useState<IAuthRegister | null>(null);
  const [form] = Form.useForm();
  const roleValue = Form.useWatch("role", form);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
  ];

  const handleFinish = async (values: any) => {
    try {
      const district = Address.getDistrict(values.district);
      if (district) {
        values.district = district.name;
      }
      const { message } = await dispatch(
        changeUserLevel({ ...values, userId: current?._id })
      ).unwrap();
      toast.success(message);
      setIsModalOpen(false);
      form.resetFields();
      setCurrent(null);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

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
          onFinish={handleFinish}
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
    </>
  );
};

export default ListUsers;
