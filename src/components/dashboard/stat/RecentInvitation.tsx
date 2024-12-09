import { getAllInvitations } from "@/redux/features/invitation.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Secure from "@/utils/helpers/secureLS";
import { Avatar } from "antd";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiUser } from "react-icons/fi";

const RecentInvitation = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.invitation);

  useEffect(() => {
    dispatch(
      getAllInvitations({
        pagination: {
          current: 1,
          pageSize: 4,
        },
        userId: Secure.getUserId(),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative rounded-xl bg-white w-full h-[445px] overflow-hidden flex flex-col items-start justify-start p-[30px] box-border gap-[15px] text-left text-base text-tw-slate-600 font-urbanist">
      <div className="self-stretch flex items-start justify-between text-[20px] text-tw-slate-800">
        <h3 className="self-stretch relative font-semibold">
          {t("Recent Invitations")}
        </h3>
        <Link
          href="/invitations"
          className="self-stretch relative text-blue-500 hover:underline"
        >
          View all
        </Link>
      </div>
      {!data.data.length && !loading && (
        <p className="text-center text-tw-slate-600">
          {t("No recent invitations")}
        </p>
      )}
      {data.data.map((item) => (
        <div
          key={item._id}
          className="self-stretch flex flex-col items-start justify-start"
        >
          <div className="self-stretch overflow-hidden flex flex-row items-center justify-between py-1.5 px-0">
            <div className="flex-1 flex flex-row items-center justify-start gap-[24px]">
              <Avatar
                src={`data:image/jpeg;base64,${item?.dispute?.claimant?.profile?.Photo}`}
                size="large"
                icon={<FiUser size={24} />}
                className="flex flex-col items-center justify-center"
              />
              <div className="flex flex-col items-start justify-start gap-[4px]">
                <div className="relative font-semibold">
                  {t("Case ID")}:{" "}
                  {item?.dispute?.length > 0
                    ? item?.dispute[0].claimId
                    : item.dispute?.claimId}
                </div>
                <div className="relative text-slategray">
                  <span>{`${"Location"}: `}</span>
                  <span className="text-cornflowerblue">{item.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentInvitation;
