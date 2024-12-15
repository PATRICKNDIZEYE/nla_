import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, Tabs } from 'antd';
import ChatBox from '../chat/ChatBox';
import { getUnreadCount } from '@/redux/features/chat/chat.slice';
import { IDispute } from '@/@types/dispute.type';
import { IUser } from '@/@types/user.type';

interface DisputeChatProps {
  dispute: IDispute;
  currentUser: IUser;
}

const DisputeChat: React.FC<DisputeChatProps> = ({ dispute, currentUser }) => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(getUnreadCount(currentUser._id) as any);
  }, [dispatch, currentUser._id]);

  // Determine chat participants based on user role and dispute details
  const getChatParticipants = () => {
    const participants = [];

    // Admin can chat with both claimant and defendant
    if (currentUser.level?.role === 'admin') {
      if (dispute.claimant?._id) {
        participants.push({
          key: 'claimant',
          label: `Claimant (${dispute.claimant.profile?.ForeName} ${dispute.claimant.profile?.Surnames})`,
          userId: dispute.claimant._id
        });
      }
      if (dispute.defendant?._id) {
        participants.push({
          key: 'defendant',
          label: `Defendant (${dispute.defendant.fullName})`,
          userId: dispute.defendant._id
        });
      }
    }
    // Claimant can chat with admin
    else if (currentUser._id === dispute.claimant?._id && (dispute.openedBy?._id || dispute.resolvedBy?._id)) {
      participants.push({
        key: 'admin',
        label: 'Administrator',
        userId: dispute.openedBy?._id || dispute.resolvedBy?._id
      });
    }
    // Defendant can chat with admin
    else if (currentUser._id === dispute.defendant?._id && (dispute.openedBy?._id || dispute.resolvedBy?._id)) {
      participants.push({
        key: 'admin',
        label: 'Administrator',
        userId: dispute.openedBy?._id || dispute.resolvedBy?._id
      });
    }

    // Filter out any participants without a valid userId
    return participants.filter(participant => participant.userId);
  };

  const participants = getChatParticipants();

  if (participants.length === 0) {
    return null;
  }

  return (
    <Card title="Messages" className="mb-4">
      <Tabs
        items={participants.map(participant => ({
          key: participant.key,
          label: (
            <span>
              {participant.label}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          ),
          children: (
            <ChatBox
              disputeId={dispute._id}
              currentUserId={currentUser._id}
              receiverId={participant.userId}
            />
          )
        }))}
      />
    </Card>
  );
};

export default DisputeChat; 