import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Upload,
} from "antd";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { createDispute } from "@/redux/features/dispute/dispute.slice";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";

const AppealForm = () => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const { loading: loadingAuth } = useAppSelector((state) => state.auth);
  const {
    data: { singleData, data },
    loading,
  } = useAppSelector((state) => state.dispute);
  const [open, setOpen] = useState(false);
  const [land, setLand] = useState<ILandData>();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === "otherDocuments") {
          values[key].fileList.forEach((file: any) => {
            formData.append("attachments", file.originFileObj);
          });
        } else if (key === "letter") {
          formData.append("attachments", values[key].file.originFileObj);
        } else if (key === "witnesses") {
          formData.append("witnesses", JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key]);
        }
      });
      formData.append("land", JSON.stringify(land));
      const defendant = {
        fullName: values.defendantFullName,
        phoneNumber: values.defendantPhone,
      };
      formData.append("defendant", JSON.stringify(defendant));
      const { message } = await dispatch(createDispute(formData)).unwrap();
      toast.success(message);

      form.resetFields();
      onClose();
    } catch (error) {
      const { message } = error as Error;
      toast.error(message);
    }
  };

  return (
    <>
      <Button
        type="primary"
        className="bg-blue-500"
        onClick={showDrawer}
        icon={<PlusOutlined />}
      >
        New appeal
      </Button>
      <Drawer
        title="New appeal"
        width={720}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              form="form-case"
              className="bg-blue-500"
              disabled={loading || loadingAuth || !land}
              loading={loading}
              onClick={() => {
                form.submit();
              }}
            >
              Submit
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          requiredMark
          onFinish={onFinish}
          id="form-case"
          form={form}
        >
          <Divider orientation="left" orientationMargin="0">
            Dispute
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="dispute"
                label="Dispute"
                rules={[{ required: true, message: "Please select a dispute" }]}
              >
                <Select
                  showSearch
                  placeholder="Select a dispute"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").includes(input)
                  }
                  options={[
                    {
                      label: "Select a dispute",
                      value: "",
                    },
                    ...(data?.map((item) => ({
                      label: item.disputeType,
                      value: item._id,
                    })) ?? []),
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="notes"
                label="Notes"
                rules={[
                  {
                    required: true,
                    message: "Please enter notes",
                  },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Notes" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" orientationMargin="0">
            Requirements
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="letter"
                label="Letter"
                rules={[
                  {
                    required: true,
                    message: "Please upload letter",
                  },
                ]}
              >
                <Upload
                  listType="text"
                  multiple={false}
                  maxCount={1}
                  accept=".pdf,.docx"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="otherDocuments"
                label="Other Documents"
                rules={[
                  {
                    validator: async (_, value) => {
                      if (value && value.fileList.length > 5) {
                        return Promise.reject(
                          new Error("Maximum 5 documents are allowed")
                        );
                      }
                    },
                  },
                ]}
              >
                <Upload listType="text" multiple accept=".pdf,.docx">
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" orientationMargin="0">
            Witnesses
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.List
                name="witnesses"
                initialValue={[{ fullName: "", phoneNumber: "" }]}
                rules={[
                  {
                    validator: async (_, names) => {
                      if (!names || names.length < 2) {
                        return Promise.reject(
                          new Error("At least 2 witnesses are required")
                        );
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      return (
                        <React.Fragment key={`${key}-${name}`}>
                          <Space
                            align="baseline"
                            className="flex w-full mb-2 items-center"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "fullName"]}
                              label="Full Name"
                              rules={[
                                {
                                  required: true,
                                  message: "Missing full name",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Full Name"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label="Phone Number"
                              name={[name, "phoneNumber"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Missing phone number",
                                },
                                {
                                  pattern: new RegExp(/^(72|73|78|79)\d{7}$/),
                                  message: "Please enter a valid phone number",
                                },
                              ]}
                            >
                              <Input
                                style={{ width: "100%" }}
                                addonBefore="+250"
                                maxLength={9}
                                placeholder="7XXXXXXXX"
                              />
                            </Form.Item>
                            {fields.length > 1 && (
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                                className="cursor-pointer"
                              />
                            )}
                          </Space>
                          <Form.ErrorList
                            errors={errors}
                            className="mb-2 text-red-500"
                          />
                        </React.Fragment>
                      );
                    })}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add witness
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default AppealForm;
