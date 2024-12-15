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

  // Add detailed debug logging
  console.log('DisputeChat - Current User:', {
    id: currentUser._id,
    role: currentUser.level?.role,
    isClaimant: currentUser._id === dispute.claimant?._id,
    isDefendant: currentUser._id === dispute.defendant?._id,
    fullData: currentUser
  });
  
  console.log('DisputeChat - Dispute:', {
    id: dispute._id,
    claimantId: dispute.claimant?._id,
    defendantId: dispute.defendant?._id,
    openedById: dispute.openedBy?._id,
    resolvedById: dispute.resolvedBy?._id,
    status: dispute.status,
    fullData: dispute
  });

  // Show appropriate message based on dispute status and user role
  const getStatusMessage = () => {
    if (currentUser._id === dispute.claimant?._id) {
      if (dispute.status === 'open' && !dispute.openedBy?._id) {
        return "Chat will be available once an administrator or district manager reviews your case.";
      }
      if (!dispute.defendant?._id) {
        return "Chat will be available once a defendant is assigned to the case.";
      }
    }
    if (currentUser._id === dispute.defendant?._id) {
      if (!dispute.openedBy?._id && !dispute.resolvedBy?._id) {
        return "Chat will be available once an administrator or district manager reviews the case.";
      }
    }
    if (currentUser.level?.role === 'manager' && currentUser.level?.district?.toLowerCase() !== dispute.district?.toLowerCase()) {
      return "Chat is only available for disputes in your district.";
    }
    return "No chat participants available at this time.";
  };

  // Determine chat participants based on user role and dispute details
  const getChatParticipants = () => {
    const participants = [];
    console.log('Getting chat participants with conditions:', {
      isAdmin: currentUser.level?.role === 'admin',
      isDistrictManager: currentUser.level?.role === 'manager',
      isClaimant: currentUser._id === dispute.claimant?._id,
      isDefendant: currentUser._id === dispute.defendant?._id,
      hasOpenedBy: Boolean(dispute.openedBy?._id),
      hasResolvedBy: Boolean(dispute.resolvedBy?._id),
      hasDefendant: Boolean(dispute.defendant?._id),
      hasClaimant: Boolean(dispute.claimant?._id),
      userDistrict: currentUser.level?.district,
      disputeDistrict: dispute.district,
      status: dispute.status
    });

    // Admin or District Manager can chat with both claimant and defendant
    if (currentUser.level?.role === 'admin' || 
        (currentUser.level?.role === 'manager' && 
         currentUser.level?.district?.toLowerCase() === dispute.district?.toLowerCase())) {
      console.log('Admin/Manager user - adding available participants');
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
    // Claimant can chat with admin/manager and defendant once case is being processed
    else if (currentUser._id === dispute.claimant?._id && (dispute.openedBy?._id || dispute.status !== 'open')) {
      console.log('Claimant user - adding available participants');
      // Chat with admin/manager
      const adminId = dispute.openedBy?._id || dispute.resolvedBy?._id;
      if (adminId) {
        const adminLabel = dispute.openedBy?.level?.role === 'manager' ? 'District Manager' : 'Administrator';
        participants.push({
          key: 'admin',
          label: adminLabel,
          userId: adminId
        });
      }
      // Chat with defendant if assigned
      if (dispute.defendant?._id) {
        participants.push({
          key: 'defendant',
          label: `Defendant (${dispute.defendant.fullName})`,
          userId: dispute.defendant._id
        });
      }
    }
    // Defendant can chat with admin/manager and claimant once case is being processed
    else if (currentUser._id === dispute.defendant?._id && (dispute.openedBy?._id || dispute.status !== 'open')) {
      console.log('Defendant user - adding available participants');
      // Chat with admin/manager
      const adminId = dispute.openedBy?._id || dispute.resolvedBy?._id;
      if (adminId) {
        const adminLabel = dispute.openedBy?.level?.role === 'manager' ? 'District Manager' : 'Administrator';
        participants.push({
          key: 'admin',
          label: adminLabel,
          userId: adminId
        });
      }
      // Chat with claimant
      if (dispute.claimant?._id) {
        participants.push({
          key: 'claimant',
          label: `Claimant (${dispute.claimant.profile?.ForeName} ${dispute.claimant.profile?.Surnames})`,
          userId: dispute.claimant._id
        });
      }
    }

    console.log('DisputeChat - Participants found:', participants);

    // Filter out any participants without a valid userId
    return participants.filter(participant => {
      const isValid = Boolean(participant.userId);
      if (!isValid) {
        console.log('Filtering out invalid participant:', participant);
      }
      return isValid;
    });
  };

  const participants = getChatParticipants();

  if (participants.length === 0) {
    console.log('DisputeChat - No participants found, showing status message. Current user role:', currentUser.level?.role);
    return (
      <Card title="Messages" className="mb-4">
        <div className="text-center text-gray-500 py-4">
          {getStatusMessage()}
        </div>
      </Card>
    );
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