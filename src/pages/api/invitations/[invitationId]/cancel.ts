import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import InvitationService from '@/services/invitation.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { invitationId } = req.query;
    await dbConnect();

    const result = await InvitationService.cancelInvitation(invitationId as string);
    
    return res.status(200).json({
      message: 'Invitation cancelled successfully',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: error.message || 'Failed to cancel invitation' 
    });
  }
} 