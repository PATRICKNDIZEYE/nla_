import React from "react";
import { Steps } from "antd";
import { useTranslation } from "react-i18next";

const DisputeSteps = ({ current = 1 }) => {
  const { t } = useTranslation("common");
  return (
    <Steps
      size="small"
      current={current}
      items={[
        {
          title: t("Application"),
        },
        {
          title: t("Submit"),
        },
        // {
        //   title: t("Submit"),
        // },
      ]}
    />
  );
};

export default DisputeSteps;
