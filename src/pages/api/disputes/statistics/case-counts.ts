import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import DisputeService from "@/services/dispute.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { userId } = req.query;
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const counts = await DisputeService.getCaseCountsByUser(userId as string);
        
        return res.status(200).json({
          message: "Case counts fetched successfully",
          data: {
            _id: userId,
            counts: {
              total: counts.total,
              open: counts.opened,
              processing: counts.processing,
              resolved: counts.resolved,
              rejected: counts.rejected,
              appealed: counts.appealed
            }
          }
        });
      } catch (error: any) {
        console.error('Error in GET /disputes/statistics/case-counts:', error);
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
} 