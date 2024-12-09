import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/layouts/DashboardLayout";

const DisputeForm = dynamic(
  () => import("@/components/dashboard/dispute/DisputeForm"),
  { ssr: false }
);

type Props = {
  // Add custom props here
};

const NewDisputePage: NextPageWithLayout = () => {
  return <DisputeForm />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

NewDisputePage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default NewDisputePage;
