import { QueryParams } from "@/@types/pagination";
import dbConnect from "@/lib/dbConnect";
import { parseForm } from "@/lib/libForm";
import DisputeService from "@/services/dispute.service";
import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { fields, files } = await parseForm(req);

        const fileLetter = files.letter?.map(
          (f) => `/uploads/${f.newFilename}`
        );
        if (!fileLetter?.length) {
          return res.status(400).json({
            message: "Please upload letter",
          });
        }
        const fileSectorReport = files.sectorReport?.map(
          (f) => `/uploads/${f.newFilename}`
        );
        if (!fileSectorReport?.length) {
          return res.status(400).json({
            message: "Please upload sector report",
          });
        }

        const deedPlan = files.deedPlan?.map(
          (f) => `/uploads/${f.newFilename}`
        );

        const otherDocuments = files.otherDocuments?.map(
          (f) => `/uploads/${f.newFilename}`
        );

        const payload: any = {
          ...fields,
          letter: fileLetter[0],
          sectorReport: fileSectorReport[0],
          deedPlan: deedPlan ? deedPlan[0] : null,
          otherDocuments: otherDocuments ? otherDocuments : [],
        };

        payload.defendant = JSON.parse(payload?.defendant);
        if (payload?.witnesses) {
          payload.witnesses = JSON.parse(payload?.witnesses);
        }
        payload.land = payload?.land ? JSON.parse(payload.land) : null;
        payload.upiNumber = payload.upiNumber.toString();
        payload.disputeType = payload.disputeType.toString();
        payload.userId = payload.userId.toString();
        payload.district =
          payload.land?.parcelLocation?.district?.districtName?.toLowerCase();

        if (payload.secondLands) {
          payload.secondLands = JSON.parse(payload.secondLands);
        }

        payload.summary = payload.summary.toString();

        const dispute = await DisputeService.createClaim(
          payload,
          payload.userId
        );

        return res.status(200).json({
          message: "Dispute created successfully",
          data: dispute,
        });
      } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      }

    case "GET":
      try {
        const { userId, district, status, isSwitch, role, ...restQuery } = req.query;
        console.log('API Request Query:', req.query);
        
        const filter: any = {};
        
        // Use role from query params (session) instead of querying database
        console.log('User role from session:', role);
        
        // Only filter by userId if not admin and not in switch mode
        if (userId && !isSwitch && role !== 'admin') {
          console.log('Adding user filter:', userId);
          filter.claimant = userId;
        }
        
        if (district) {
          console.log('Adding district filter:', district);
          filter.district = district.toString().toLowerCase();
        }

        if (status) {
          console.log('Adding status filter:', status);
          filter.status = status;
        }

        console.log('Final filter:', filter);
        console.log('Rest query params:', restQuery);

        const disputes = await DisputeService.getAllClaims({ 
          ...restQuery,
          userId: userId?.toString(),
          role: role?.toString(),
          filter 
        });
        
        console.log('Disputes found:', {
          count: disputes.data.length,
          totalItems: disputes.pagination.totalItems,
          userRole: role
        });

        return res.status(200).json(disputes);
      } catch (error: any) {
        console.error('Error in GET /disputes:', error);
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
