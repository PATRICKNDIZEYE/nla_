import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import DashboardLayout from "@/components/layouts/DashboardLayout";

import dynamic from "next/dynamic";

const Statistics = dynamic(
  () => import("@/components/dashboard/stat/Statistics"),
  {
    ssr: false,
  }
);

type Props = {
  // Add custom props here
};

const DashboardPage: NextPageWithLayout = () => {
  return <Statistics />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
