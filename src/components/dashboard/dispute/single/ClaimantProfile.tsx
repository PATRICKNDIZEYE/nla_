import { IDispute } from "@/@types/dispute.type";
import React from "react";
import { useTranslation } from "react-i18next";

const ClaimantProfile = ({ dispute }: { dispute: IDispute }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Full Name")}:</p>
        <p>
          {dispute.claimant?.profile?.Surnames +
            " " +
            dispute.claimant?.profile?.ForeName}
        </p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("National ID")}:</p>
        <p>{dispute.claimant?.nationalId}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("District")}:</p>
        <p>{dispute.claimant?.profile?.District}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Sector")}:</p>
        <p>{dispute.claimant?.profile?.Sector}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Cell")}:</p>
        <p>{dispute.claimant?.profile?.Cell}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Village")}:</p>
        <p>{dispute.claimant?.profile?.Village}</p>
      </div>
    </>
  );
};

export default ClaimantProfile;
