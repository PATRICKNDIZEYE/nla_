import OTP from "@/models/OTP";
import User from "@/models/User";
import Keys from "@/utils/constants/keys";
import { generateOTP } from "@/utils/helpers/function";
import axios from "axios";
import SmsService from "./SmsService";
import EmailService from "./email.service";

export default class OTPService {
  static async createOTP(username: string, email?: string) {
    try {
      console.log('Creating OTP for:', { username, email }); // Debug log
      const code = generateOTP(6);
      const exist = await OTP.findOne({ username });

      if (exist) {
        await exist.deleteOne();
      }

      const otp = new OTP({
        username,
        email,
        otp: code,
      });

      await otp.save();
      console.log('OTP saved to database'); // Debug log

      // Send via SMS if it's a phone number
      if (username.startsWith("7") && username.length === 9) {
        console.log('Sending OTP via SMS'); // Debug log
        await OTPService.sendOTP(username, code);
      }

      // Send via email if email is provided
      if (email) {
        console.log('Sending OTP via email to:', email); // Debug log
        try {
          await EmailService.sendEmail({
            to: email,
            subject: "Your OTP Code",
            html: `
              <h3>Your OTP Code</h3>
              <p>Your one-time password (OTP) is:</p>
              <h2 style="letter-spacing: 5px; font-size: 32px; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 4px;">
                ${code}
              </h2>
              <p>This code will expire in 5 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            `
          });
          console.log('Email sent successfully'); // Debug log
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't throw error here to allow SMS to work even if email fails
        }
      }

      return code;
    } catch (error) {
      console.error('Error in createOTP:', error);
      throw error;
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

  static async verifyOTP(username: string, otp: string): Promise<boolean> {
    const otpRecord = await OTP.findOne({ 
      username,
      otp,
      createdAt: { 
        $gt: new Date(Date.now() - 5 * 60 * 1000) // OTP valid for 5 minutes
      }
    });

    return !!otpRecord;
  }
}
