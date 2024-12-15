import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMessages, sendMessage, markMessagesAsRead } from '@/redux/features/chat/chat.slice';
import { Avatar, Button, Input, List, Upload, message } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { formatDistanceToNow } from 'date-fns';

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

  const { messages, loading } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(getMessages({ disputeId }) as any);
  }, [dispatch, disputeId]);

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

    const formData = new FormData();
    formData.append('disputeId', disputeId);
    formData.append('senderId', currentUserId);
    formData.append('receiverId', receiverId);
    formData.append('message', newMessage);

    fileList.forEach(file => {
      formData.append('attachments', file.originFileObj as File);
    });

    try {
      await dispatch(sendMessage(formData) as any);
      setNewMessage('');
      setFileList([]);
    } catch (error) {
      message.error('Failed to send message');
    }
  };

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
            const isSender = msg.sender._id === currentUserId;
            return (
              <List.Item className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${isSender ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%]`}>
                  <Avatar 
                    className={`${isSender ? 'ml-2' : 'mr-2'}`}
                    src={msg.sender.profile?.avatar}
                  >
                    {msg.sender.profile?.ForeName?.[0]}
                  </Avatar>
                  <div>
                    <div className={`
                      rounded-lg p-3 mb-1
                      ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-100'}
                    `}>
                      <div>{msg.message}</div>
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2">
                          {msg.attachments.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm underline"
                            >
                              Attachment {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs text-gray-500 ${isSender ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </div>
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