import { ReactElement } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/pages/_app";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import dynamic from "next/dynamic";

const ListInvitations = dynamic(
  () => import("@/components/dashboard/invitations/ListInvitations"),
  { ssr: false }
);

type Props = {
  // Add custom props here
};

const InvitationsPage: NextPageWithLayout = () => {
  return <ListInvitations />;
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

InvitationsPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default InvitationsPage;
