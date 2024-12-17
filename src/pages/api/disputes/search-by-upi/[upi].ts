import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DisputeService from '@/services/dispute.service';
// import { withAuth } from '@/middleware/auth.middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { upi } = req.query;

    if (!upi || typeof upi !== 'string') {
      return res.status(400).json({ message: 'Invalid UPI number' });
    }

    // Get all disputes for this UPI
    const disputes = await DisputeService.getDisputesByUPI(upi);
    return res.status(200).json(disputes);
  } catch (error) {
    console.error('Error in UPI search API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Wrap the handler with auth middleware to ensure only admin/manager can access
// export default withAuth(handler, ['admin', 'manager']); 
export default handler;
