import React, { useEffect } from "react";
import { Breadcrumb, Tabs } from "antd";
import type { TabsProps } from "antd";
import DisputeInfo from "./DisputeInfo";
import ClaimantProfile from "./ClaimantProfile";
import LandInDispute from "./LandInDispute";
import DefendantProfile from "./DefendantProfile";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { getDisputeById } from "@/redux/features/dispute/dispute.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Spinner from "@/components/partials/Spinner";

const SingleCaseView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("1");
  const { t } = useTranslation("common");
  const { disputeId } = useParams();
  const dispatch = useAppDispatch();
  const {
    data: { singleData },
    loading,
  } = useAppSelector((state) => state.dispute);

  useEffect(() => {
    if (disputeId) {
      dispatch(getDisputeById(disputeId.toString()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("Dispute Info"),
      children: <DisputeInfo dispute={singleData} />,
    },
    {
      key: "2",
      label: t("Claimant Profile"),
      children: <ClaimantProfile dispute={singleData} />,
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

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <Breadcrumb
        items={[
          {
            title: <Link href="/dispute">{t("Disputes")}</Link>,
          },
          {
            title: items.find((item) => item.key === activeTab)?.label,
          },
        ]}
      />
      <Tabs defaultActiveKey="1" items={items} onChange={setActiveTab} />
    </>
  );
};

export default SingleCaseView;
