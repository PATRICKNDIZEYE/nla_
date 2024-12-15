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
  Badge
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
import dayjs from 'dayjs';
import { districts } from "@/utils/constants/districts";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ListInvitations = () => {
  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);
  const userRole = user?.level?.role ?? "user";
  const { data, loading } = useAppSelector((state) => state.invitation);
  const { search, debouncedSearch, setSearch } = useSearch();
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [letterForm] = Form.useForm();
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<IInvitation | null>(null);
  const [documentForm] = Form.useForm();

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
      const values = await letterForm.validateFields();
      await dispatch(generateInvitationLetter({ 
        invitationId: selectedInvitation?._id, 
        ...values 
      }));
      toast.success(t("Invitation letter generated successfully"));
      setIsLetterModalVisible(false);
      letterForm.resetFields();
    } catch (error) {
      toast.error(t("Failed to generate invitation letter"));
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
      const values = await documentForm.validateFields();
      await dispatch(shareDocuments({ 
        invitationId: selectedInvitation?._id, 
        ...values 
      }));
      toast.success(t("Documents shared successfully"));
      setIsDocumentModalVisible(false);
      documentForm.resetFields();
    } catch (error) {
      toast.error(t("Failed to share documents"));
    }
  };

  const fetchData = () => {
    dispatch(
      getAllInvitations({
        ...tableParams,
        search: debouncedSearch,
        userId: user?.level?.isSwitch ? user._id : undefined,
        district: selectedDistrict || (getEffectiveRole(user) === "manager" ? user?.level?.district : undefined),
        dateFrom: dateRange[0]?.toISOString(),
        dateTo: dateRange[1]?.toISOString(),
      })
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), debouncedSearch, user, dateRange, selectedDistrict]);

  const columns: ColumnsType<IInvitation> = [
    {
      title: t("Date Time"),
      dataIndex: "dateTime",
      key: "dateTime",
      render: (_, record) => new Date(record.dateTime).toLocaleString(),
      sorter: true,
    },
    {
      title: t("Location"),
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      filters: data.data
        .map((item) => item.location)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((location) => ({ text: location, value: location })),
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
      sorter: true,
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
            <>
              <Tooltip title={t("Cancel Invitation")}>
                <Popconfirm
                  title={t("Are you sure you want to cancel this invitation?")}
                  onConfirm={() => handleCancelInvitation(record.id)}
                  okText={t("Yes")}
                  cancelText={t("No")}
                >
                  <Button type="link" danger>
                    {t("Cancel")}
                  </Button>
                </Popconfirm>
              </Tooltip>
              
              <Tooltip title={t("Generate Invitation Letter")}>
                <Button 
                  type="link" 
                  icon={<FileTextOutlined />}
                  onClick={() => handleGenerateInvitationLetter(record)}
                >
                  {t("Letter")}
                </Button>
              </Tooltip>

              <Tooltip title={t("Assign Defendant")}>
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAssignDefendant(record)}
                >
                  {t("Assign")}
                </Button>
              </Tooltip>

              <Tooltip title={t("Share Documents")}>
                <Button
                  type="link"
                  icon={<UploadOutlined />}
                  onClick={() => handleShareDocuments(record)}
                >
                  {t("Share")}
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
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
        <RangePicker
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
          className="min-w-[250px]"
        />
        {(userRole === "admin" || userRole === "superadmin") && (
          <Select
            placeholder={t("Select District")}
            allowClear
            className="min-w-[200px]"
            onChange={setSelectedDistrict}
            value={selectedDistrict}
          >
            {/* District options would be populated from your districts data */}
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
          onChange={handleTableChange}
        />
      </ConfigProvider>

      <Modal
        title={t("Generate Invitation Letter")}
        open={isLetterModalVisible}
        onOk={handleLetterSubmit}
        onCancel={() => setIsLetterModalVisible(false)}
        width={600}
      >
        <Form
          form={letterForm}
          layout="vertical"
        >
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

          <Form.Item
            name="meetingDate"
            label={t("Meeting Date")}
            rules={[{ required: true, message: t("Please select meeting date") }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            name="venue"
            label={t("Venue")}
            rules={[{ required: true, message: t("Please enter venue") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="additionalNotes"
            label={t("Additional Notes")}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("Share Documents")}
        open={isDocumentModalVisible}
        onOk={handleDocumentSubmit}
        onCancel={() => setIsDocumentModalVisible(false)}
        width={600}
      >
        <Form
          form={documentForm}
          layout="vertical"
        >
          <Form.Item
            name="documents"
            label={t("Documents")}
            rules={[{ required: true, message: t("Please upload at least one document") }]}
          >
            <Upload
              accept=".pdf"
              multiple
              beforeUpload={() => false}
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
            <TextArea rows={4} placeholder={t("Add a message for the recipients")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListInvitations;
