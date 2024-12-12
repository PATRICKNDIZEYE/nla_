import { IAuthRegister } from "./auth.type";

export interface IAttachment {
  filename?: string;
  size?: number;
  url: string;
}

export interface IWitness {
  fullName: string;
  phoneNumber: string;
}

export interface IDefendant {
  fullName: string;
  phoneNumber: string;
}

export interface IWithdrawal {
  date?: Date;
  reason: string;
  attachments: IAttachment[];
  approvedBy?: IAuthRegister;
}

export interface IComment {
  _id: string;
  user: IAuthRegister;
  datecreated?: string;
  timecreated?: string;
  comment: string;
}

export interface IDisputeCategory {
  _id: string;
  name: string;
  description: string;
}

export interface IDispute {
  summary: string;
  deedPlan?: string;
  otherDocuments?: string[];
  _id?: string;
  claimant?: IAuthRegister;
  status?:
    | "open"
    | "processing"
    | "closed"
    | "resolved"
    | "rejected"
    | "appealed"
    | "withdrawn";
  upiNumber: string;
  land?: ILandData;
  defendant: IDefendant;
  withdrawal?: IWithdrawal;
  disputeType: string;
  assignees?: IAuthRegister[];
  attachments: IAttachment[];
  comments: IComment[];
  villageLeaderPhone: string;
  witnesses: IWitness[];
  resolvedBy?: IAuthRegister;
  claimId?: string;
  letter?: string;
  sectorReport?: string;
  invitationProof?: string;
  secondLands: ILandData[];
  feedback?: string;
  rejectReason?: string;
  appealReason?: string;
  level: "district" | "nla" | "court";
  overdueDays?: number;
  createdAt: string;
  stampedLetter?: string;
  submissionDate: string;
  lastUpdated: string;
  processingDays: number;
  defendantSignupLink?: string;
  defendantSignupExpiry?: string;
  autoAssignmentStatus?: "pending" | "completed" | "failed";
}

export interface IAppeal {
  _id?: string;
  claimant?: IAuthRegister;
  status?: "open" | "processing" | "closed" | "resolved";
  dispute: IDispute;
  assignees?: IAuthRegister[];
  attachments: IAttachment[];
  comments: IComment[];
  villageLeaderPhone: string;
  witnesses: IWitness[];
  resolvedBy?: IAuthRegister;
}
