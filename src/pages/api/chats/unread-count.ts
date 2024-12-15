import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import ChatService from "@/services/chat.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  if (method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    const count = await ChatService.getUnreadCount(userId as string);

    return res.status(200).json({
      message: "Unread count fetched successfully",
      count
    });
  } catch (error: any) {
    console.error('Error in GET /chats/unread-count:', error);
    return res.status(500).json({ message: error.message });
  }
} 