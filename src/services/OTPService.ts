import OTP from "@/models/OTP";
import User from "@/models/User";
import Keys from "@/utils/constants/keys";
import { generateOTP } from "@/utils/helpers/function";
import axios from "axios";
import SmsService from "./SmsService";

export default class OTPService {
  static async createOTP(username: string) {
    const code = generateOTP(6);
    const exist = await OTP.findOne({ username });

    if (exist) {
      await exist.deleteOne();
    }
    const otp = new OTP({
      username,
      otp: code,
    });

    await otp.save();

    if (username.startsWith("7") && username.length === 9) {
      await OTPService.sendOTP(username, code);
    }
  }

  static async sendOTP(phone: string, otp: string) {
    const message = `OTP is ${otp}`;
    await SmsService.sendSms(phone, message);
  }

  static async checkUser(username: string) {
    const user = await User.findOne({ phoneNumber: username });
    return user;
  }
}
