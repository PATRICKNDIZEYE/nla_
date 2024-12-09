import mongoose from "mongoose";

interface LogUser {
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
}

export interface Logs extends mongoose.Document {
  user: string | LogUser;
  action: string;
  target: string;
  targettype: string;
  createdAt?: string;
  updatedAt?: string;
}

const LogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    required: true,
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targettype: {
    type: String,
    required: true,
  },
});

LogSchema.set("timestamps", true);

export default (mongoose.models.Log as mongoose.Model<Logs>) ||
  mongoose.model<Logs>("Log", LogSchema);
