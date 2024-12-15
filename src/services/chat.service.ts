import { QueryParams } from "@/@types/pagination";
import Chat, { IChat } from "@/models/Chat";
import User from "@/models/User";
import { paginate } from "@/utils/helpers/function";
import mongoose from "mongoose";
import EmailService from "./email.service";
import SmsService from "./SmsService";

export default class ChatService {
  public static async getMessages(disputeId: string, params?: QueryParams) {
    try {
      console.log('Getting messages for dispute:', disputeId, 'with params:', params);
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 20);

      // Build query to get messages where user is either sender or receiver
      const query = {
        disputeId: new mongoose.Types.ObjectId(disputeId),
        $or: [
          { sender: params?.userId ? new mongoose.Types.ObjectId(params.userId) : null },
          { receiver: params?.userId ? new mongoose.Types.ObjectId(params.userId) : null }
        ]
      };

      console.log('Query:', JSON.stringify(query));
      const totalCount = await Chat.countDocuments(query);
      console.log('Total messages found:', totalCount);

      const messages = await Chat.find(query)
        .populate('sender', '_id profile email phoneNumber level')
        .populate('receiver', '_id profile email phoneNumber level')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Filter out any messages with invalid sender/receiver
      const validMessages = messages.filter(msg => 
        msg && msg.sender && msg.sender._id && 
        msg.receiver && msg.receiver._id
      );

      console.log('Retrieved messages:', validMessages.length);
      return {
        data: validMessages,
        pagination: paginate(totalCount, limit, page)
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  public static async sendMessage(data: {
    disputeId: string;
    senderId: string;
    receiverId: string;
    message: string;
    attachments?: string[];
  }) {
    try {
      console.log('Sending message with data:', {
        disputeId: data.disputeId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        messageLength: data.message?.length,
        attachmentsCount: data.attachments?.length
      });

      // Validate input data
      if (!data.disputeId || !data.senderId || !data.receiverId || !data.message) {
        throw new Error('Missing required fields');
      }

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(data.disputeId)) {
        throw new Error('Invalid dispute ID');
      }
      if (!mongoose.Types.ObjectId.isValid(data.senderId)) {
        throw new Error('Invalid sender ID');
      }
      if (!mongoose.Types.ObjectId.isValid(data.receiverId)) {
        throw new Error('Invalid receiver ID');
      }

      // Create and save the message
      const chat = await Chat.create({
        disputeId: new mongoose.Types.ObjectId(data.disputeId),
        sender: new mongoose.Types.ObjectId(data.senderId),
        receiver: new mongoose.Types.ObjectId(data.receiverId),
        message: data.message,
        attachments: data.attachments || []
      });

      console.log('Message saved with ID:', chat._id);

      // Populate sender and receiver details
      const populatedChat = await Chat.findById(chat._id)
        .populate('sender', 'profile email phoneNumber level')
        .populate('receiver', 'profile email phoneNumber level')
        .lean();

      if (!populatedChat) {
        throw new Error('Failed to retrieve populated chat message');
      }

      console.log('Message populated successfully');

      // Send notifications
      try {
        const receiver = await User.findById(data.receiverId);
        if (receiver) {
          console.log('Sending notifications to receiver:', receiver.email);
          
          // Send email notification
          if (receiver.email) {
            await EmailService.sendEmail({
              to: receiver.email,
              subject: `New Message - Case ${data.disputeId}`,
              html: `
                <p>You have received a new message regarding case ${data.disputeId}.</p>
                <p>Message: ${data.message}</p>
                <p>Please log in to the system to respond.</p>
              `
            });
            console.log('Email notification sent');
          }

          // Send SMS notification
          if (receiver.phoneNumber) {
            await SmsService.sendSms(
              receiver.phoneNumber,
              `New message received for case ${data.disputeId}. Please log in to view and respond.`
            );
            console.log('SMS notification sent');
          }
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't throw error here, as the message was already saved
      }

      return populatedChat;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public static async markAsRead(messageIds: string[]) {
    try {
      console.log('Marking messages as read:', messageIds);
      const result = await Chat.updateMany(
        { _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) } },
        { $set: { read: true } }
      );
      console.log('Mark as read result:', result);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  public static async getUnreadCount(userId: string) {
    try {
      console.log('Getting unread count for user:', userId);
      const count = await Chat.countDocuments({
        receiver: new mongoose.Types.ObjectId(userId),
        read: false
      });
      console.log('Unread count:', count);
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
} 