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
    case "PUT":
      const result = await InvitationService.cancelInvitation(
        invitationId as string
      );
      return res.status(200).json({
        message: "Invitation cancelled successfully",
        data: result,
      });
    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
