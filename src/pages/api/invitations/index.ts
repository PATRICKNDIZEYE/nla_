import { QueryParams } from "@/@types/pagination";
import dbConnect from "@/lib/dbConnect";
import InvitationService from "@/services/invitation.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const newData = req.body;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { data, pagination } = await InvitationService.getAll(
          req.query as QueryParams
        );

        return res.status(200).json({
          message: "Invitations fetched successfully",
          data,
          pagination,
        });
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    case "POST":
      const result = await InvitationService.create(newData);
      return res.status(201).json({
        message: "Invitation created successfully",
        data: result,
      });

    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
