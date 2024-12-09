import React from "react";
import type { GetStaticProps } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";

const UnauthorizedError = dynamic(
  () => import("@/components/partials/UnauthorizedError"),
  { ssr: false }
);

type Props = {};

const UnauthorizedPage = () => {
  return <UnauthorizedError />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default UnauthorizedPage;
