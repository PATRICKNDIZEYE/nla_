import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import DisputeService from "@/services/dispute.service";

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
        const { email, phoneNumber, fullName, nationalId } = req.body;
        
        if (!email || !phoneNumber || !fullName) {
          return res.status(400).json({
            message: "Email, phone number, and full name are required"
          });
        }

        const result = await DisputeService.assignDefendant(disputeId as string, {
          email,
          phoneNumber,
          fullName,
          nationalId
        });

        // Handle partial success cases
        if (result.status === 'PARTIAL_SUCCESS') {
          return res.status(207).json({
            message: "Defendant assigned but with some notification issues",
            data: result.dispute,
            warnings: result.warnings
          });
        }

        return res.status(200).json({
          message: "Defendant assigned and notified successfully",
          data: result.dispute
        });
      } catch (error: any) {
        console.error('Error in POST /disputes/[disputeId]/assign-defendant:', error);
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
} 