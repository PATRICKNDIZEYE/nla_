import dbConnect from "@/lib/dbConnect";
import DisputeService from "@/services/dispute.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { startDate, endDate, userId } = req.query;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const data = await DisputeService.countAndGroupByStatusAndMonth(
          userId as string,
          startDate as string,
          endDate as string
        );

        return res.status(200).json(data);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
