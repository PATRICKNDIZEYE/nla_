import React, { useEffect, useState } from "react";
import { 
  ConfigProvider, 
  Input, 
  Popconfirm, 
  Space, 
  Table, 
  Tag, 
  DatePicker, 
  Button, 
  Select, 
  Form,
  Modal,
  Upload,
  Tooltip,
  Badge,
  Row,
  Col,
  message
} from "antd";
import { UploadOutlined, UserAddOutlined, FileTextOutlined, MessageOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { IInvitation } from "@/models/Invitation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  cancelInvitation,
  getAllInvitations,
  resetState,
  generateInvitationLetter,
  assignDefendant,
  shareDocuments,
} from "@/redux/features/invitation.slice";
import { useSearch } from "@/components/hooks/search";
import { TableParams } from "@/@types/pagination";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getEffectiveRole, shouldShowAdminContent, canAccessContent } from "@/utils/helpers/roleCheck";
import dayjs, { Moment } from 'dayjs';
import { districts } from "@/utils/constants/districts";
import { formatPhoneNumber } from "@/utils/helpers/formatPhoneNumber";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ListInvitations = () => {
  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);
  const userRole = user?.level?.role;
  const { data, loading: fetchLoading } = useAppSelector((state) => state.invitation);
  const { search, debouncedSearch, setSearch } = useSearch();
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [letterForm] = Form.useForm();
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<IInvitation | null>(null);
  const [documentForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState<Record<string, boolean>>({});

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

  const handleGenerateInvitationLetter = async (record: IInvitation) => {
    setSelectedInvitation(record);
    setIsLetterModalVisible(true);
  };

  const handleLetterSubmit = async () => {
    try {
      setLetterLoading(true);
      const values = await letterForm.validateFields();
      
      const formattedDate = dayjs(values.meetingDate).format('YYYY-MM-DD HH:mm');
      
      await dispatch(generateInvitationLetter({ 
        invitationId: selectedInvitation?._id,
        letterType: values.letterType,
        language: values.language,
        meetingDate: formattedDate,
        district: values.district,
        venue: values.venue,
        duration: values.duration,
        agenda: values.agenda,
        additionalNotes: values.additionalNotes,
        requiredDocuments: values.requiredDocuments,
      })).unwrap();

      toast.success(t("Invitation letter generated successfully"));
      setIsLetterModalVisible(false);
      letterForm.resetFields();
    } catch (error) {
      toast.error(t("Failed to generate invitation letter"));
      console.error("Letter generation error:", error);
    } finally {
      setLetterLoading(false);
    }
  };

  const handleAssignDefendant = async (record: IInvitation) => {
    try {
      await dispatch(assignDefendant({ invitationId: record._id }));
      toast.success(t("Defendant assigned and welcome message sent successfully"));
      fetchData();
    } catch (error) {
      toast.error(t("Failed to assign defendant"));
    }
  };

  const handleShareDocuments = async (record: IInvitation) => {
    setSelectedInvitation(record);
    setIsDocumentModalVisible(true);
  };

  const handleDocumentSubmit = async () => {
    try {
      setDocumentLoading(true);
      const values = await documentForm.validateFields();
      
      const files = values.documents?.fileList || [];
      const hasLargeFile = files.some(file => file.size > 10 * 1024 * 1024);
      
      if (hasLargeFile) {
        toast.error(t("File size should not exceed 10MB"));
        return;
      }

      const hasInvalidFile = files.some(file => !file.type.includes('pdf'));
      if (hasInvalidFile) {
        toast.error(t("Only PDF files are allowed"));
        return;
      }

      await handleShareDocuments({
        invitationId: selectedInvitation?._id,
        documents: files,
        recipientType: values.recipientType,
        message: values.message
      });

      setIsDocumentModalVisible(false);
      documentForm.resetFields();
      toast.success(t("Documents shared successfully"));
    } catch (error) {
      toast.error(t("Failed to share documents"));
      console.error("Document sharing error:", error);
    } finally {
      setDocumentLoading(false);
    }
  };

  const fetchData = () => {
    console.log('Current user role:', userRole);

    const queryParams = {
      ...tableParams,
      search: debouncedSearch,
      dateFrom: dateRange?.[0]?.toISOString(),
      dateTo: dateRange?.[1]?.toISOString(),
      userId: user?._id,
      role: userRole
    };

    console.log('Fetching invitations with params:', queryParams);
    dispatch(getAllInvitations(queryParams));
  };

  useEffect(() => {
    if (user?._id && userRole) {
      fetchData();
    }
  }, [JSON.stringify(tableParams), debouncedSearch, user?._id, userRole, dateRange]);

  const handleDateRangeChange = (dates: [Moment, Moment]) => {
    setDateRange(dates);
    // Apply filter to your data here
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      setLoadingInvitations(prev => ({ ...prev, [invitationId]: true }));
      await dispatch(cancelInvitation(invitationId)).unwrap();
      message.success(t('Invitation cancelled successfully'));
      fetchData();
    } catch (error: any) {
      message.error(error.message || t('Failed to cancel invitation'));
    } finally {
      setLoadingInvitations(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const columns: ColumnsType<IInvitation> = [
    {
      title: t("Date Time"),
      dataIndex: "dateTime",
      key: "dateTime",
      render: (_, record) => new Date(record.dateTime).toLocaleString(),
      sorter: true,
      width: 180,
      ellipsis: true,
    },
    {
      title: t("Location"),
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      width: 150,
      filters: data.data
        .map((item) => item.location)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((location) => ({ text: location, value: location })),
    },
    {
      title: t("Case ID"),
      dataIndex: "claimId",
      render: (_, record) => `${
        Array.isArray(record?.dispute)
          ? record?.dispute[0].claimId
          : record.dispute.claimId ?? ""
      }`,
      sorter: true,
      width: 120,
      ellipsis: true,
    },
    {
      title: t("Invitees"),
      dataIndex: "invitees",
      key: "invitees",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.invitees.map((invitee) => (
            <Tag key={invitee} className="uppercase mb-1">
              {invitee}
            </Tag>
          ))}
        </div>
      ),
      width: 200,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      width: 150,
      ellipsis: true,
    },
    {
      title: t("Status"),
      dataIndex: "isCanceled",
      render: (isCanceled: boolean) => {
        return (
          <Tag color={isCanceled ? "red" : "gold"}>
            {t(isCanceled ? "CANCELLED" : "PENDING")}
          </Tag>
        );
      },
      filters: [
        { text: t("Pending"), value: false },
        { text: t("Cancelled"), value: true }
      ],
      onFilter: (value: boolean, record) => record.isCanceled === value,
      width: 120,
    },
    {
      title: t("Actions"),
      key: "actions",
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small" className="whitespace-nowrap">
          <Button
            type="link"
            onClick={() => handleGenerateInvitationLetter(record)}
            className="p-0"
          >
            {t('Generate Letter')}
          </Button>
          
          {record.isCanceled !== true && (
            <Popconfirm
              title={t("Are you sure you want to cancel this invitation?")}
              onConfirm={() => handleCancelInvitation(record._id)}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button
                type="link"
                danger
                loading={loadingInvitations[record._id]}
                className="p-0"
              >
                {t('Cancel')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (["manager", "admin"].includes(userRole)) {
    columns.push({
      title: t("Action"),
      key: "action",
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          {shouldShowAdminContent(user) && (
            <>
              <Tooltip title={t("Assign Defendant")}>
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  size="small"
                  onClick={() => handleAssignDefendant(record)}
                >
                  {t("Assign")}
                </Button>
              </Tooltip>

              <Tooltip title={t("Share Documents")}>
                <Button
                  type="link"
                  icon={<UploadOutlined />}
                  size="small"
                  onClick={() => handleShareDocuments(record)}
                >
                  {t("Share")}
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    });
  }

  const showDistrictSelect = (user?.level?.role === "admin" || user?.level?.role === "manager") && 
                           !user?.level?.isSwitch;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Search
          placeholder={t("Search invitation...")}
          loading={fetchLoading}
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
        <RangePicker
          onChange={handleDateRangeChange}
          format="YYYY-MM-DD"
          className="w-full"
        />
        {showDistrictSelect && (
          <Select
            placeholder={t("Select District")}
            allowClear
            className="w-full"
            onChange={setSelectedDistrict}
            value={selectedDistrict}
            disabled={user?.level?.role === "manager" && !selectedDistrict}
          >
            {districts.map((district) => (
              <Select.Option key={district.name} value={district.name.toLowerCase()}>
                {district.name}
              </Select.Option>
            ))}
          </Select>
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
          rowKey={(record) => `${record._id}`}
          loading={fetchLoading}
          pagination={{
            position: ["bottomRight"],
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
          scroll={{ x: 1200 }}
          className="overflow-x-auto"
          onChange={handleTableChange}
          sticky
        />
      </ConfigProvider>

      <Modal
        title={t("Generate Invitation Letter")}
        open={isLetterModalVisible}
        onOk={handleLetterSubmit}
        onCancel={() => {
          setIsLetterModalVisible(false);
          letterForm.resetFields();
        }}
        width={800}
        confirmLoading={letterLoading}
      >
        <Form
          form={letterForm}
          layout="vertical"
          initialValues={{
            letterType: 'first',
            language: 'rw', // Default to Kinyarwanda
            district: user?.level?.district
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="letterType"
                label={t("Letter Type")}
                rules={[{ required: true, message: t("Please select letter type") }]}
              >
                <Select>
                  <Select.Option value="first">{t("First Invitation")}</Select.Option>
                  <Select.Option value="reminder">{t("Reminder")}</Select.Option>
                  <Select.Option value="final">{t("Final Notice")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="language"
                label={t("Letter Language")}
                rules={[{ required: true, message: t("Please select language") }]}
              >
                <Select>
                  <Select.Option value="rw">{t("Kinyarwanda")}</Select.Option>
                  <Select.Option value="en">{t("English")}</Select.Option>
                  <Select.Option value="fr">{t("French")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="meetingDate"
                label={t("Meeting Date & Time")}
                rules={[{ required: true, message: t("Please select meeting date and time") }]}
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="district"
                label={t("District")}
                rules={[{ required: true, message: t("Please select district") }]}
              >
                <Select disabled={userRole === "manager"}>
                  {districts.map((district) => (
                    <Select.Option key={district.name} value={district.name}>
                      {district.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="venue"
                label={t("Venue")}
                rules={[{ required: true, message: t("Please enter venue") }]}
              >
                <Input placeholder={t("Enter meeting venue")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label={t("Expected Duration")}
                rules={[{ required: true, message: t("Please enter expected duration") }]}
              >
                <Select>
                  <Select.Option value="30">{t("30 minutes")}</Select.Option>
                  <Select.Option value="60">{t("1 hour")}</Select.Option>
                  <Select.Option value="90">{t("1.5 hours")}</Select.Option>
                  <Select.Option value="120">{t("2 hours")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="agenda"
            label={t("Meeting Agenda")}
            rules={[{ required: true, message: t("Please enter meeting agenda") }]}
          >
            <TextArea 
              rows={3} 
              placeholder={t("Enter the main points to be discussed")}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="additionalNotes"
            label={t("Additional Notes")}
          >
            <TextArea 
              rows={3} 
              placeholder={t("Any additional information for the invitees")}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="requiredDocuments"
            label={t("Required Documents")}
          >
            <Select mode="multiple" placeholder={t("Select documents invitees should bring")}>
              <Select.Option value="id">{t("National ID")}</Select.Option>
              <Select.Option value="landTitle">{t("Land Title")}</Select.Option>
              <Select.Option value="powerOfAttorney">{t("Power of Attorney")}</Select.Option>
              <Select.Option value="proofOfOwnership">{t("Proof of Ownership")}</Select.Option>
              <Select.Option value="other">{t("Other Supporting Documents")}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("Share Documents")}
        open={isDocumentModalVisible}
        onOk={handleDocumentSubmit}
        onCancel={() => setIsDocumentModalVisible(false)}
        width={600}
        confirmLoading={documentLoading}
      >
        <Form
          form={documentForm}
          layout="vertical"
        >
          <Form.Item
            name="documents"
            label={t("Documents")}
            rules={[
              { required: true, message: t("Please upload at least one document") },
              {
                validator: (_, fileList) => {
                  if (fileList?.fileList?.length > 5) {
                    return Promise.reject(t("Maximum 5 documents allowed"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Upload
              accept=".pdf"
              multiple
              beforeUpload={() => false}
              maxCount={5}
            >
              <Button icon={<UploadOutlined />}>{t("Upload PDF Documents")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="recipientType"
            label={t("Share With")}
            rules={[{ required: true, message: t("Please select recipients") }]}
          >
            <Select mode="multiple">
              <Select.Option value="committee">{t("Ad Hoc Committee")}</Select.Option>
              <Select.Option value="defendant">{t("Defendant")}</Select.Option>
              <Select.Option value="plaintiff">{t("Plaintiff")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label={t("Message")}
          >
            <TextArea 
              rows={4} 
              placeholder={t("Add a message for the recipients")}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListInvitations;
