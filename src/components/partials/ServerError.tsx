import React from "react";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const ServerError: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  return (
    <Result
      status="500"
      title="500"
      subTitle={t("sorry-something-went-wrong")}
      extra={
        <Button
          className="bg-blue-600"
          type="primary"
          onClick={() => router.replace("/")}
        >
          {t("back-to-home")}
        </Button>
      }
    />
  );
};

export default ServerError;
