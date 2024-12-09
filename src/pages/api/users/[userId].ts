import dbConnect from "@/lib/dbConnect";
import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { userId, updatedBy } = req.query;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const data = await UserService.getUserById(userId as string);

        if (!data) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        return res.status(200).json({
          message: "User fetched successfully",
          data,
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error.message,
        });
      }
    case "PUT":
      try {
        const userData = req.body;
        const data = await UserService.updateLevel(
          userData,
          userId as string,
          updatedBy as string
        );

        return res.status(200).json({
          message: "User level updated successfully",
          data,
        });
      } catch (error: any) {
        return res.status(400).json({
          message: error.message,
        });
      }
    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
