import React from "react";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const NotFoundError: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t("sorry-we-couldnt-find-that-page")}
      extra={
        <Button
          type="primary"
          className="bg-blue-600"
          onClick={() => router.replace("/")}
        >
          {t("back-to-home")}
        </Button>
      }
    />
  );
};

export default NotFoundError;
