import React, { useEffect, useState } from 'react';
import { Card, Tag, Timeline, Tooltip, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

interface AppealStatusDisplayProps {
  upiNumber: string;
}

interface AppealInfo {
  hasAppeals: boolean;
  appeals: Array<{
    claimId: string;
    status: string;
    appealHistory: Array<{
      appealedAt: string;
      appealReason: string;
      status: string;
      level: string;
    }>;
  }>;
  lastUpdate: string | null;
  daysFromLastUpdate: number;
}

const AppealStatusDisplay: React.FC<AppealStatusDisplayProps> = ({ upiNumber }) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [appealInfo, setAppealInfo] = useState<AppealInfo | null>(null);

  useEffect(() => {
    const fetchAppealStatus = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/disputes/appeal-status/${upiNumber}`);
        setAppealInfo(response.data);
      } catch (error) {
        console.error('Error fetching appeal status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (upiNumber) {
      fetchAppealStatus();
    }
  }, [upiNumber]);

  if (loading) {
    return <Spin />;
  }

  if (!appealInfo) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      appealed: 'blue'
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const getDaysTag = () => {
    const days = appealInfo.daysFromLastUpdate;
    if (days === 0) {
      return <Tag color="green">{t('Updated today')}</Tag>;
    }
    return (
      <Tooltip title={t('Days since last update')}>
        <Tag icon={<ClockCircleOutlined />} color={days > 2 ? 'warning' : 'default'}>
          {days} {t('days ago')}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Card 
      title={t('Appeal Status')}
      extra={getDaysTag()}
      className="mb-4"
    >
      {!appealInfo.hasAppeals ? (
        <div className="text-center py-4 text-gray-500">
          <ExclamationCircleOutlined className="mr-2" />
          {t('No appeals found for this UPI')}
        </div>
      ) : (
        <Timeline>
          {appealInfo.appeals.map((appeal, index) => (
            <Timeline.Item 
              key={appeal.claimId}
              color={getStatusColor(appeal.status)}
            >
              <div className="flex flex-col gap-1">
                <div className="font-medium">
                  {t('Case')}: {appeal.claimId}
                  <Tag 
                    color={getStatusColor(appeal.status)}
                    className="ml-2"
                  >
                    {appeal.status.toUpperCase()}
                  </Tag>
                </div>
                {appeal.appealHistory.map((history, hIndex) => (
                  <div key={`${appeal.claimId}-${hIndex}`} className="text-sm text-gray-600">
                    <div>
                      {new Date(history.appealedAt).toLocaleDateString()} - {t(history.level)}
                    </div>
                    <div className="text-gray-500">
                      {history.appealReason}
                    </div>
                  </div>
                ))}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Card>
  );
};

export default AppealStatusDisplay; 