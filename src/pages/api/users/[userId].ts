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
        // Validate required fields
        const { level } = req.body;
        if (!level || !level.role) {
          return res.status(400).json({
            message: "Level and role are required",
          });
        }

        // Validate role value
        const validRoles = ['user', 'admin', 'manager'];
        if (!validRoles.includes(level.role)) {
          return res.status(400).json({
            message: "Invalid role value",
          });
        }

        // If role is manager, district is required
        if (level.role === 'manager' && !level.district) {
          return res.status(400).json({
            message: "District is required for manager role",
          });
        }

        const data = await UserService.updateLevel(
          level,
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
