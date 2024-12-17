import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "./_app";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import dynamic from "next/dynamic";

const UPISearch = dynamic(() => import("@/components/dashboard/upi/UPISearch"), {
  ssr: false,
});

type Props = {
  // Add custom props here
};

const UPISearchPage: NextPageWithLayout = () => {
  return <UPISearch />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

UPISearchPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UPISearchPage; 