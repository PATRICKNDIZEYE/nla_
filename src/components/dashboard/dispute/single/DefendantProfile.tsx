import { IDispute } from "@/@types/dispute.type";
import { formatPhoneNumber } from "@/utils/helpers/function";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiDownload } from "react-icons/hi";

const DefendantProfile = ({ dispute }: { dispute: IDispute }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Full Name")}:</p>
        <p>{dispute.defendant?.fullName}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Phone Number")}:</p>
        <p>{formatPhoneNumber(`0${dispute.defendant?.phoneNumber}`)}</p>
      </div>

      {dispute?.invitationProof ? (
        <a
          href={dispute?.invitationProof}
          download={dispute?.defendant?.fullName + "_invitation"}
          target="_blank"
          rel="noreferrer"
          className="block font-semibold bg-white p-4 mb-3"
        >
          {t("Proof of invitation")}{" "}
          <HiDownload size={16} className="inline-block text-red-500" />
        </a>
      ) : null}
    </>
  );
};

export default DefendantProfile;
