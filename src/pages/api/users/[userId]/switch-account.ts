import dbConnect from "@/lib/dbConnect";
import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { userId } = req.query;
  const { targetRole } = req.body;

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        if (!['user', 'manager'].includes(targetRole)) {
          return res.status(400).json({
            message: "Invalid target role",
          });
        }

        const result = await UserService.switchAccount(
          userId as string,
          targetRole as 'user' | 'manager'
        );

        return res.status(200).json({
          message: "Account switched successfully",
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