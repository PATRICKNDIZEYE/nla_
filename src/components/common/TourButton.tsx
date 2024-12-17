import React, { useState } from 'react';
import Button from 'antd/lib/button';
import Tour from 'antd/lib/tour';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSystemTour } from '@/components/hooks/tour';

interface TourButtonProps {
  tourId: string;
  className?: string;
}

const TourButton: React.FC<TourButtonProps> = ({ tourId, className }) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const systemTour = useSystemTour();
  const tour = systemTour.getTour(tourId);

  if (!tour || tour.steps.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={() => setOpen(true)}
        className={className}
      >
        {t('Help')}
      </Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={tour.steps}
        type="primary"
      />
    </>
  );
};

export default TourButton; 