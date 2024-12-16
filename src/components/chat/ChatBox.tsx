import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMessages, sendMessage, markMessagesAsRead } from '@/redux/features/chat/chat.slice';
import { Avatar, Button, Input, List, Upload, Tooltip } from 'antd';
import { SendOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { getEffectiveRole } from '@/utils/helpers/roleCheck';

interface ChatBoxProps {
  disputeId: string;
  currentUserId: string;
  receiverId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ disputeId, currentUserId, receiverId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const previousMessagesLength = useRef(0);

  const { messages, loading } = useSelector((state: RootState) => state.chat);
  const { data: currentUser } = useSelector((state: RootState) => state.profile);

  // Handle scroll events
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    
    setIsUserScrolling(true);
    setShouldScrollToBottom(isAtBottom);
  };

  // Auto refresh messages every 10 seconds
  useEffect(() => {
    const fetchMessages = () => {
      dispatch(getMessages({ 
        disputeId,
        userId: currentUserId
      }) as any);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);

    return () => clearInterval(interval);
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

  // Scroll handling
  useEffect(() => {
    if (!chatContainerRef.current || !messagesEndRef.current) return;

    // Check if new messages were added
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    // Only auto-scroll if:
    // 1. User hasn't scrolled manually, or
    // 2. User is already at the bottom, or
    // 3. It's the initial load
    if (!isUserScrolling || shouldScrollToBottom || messages.length <= 1) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: messages.length <= 1 ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  }, [messages, shouldScrollToBottom, isUserScrolling]);

  const handleSend = async () => {
    if (!newMessage.trim() && fileList.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('disputeId', disputeId);
      formData.append('senderId', currentUserId);
      formData.append('receiverId', receiverId);
      formData.append('message', newMessage.trim());
      
      // Add current user's effective role information
      if (currentUser?.level) {
        const effectiveRole = getEffectiveRole(currentUser);
        formData.append('senderRole', JSON.stringify({
          role: effectiveRole,
          isSwitch: currentUser.level.isSwitch || false,
          accountRole: currentUser.level.accountRole,
          district: currentUser.level.district
        }));
      }

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });

      await dispatch(sendMessage(formData) as any);
      setNewMessage('');
      setFileList([]);
      // Force scroll to bottom when sending a new message
      setShouldScrollToBottom(true);
      setIsUserScrolling(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          bg: 'bg-[#1a365d]',
          text: 'text-[#1a365d]',
          light: 'bg-[#e2e8f0]'
        };
      case 'manager':
        return {
          bg: 'bg-[#2f4858]',
          text: 'text-[#2f4858]',
          light: 'bg-[#e5e9eb]'
        };
      default:
        return {
          bg: 'bg-[#4a5568]',
          text: 'text-[#4a5568]',
          light: 'bg-[#edf2f7]'
        };
    }
  };

  // Sort messages to show most recent at the bottom
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getActualRole = (userLevel: any) => {
    if (!userLevel) return 'USER';
      return getEffectiveRole(userLevel) || 'USER';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Messages List */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="h-[350px] overflow-y-auto p-3"
      >
        <List
          dataSource={sortedMessages}
          loading={loading}
          className="space-y-2"
          renderItem={(msg) => {
            if (!msg?.sender?._id) return null;

            const isSender = msg.sender._id === currentUserId;
            const senderName = msg.sender.profile?.ForeName 
              ? `${msg.sender.profile.ForeName} ${msg.sender.profile.Surnames || ''}`
              : 'Unknown User';
            
            const actualRole = getActualRole(msg.sender.level);
            const colors = getRoleColor(actualRole);
            const roleDisplay = actualRole.toUpperCase();

            return (
              <List.Item className="border-0 p-0">
                <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                  {/* Sender Info - Simplified */}
                  <div className="flex items-center gap-2 mb-1">
                    <Tooltip title={`${senderName} (${roleDisplay})`}>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.light} ${colors.text}`}>
                        {roleDisplay}
                      </span>
                    </Tooltip>
                  </div>

                  {/* Message Content - Simplified */}
                  <div className={`max-w-full ${isSender ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`p-2 rounded-lg ${
                      isSender 
                        ? `${colors.bg} text-white` 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          {msg.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-xs ${
                                isSender ? 'text-white/90 hover:text-white' : 'text-blue-600 hover:text-blue-700'
                              } underline mr-2`}
                            >
                              <PaperClipOutlined />
                              File {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Simplified */}
      <div className="p-2 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            multiple
            beforeUpload={() => false}
          >
            <Button 
              size="small"
              icon={<PaperClipOutlined />}
              className="flex items-center justify-center"
            />
          </Upload>
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            className="flex-1 text-sm resize-none rounded"
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="small"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700"
          />
        </div>
        {fileList.length > 0 && (
          <div className="mt-1 pl-8">
            <span className="text-xs text-gray-500">
              {fileList.length} file(s) attached
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox; 