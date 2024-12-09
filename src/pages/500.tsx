import React from "react";
import type { GetStaticProps } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";

const ServerError = dynamic(() => import("@/components/partials/ServerError"), {
  ssr: false,
});

type Props = {};

const ServerPage = () => {
  return <ServerError />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default ServerPage;
