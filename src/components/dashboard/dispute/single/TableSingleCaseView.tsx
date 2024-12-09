import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import DisputeInfo from "./DisputeInfo";
import ClaimantProfile from "./ClaimantProfile";
import LandInDispute from "./LandInDispute";
import DefendantProfile from "./DefendantProfile";
import { useTranslation } from "react-i18next";
import { IDispute } from "@/@types/dispute.type";

const TableSingleCaseView = ({ singleData }: { singleData: IDispute }) => {
  const [activeTab, setActiveTab] = React.useState("1");
  const { t } = useTranslation("common");

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("Claimant Profile"),
      children: <ClaimantProfile dispute={singleData} />,
    },
    {
      key: "2",
      label: t("Dispute Info"),
      children: <DisputeInfo dispute={singleData} />,
    },
    {
      key: "3",
      label: t("Land in Dispute"),
      children: <LandInDispute land={singleData?.land} />,
    },
    {
      key: "4",
      label: t("Defendant Profile"),
      children: <DefendantProfile dispute={singleData} />,
    },
  ];

  return <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />;
};

export default TableSingleCaseView;
