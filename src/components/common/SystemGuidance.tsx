import React from 'react';
import { Tour } from 'antd';
import { useTranslation } from 'next-i18next';

export const SystemGuidance: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);

  const steps = [
    {
      title: t('Welcome to LDMS'),
      description: t('Let us guide you through the main features of the system'),
      target: () => document.querySelector('.dashboard-header')
    },
    {
      title: t('Creating a New Case'),
      description: t('Click here to start a new land dispute case'),
      target: () => document.querySelector('.new-case-button')
    },
    // Add more steps as needed
  ];

  return (
    <>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={steps}
        current={current}
        onChange={setCurrent}
      />
      <button
        className="help-button"
        onClick={() => setOpen(true)}
      >
        {t('Need Help?')}
      </button>
    </>
  );
}; 