import dbConnect from "@/lib/dbConnect";
import InvitationService from "@/services/invitation.service";
import { NextApiRequest, NextApiResponse } from "next";

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
        const result = await InvitationService.assignDefendant(invitationId as string);
        return res.status(200).json({
          message: "Defendant assigned successfully",
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