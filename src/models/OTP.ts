import mongoose from "mongoose";

export interface OTPs extends mongoose.Document {
  username: string;
  email: string;
  otp: string;
  createdAt: Date;
}

const OTPSchema = new mongoose.Schema<OTPs>({
  username: {
    type: String,
    required: [true, "Please provide a username for this OTP."],
    maxlength: [60, "Username cannot be more than 60 characters"],
  },
  otp: {
    type: String,
    required: [true, "Please provide an otp for this OTP."],
    maxlength: [6, "OTP cannot be more than 60 characters"],
  },
});

OTPSchema.set("timestamps", true);

export default (mongoose.models.OTP as mongoose.Model<OTPs>) ||
  mongoose.model("OTP", OTPSchema);
