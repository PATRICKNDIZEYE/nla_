import React, { useState } from 'react';
import { Input, Card, Table, Tag, Statistic, Row, Col, Alert, Spin, Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';

interface DisputeData {
  _id: string;
  claimId: string;
  status: string;
  isAppealed: boolean;
  createdAt: string | null;
  claimant: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  } | null;
  appealHistory?: Array<{
    appealedAt: string;
    appealReason: string;
    status: string;
  }>;
  daysSinceLastUpdate: number;
}

interface UPISearchResponse {
  disputes: DisputeData[];
  summary: {
    total: number;
    appealed: number;
    nonAppealed: number;
  };
}

const UPISearch: React.FC = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UPISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleSearch = async (upiNumber: string) => {
    if (!upiNumber) {
      setError(t('Please enter a UPI number'));
      return;
    }

    const upiRegex = /^(\d{1})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d{1,4})$/;
    if (!upiRegex.test(upiNumber)) {
      setError(t('Invalid UPI format'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/disputes/search-by-upi/' + encodeURIComponent(upiNumber));
      const { data } = response;
      
      if (data.disputes.length === 0) {
        setError(t('No cases found for this UPI'));
        setDrawerVisible(false);
      } else {
        setSearchResults(data);
        setDrawerVisible(true);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError(
        error.response?.data?.message || 
        t('Error searching for disputes. Please try again.')
      );
      setDrawerVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DisputeData> = [
    {
      title: t('Case ID'),
      dataIndex: 'claimId',
      key: 'claimId',
      width: 120,
      render: (claimId: string) => claimId || t('N/A'),
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record) => (
        <Tag color={record.isAppealed ? 'blue' : 'green'}>
          {status || t('Unknown')}
        </Tag>
      ),
    },
    {
      title: t('Claimant'),
      dataIndex: ['claimant', 'fullName'],
      key: 'claimant',
      width: 200,
      ellipsis: true,
      render: (_, record) => record.claimant?.fullName || t('N/A'),
    },
    {
      title: t('Date Filed'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : t('N/A'),
    },
    {
      title: t('Appeal Status'),
      key: 'appealStatus',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          {record.isAppealed ? (
            <Tag color="blue">{t('Appealed')}</Tag>
          ) : (
            <Tag color="default">{t('Not Appealed')}</Tag>
          )}
          {record.appealHistory && record.appealHistory.length > 0 && (
            <div className="text-xs text-gray-500">
              {t('Last appeal')}: {new Date(record.appealHistory[0].appealedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('Days Since Update'),
      key: 'daysSinceUpdate',
      width: 150,
      render: (_, record) => (
        <Tag color={record.daysSinceLastUpdate > 2 ? 'orange' : 'green'}>
          {record.daysSinceLastUpdate} {t('days')}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Input.Search
          placeholder={t('Search by UPI (e.g., 1/02/03/01/123)')}
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          loading={loading}
          className="max-w-xl"
        />
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mt-2"
          />
        )}
      </div>

      <Drawer
        title={t('UPI Search Results')}
        placement="right"
        width={window.innerWidth > 1200 ? 1000 : window.innerWidth > 768 ? 720 : '100%'}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="upi-search-drawer"
      >
        {searchResults && (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title={t('Total Cases')}
                    value={searchResults.summary.total}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title={t('Appealed Cases')}
                    value={searchResults.summary.appealed}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title={t('Non-Appealed Cases')}
                    value={searchResults.summary.nonAppealed}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={searchResults.disputes}
              rowKey="_id"
              loading={loading}
              pagination={false}
              scroll={{ x: 800, y: 'calc(100vh - 400px)' }}
              className="border rounded-lg"
              size="middle"
            />
          </>
        )}
      </Drawer>
    </>
  );
};

export default UPISearch; 