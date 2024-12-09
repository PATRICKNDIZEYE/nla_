import { IProfile } from "@/@types/profile.type";
import {
  authRegister,
  getNidaData,
  sendSMS,
} from "@/redux/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Secure from "@/utils/helpers/secureLS";
import { Button, Form, Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [isSentOTP, setSentOTP] = React.useState<boolean>(false);
  const { t } = useTranslation("common");
  const [profile, setProfile] = React.useState<IProfile | null>(null);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const onFinish = async (values: any) => {
    try {
      if (!profile) {
        throw new Error("Please enter a valid national ID");
      }
      const { nationalId, phoneNumber, password } = values;
      const trimmedNationalID = nationalId?.replace(/\s/g, "");
      const trimmedPhoneNumber = phoneNumber?.replace(/\s/g, "");

      if (trimmedNationalID && trimmedPhoneNumber && isSentOTP && password) {
        const { token, user } = await dispatch(
          authRegister({
            profile,
            phoneNumber: trimmedPhoneNumber,
            nationalId: trimmedNationalID,
            password,
            otp: values.otp,
            email: values.email?.trim()?.toLowerCase(),
          })
        ).unwrap();
        toast.success(t("Account created successfully"));
        Secure.setToken(token);
        Secure.setUserId(user._id!);
        window.location.href = "/";
      }
    } catch (error) {
      const { message } = error as Error;
      toast.error(`${t(`${message}` as any)}`);
    }
  };

  return (
    <Form layout="vertical" requiredMark onFinish={onFinish}>
      <Form.Item
        label={t("identification-number")}
        hasFeedback
        validateStatus={
          profile ? "success" : loading ? "validating" : "warning"
        }
        name="nationalId"
        rules={[
          {
            required: true,
            message: t("National ID is required"),
          },
          {
            pattern: new RegExp(/^\d{16}$/),
            message: "Please enter a valid Rwandan national ID",
          },
          {
            validator: async (_, value) => {
              const trimmedNationalID = value?.replace(/\s/g, "");
              if (
                !profile &&
                trimmedNationalID &&
                trimmedNationalID.length === 16
              ) {
                try {
                  const profile = await dispatch(
                    getNidaData(trimmedNationalID)
                  ).unwrap();
                  setProfile(profile);
                } catch (error) {
                  return Promise.reject(
                    new Error("Please enter a valid national ID")
                  );
                }
              }
            },
          },
        ]}
      >
        <Input
          size="large"
          placeholder={t("identification-number")}
          name="nationalId"
          onChange={() => setProfile(null)}
          disabled={!profile && loading}
        />
      </Form.Item>
      {profile && (
        <>
          <Form.Item label={t("fullName")} htmlFor="fullName">
            <Input
              id="fullName"
              size="large"
              placeholder={t("fullName")}
              disabled
              value={`${profile?.ForeName || ""} ${profile?.Surnames || ""}`}
            />
          </Form.Item>
          <Form.Item
            label={t("email")}
            name="email"
            rules={[
              {
                type: "email",
                message: t("Please enter a valid email"),
              },
              {
                required: true,
                message: t("Email is required"),
              },
            ]}
            hasFeedback
          >
            <Input size="large" placeholder={t("email")} />
          </Form.Item>
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
                        sendSMS({ phone: trimmedPhoneNumber })
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
        </>
      )}
      <div className="py-4">
        <Button
          type="primary"
          htmlType="submit"
          disabled={loading}
          size="large"
          className="disabled:cursor-not-allowed disabled:opacity-50 block w-full text-center text-white bg-gradient-to-r from-teal-500 via-teal-700 to-orange-400 hover:bg-purple-900 px-2 py-1.5 rounded-full"
        >
          {t("register")}
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;
