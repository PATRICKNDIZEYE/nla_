import { NextApiRequest } from 'next';
import { Role } from './auth.type';

declare module 'next' {
  interface NextApiRequest {
    user?: {
      id: string;
      phoneNumber: string;
      role: Role;
      isSwitch?: boolean;
      accountRole?: Role;
    };
  }
} 