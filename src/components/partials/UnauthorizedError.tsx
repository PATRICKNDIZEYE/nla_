import React from "react";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  return (
    <Result
      status="403"
      title="403"
      subTitle={t("sorry-you-are-not-authorized-to-access-this-page")}
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

export default LanguageSwitcher;
