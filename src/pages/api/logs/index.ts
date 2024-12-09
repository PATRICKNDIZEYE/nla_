import { QueryParams } from "@/@types/pagination";
import dbConnect from "@/lib/dbConnect";
import LogService from "@/services/log.service";
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
        const { data, pagination } = await LogService.getAll(
          req.query as QueryParams
        );

        return res.status(200).json({
          message: "Logs fetched successfully",
          data,
          pagination,
        });
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    case "POST":
      const result = await LogService.create(newData);
      return res.status(201).json({
        message: "Log created successfully",
        data: result,
      });

    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
