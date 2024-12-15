import dbConnect from "@/lib/dbConnect";
import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { userId } = req.query;
  const { reactivatedBy } = req.body;

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const result = await UserService.reactivateAccount(
          userId as string,
          reactivatedBy
        );

        return res.status(200).json({
          message: "Account reactivated successfully",
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