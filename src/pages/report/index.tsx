import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import DashboardLayout from "@/components/layouts/DashboardLayout";

import dynamic from "next/dynamic";

const AllReport = dynamic(
  () => import("@/components/dashboard/report/AllReport"),
  {
    ssr: false,
  }
);

type Props = {
  // Add custom props here
};

const ReportPage: NextPageWithLayout = () => {
  return <AllReport />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

ReportPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ReportPage;
