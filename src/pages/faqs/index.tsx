import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import dynamic from "next/dynamic";
import PublicLayout from "@/components/layouts/PublicLayout";

const FAQs = dynamic(() => import("@/components/faqs/FAQs"), {
  ssr: false,
});

type Props = {
  // Add custom props here
};

const FAQsPage: NextPageWithLayout = () => {
  return <FAQs />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

FAQsPage.getLayout = function getLayout(page: ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};

export default FAQsPage;
