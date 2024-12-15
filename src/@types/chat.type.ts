import { IUser } from "./user.type";

export interface IChat {
  _id: string;
  disputeId: string;
  sender: IUser;
  receiver: IUser;
  message: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
  updatedAt: string;
} 