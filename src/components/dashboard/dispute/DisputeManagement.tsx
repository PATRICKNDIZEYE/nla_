import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tour,
  Upload,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSearch } from "@/components/hooks/search";
import { TableParams } from "@/@types/pagination";
import {
  ExpandableConfig,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import {
  clearDispute,
  getAllDisputes,
  updateStatus,
} from "@/redux/features/dispute/dispute.slice";
import { IDispute } from "@/@types/dispute.type";
import { formatPhoneNumber } from "@/utils/helpers/function";
import StatusFilter from "./filter/StatusFilter";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { createInvitation } from "@/redux/features/invitation.slice";
import { useTranslation } from "react-i18next";
import { useSystemTour } from "@/components/hooks/tour";
import { useRouter } from "next/router";
import TableSingleCaseView from "./single/TableSingleCaseView";

const { Search } = Input;

const defaultExpandable: ExpandableConfig<IDispute> = {
  expandedRowRender: (record: IDispute) => (
    <div className="bg-white rounded px-3 py-2">
      <TableSingleCaseView singleData={record} />
    </div>
  ),
};

const CaseManagement = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [invitationForm] = Form.useForm();
  const [emailsForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [appealFrom] = Form.useForm();
  const { data: user } = useAppSelector((state) => state.profile);
  const userRole = user?.level?.role ?? "user";
  const params = useSearchParams();
  const { data, loading, error } = useAppSelector((state) => state.dispute);
  const { search, debouncedSearch, setSearch } = useSearch();
  const dispatch = useAppDispatch();

  console.log('Current Redux State:', { data, loading, error });
  console.log('Current User:', { user, userRole });

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<IDispute>
  ) => {
    console.log('Table params changing:', { pagination, filters, sorter });
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
    if (!user) {
      console.log('No user found, skipping fetch');
      return;
    }
    const fetchParams = {
      ...tableParams,
      search: debouncedSearch,
      status: tableParams.status ?? params.get("status")?.toString(),
      userId: user?._id,
      role: userRole,
      level: tableParams.level ?? params.get("level")?.toString(),
    };
    console.log('Fetching disputes with params:', fetchParams);
    
    dispatch(getAllDisputes(fetchParams))
      .then((result: any) => {
        console.log('Disputes fetch result:', result);
        console.log('Payload data:', result.payload?.data);
        if (result.error) {
          console.error('Error in result:', result.error);
          toast.error(t('Failed to fetch disputes'));
        }
      })
      .catch((error) => {
        console.error('Error fetching disputes:', error);
        toast.error(t('Failed to fetch disputes'));
      });
  };

  useEffect(() => {
    console.log('Effect triggered with:', {
      tableParams,
      debouncedSearch,
      userId: user?._id
    });
    fetchData();
  }, [JSON.stringify(tableParams), debouncedSearch, user]);

  useEffect(() => {
    if (user?.level?.isSwitch !== undefined) {
      console.log('Switch mode changed, clearing disputes');
      dispatch(clearDispute());
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: 1,
        },
      }));
    }
  }, [user?.level?.isSwitch, dispatch]);

  const onUpdateStatus = (
    status: "processing" | "rejected" | "resolved" | "withdrawn",
    disputeId: string
  ) => {
    let instance: any;
    const onFinish = async (values?: any) => {
      try {
        const { message } = await dispatch(
          updateStatus({
            status,
            disputeId,
            userId: user?._id!,
            feedback: values?.feedback,
            stampedLetter: values?.stampedLetter?.file?.originFileObj,
          })
        ).unwrap();
        toast.success(`${t(`${message}` as any)}`);
        statusForm.resetFields();
        instance?.destroy();
      } catch (error: any) {
        toast.error(`${t(`${error.message}` as any)}`);
      }
    };

    if (status === "processing") {
      onFinish();
      return;
    }

    instance = Modal.confirm({
      title: t("Update Status"),
      content: (
        <Form
          onFinish={onFinish}
          className="mt-4"
          layout="vertical"
          initialValues={{
            status,
          }}
          form={statusForm}
        >
          <Form.Item label={t("Status")} name="status">
            <Input readOnly disabled className="uppercase" />
          </Form.Item>
          {["rejected", "resolved", "withdrawn"].includes(status) && (
            <Form.Item
              name="stampedLetter"
              label={t("Stamped or Signed Letter")}
              rules={[
                {
                  required: true,
                  message: t("Please upload letter"),
                },
              ]}
            >
              <Upload
                listType="text"
                multiple={false}
                maxCount={1}
                accept=".pdf"
              >
                <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
              </Upload>
            </Form.Item>
          )}
          <Form.Item
            label={status === "rejected" ? t("Reject Reason") : t("Feedback")}
            name="feedback"
          >
            <Input.TextArea placeholder={t("Enter feedback")} />
          </Form.Item>
        </Form>
      ),
      closable: true,
      okButtonProps: {
        className: "bg-blue-500",
        loading: loading,
        disabled: loading,
        onClick: (event) => {
          event.preventDefault();
          statusForm.submit();
          return;
        },
      },
      okText: t("Update"),
    });
  };

  const onAppeal = (dispute: IDispute) => {
    let instance: any;
    const onFinish = async (values?: any) => {
      try {
        const { message } = await dispatch(
          updateStatus({
            status: "appealed",
            disputeId: dispute._id!,
            userId: user?._id!,
            feedback: values?.feedback,
          })
        ).unwrap();
        toast.success(`${t(`${message}` as any)}`);
        appealFrom.resetFields();
        instance?.destroy();
      } catch (error: any) {
        toast.error(`${t(`${error.message}` as any)}`);
      }
    };

    instance = Modal.confirm({
      title: t("Appeal"),
      content: (
        <Form
          onFinish={onFinish}
          className="mt-4"
          layout="vertical"
          initialValues={{
            status: "appealed",
          }}
          form={appealFrom}
        >
          <Form.Item label="Status" name="status">
            <Input readOnly disabled className="uppercase" />
          </Form.Item>
          <Form.Item label={t("Appeal Reason")} name="feedback">
            <Input.TextArea placeholder={t("Enter feedback")} />
          </Form.Item>
        </Form>
      ),
      closable: true,
      okButtonProps: {
        className: "bg-blue-500",
        loading: loading,
        disabled: loading,
        onClick: (event) => {
          event.preventDefault();
          appealFrom.submit();
          return;
        },
      },
      okText: "Appeal",
    });
  };

  const onSendEmails = () => {
    const instance = Modal.confirm({
      title: "Ohereza Imeri ku kanama",
      content: (
        <Form
          form={emailsForm}
          onFinish={async (values) => {
            try {
              // const { message } = await dispatch(
              //   createInvitation({
              //     invitees: values.invitees,
              //     invitedBy: user?._id!,
              //     dispute: dispute._id!,
              //     dateTime: values.dateTime,
              //     location: values.location,
              //   })
              // ).unwrap();
              // toast.success(message);
              emailsForm.resetFields();
              instance?.destroy();
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          className="mt-4"
          layout="vertical"
        >
          <Form.Item
            label={t("Email")}
            name="email"
            rules={[{ required: true, message: t("Please enter email") }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </Form>
      ),

      closable: true,
      okButtonProps: {
        className: "bg-blue-500",
        loading: loading,
        disabled: loading,
        onClick: (event) => {
          event.preventDefault();
          emailsForm.submit();
          return;
        },
      },
      okText: t("Send"),
    });
  };

  const onInvite = (dispute: IDispute) => {
    const instance = Modal.confirm({
      title: "Create Invitation",
      content: (
        <Form
          form={invitationForm}
          onFinish={async (values) => {
            try {
              const { message } = await dispatch(
                createInvitation({
                  invitees: values.invitees,
                  invitedBy: user?._id!,
                  dispute: dispute._id!,
                  dateTime: values.dateTime,
                  location: values.location,
                })
              ).unwrap();
              toast.success(message);
              invitationForm.resetFields();
              instance?.destroy();
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          className="mt-4"
          layout="vertical"
          initialValues={{
            invitees: ["claimant", "defendant", "witnesses"],
            location: `${dispute.land?.districtName} District Office`,
          }}
        >
          <Form.Item label="Case ID">
            <Input defaultValue={dispute.claimId} readOnly disabled />
          </Form.Item>

          <Form.Item
            label={t("Location")}
            name="location"
            rules={[{ required: true, message: t("Please input location") }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>
          <Form.Item
            name="dateTime"
            label={t("Date & Time")}
            rules={[{ required: true, message: t("Please input date & time") }]}
          >
            <Input
              type="datetime-local"
              min={new Date().toISOString().split(".")[0]}
            />
          </Form.Item>

          <Form.Item
            name="invitees"
            label={t("Invitees")}
            rules={[{ required: true, message: t("Please add invitees") }]}
          >
            <Checkbox.Group
              options={[
                {
                  label: t("Claimant"),
                  value: "claimant",
                },
                {
                  label: t("Defendant"),
                  value: "defendant",
                },
                {
                  label: t("Witnesses"),
                  value: "witnesses",
                },
              ]}
            />
          </Form.Item>
        </Form>
      ),

      closable: true,
      okButtonProps: {
        className: "bg-blue-500",
        loading: loading,
        disabled: loading,
        onClick: (event) => {
          event.preventDefault();
          invitationForm.submit();
          return;
        },
      },
      okText: t("Invite"),
    });
  };

  const columns: ColumnsType<IDispute> = [
    {
      title: t("Case ID"),
      dataIndex: "caseNumber",
      ellipsis: true,
      render: (_, record) => (
        <Link href={`/dispute/${record._id}`}>{record.claimId}</Link>
      ),
    },
    {
      title: t("Names"),
      dataIndex: ["claimant", "profile", "Surnames"],
      render: (_, record) => (
        <Link href={`/dispute/${record._id}`}>
          {record.claimant?.profile?.Surnames ?? ""}{" "}
          {record.claimant?.profile?.ForeName ?? ""}
        </Link>
      ),
      ellipsis: true,
    },
    // {
    //   title: t("Phone Number"),
    //   dataIndex: ["claimant", "phoneNumber"],
    //   render: (phoneNumber: string) => (
    //     <p className="text-gray-900 ">{formatPhoneNumber(`0${phoneNumber}`)}</p>
    //   ),
    // },
    // {
    //   title: t("National ID"),
    //   dataIndex: ["claimant", "nationalId"],
    //   render: (nationalId: string) => (
    //     <p className="text-gray-900 ">{nationalId}</p>
    //   ),
    // },
    // {
    //   title: t("Dispute Type"),
    //   dataIndex: "disputeType",
    //   ellipsis: true,
    //   render: (_, record) => (
    //     <Link className="text-blue-500" href={`/dispute/${record._id}`}>
    //       {record.disputeType}
    //     </Link>
    //   ),
    // },
    {
      title: t("UPI Number"),
      dataIndex: "upiNumber",
    },
    // {
    //   title: t("Parcel Address"),
    //   dataIndex: "land.",
    //   render: (_, record) => <span>{record.land?.address?.string ?? ""}</span>,
    //   ellipsis: true,
    // },

    {
      title: t("Status"),
      key: "status",
      dataIndex: "status",
      render: (status: string, record) => (
        <>
          <Tag
            color={
              status === "opened"
                ? "green"
                : ["closed", "rejected"].includes(status)
                ? "red"
                : status === "appealed"
                ? "orange"
                : "blue"
            }
            className="uppercase"
          >
            {t(`${status}` as any)}
          </Tag>
          {(record.overdueDays ?? 0) > 0 && (
            <Tag color="#f50">
              {t("Overdue")} {record.overdueDays} {t("days")}
            </Tag>
          )}
        </>
      ),
      // width: 100,
    },
    {
      title: t("Submitted At"),
      dataIndex: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {userRole === "user" &&
            ["resolved", "rejected"].includes(record.status!) && (
              <button
                disabled={loading || record.level === "nla"}
                onClick={() => onAppeal(record)}
                className="disabled:cursor-not-allowed disabled:opacity-70 text-blue-500 hover:underline"
                type="button"
              >
                {record.level === "district" ? "Appeal" : "Appealed"}
              </button>
            )}
          {["manager", "admin"].includes(userRole) && (
            <>
              {record.status === "processing" &&
                ((userRole === "admin" && record.level === "nla") ||
                  (userRole === "manager" && record.level === "district")) && (
                  <button
                    disabled={loading}
                    onClick={() => onInvite(record)}
                    className="disabled:cursor-not-allowed disabled:opacity-70 text-blue-500 hover:underline"
                    type="button"
                  >
                    {t("Invite")}
                  </button>
                )}
              {["open", "appealed"].includes(record.status!) &&
                ((userRole === "admin" && record.level === "nla") ||
                  (userRole === "manager" && record.level === "district")) && (
                  <Popconfirm
                    title="Open the dispute"
                    description="Are you sure to process this dispute?"
                    onConfirm={() => onUpdateStatus("processing", record._id!)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                      loading,
                      disabled: loading,
                      className: "bg-brand-green",
                    }}
                    placement="bottomRight"
                  >
                    <button
                      disabled={loading}
                      className="disabled:cursor-not-allowed disabled:opacity-70 text-brand-green hover:underline"
                      type="button"
                    >
                      {t("Process")}
                    </button>
                  </Popconfirm>
                )}

              {record.status === "processing" &&
                ((userRole === "admin" && record.level === "nla") ||
                  (userRole === "manager" && record.level === "district")) && (
                  <button
                    disabled={loading}
                    onClick={() => onUpdateStatus("resolved", record._id!)}
                    className="disabled:cursor-not-allowed disabled:opacity-70 text-brand-green hover:underline"
                    type="button"
                  >
                    {t("Resolve")}
                  </button>
                )}
              {["open", "appealed"].includes(record.status!) &&
                ((userRole === "admin" && record.level === "nla") ||
                  (userRole === "manager" && record.level === "district")) && (
                  <button
                    disabled={loading}
                    onClick={() => onUpdateStatus("rejected", record._id!)}
                    className="disabled:cursor-not-allowed disabled:opacity-70 text-red-500 hover:underline"
                    type="button"
                  >
                    {t("Reject")}
                  </button>
                )}
            </>
          )}
          {userRole === "user" && (
            <button
              onClick={onSendEmails}
              className="text-brand-gray hover:underline"
              type="button"
              disabled={loading}
            >
              {t("Email")}
            </button>
          )}
          {userRole === "user" &&
            ["open", "appealed"].includes(record.status!) && (
              <button
                onClick={() => onUpdateStatus("withdrawn", record._id!)}
                className="text-red-500 hover:underline"
                type="button"
                disabled={loading}
              >
                {t("Withdraw")}
              </button>
            )}
        </Space>
      ),
    },
  ];

  const systemTour = useSystemTour();

  const [showTour, setShowTour] = React.useState(true);

  return (
    <>
      <div className="flex items-center mb-4 gap-2">
        <Search
          placeholder={t("Search dispute...")}
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
            console.log('Status filter changed:', value);
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
        />
        {!["manager", "admin"].includes(userRole) && (
          <Button
            type="primary"
            className="bg-blue-500"
            icon={<PlusOutlined />}
            onClick={() => router.push("/dispute/new")}
          >
            {t("New Case")}
          </Button>
        )}
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
          rowKey={(record) => record._id}
          loading={loading}
          dataSource={data?.data || []}
          pagination={{
            position: ["none", "bottomRight"],
            pageSize: tableParams.pagination?.pageSize,
            current: tableParams.pagination?.current,
            total: data?.pagination?.totalItems || 0,
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
          scroll={{ x: 1200 }}
          className="whitespace-nowrap"
          expandable={defaultExpandable}
          locale={{
            emptyText: loading ? t('Loading...') : error ? t('Error loading disputes') : t('No disputes found')
          }}
        />
      </ConfigProvider>
      {error && (
        <div className="text-red-500 mt-4">
          {t('Error')}: {error}
        </div>
      )}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({
            loading,
            error,
            dataLength: data?.data?.length,
            totalItems: data?.pagination?.totalItems,
            userRole,
            tableParams
          }, null, 2)}
        </pre>
      </div>
    </>
  );
};

export default CaseManagement;
