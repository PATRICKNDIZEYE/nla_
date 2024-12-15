import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import ChatService from "@/services/chat.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  if (method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        message: "Message IDs array is required"
      });
    }

    await ChatService.markAsRead(messageIds);

    return res.status(200).json({
      message: "Messages marked as read",
      success: true
    });
  } catch (error: any) {
    console.error('Error in POST /chats/mark-read:', error);
    return res.status(500).json({ message: error.message });
  }
} 