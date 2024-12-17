import { QueryParams } from "@/@types/pagination";
import dbConnect from "@/lib/dbConnect";
import InvitationService from "@/services/invitation.service";
import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/user";

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
        const { userId, role, ...restQuery } = req.query;
        console.log('Invitations API Request:', { 
          userId, 
          role, 
          restQuery,
          hasRole: Boolean(role),
          roleType: typeof role
        });

        if (!userId || !role) {
          console.warn('Missing userId or role:', { userId, role });
          return res.status(400).json({ 
            message: "userId and role are required parameters" 
          });
        }

        const filter: any = {};

        // Role-based filtering for invitations
        if (role === 'user') {
          filter.$or = [
            { claimant: userId },
            { invitedBy: userId },
            { invitees: { $in: ["claimant", "defendant", "witnesses"] } },
            { 'dispute.claimant': userId },
            { 'dispute.defendant': userId }
          ];
        } else if (role === 'manager') {
          const user = await User.findById(userId);
          if (user?.level?.district) {
            filter.district = user.level.district.toLowerCase();
          }
        }
        // Admin sees all invitations (no filter)

        console.log('Final invitation filter:', filter);

        const invitations = await InvitationService.getAll({
          ...restQuery,
          userId: userId.toString(),
          role: role.toString(),
          filter
        });

        return res.status(200).json(invitations);
      } catch (error) {
        console.error('Error in GET /invitations:', error);
        return res.status(500).json({ message: error.message });
      }
    case "POST":
      const result = await InvitationService.create(newData);
      return res.status(201).json({
        message: "Invitation created successfully",
        data: result,
      });

    default:
      return res.status(400).json({
        message: "Method is not allowed",
      });
  }
}
