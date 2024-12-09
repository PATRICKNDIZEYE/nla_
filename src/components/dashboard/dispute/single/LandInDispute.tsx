import { IDispute } from "@/@types/dispute.type";
import { Timeline } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

const LandInDispute = ({ land }: { land: IDispute["land"] }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("UPI Number")}:</p>
        <p>{land?.upi}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Address")}:</p>
        <p>{land?.parcelLocation?.district?.districtName}</p>
      </div>

      <div className="flex gap-2 bg-white p-4 mb-3">
        <p className="font-semibold">{t("Land Use")}:</p>
        <p>{land?.landUseNameKinyarwanda}</p>
      </div>

      <div className="flex flex-col bg-white p-4 mb-3">
        <p className="font-semibold mb-3">{t("Land Owners")}:</p>
        <Timeline
          items={land?.owners?.map((item) => ({
            children: item.fullName,
          }))}
        />
      </div>
    </>
  );
};

export default LandInDispute;
