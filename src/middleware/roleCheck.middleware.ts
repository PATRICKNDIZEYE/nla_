import { NextApiRequest, NextApiResponse } from 'next';
import { getEffectiveRole } from '@/utils/helpers/roleCheck';
import User from '@/models/User';

export async function validateRoleAccess(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const { userId, role } = req.query;
    
    if (!userId || !role) {
      return res.status(400).json({
        message: 'Missing required parameters: userId or role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const effectiveRole = getEffectiveRole(user);
    if (effectiveRole !== role) {
      return res.status(403).json({
        message: 'Invalid role for this user'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Error validating role access'
    });
  }
} 