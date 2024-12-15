import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';

interface ContextualHelpProps {
  topic: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ topic }) => {
  const { t } = useTranslation();
  
  const helpTexts: Record<string, string> = {
    'upi': t('The Unique Parcel Identifier is a unique number assigned to each land parcel'),
    'disputeType': t('Select the type of dispute that best describes your case'),
    // Add more help texts
  };

  return (
    <Tooltip title={helpTexts[topic]}>
      <QuestionCircleOutlined className="text-gray-400 ml-1" />
    </Tooltip>
  );
}; 