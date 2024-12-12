import { IProfile } from "./profile.type";

export type Role = "admin" | "user" | "manager";

export interface ILevel {
  // The role in the session
  role: Role;
  district: string;
  sector: string;
  // The original Role (This is not stored in the database but in the session)
  accountRole?: Role;
  isSwitch?: boolean;
}

export interface IAuth {
  phoneNumber: string;
  password: string;
}

export interface IAuthRegister {
  nationalId: number;
  password: string;
  phoneNumber: string;
  profile: IProfile;
  _id?: string;
  level?: ILevel;
  email?: string;

}

export interface IAuthRegisterResponse {
  user: IAuthRegister;
  token: string;
}
