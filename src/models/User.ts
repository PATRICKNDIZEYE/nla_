import { IProfile } from "@/@types/profile.type";
import mongoose from "mongoose";

export interface Users extends mongoose.Document {
  nationalId: string;
  phoneNumber: string;
  level: {
    role: 'user' | 'admin' | 'manager';
    district?: string;
  };
  email: string;
  profile: IProfile;
  password: string;
  datetimedeleted: string;
  verified: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const UserSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  level: {
    role: {
      type: String,
      required: true,
      default: "user",
    },
    district: {
      type: String,
      required: false,
      default: null,
    },
  },
  email: {
    type: String,
    default: null,
  },
  profile: {},
  password: {
    type: String,
    required: true,
  },
  datetimedeleted: {
    type: String,
    required: false,
    default: null,
  },
  verified: {
    type: Boolean,
    required: false,
    default: true,
  },
  status: {
    type: String,
    required: false,
    default: "active",
  },
});

UserSchema.set("timestamps", true);

export default (mongoose.models.User as mongoose.Model<Users>) ||
  mongoose.model<Users>("User", UserSchema);
