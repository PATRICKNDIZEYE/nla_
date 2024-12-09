import { ReactElement } from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/partials/LoginForm"), {
  ssr: false,
});

type Props = {
  // Add custom props here
};

const Login: NextPageWithLayout = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <center>
        <h2 className="text-black text-xl font-bold opacity-70">
          {t("login")}
        </h2>
      </center>
      <h1 className="mb-4 text-black-900 text-lg font-semibold">
        {t("dont-have-account")}{" "}
        <Link href="/register" className="text-brand-green">
          {t("register")}
        </Link>{" "}
      </h1>

      <LoginForm />
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

Login.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default Login;
