import { IDispute } from "@/@types/dispute.type";
import { formatPhoneNumber } from "@/utils/helpers/function";
import { Divider } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiDownload } from "react-icons/hi";
import LandInDispute from "./LandInDispute";

const DisputeInfo = ({ dispute }: { dispute: IDispute }) => {
  const { t } = useTranslation("common");
  if (!dispute) return null;
  return (
    <>
      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Dispute Type")}:</p>
        <p>{dispute.disputeType}</p>
      </div>
      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Status")}:</p>
        <p>{dispute.status}</p>
      </div>

      {dispute.feedback && (
        <div className="flex gap-2 bg-white p-4 mb-3">
          <p className="font-semibold">{t("District Feedback")}:</p>
          <p>{dispute.feedback}</p>
        </div>
      )}

      {dispute.rejectReason && (
        <div className="flex gap-2 bg-white p-4 mb-3">
          <p className="font-semibold">{t("Reject Reason")}:</p>
          <p>{dispute.rejectReason}</p>
        </div>
      )}

      {dispute.appealReason && (
        <div className="flex gap-2 bg-white p-4 mb-3">
          <p className="font-semibold">{t("Appeal Reason")}:</p>
          <p>{dispute.appealReason}</p>
        </div>
      )}

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Summary")}:</p>
        <p>{dispute.summary}</p>
      </div>

      {dispute.secondLands?.length ? (
        <div className="flex gap-2 bg-white p-4 mb-3">
          <p className="font-semibold">{t("Second UPIs")}:</p>
          {dispute.secondLands?.map((land) => (
            <p key={land.upi} className="mt-2">
              {land.upi}
            </p>
          ))}
        </div>
      ) : null}

      <Divider orientation="left" orientationMargin="0" className="mb-2">
        {t("Witnesses")}
      </Divider>

      {dispute.witnesses?.map((witness, index) => (
        <div key={index} className="flex gap-2 bg-white p-4 mb-3">
          <p className="font-semibold">
            {t("Witness")}
            {index + 1}:
          </p>
          <p>
            {t("Full Name")}: {witness?.fullName}, {t("Phone Number")}:
            {formatPhoneNumber(`0${witness?.phoneNumber}`)}
          </p>
        </div>
      ))}

      {dispute.secondLands?.length ? (
        <>
          <Divider orientation="left" orientationMargin="0" className="mb-2">
            {t("Second Lands in Dispute")}
          </Divider>

          {dispute.secondLands?.map((land, index) => (
            <LandInDispute key={land.upi} land={land} />
          ))}
        </>
      ) : null}

      <Divider orientation="left" orientationMargin="0" className="mb-2">
        {t("Other Documents")}
      </Divider>

      <a
        href={dispute?.letter}
        download={
          dispute?.claimant?.profile?.ForeName +
          "_" +
          dispute?.claimant?.profile?.Surnames +
          "_letter"
        }
        target="_blank"
        rel="noreferrer"
        className="block font-semibold bg-white p-4 mb-3"
      >
        {t("Letter")}{" "}
        <HiDownload size={16} className="inline-block text-red-500" />
      </a>

      <a
        href={dispute?.sectorReport}
        download={
          dispute?.claimant?.profile?.ForeName +
          "_" +
          dispute?.claimant?.profile?.Surnames +
          "_sector_report"
        }
        target="_blank"
        rel="noreferrer"
        className="block bg-white p-4 mb-3 font-semibold"
      >
        {t("Sector Report")}{" "}
        <HiDownload size={16} className="inline-block text-red-500" />
      </a>

      {dispute.deedPlan ? (
        <a
          href={dispute.deedPlan}
          download={
            dispute?.claimant?.profile?.ForeName +
            "_" +
            dispute?.claimant?.profile?.Surnames +
            "_deep_plan"
          }
          target="_blank"
          rel="noreferrer"
          className="block bg-white p-4 mb-3 font-semibold"
        >
          {t("Deed Plan")}{" "}
          <HiDownload size={16} className="inline-block text-red-500" />
        </a>
      ) : null}

      {dispute.stampedLetter ? (
        <a
          href={dispute.stampedLetter}
          download={
            dispute?.claimant?.profile?.ForeName +
            "_" +
            dispute?.claimant?.profile?.Surnames +
            "_stamped_letter"
          }
          target="_blank"
          rel="noreferrer"
          className="block bg-white p-4 mb-3 font-semibold"
        >
          {t("Stamped Letter")}{" "}
          <HiDownload size={16} className="inline-block text-red-500" />
        </a>
      ) : null}

      {dispute.otherDocuments?.map((doc, index) => (
        <a
          key={index}
          href={doc}
          download={
            dispute?.claimant?.profile?.ForeName +
            "_" +
            dispute?.claimant?.profile?.Surnames +
            "_other_document_" +
            index
          }
          target="_blank"
          rel="noreferrer"
          className="block bg-white p-4 mb-3 font-semibold"
        >
          {t("Other Document")} {index + 1}{" "}
          <HiDownload size={16} className="inline-block text-red-500" />
        </a>
      ))}
    </>
  );
};

export default DisputeInfo;
