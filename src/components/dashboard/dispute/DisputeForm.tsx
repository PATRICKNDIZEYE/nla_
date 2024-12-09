import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Timeline,
  Upload,
} from "antd";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getParcelInfo } from "@/redux/features/auth/auth.slice";
import { createDispute } from "@/redux/features/dispute/dispute.slice";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import { useTranslation } from "react-i18next";
import Address from "@/utils/lib/address";
import { disputeCategories } from "@/utils/constants/dispute.categories";
import { useSystemTour } from "@/components/hooks/tour";
import DisputeSteps from "./DisputeSteps";
import { useRouter } from "next/router";
import Secure from "@/utils/helpers/secureLS";

const { TextArea } = Input;

const CaseForm: React.FC = () => {
  const topDivRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const { data: user } = useAppSelector((state) => state.profile);
  const { t } = useTranslation("common");
  const [form] = useForm();
  const defendantDistrictValue = Form.useWatch("defendantDistrict", form);
  const defendantSectorValue = Form.useWatch("defendantSector", form);
  const disputeTypeValue = Form.useWatch("disputeType", form);
  const dispatch = useAppDispatch();
  const { loading: loadingAuth } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.dispute);
  const [land, setLand] = useState<ILandData>();
  const [secondLand, setSecondLand] = useState<ILandData[]>([]);

  const onFinish = async (values: any) => {
    if (!user?._id) return;
    const formData = new FormData();
    try {
      if (!land) {
        const landData = await dispatch(
          getParcelInfo(values.upiNumber)
        ).unwrap();
        setLand(landData);
        formData.append("land", JSON.stringify(landData));
      } else {
        formData.append("land", JSON.stringify(land));
      }
    } catch (error) {
      form.setFields([
        {
          name: "upiNumber",
          errors: [t("Failed to fetch land data")],
        },
      ]);
      form.scrollToField("upiNumber");
      return;
    }
    if (values.secondUPIs?.length > 0) {
      try {
        if (!secondLand.length) {
          const lands = await Promise.all(
            values.secondUPIs.map(async (item: any) => {
              const data = await dispatch(
                getParcelInfo(item.secondUPI)
              ).unwrap();
              return data;
            })
          );
          setSecondLand(lands);
          formData.append("secondLands", JSON.stringify(lands));
        } else {
          formData.append("secondLands", JSON.stringify(secondLand));
        }
      } catch (error) {
        form.setFields([
          {
            name: "secondUPIs",
            errors: [t("Failed to fetch land data")],
          },
        ]);
        form.scrollToField("secondUPIs");

        return;
      }
    }

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    try {
      values.defendantDistrict = Address.getDistrict(
        defendantDistrictValue
      )?.name.toLocaleLowerCase();
      values.defendantSector =
        Address.getSector(defendantSectorValue)?.name.toLocaleLowerCase();
      values.defendantCell = Address.getCell(
        values.defendantCell
      )?.name.toLocaleLowerCase();
      values.district = land?.districtName?.toLowerCase() ?? "";

      Object.keys(values).forEach((key) => {
        if (key === "letter" && values[key]?.file) {
          formData.append("letter", values[key].file.originFileObj);
        } else if (key === "sectorReport") {
          formData.append("sectorReport", values[key].file.originFileObj);
        } else if (key === "deedPlan" && values[key]?.file) {
          formData.append("deedPlan", values[key].file.originFileObj);
        } else if (key === "invitationProof") {
          formData.append("invitationProof", values[key].file.originFileObj);
        } else if (key === "otherDocuments" && values[key]?.length) {
          values[key].forEach((file: any) => {
            formData.append("otherDocuments", file.originFileObj);
          });
        } else if (key === "witnesses" && values[key]?.length) {
          formData.append("witnesses", JSON.stringify(values[key]));
        } else if (key === "disputeType" && values[key]) {
          const category = disputeCategories.find(
            (item) => item.value === values[key]
          )?.label as string;
          formData.append("disputeType", category?.toString());
        } else if (values[key]) {
          formData.append(key, values[key]);
        }
      });

      const defendant = {
        fullName: values.defendantFullName,
        phoneNumber: values.defendantPhone,
      };
      formData.append("defendant", JSON.stringify(defendant));
      formData.append("userId", user?._id as string);
      const { message } = await dispatch(createDispute(formData)).unwrap();
      toast.success(`${t(`${message}` as any)}`);
      onReset();
    } catch (error) {
      const { message } = error as Error;
      toast.error(`${t(`${message}` as any)}`);
    }
  };

  const onReset = () => {
    form.resetFields();
    setLand(undefined);
    setSecondLand([]);
    Secure.remove("draft");
    router.push("/dispute");
  };

  const onSaveDraft = () => {
    const draft = form.getFieldsValue();
    Secure.set("draft", draft);
    toast.success(t("Draft saved successfully"));
  };

  const newCaseButtonRef = useRef(null);
  const systemTour = useSystemTour();
  systemTour.addTour({
    id: "new-case",
    title: t("New Case"),
    description: t("Add new land case"),
    steps: [],
  });
  systemTour.addStep(
    "new-case",
    {
      id: "new-case-button",
      title: t("New Case"),
      target: () => newCaseButtonRef.current,
      description: "Click here to add new land case",
    },
    2
  );

  useEffect(() => {
    const draft = Secure.get("draft");
    if (draft) {
      form.setFieldsValue(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || loadingAuth) {
      topDivRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, loadingAuth]);

  return (
    <>
      <div ref={topDivRef} className="invisible" />
      <DisputeSteps current={currentStep} />
      <Spin spinning={loading || loadingAuth}>
        <Form
          layout="vertical"
          requiredMark
          onFinish={onFinish}
          id="form-case"
          form={form}
        >
          <div className="flex flex-col bg-white py-2 px-6 rounded mt-12">
            <Divider orientation="left" orientationMargin="0">
              {t("Plot Details")}
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="upiNumber"
                  label={t("UPI Number")}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t("Please enter UPI"),
                    },
                    {
                      pattern: new RegExp(
                        /^((\d{1})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d{1,4}))$/
                      ),
                      message: t("Please enter a valid UPI"),
                    },
                  ]}
                >
                  <Input
                    disabled={loadingAuth}
                    placeholder={t("Please enter UPI")}
                    onChange={() => {
                      setLand(undefined);
                      setCurrentStep(0);
                    }}
                  />
                </Form.Item>
              </Col>
              {land && (
                <Col span={12}>
                  <p className="mb-2">
                    Location: {land.parcelLocation?.cell?.cellName},{" "}
                    {land.parcelLocation?.sector?.sectorName},{" "}
                    {land.parcelLocation?.district?.districtName}
                  </p>
                  <Form.Item label={t("Land Owners")} className="flex flex-col">
                    <Timeline
                      items={land.owners?.map((item) => ({
                        children: item.fullName,
                      }))}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row gutter={16}>
              {land && (
                <Col span={12}>
                  <Form.Item name="toDistrict" label={t("To District")}>
                    <Select
                      showSearch
                      placeholder={t("Select district")}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label?.toLowerCase() ?? "").includes(
                          input.toLowerCase()
                        )
                      }
                      defaultValue={
                        land?.parcelLocation?.district?.districtName?.toLowerCase() ??
                        ""
                      }
                      options={[
                        {
                          label: land?.parcelLocation?.district?.districtName,
                          value:
                            land?.parcelLocation?.district?.districtName?.toLowerCase() ??
                            "",
                        },
                      ]}
                      disabled
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={12}>
                <Form.Item
                  name="summary"
                  label={t("Summary for dispute")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter summary for dispute"),
                    },
                  ]}
                >
                  <TextArea
                    placeholder={t("Please enter summary for dispute")}
                    autoSize
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="flex flex-col bg-white py-2 px-6 rounded mt-8">
            <Divider orientation="left" orientationMargin="0">
              {t("Profile of the defendant")}
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="defendantFullName"
                  label={t("Defendant Full Name")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter defendant name"),
                    },
                  ]}
                >
                  <Input placeholder={t("Please enter defendant name")} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defendantDistrict"
                  label={t("District")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter district"),
                    },
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
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="defendantSector"
                  label={t("Sector")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter sector"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input.toLowerCase()
                      )
                    }
                    placeholder={t("Select sector")}
                    options={[
                      {
                        label: t("Select sector"),
                        value: "",
                      },
                      ...Address.getSectors(defendantDistrictValue).map(
                        (item) => ({
                          label: item.name,
                          value: item.id,
                        })
                      ),
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defendantCell"
                  label={t("Cell")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter cell"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input.toLowerCase()
                      )
                    }
                    placeholder={t("Select cell")}
                    options={[
                      {
                        label: t("Select cell"),
                        value: "",
                      },
                      ...Address.getCells(defendantSectorValue).map((item) => ({
                        label: item.name,
                        value: item.name,
                      })),
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="defendantVillage"
                  label={t("Village")}
                  rules={[
                    {
                      required: true,
                      message: t("Please enter village"),
                    },
                  ]}
                >
                  <Input placeholder={t("Please enter village")} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defendantPhone"
                  label={t("Defendant Phone Number")}
                  rules={[
                    {
                      pattern: new RegExp(/^(72|73|78|79)\d{7}$/),
                      message: t("Please enter a valid defendant phone"),
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
              </Col>
            </Row>
            <Row gutter={16}>
              {/* <Col span={12}>
                <Form.Item
                  name="invitationProof"
                  label={t("Proof of invitation")}
                  rules={[
                    {
                      required: true,
                      message: t("Please upload proof of invitation"),
                    },
                  ]}
                >
                  <Upload
                    listType="text"
                    multiple={false}
                    maxCount={1}
                    accept=".pdf,.docx"
                  >
                    <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
                  </Upload>
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item
                  name="defendantEmail"
                  label={t("Defendant Email (Optional)")}
                  rules={[
                    {
                      type: "email",
                      message: t("The input is not valid E-mail!"),
                    },
                  ]}
                >
                  <Input type="email" placeholder="email@example.com" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex flex-col bg-white py-2 px-6 rounded mt-8">
            <Divider orientation="left" orientationMargin="0">
              {t("dispute")}
            </Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="disputeType"
                  label={t("Dispute Type")}
                  rules={[
                    { required: true, message: t("Please select a type") },
                    {
                      pattern: new RegExp(
                        `^(${disputeCategories
                          .map((item) => item.value)
                          .join("|")})$`
                      ),
                      message: t("Please select a valid type"),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={t("Please select a type")}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input.toLowerCase()
                      )
                    }
                    options={[
                      {
                        label: t("Select type"),
                        value: "",
                      },
                      ...disputeCategories.map((item) => ({
                        label: item.label,
                        value: item.value,
                      })),
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            {disputeTypeValue === "2" && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.List
                    name="secondUPIs"
                    initialValue={[{ secondUPI: "" }]}
                    rules={[
                      {
                        validator: async (_, names) => {
                          if (!names || names.length < 1) {
                            return Promise.reject(new Error(t("Required")));
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
                              <div className="flex space-x-2 w-full mb-2 items-center">
                                <Form.Item
                                  {...restField}
                                  name={[name, "secondUPI"]}
                                  label={t("Second UPI")}
                                  hasFeedback
                                  rules={[
                                    {
                                      required: true,
                                      message: t("Please enter UPI"),
                                    },
                                    {
                                      pattern: new RegExp(
                                        /^((\d{1})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d{1,4}))$/
                                      ),
                                      message: t("Please enter a valid UPI"),
                                    },
                                  ]}
                                  style={{ width: "100%" }}
                                >
                                  <Input
                                    placeholder={t("Please enter UPI")}
                                    onChange={() => {
                                      setSecondLand([]);
                                      setCurrentStep(0);
                                    }}
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <MinusCircleOutlined
                                    onClick={() => {
                                      remove(name);
                                      setSecondLand([]);
                                    }}
                                    className="cursor-pointer"
                                  />
                                )}
                              </div>
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
                            {t("Add")}
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Col>
                <Col span={12}>
                  {secondLand.map((item) => (
                    <Form.Item
                      key={item.upi}
                      label={`${t("Land Owners")} for UPI: ${item.upi}`}
                    >
                      <Timeline
                        items={item.owners?.map((item) => ({
                          children: item.fullName,
                        }))}
                      />
                    </Form.Item>
                  ))}
                </Col>
              </Row>
            )}
          </div>

          <div className="flex flex-col bg-white py-2 px-6 rounded mt-8">
            <Divider orientation="left" orientationMargin="0">
              {t("Requirements")}
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="letter"
                  label={t("Letter")}
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
                    accept=".pdf,.docx"
                  >
                    <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="sectorReport"
                  label={t("Sector Report")}
                  rules={[
                    {
                      required: true,
                      message: t("Please upload sector report"),
                    },
                  ]}
                >
                  <Upload
                    listType="text"
                    multiple={false}
                    maxCount={1}
                    accept=".pdf,.docx"
                  >
                    <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="deedPlan" label={t("Deed Plan (Optional)")}>
                  <Upload
                    listType="text"
                    multiple={false}
                    maxCount={1}
                    accept=".pdf,.docx"
                  >
                    <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="otherDocuments"
                  label={t("Other Documents (Optional)")}
                >
                  <Upload
                    listType="text"
                    multiple={false}
                    maxCount={4}
                    accept=".pdf,.docx"
                  >
                    <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex flex-col bg-white py-2 px-6 rounded mt-8">
            <Divider orientation="left" orientationMargin="0">
              {t("Witnesses")}
            </Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.List name="witnesses">
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
                                label={t("Full Name")}
                                rules={[
                                  {
                                    required: true,
                                    message: t("Missing full name"),
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={t("Full Name")}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label={t("Phone Number")}
                                name={[name, "phoneNumber"]}
                                rules={[
                                  {
                                    required: true,
                                    message: t("Missing phone number"),
                                  },
                                  {
                                    pattern: new RegExp(/^(72|73|78|79)\d{7}$/),
                                    message:
                                      "Please enter a valid phone number",
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
                              {fields.length > 0 && (
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
                          {t("Add witness")}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Col>
            </Row>
          </div>

          <Form.Item className="mt-12">
            <div className="w-full flex items-center justify-between space-x-12">
              <Button
                type="link"
                htmlType="button"
                onClick={onSaveDraft}
                disabled={loading || loadingAuth || !form.isFieldsTouched()}
              >
                {t("Save as draft")}
              </Button>

              <div className="flex items-center space-x-4">
                <Button
                  htmlType="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      setCurrentStep(0);
                    } else {
                      onReset();
                    }
                  }}
                >
                  {t(currentStep < 1 ? "Cancel" : "Back")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-500"
                  disabled={loading || loadingAuth}
                  loading={loading}
                >
                  {t(currentStep < 1 ? "Next" : "Submit")}
                </Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};

export default CaseForm;
