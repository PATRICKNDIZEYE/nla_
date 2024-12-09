import { QueryParams } from "@/@types/pagination";
import dbConnect from "@/lib/dbConnect";
import OTPService from "@/services/OTPService";
import DisputeService from "@/services/dispute.service";
import ReportService from "@/services/report.service";
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
        let startDate = req.query.startDate as string;
        let endDate = req.query.endDate as string;

        const results = await DisputeService.getAllClaims_Pageless(
          req.query as QueryParams
        );

        if (!results?.data?.length) {
          return res.status(404).json({ message: "No data found" });
        }

        if (!startDate) {
          startDate = results.data[0].createdAt!;
        }

        if (!endDate) {
          endDate = results.data[results.data.length - 1].createdAt!;
        }

        const report = await ReportService.getReport(
          startDate,
          endDate,
          results.data,
          results.count,
          results.sessionUser.fullNames
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=disputes-report.pdf`
        );
        res.setHeader("Content-Length", report.pdf.length);
        return res.send(report.pdf);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
