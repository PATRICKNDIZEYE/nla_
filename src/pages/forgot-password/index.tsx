import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

const ForgotPasswordForm = dynamic(
  () => import("@/components/partials/ForgotPasswordForm"),
  { ssr: false }
);

type Props = {
  // Add custom props here
};

const ForgotPassword: NextPageWithLayout = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <center>
        <h2 className="text-black text-xl font-bold opacity-70">
          {t("forgot-password")}
        </h2>
      </center>
      <h1 className="text-brand-gray text-sm text-center mt-1 mb-4">
        {t("forgot-password-intro")}
      </h1>

      <ForgotPasswordForm />
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default ForgotPassword;
