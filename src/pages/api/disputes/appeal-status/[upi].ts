import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import DisputeService from '@/services/dispute.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { upi } = req.query;

    if (!upi || typeof upi !== 'string') {
      return res.status(400).json({ message: 'Invalid UPI number' });
    }

    const appealStatus = await DisputeService.getAppealStatusByUPI(upi);
    return res.status(200).json(appealStatus);
  } catch (error) {
    console.error('Error in appeal status API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 