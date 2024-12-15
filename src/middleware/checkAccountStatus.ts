import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export async function checkAccountStatus(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(token.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended',
        reason: user.suspensionReason,
        suspendedAt: user.suspendedAt
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
} 