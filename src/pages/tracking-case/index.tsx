import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import dynamic from "next/dynamic";
import PublicLayout from "@/components/layouts/PublicLayout";

const TrackingCase = dynamic(() => import("@/components/tracking-case/TrackingCase"), {
  ssr: false,
});

type Props = {
  // Add custom props here
};

const TrackingCasePage: NextPageWithLayout = () => {
  return <TrackingCase />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

TrackingCasePage.getLayout = function getLayout(page: ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};

export default TrackingCasePage;
