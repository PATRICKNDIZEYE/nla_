import { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import DisputeChat from '@/components/dispute/DisputeChat';
import type { NextPageWithLayout } from '../_app';

const DisputeDetails: NextPageWithLayout = () => {
  return (
    <div>
      <DisputeChat />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

DisputeDetails.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DisputeDetails; 