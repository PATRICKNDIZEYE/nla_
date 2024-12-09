import { authLogin, sendSMS } from "@/redux/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Keys from "@/utils/constants/keys";
import Secure from "@/utils/helpers/secureLS";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const LoginForm = () => {
  const router = useRouter();
  const [isSentOTP, setSentOTP] = React.useState<boolean>(false);
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const onFinish = async (values: any) => {
    try {
      const { phoneNumber, password, otp } = values;
      const { token, user } = await dispatch(
        authLogin({ phoneNumber, password, otp })
      ).unwrap();
      toast.success(`${t("welcome")} ${user?.profile?.Surnames}!`);
      Secure.setToken(token);
      Secure.setUserId(user._id!);
      const redirectLink = Secure.get(Keys.REDIRECT_TO) as string;
      router.replace(redirectLink ?? "/home");
    } catch (error) {
      const { message } = error as { message: string };
      toast.error(`${t(message as any)}`);
    }
  };

  return (
    <Form layout="vertical" requiredMark onFinish={onFinish}>
      <Form.Item
        rules={[
          {
            required: true,
            message: t("Phone number is required"),
          },
          {
            validator: async (_, value) => {
              const trimmedPhoneNumber = value?.replace(/\s/g, "");
              const pattern: RegExp = /^(72|73|78|79)\d{7}$/;

              if (trimmedPhoneNumber && !pattern.test(trimmedPhoneNumber)) {
                return Promise.reject(
                  new Error("Please enter a valid phone number")
                );
              } else if (
                !isSentOTP &&
                trimmedPhoneNumber &&
                trimmedPhoneNumber.length === 9
              ) {
                try {
                  const { message } = await dispatch(
                    sendSMS({ phone: trimmedPhoneNumber, checkUser: true })
                  ).unwrap();
                  setSentOTP(true);
                  toast.success(`${t(message as any)}`);
                } catch (error: any) {
                  return Promise.reject(
                    new Error(error.message ?? "OTP sending failed")
                  );
                }
              }
            },
          },
        ]}
        label={t("phoneNumber")}
        name="phoneNumber"
        hasFeedback
        validateStatus={
          isSentOTP ? "success" : loading ? "validating" : "warning"
        }
      >
        <Input
          size="large"
          addonBefore="+250"
          placeholder="7XXXXXXXX"
          onChange={() => setSentOTP(false)}
          disabled={!isSentOTP && loading}
        />
      </Form.Item>

      {isSentOTP && (
        <>
          <Form.Item
            label={t("password")}
            name="password"
            rules={[
              {
                required: true,
                message: t("Password is required"),
              },
              {
                min: 6,
                message: t("Password must be at least 6 characters"),
              },
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder={t("password")} />
          </Form.Item>
          <Form.Item
            label={t("otp-code")}
            name="otp"
            rules={[
              {
                required: true,
                message: t("OTP is required"),
              },
              {
                validator: async (_, value) => {
                  const trimmedOTP = value?.replace(/\s/g, "");
                  const pattern: RegExp = /^\d{6}$/;
                  if (trimmedOTP && !pattern.test(trimmedOTP)) {
                    return Promise.reject(
                      new Error("Please enter a valid received OTP")
                    );
                  }
                },
              },
            ]}
            hasFeedback
          >
            <Input size="large" placeholder={t("otp-code")} />
          </Form.Item>
        </>
      )}

      <Link
        href="/forgot-password"
        className="text-xs font-semibold mb-3 block w-fit text-right ml-auto text-brand-green"
      >
        {t("forgot-password")}
      </Link>

      <div className="py-4">
        <Button
          type="primary"
          htmlType="submit"
          disabled={loading}
          size="large"
          className="disabled:cursor-not-allowed disabled:opacity-50 block w-full text-center text-white bg-gradient-to-r from-teal-500 via-teal-700 to-orange-400 hover:bg-purple-900 px-2 py-1.5 rounded-full"
        >
          {t("sign-in")}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
