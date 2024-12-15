import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import ChatService from "@/services/chat.service";
import { parseForm } from "@/lib/libForm";
import { uploadToStorage } from "@/utils/helpers/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { disputeId, ...params } = req.query;
        
        if (!disputeId) {
          return res.status(400).json({
            message: "Dispute ID is required"
          });
        }

        const messages = await ChatService.getMessages(
          disputeId as string,
          params
        );

        return res.status(200).json(messages);
      } catch (error: any) {
        console.error('Error in GET /chats:', error);
        return res.status(500).json({ message: error.message });
      }

    case "POST":
      try {
        const { fields, files } = await parseForm(req);
        
        // Handle file uploads if any
        const attachments = [];
        if (files.attachments) {
          for (const file of files.attachments) {
            const fileName = `chat-${Date.now()}-${file.newFilename}`;
            const fileUrl = await uploadToStorage(file.buffer, fileName, file.mimetype);
            attachments.push(fileUrl);
          }
        }

        const message = await ChatService.sendMessage({
          disputeId: fields.disputeId as string,
          senderId: fields.senderId as string,
          receiverId: fields.receiverId as string,
          message: fields.message as string,
          attachments
        });

        return res.status(200).json({
          message: "Message sent successfully",
          data: message
        });
      } catch (error: any) {
        console.error('Error in POST /chats:', error);
        return res.status(500).json({ message: error.message });
      }

    default:
      return res.status(405).json({
        message: "Method not allowed"
      });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}; 