import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '@/@types/auth.type';
import UserService from '@/services/user.service';

type NextApiHandlerWithAuth = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | NextApiResponse>;

export function withAuth(handler: NextApiHandlerWithAuth, allowedRoles: Role[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify and decode token
      const user = UserService.decodeAcessToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
      }

      // Add user info to request
      req.user = user;

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
  };
} 