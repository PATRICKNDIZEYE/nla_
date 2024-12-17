import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import InvitationService from "@/services/invitation.service";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const result = await InvitationService.getAll(req.query);
        return res.status(200).json(result);
      } catch (error: any) {
        return res.status(500).json({
          message: error.message || "Failed to get invitations",
        });
      }

    case "POST":
      try {
        const result = await InvitationService.create(req.body);
        return res.status(201).json({
          message: "Invitation created successfully",
          data: result,
        });
      } catch (error: any) {
        return res.status(500).json({
          message: error.message || "Failed to create invitation",
        });
      }

    default:
      return res.status(405).json({
        message: "Method not allowed",
      });
  }
}
