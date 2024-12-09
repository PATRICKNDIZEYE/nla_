import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import dynamic from "next/dynamic";

const MyProfile = dynamic(
  () => import("@/components/dashboard/profile/MyProfile"),
  {
    ssr: false,
  }
);

type Props = {
  // Add custom props here
};

const ProfilePage: NextPageWithLayout = () => {
  return <MyProfile />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

ProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProfilePage;
