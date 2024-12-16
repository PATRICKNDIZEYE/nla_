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
  Tooltip,
  Row,
  Col,
  Select
} from "antd";
import { PlusOutlined, UploadOutlined, EditOutlined, LockOutlined } from "@ant-design/icons";
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
  getDisputeById,
  updateDispute
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
import { canEditCase } from '@/utils/helpers/permissionHelpers';

const { Search } = Input;

const defaultExpandable: ExpandableConfig<IDispute> = {
  expandedRowRender: (record: IDispute) => (
    <div className="bg-white rounded px-3 py-2">
      <TableSingleCaseView singleData={record} />
    </div>
  ),
};

type CaseStatus = "processing" | "rejected" | "resolved" | "withdrawn" | "open";

const isEditable = (status: CaseStatus, userRole: string, createdBy: string, currentUserId: string) => {
  console.log('Checking edit permissions:', {
    status,
    userRole,
    createdBy,
    currentUserId,
    isAdmin: userRole === 'admin' || userRole === 'superadmin',
    isCreator: currentUserId === createdBy,
    isManager: userRole === 'manager',
    hasCreatorId: !!createdBy,
    hasCurrentUserId: !!currentUserId
  });

  // Super admin or admin can edit any case
  if (userRole === 'superadmin' || userRole === 'admin') {
    return true;
  }

  // Regular user can edit their own cases if:
  // 1. They created it (createdBy matches currentUserId) OR they are the claimant
  // 2. Status is not processing
  if (createdBy && currentUserId && currentUserId === createdBy && status !== 'processing') {
    return true;
  }

  // District manager can edit cases in their district except processing ones
  if (userRole === 'manager' && status !== 'processing') {
    return true;
  }

  return false;
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

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [editForm] = Form.useForm();

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

  const renderEditButton = (record: IDispute) => {
    // Extract createdBy ID, handling both object and string cases
    const createdById = record.createdBy?._id || record.createdBy || record.claimant?._id;
    
    console.log('Edit button data:', {
      status: record.status,
      userRole: user?.level?.role,
      createdBy: createdById,
      currentUserId: user?._id,
      record,
      claimantId: record.claimant?._id,
      fullRecord: record
    });

    const canEdit = isEditable(
      record.status as CaseStatus,
      user?.level?.role || 'user',
      createdById,
      user?._id
    );

    return (
      <Tooltip title={canEdit ? t("Edit Case") : t("Cannot edit case in current status")}>
        <Button
          type="link"
          icon={canEdit ? <EditOutlined /> : <LockOutlined />}
          onClick={() => canEdit && handleEdit(record)}
          disabled={!canEdit}
        >
          {t("Edit")}
        </Button>
      </Tooltip>
    );
  };

  const handleEdit = async (record: IDispute) => {
    try {
      // Fetch the latest dispute data
      const result = await dispatch(getDisputeById(record._id)).unwrap();
      const dispute = result.data;
      
      console.log('Fetched dispute data:', dispute);
      
      setSelectedCase(dispute);
      editForm.setFieldsValue({
        claimId: dispute.claimId,
        status: dispute.status,
        disputeType: dispute.disputeType,
        upiNumber: dispute.upiNumber,
        description: dispute.description,
        location: dispute.location || dispute.land?.address?.string,
        additionalNotes: dispute.additionalNotes,
        rejectionReason: dispute.rejectionReason,
        // Handle existing attachments if any
        attachments: dispute.attachments?.map(attachment => ({
          uid: attachment._id,
          name: attachment.name,
          status: 'done',
          url: attachment.url
        }))
      });

      // Add debug logging
      console.log('Form values set:', {
        formValues: editForm.getFieldsValue(),
        dispute,
        selectedCase: dispute
      });

      setIsEditModalVisible(true);
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      toast.error(t("Failed to load dispute details"));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      
      // Create FormData for the update
      const formData = new FormData();
      
      // Add basic fields
      formData.append('status', selectedCase.status); // Add current status
      formData.append('disputeType', values.disputeType);
      formData.append('upiNumber', values.upiNumber);
      formData.append('description', values.description);
      formData.append('location', values.location);
      if (values.additionalNotes) {
        formData.append('additionalNotes', values.additionalNotes);
      }

      // Handle file attachments
      if (values.attachments?.fileList) {
        const files = values.attachments.fileList;
        files.forEach((file: any) => {
          if (file.originFileObj) {
            // Check file size
            if (file.size > 10 * 1024 * 1024) {
              throw new Error(t("File size should not exceed 10MB"));
            }
            formData.append('attachments', file.originFileObj);
          }
        });
      }

      // Add debug logging
      console.log('Updating dispute with data:', {
        disputeId: selectedCase._id,
        userId: user?._id,
        status: selectedCase.status,
        values,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name}` : value
        }))
      });

      if (!user?._id) {
        throw new Error(t("User ID not found"));
      }

      await dispatch(updateDispute({
        disputeId: selectedCase._id,
        formData,
        userId: user._id
      })).unwrap();

      toast.success(t("Case updated successfully"));
      setIsEditModalVisible(false);
      editForm.resetFields();
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Case update error:", error);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(t("Failed to update case"));
      }
    }
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
          {renderEditButton(record)}
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
      <Modal
        title={t("Edit Case")}
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        width={800}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ status: selectedCase?.status }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="claimId"
                label={t("Case ID")}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t("Status")}
              >
                <Input disabled className="uppercase" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disputeType"
                label={t("Dispute Type")}
                rules={[{ required: true, message: t("Please select dispute type") }]}
              >
                <Select disabled={selectedCase?.status === "processing"}>
                  <Select.Option value="boundary">{t("Boundary Dispute")}</Select.Option>
                  <Select.Option value="ownership">{t("Ownership Dispute")}</Select.Option>
                  <Select.Option value="inheritance">{t("Inheritance Dispute")}</Select.Option>
                  <Select.Option value="other">{t("Other")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="upiNumber"
                label={t("UPI Number")}
                rules={[{ required: true, message: t("Please enter UPI number") }]}
              >
                <Input disabled={selectedCase?.status === "processing"} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t("Case Description")}
            rules={[{ required: true, message: t("Please enter case description") }]}
          >
            <Input.TextArea 
              rows={4} 
              disabled={selectedCase?.status === "processing"}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={t("Location")}
            rules={[{ required: true, message: t("Please enter location") }]}
          >
            <Input disabled={selectedCase?.status === "processing"} />
          </Form.Item>

          <Form.Item
            name="attachments"
            label={t("Documents")}
            extra={t("Only PDF files. Max 10MB per file")}
          >
            <Upload
              listType="text"
              multiple
              maxCount={5}
              accept=".pdf"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
            </Upload>
          </Form.Item>

          {selectedCase?.status === "rejected" && (
            <Form.Item
              name="rejectionReason"
              label={t("Rejection Reason")}
            >
              <Input.TextArea disabled rows={3} />
            </Form.Item>
          )}

          <Form.Item
            name="additionalNotes"
            label={t("Additional Notes")}
          >
            <Input.TextArea 
              rows={3} 
              maxLength={500}
              showCount
              placeholder={t("Any additional information about the case")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CaseManagement;
