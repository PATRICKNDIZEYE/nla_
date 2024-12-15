import dbConnect from "@/lib/dbConnect";
import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { userId } = req.query;

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { method: otpMethod } = req.body;
        
        if (!['sms', 'email', 'both'].includes(otpMethod)) {
          return res.status(400).json({
            message: "Invalid OTP method",
          });
        }

        const result = await UserService.requestOTP(
          userId as string,
          otpMethod as 'sms' | 'email' | 'both'
        );

        return res.status(200).json({
          message: "OTP sent successfully",
          data: result,
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error.message,
        });
      }

    case "PUT":
      try {
        const { otp } = req.body;
        
        if (!otp) {
          return res.status(400).json({
            message: "OTP is required",
          });
        }

        const result = await UserService.verifyOTP(
          userId as string,
          otp
        );

        return res.status(200).json({
          message: "OTP verified successfully",
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