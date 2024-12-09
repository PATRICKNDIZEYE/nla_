import { IAuthRegister } from "./auth.type";

export interface ILog {
  _id: string;
  user: IAuthRegister;
  action: string;
  target: string;
  targettype: string;
  createdAt: string;
}
