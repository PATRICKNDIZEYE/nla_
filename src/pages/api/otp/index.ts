import dbConnect from "@/lib/dbConnect";
import OTPService from "@/services/OTPService";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { checkUser } = req.query;
  let { phone, email } = req.body;
  
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        if (checkUser) {
          const user = await OTPService.checkUser(phone);
          if (!user) {
            return res.status(404).json({
              message: "Account not found, please register first",
            });
          }
          // If user exists, use their email from the database
          email = user.email;
        }

        console.log('Sending OTP to:', { phone, email }); // Debug log
        await OTPService.createOTP(phone, email);
        
        const message = email 
          ? "OTP sent successfully, please check your phone and email"
          : "OTP sent successfully, please check your phone";

        return res.status(200).json({ message });
      } catch (error: any) {
        console.error('Error in OTP API:', error);
        return res.status(500).json({
          message: error.message || "Failed to send OTP",
        });
      }

    case "PUT":
      try {
        const { otp } = req.body;
        const isValid = await OTPService.verifyOTP(phone, otp);
        
        if (!isValid) {
          return res.status(400).json({
            message: "Invalid or expired OTP",
          });
        }

        return res.status(200).json({
          message: "OTP verified successfully",
        });
      } catch (error: any) {
        return res.status(500).json({
          message: error.message || "Failed to verify OTP",
        });
      }

    default:
      return res.status(405).json({
        message: "Method not allowed",
      });
  }
}
