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
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 20);

      const query = {
        disputeId: new mongoose.Types.ObjectId(disputeId)
      };

      const totalCount = await Chat.countDocuments(query);

      const messages = await Chat.find(query)
        .populate('sender', 'profile email phoneNumber level')
        .populate('receiver', 'profile email phoneNumber level')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        data: messages,
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
      const { disputeId, senderId, receiverId, message, attachments } = data;

      // Create and save the message
      const chat = await Chat.create({
        disputeId,
        sender: senderId,
        receiver: receiverId,
        message,
        attachments
      });

      // Populate sender and receiver details
      const populatedChat = await Chat.findById(chat._id)
        .populate('sender', 'profile email phoneNumber level')
        .populate('receiver', 'profile email phoneNumber level');

      // Send notifications
      const receiver = await User.findById(receiverId);
      if (receiver) {
        // Send email notification
        await EmailService.sendEmail({
          to: receiver.email,
          subject: `New Message - Case ${disputeId}`,
          html: `
            <p>You have received a new message regarding case ${disputeId}.</p>
            <p>Message: ${message}</p>
            <p>Please log in to the system to respond.</p>
          `
        });

        // Send SMS notification
        if (receiver.phoneNumber) {
          await SmsService.sendSms(
            receiver.phoneNumber,
            `New message received for case ${disputeId}. Please log in to view and respond.`
          );
        }
      }

      return populatedChat;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public static async markAsRead(messageIds: string[]) {
    try {
      await Chat.updateMany(
        { _id: { $in: messageIds } },
        { $set: { read: true } }
      );
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  public static async getUnreadCount(userId: string) {
    try {
      const count = await Chat.countDocuments({
        receiver: new mongoose.Types.ObjectId(userId),
        read: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
} 