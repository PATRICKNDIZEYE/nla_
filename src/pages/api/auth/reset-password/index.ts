import dbConnect from "@/lib/dbConnect";
import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { phoneNumber, password, otp } = req.body;
        if (!phoneNumber || !password) {
          return res.status(400).json({
            message: "Please provide phone number and password",
          });
        }

        const user = await UserService.resetPassword(
          phoneNumber,
          password,
          otp
        );

        const token = UserService.signInToken({
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.level.role,
        });

        return res.status(200).json({
          message: "Login successful",
          data: { user, token },
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error.message,
        });
      }
    default:
      return res.status(400).json({
        message: "Only POST method is allowed",
      });
  }
}
