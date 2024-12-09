import { QueryParams } from "@/@types/pagination";
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
    case "GET":
      try {
        const { data, pagination } = await UserService.getAllUsers(
          req.query as QueryParams
        );

        return res.status(200).json({
          message: "Users fetched successfully",
          data,
          pagination,
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
