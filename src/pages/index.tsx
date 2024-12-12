import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import dynamic from "next/dynamic";
import PublicLayout from "@/components/layouts/PublicLayout";

// import Home from "@/components/home/Home";

const Home = dynamic(() => import("@/components/home/Home"), {
  ssr: false,
});

type Props = {
  // Add custom props here
};




const HomePage: NextPageWithLayout = () => {
  return <Home />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};

export default HomePage;
