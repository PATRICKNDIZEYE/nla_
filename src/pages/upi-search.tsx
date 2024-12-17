import React from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import UPISearch from '@/components/dashboard/dispute/UPISearch';
import DashboardLayout from '@/templates/layouts/DashboardLayout';

const UPISearchPage: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('UPI Case Search')}</h1>
        <UPISearch />
      </div>
    </DashboardLayout>
  );
};

export default UPISearchPage; 