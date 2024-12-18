import mongoose from "mongoose";

export interface Invitations extends mongoose.Document {
  dateTime: string;
  dispute: any;
  invitedBy: any;
  invitees: string[];
  isCanceled?: boolean;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  claimant?: any;
  district?: string;
  level?: {
    role: string;
    district?: string;
  };
}

export type IInvitation = Pick<
  Invitations,
  | "invitedBy"
  | "invitees"
  | "dispute"
  | 'claimant'
  | "dateTime"
  | "isCanceled"
  | "_id"
  | "location"
>;

const InvitationSchema = new mongoose.Schema<Invitations>({
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispute",
  },
  dateTime: {
    type: String,
    required: true,
  },
  invitees: [String],
  isCanceled: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    required: true,
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  district: {
    type: String,
    required: false
  },
  level: {
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user'
    },
    district: String
  }
});

InvitationSchema.set("timestamps", true);

export default (mongoose.models.Invitation as mongoose.Model<Invitations>) ||
  mongoose.model<Invitations>("Invitation", InvitationSchema);
