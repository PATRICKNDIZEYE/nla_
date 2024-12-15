import React, { useState } from 'react';
import { Button, Card, Form, Modal, Upload, Input, List, message } from 'antd';
import { UploadOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { shareDocuments } from '@/redux/features/dispute/dispute.slice';
import { IDispute } from '@/@types/dispute.type';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;

interface CommitteeDocumentsProps {
  dispute: IDispute;
  canShare?: boolean;
}

const CommitteeDocuments: React.FC<CommitteeDocumentsProps> = ({ dispute, canShare = false }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Filter documents shared with committee
  const committeeDocuments = dispute.sharedDocuments?.filter(
    doc => doc.recipientType.includes('committee')
  ) || [];

  const handleShare = async () => {
    try {
      setUploading(true);
      const values = await form.validateFields();
      
      if (!fileList.length) {
        message.error(t('Please upload at least one document'));
        return;
      }

      const formData = new FormData();
      
      // Append files
      fileList.forEach((file) => {
        if (file.originFileObj) {
          console.log('Appending file to FormData:', file.name);
          formData.append('documents', file.originFileObj);
        }
      });

      // Append recipientType
      console.log('Appending recipientType to FormData: committee');
      formData.append('recipientType[]', 'committee');

      // Append message if exists
      if (values.message) {
        console.log('Appending message to FormData');
        formData.append('message', values.message);
      }

      console.log('Sharing documents for dispute:', dispute._id);
      console.log('Form data contents:', {
        filesCount: fileList.length,
        message: values.message,
        recipientType: 'committee'
      });

      const result = await dispatch(shareDocuments({
        disputeId: dispute._id,
        formData
      }) as any).unwrap();

      console.log('Share documents result:', result);

      message.success(t('Documents shared successfully'));
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      console.error('Error sharing documents:', error);
      message.error(error.message || t('Failed to share documents'));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  return (
    <Card 
      title={t("Committee Documents")}
      extra={canShare && (
        <Button 
          type="primary" 
          icon={<UploadOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t("Share Documents")}
        </Button>
      )}
    >
      {committeeDocuments.length > 0 ? (
        <List
          dataSource={committeeDocuments}
          renderItem={doc => (
            <List.Item
              actions={[
                <Button 
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  href={doc.url}
                  target="_blank"
                >
                  {t("Download")}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={doc.name}
                description={new Date(doc.sharedAt).toLocaleString()}
              />
            </List.Item>
          )}
        />
      ) : (
        <div className="text-center text-gray-500 py-4">
          {t("No documents shared with committee yet")}
        </div>
      )}

      <Modal
        title={t("Share Documents with Committee")}
        open={isModalVisible}
        onOk={handleShare}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        confirmLoading={uploading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="documents"
            label={t("Documents")}
            rules={[{ required: true, message: t("Please upload at least one document") }]}
          >
            <Upload
              multiple
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              listType="text"
              fileList={fileList}
              onChange={handleUploadChange}
            >
              <Button icon={<UploadOutlined />}>{t("Upload Documents")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="message"
            label={t("Message for Committee")}
          >
            <TextArea 
              rows={4} 
              placeholder={t("Add a message for the committee members")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CommitteeDocuments; 