import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/layouts/DashboardLayout";

const SingleDisputePage = dynamic(
  () => import("@/components/dashboard/dispute/single/SingleCaseView"),
  { ssr: false }
);

type Props = {
  // Add custom props here
};

const SingleDisputePagePage: NextPageWithLayout = () => {
  return <SingleDisputePage />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

SingleDisputePagePage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SingleDisputePagePage;
