import dbConnect from "@/lib/dbConnect";
import DisputeService from "@/services/dispute.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { startDate, endDate, userId, role } = req.query;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        if (!userId) {
          return res.status(400).json({ message: "userId is required" });
        }

        console.log('Fetching status counts with params:', { startDate, endDate, userId, role });
        
        const data = await DisputeService.countAndGroupByStatus(
          userId as string,
          startDate as string,
          endDate as string,
          role as string
        );

        console.log('Status count response:', data);
        return res.status(200).json(data);
      } catch (error: any) {
        console.error('Error in count-status API:', error);
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
