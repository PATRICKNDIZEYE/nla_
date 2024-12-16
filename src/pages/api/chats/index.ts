import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import ChatService from "@/services/chat.service";
import formidable from "formidable";
import { uploadToStorage } from "@/utils/helpers/storage";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  console.log('Chat API called with method:', method);
  
  try {
    await dbConnect();
    console.log('Database connected');

    switch (method) {
      case "GET":
        try {
          const { disputeId, ...params } = req.query;
          console.log('GET request params:', { disputeId, params });
          
          if (!disputeId) {
            return res.status(400).json({
              message: "Dispute ID is required"
            });
          }

          const messages = await ChatService.getMessages(
            disputeId as string,
            params
          );

          console.log('Retrieved messages:', messages.data.length);
          return res.status(200).json(messages);
        } catch (error: any) {
          console.error('Error in GET /chats:', error);
          return res.status(500).json({ message: error.message });
        }

      case "POST":
        try {
          console.log('Processing POST request');
          
          // Parse form data
          const form = formidable({ multiples: true });
          const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) reject(err);
              resolve([fields, files]);
            });
          });
          
          console.log('Parsed form fields:', fields);
          console.log('Parsed files:', Object.keys(files));

          // Validate required fields
          if (!fields.disputeId?.[0] || !fields.senderId?.[0] || !fields.receiverId?.[0] || !fields.message?.[0]) {
            return res.status(400).json({
              message: "Missing required fields"
            });
          }

          // Handle file uploads if any
          const attachments = [];
          if (files.attachments) {
            console.log('Processing file attachments');
            const fileArray = Array.isArray(files.attachments) ? files.attachments : [files.attachments];
            for (const file of fileArray) {
              const fileName = `chat-${Date.now()}-${file.originalFilename}`;
              console.log('Uploading file:', fileName);
              const fileBuffer = await fs.promises.readFile(file.filepath);
              const fileUrl = await uploadToStorage(fileBuffer, fileName, file.mimetype || 'application/octet-stream');
              attachments.push(fileUrl);
              // Clean up temp file
              await fs.promises.unlink(file.filepath);
            }
          }

          // Parse sender role information if provided
          let senderRole;
          if (fields.senderRole?.[0]) {
            try {
              senderRole = JSON.parse(fields.senderRole[0]);
              console.log('Parsed sender role:', senderRole);
            } catch (error) {
              console.error('Error parsing sender role:', error);
            }
          }

          console.log('Creating chat message with attachments:', attachments.length);
          const message = await ChatService.sendMessage({
            disputeId: fields.disputeId[0] as string,
            senderId: fields.senderId[0] as string,
            receiverId: fields.receiverId[0] as string,
            message: fields.message[0] as string,
            attachments,
            senderRole
          });

          console.log('Message created successfully:', message._id);
          return res.status(200).json({
            message: "Message sent successfully",
            data: message
          });
        } catch (error: any) {
          console.error('Error in POST /chats:', error);
          return res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }

      default:
        return res.status(405).json({
          message: "Method not allowed"
        });
    }
  } catch (error: any) {
    console.error('Error connecting to database:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 