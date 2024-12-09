import dbConnect from "@/lib/dbConnect";
import OTPService from "@/services/OTPService";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { checkUser } = req.query;
  const { phone } = req.body;
  await dbConnect();

  switch (method) {
    case "POST":
      if (checkUser) {
        const user = await OTPService.checkUser(phone);
        if (!user) {
          return res.status(404).json({
            message: "Account not found, please register first",
          });
        }
      }

      await OTPService.createOTP(phone);
      return res.status(200).json({
        message: "OTP sent successfully, please check your phone",
      });
    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
