import dbConnect from "@/lib/dbConnect";
import { parseForm } from "@/lib/libForm";
import { Disputes } from "@/models/Dispute";
import DisputeService from "@/services/dispute.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { disputeId, userId, status } = req.query;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const dispute = await DisputeService.getById(disputeId as string);
        if (!dispute) {
          return res.status(404).json({
            message: "Dispute not found",
          });
        }
        return res.status(200).json({
          message: "Dispute fetched successfully",
          data: dispute,
        });
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({
          message: "Internal server error",
          error: error.message,
        });
      }
    case "PUT":
      try {
        if (!userId) {
          return res.status(400).json({
            message: "Please provide userId",
          });
        }
        if (!status) {
          return res.status(400).json({
            message: "Please provide status",
          });
        }

        const { fields, files } = await parseForm(req);
        const feedback = fields.feedback?.toString();

        const stampedLetter = files.stampedLetter?.map(
          (f) => `/uploads/${f.newFilename}`
        );

        const dispute = await DisputeService.updateClaimStatus(
          disputeId as string,
          status as Disputes["status"],
          userId as string,
          feedback as string,
          stampedLetter?.length ? stampedLetter[0] : undefined
        );
        return res.status(200).json({
          message: "Dispute updated successfully",
          data: dispute,
        });
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({
          message: "Internal server error",
          error: error.message,
        });
      }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
