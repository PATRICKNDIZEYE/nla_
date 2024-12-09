import { ReactElement } from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useTranslation } from "react-i18next";

import dynamic from "next/dynamic";
const RegisterForm = dynamic(
  () => import("@/components/partials/RegisterForm"),
  { ssr: false }
);

type Props = {
  // Add custom props here
};

const Register: NextPageWithLayout = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <center>
        <h2 className="text-black text-xl font-bold opacity-70">
          {t("register")}
        </h2>
      </center>
      <h1 className="mb-4 text-brand-gray text-lg font-semibold">
        {t("already-have-an-account")}{" "}
        <Link href="/login" className="text-brand-green">
          {t("login")}
        </Link>
      </h1>
      <RegisterForm />
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

Register.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default Register;
