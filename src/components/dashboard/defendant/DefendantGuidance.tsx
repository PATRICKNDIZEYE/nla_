import React from 'react';
import { useTranslation } from 'next-i18next';
import { Card, Steps, Alert, List, Typography } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, BulbOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DefendantGuidance: React.FC = () => {
  const { t } = useTranslation('common');

  const steps = [
    {
      title: t('defendant-guidance.steps.step1').split(':')[0],
      description: t('defendant-guidance.steps.step1').split(':')[1],
    },
    {
      title: t('defendant-guidance.steps.step2').split(':')[0],
      description: t('defendant-guidance.steps.step2').split(':')[1],
    },
    {
      title: t('defendant-guidance.steps.step3').split(':')[0],
      description: t('defendant-guidance.steps.step3').split(':')[1],
    },
    {
      title: t('defendant-guidance.steps.step4').split(':')[0],
      description: t('defendant-guidance.steps.step4').split(':')[1],
    },
    {
      title: t('defendant-guidance.steps.step5').split(':')[0],
      description: t('defendant-guidance.steps.step5').split(':')[1],
    },
  ];

  const tips = [
    t('defendant-guidance.tips.tip1'),
    t('defendant-guidance.tips.tip2'),
    t('defendant-guidance.tips.tip3'),
    t('defendant-guidance.tips.tip4'),
  ];

  return (
    <div className="space-y-6">
      <Alert
        message={t('defendant-guidance.welcome')}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-6"
      />

      <Card title={t('defendant-guidance.steps.title')} className="mb-6">
        <Steps
          direction="vertical"
          current={-1}
          items={steps}
          className="max-w-3xl"
        />
      </Card>

      <Card 
        title={
          <span>
            <BulbOutlined className="mr-2" />
            {t('defendant-guidance.tips.title')}
          </span>
        }
      >
        <List
          dataSource={tips}
          renderItem={(tip) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleOutlined className="text-green-500" />}
                description={tip}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DefendantGuidance; 