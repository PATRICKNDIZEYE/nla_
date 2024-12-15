import React, { useState } from "react";
import { Form, Input, Button, Space, Radio, Divider } from "antd";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { login, requestOTP, verifyOTP } from "@/redux/features/auth/auth.slice";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const LoginForm = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpMethod, setOTPMethod] = useState<'sms' | 'email' | 'both'>('sms');
  const [tempUserId, setTempUserId] = useState<string>("");

  const handleLogin = async (values: { phoneNumber: string; password: string }) => {
    try {
      // First step: Validate credentials
      const result = await dispatch(login(values)).unwrap();
      setTempUserId(result.user._id);
      
      // Second step: Request OTP
      await dispatch(requestOTP({
        userId: result.user._id,
        method: otpMethod,
      })).unwrap();

      setShowOTPInput(true);
      toast.success(t("OTP sent successfully"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleVerifyOTP = async (values: { otp: string }) => {
    try {
      await dispatch(verifyOTP({
        userId: tempUserId,
        otp: values.otp,
      })).unwrap();

      toast.success(t("Login successful"));
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(requestOTP({
        userId: tempUserId,
        method: otpMethod,
      })).unwrap();
      toast.success(t("OTP resent successfully"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!showOTPInput ? (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            className="w-full"
          >
            <Form.Item
              name="phoneNumber"
              label={t("Phone Number")}
              rules={[
                { required: true, message: t("Please enter your phone number") },
              ]}
            >
              <Input placeholder={t("Enter phone number")} />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("Password")}
              rules={[
                { required: true, message: t("Please enter your password") },
              ]}
            >
              <Input.Password placeholder={t("Enter password")} />
            </Form.Item>

            <Form.Item label={t("OTP Method")}>
              <Radio.Group
                value={otpMethod}
                onChange={(e) => setOTPMethod(e.target.value)}
              >
                <Radio value="sms">{t("SMS")}</Radio>
                <Radio value="email">{t("Email")}</Radio>
                <Radio value="both">{t("Both")}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-500"
              >
                {t("Continue")}
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">{t("Enter OTP")}</h3>
            <p className="text-gray-500">
              {t("Please enter the OTP sent to your")} {" "}
              {otpMethod === 'sms' ? t("phone") : 
               otpMethod === 'email' ? t("email") : 
               t("phone and email")}
            </p>
          </div>

          <Form
            form={otpForm}
            layout="vertical"
            onFinish={handleVerifyOTP}
            className="w-full"
          >
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: t("Please enter OTP") },
                { len: 6, message: t("OTP must be 6 digits") },
              ]}
            >
              <Input
                placeholder={t("Enter OTP")}
                maxLength={6}
                className="text-center text-2xl tracking-wider"
              />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-blue-500"
                >
                  {t("Verify & Login")}
                </Button>

                <Divider>{t("or")}</Divider>

                <Button
                  type="link"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full"
                >
                  {t("Resend OTP")}
                </Button>

                <Button
                  type="link"
                  onClick={() => {
                    setShowOTPInput(false);
                    setTempUserId("");
                    form.resetFields();
                    otpForm.resetFields();
                  }}
                  className="w-full"
                >
                  {t("Back to Login")}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default LoginForm; 