import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMessages, sendMessage, markMessagesAsRead } from '@/redux/features/chat/chat.slice';
import { Avatar, Button, Input, List, Upload, message } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

interface ChatBoxProps {
  disputeId: string;
  currentUserId: string;
  receiverId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ disputeId, currentUserId, receiverId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { messages, loading, error } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    console.log('Fetching messages with params:', {
      disputeId,
      userId: currentUserId
    });
    dispatch(getMessages({ 
      disputeId,
      userId: currentUserId
    }) as any);
  }, [dispatch, disputeId, currentUserId]);

  useEffect(() => {
    // Mark unread messages as read
    const unreadMessageIds = messages
      .filter(msg => !msg.read && msg.receiver._id === currentUserId)
      .map(msg => msg._id);
    
    if (unreadMessageIds.length > 0) {
      dispatch(markMessagesAsRead(unreadMessageIds) as any);
    }
  }, [messages, currentUserId, dispatch]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && fileList.length === 0) return;

    try {
      console.log('Preparing to send message with data:', {
        disputeId,
        currentUserId,
        receiverId,
        messageLength: newMessage.length,
        attachmentsCount: fileList.length
      });
      
      // Validate required fields
      if (!disputeId || !currentUserId || !receiverId) {
        console.error('Missing required fields:', { disputeId, currentUserId, receiverId });
        message.error('Missing required fields for sending message');
        return;
      }

      const formData = new FormData();
      formData.append('disputeId', disputeId);
      formData.append('senderId', currentUserId);
      formData.append('receiverId', receiverId);
      formData.append('message', newMessage.trim());

      // Append files if any
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });

      await dispatch(sendMessage(formData) as any);
      console.log('Message sent successfully');
      
      setNewMessage('');
      setFileList([]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      message.error(error.message || 'Failed to send message');
    }
  };

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4">
        <List
          dataSource={messages}
          loading={loading}
          renderItem={(msg) => {
            if (!msg?.sender?._id) {
              console.warn('Invalid message:', msg);
              return null;
            }

            const isSender = msg.sender._id === currentUserId;
            const senderName = msg.sender.profile?.ForeName 
              ? `${msg.sender.profile.ForeName} ${msg.sender.profile.Surnames || ''}`
              : 'Unknown User';

            return (
              <List.Item className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${isSender ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%] gap-2`}>
                  <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500">{senderName}</span>
                    <div className={`p-3 rounded-lg ${
                      isSender ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}>
                      <p className="m-0">{msg.message}</p>
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2">
                          {msg.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm ${isSender ? 'text-white' : 'text-blue-500'} underline`}
                            >
                              Attachment {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            multiple
            beforeUpload={() => false}
          >
            <Button icon={<PaperClipOutlined />} />
          </Upload>
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
          />
        </div>
        {fileList.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {fileList.length} file(s) attached
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox; 