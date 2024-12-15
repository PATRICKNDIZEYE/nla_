import React, { useEffect } from "react";
import { Breadcrumb, Tabs } from "antd";
import type { TabsProps } from "antd";
import DisputeInfo from "./DisputeInfo";
import ClaimantProfile from "./ClaimantProfile";
import LandInDispute from "./LandInDispute";
import DefendantProfile from "./DefendantProfile";
import DisputeChat from "@/components/dispute/DisputeChat";
import CommitteeDocuments from "./CommitteeDocuments";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { getDisputeById } from "@/redux/features/dispute/dispute.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Spinner from "@/components/partials/Spinner";
import { MessageOutlined } from "@ant-design/icons";

const SingleCaseView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("1");
  const { t } = useTranslation("common");
  const { disputeId } = useParams();
  const dispatch = useAppDispatch();
  const {
    data: { singleData },
    loading,
  } = useAppSelector((state) => state.dispute);
  const { data: currentUser } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (disputeId) {
      dispatch(getDisputeById(disputeId.toString()));
    }
  }, [dispatch, disputeId]);

  const canShareDocuments = currentUser?.level?.role === 'admin' || 
    (currentUser?.level?.role === 'manager' && 
     currentUser?.level?.district?.toLowerCase() === singleData?.district?.toLowerCase());

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
    {
      key: "5",
      label: t("Committee Documents"),
      children: <CommitteeDocuments dispute={singleData} canShare={canShareDocuments} />,
    }
  ];

  // Add chat tab if user is authorized
  if (currentUser && singleData && (
    currentUser.level?.role === 'admin' ||
    currentUser.level?.role === 'manager' ||
    currentUser._id === singleData.claimant?._id ||
    currentUser._id === singleData.defendant?._id
  )) {
    items.push({
      key: "6",
      label: (
        <span>
          <MessageOutlined className="mr-2" />
          {t("Messages")}
        </span>
      ),
      children: (
        <DisputeChat
          dispute={singleData}
          currentUser={currentUser}
        />
      ),
    });
  }

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
