import React from "react";
import type { GetStaticProps } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";

const NotFoundError = dynamic(
  () => import("@/components/partials/NotFoundError"),
  { ssr: false }
);

type Props = {};

const NotFoundPage = () => {
  return <NotFoundError />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default NotFoundPage;
