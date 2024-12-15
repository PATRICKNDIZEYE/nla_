import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import DisputeService from "@/services/dispute.service";
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
  const { disputeId } = req.query;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const form = formidable({ 
          multiples: true,
          keepExtensions: true,
        });

        // Parse form data
        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        });

        console.log('Received fields:', fields);
        console.log('Received files:', files);

        // Handle files array properly
        const fileArray = Array.isArray(files.documents) 
          ? files.documents 
          : files.documents 
            ? [files.documents] 
            : [];

        if (!fileArray.length) {
          return res.status(400).json({
            message: "At least one document is required"
          });
        }

        // Convert files to buffer for storage
        const documentBuffers = await Promise.all(
          fileArray.map(async (file) => {
            if (!file.filepath) {
              throw new Error(`Invalid file object: ${JSON.stringify(file)}`);
            }
            const content = await fs.readFile(file.filepath);
            return {
              filename: file.originalFilename || 'unnamed-file',
              buffer: content,
              mimetype: file.mimetype || 'application/octet-stream',
            };
          })
        );

        console.log('Processing documents:', documentBuffers.length);

        // Extract recipientType from fields
        const recipientType = Array.isArray(fields['recipientType[]']) 
          ? fields['recipientType[]'] 
          : fields['recipientType[]'] 
            ? [fields['recipientType[]']] 
            : ['committee']; // default to committee if not specified

        // Call service with proper parameters
        const result = await DisputeService.shareDocuments(
          disputeId as string,
          {
            documents: documentBuffers,
            recipientType: recipientType as ('committee' | 'defendant' | 'claimant')[],
            message: fields.message ? String(fields.message) : undefined,
          }
        );

        return res.status(200).json({
          message: "Documents shared successfully",
          data: result
        });
      } catch (error: any) {
        console.error('Error in POST /disputes/[disputeId]/share-documents:', error);
        return res.status(400).json({ message: error.message });
      }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
} 