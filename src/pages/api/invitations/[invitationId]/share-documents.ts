import dbConnect from "@/lib/dbConnect";
import InvitationService from "@/services/invitation.service";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { promises as fs } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { invitationId } = req.query;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const form = formidable({ multiples: true });
        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        });

        // Convert files to buffer for storage
        const documents = Array.isArray(files.documents) ? files.documents : [files.documents];
        const documentBuffers = await Promise.all(
          documents.map(async (file) => {
            const content = await fs.readFile(file.filepath);
            return {
              filename: file.originalFilename,
              buffer: content,
              mimetype: file.mimetype,
            };
          })
        );

        const result = await InvitationService.shareDocuments(
          invitationId as string,
          {
            documents: documentBuffers,
            recipientType: fields.recipientType as string[],
            message: fields.message as string,
          }
        );

        return res.status(200).json({
          message: "Documents shared successfully",
          data: result,
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error.message,
        });
      }
    default:
      return res.status(405).json({
        message: "Method not allowed",
      });
  }
} 