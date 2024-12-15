import { QueryParams } from "@/@types/pagination";
import OTP from "@/models/OTP";
import User, { Users } from "@/models/User";
import Keys from "@/utils/constants/keys";
import { generateFilter, paginate } from "@/utils/helpers/function";
import { compare, genSaltSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import LogService from "./log.service";
import EmailService from "./email.service";
import SmsService from "./SmsService";
import mongoose from "mongoose";

export default class UserService {
  static async login(phoneNumber: string, password: string, otp: string) {
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) throw new Error("Invalid phone number or password");

      const isMatch = await UserService.comparePassword(password, user.password);
      if (!isMatch) throw new Error("Invalid phone number or password");

      const isExistOtp = await OTP.findOne({
        username: phoneNumber,
        otp,
      });
      if (!isExistOtp) throw new Error("Invalid OTP");

      // Check if OTP is not expired in 5 minutes
      const now = new Date();
      const diff = now.getTime() - isExistOtp.createdAt.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      if (minutes > 5) throw new Error("OTP expired");

      LogService.create({
        user: user._id,
        action: `Logged in`,
        targettype: `User`,
        target: user._id,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async resetPassword(phoneNumber: string, password: string, otp: string) {
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) throw new Error("Invalid phone number or password");

      const isExistOtp = await OTP.findOne({
        username: phoneNumber,
        otp,
      });
      if (!isExistOtp) throw new Error("Invalid OTP");

      // Check if OTP is not expired in 5 minutes
      const now = new Date();
      const diff = now.getTime() - isExistOtp.createdAt.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      if (minutes > 5) throw new Error("OTP expired");

      user.password = UserService.hashPassword(password);
      await user.save();

      LogService.create({
        user: user._id,
        action: `Reset password`,
        targettype: `User`,
        target: user._id,
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static comparePassword(password: string, hash: string) {
    return compare(password, hash);
  }

  static hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  static async createUser(user: any) {
    try {
      const existUser = await User.findOne({ phoneNumber: user.phoneNumber });
      if (existUser) throw new Error("Phone number already exists");

      const existOtp = await OTP.findOne({
        username: user.phoneNumber,
        otp: user.otp,
      });
      if (!existOtp) throw new Error("Invalid OTP");

      // Check if OTP is not expired in 5 minutes
      const now = new Date();
      const diff = now.getTime() - existOtp.createdAt.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      if (minutes > 5) throw new Error("OTP expired");

      user.password = UserService.hashPassword(user.password);

      const newUser = new User({
        ...user,
        level: { role: "user" },
      });
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static signInToken(
    params: object,
    time = Keys.EXPIRES_IN || "24h",
    secret = Keys.JWT_SECRET
  ) {
    const token = jwt.sign(params, secret, { expiresIn: time });
    return token;
  }

  static decodeAcessToken(token: string) {
    const content = jwt.verify(token, Keys.JWT_SECRET);
    return content;
  }
  static decode(token: string) {
    const content = jwt.verify(token, Keys.JWT_SECRET);
    return content;
  }


  static async getAllUsers(params?: QueryParams) {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);

    const filter = generateFilter(params!, [
      "role",
      "status",
      "level.role",
      "_id",
      "nationalId",
      "phoneNumber",
    ]);

    const search = params?.search;
    let $or: any[] = [{}];

    if (search) {
      $or = [
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.ForeName": { $regex: search, $options: "i" } },
        { "profile.Surnames": { $regex: search, $options: "i" } },
        { nationalId: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find({
      ...filter,
      datetimedeleted: null,
      $or,
    })
      .select(
        "-password -profile.Photo -profile.Signature -profile.FingerPrint -role -schedules -__v"
      )
      .sort({ createdAt: -1 })
      .skip(Math.abs(limit * (page - 1)))
      .limit(limit);

    const count = await User.countDocuments({
      ...filter,
      datetimedeleted: null,
      $or,
    });

    const pagination = paginate(count, limit, page);
    return { data: users, pagination };
  }

  static async getUserById(id: string) {
    const user = await User.findOne({ _id: id, datetimedeleted: null });
    return user;
  }

  static async updateLevel(level: Users["level"], userId: string, updatedBy: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.level = level;
    await user.save();

    LogService.create({
      user: updatedBy,
      action: `Updated level to ${level.role}`,
      targettype: `User`,
      target: user._id,
    });

    return user;
  }

  static async suspendAccount(
    userId: string,
    suspendedBy: string,
    reason: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already suspended
    if (user.accountStatus === 'suspended') {
      throw new Error("User is already suspended");
    }

    // Update user status
    user.accountStatus = 'suspended';
    user.suspendedAt = new Date();
    user.suspendedBy = new mongoose.Types.ObjectId(suspendedBy);
    user.suspensionReason = reason;
    await user.save();

    // Notify user via email and SMS
    if (user.email) {
      await EmailService.sendEmail({
        to: user.email,
        subject: "Account Suspended",
        html: `
          <p>Dear ${user.profile?.ForeName},</p>
          <p>Your account has been suspended for the following reason:</p>
          <p>${reason}</p>
          <p>If you believe this is a mistake, please contact our support team.</p>
        `
      });
    }

    if (user.phoneNumber) {
      await SmsService.sendSms(
        user.phoneNumber,
        `Your account has been suspended. Reason: ${reason}. Please contact support if you believe this is a mistake.`
      );
    }

    // Log the action
    await LogService.create({
      user: suspendedBy,
      action: `Suspended user account`,
      targettype: "User",
      target: user._id,
    });

    return user;
  }

  static async reactivateAccount(
    userId: string,
    reactivatedBy: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is suspended
    if (user.accountStatus !== 'suspended') {
      throw new Error("User is not suspended");
    }

    // Update user status
    user.accountStatus = 'active';
    user.suspendedAt = null;
    user.suspendedBy = null;
    user.suspensionReason = null;
    await user.save();

    // Notify user via email and SMS
    if (user.email) {
      await EmailService.sendEmail({
        to: user.email,
        subject: "Account Reactivated",
        html: `
          <p>Dear ${user.profile?.ForeName},</p>
          <p>Your account has been reactivated. You can now log in to your account.</p>
        `
      });
    }

    if (user.phoneNumber) {
      await SmsService.sendSms(
        user.phoneNumber,
        "Your account has been reactivated. You can now log in to your account."
      );
    }

    // Log the action
    await LogService.create({
      user: reactivatedBy,
      action: `Reactivated user account`,
      targettype: "User",
      target: user._id,
    });

    return user;
  }

  static async switchAccount(userId: string, targetRole: 'user' | 'manager') {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Store the original role if not already stored
    const originalRole = user.level.accountRole || user.level.role;
    
    // Check if switching is allowed
    if (originalRole !== 'manager') {
      throw new Error("Account switching is only available for district managers");
    }

    // Update user level
    user.level = {
      ...user.level,
      role: targetRole,
      accountRole: originalRole, // Store the original role
      isSwitch: targetRole !== originalRole, // Flag to indicate if account is switched
    };

    await user.save();

    // Log the action
    await LogService.create({
      user: userId,
      action: `Switched account to ${targetRole} role`,
      targettype: "User",
      target: user._id,
    });

    return user;
  }

  static async requestOTP(userId: string, method: 'sms' | 'email' | 'both') {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP
    const otpRecord = new OTP({
      username: user.phoneNumber,
      otp,
    });
    await otpRecord.save();

    // Send OTP via selected methods
    const messages: Promise<any>[] = [];

    if (method === 'sms' || method === 'both') {
      if (!user.phoneNumber) {
        throw new Error("Phone number not available");
      }
      messages.push(
        SmsService.sendSms(
          user.phoneNumber,
          `Your OTP is: ${otp}. Valid for 5 minutes.`
        )
      );
    }

    if (method === 'email' || method === 'both') {
      if (!user.email) {
        throw new Error("Email not available");
      }
      messages.push(
        EmailService.sendEmail({
          to: user.email,
          subject: "Your OTP Code",
          html: `
            <p>Dear ${user.profile?.ForeName},</p>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>This code is valid for 5 minutes.</p>
          `
        })
      );
    }

    await Promise.all(messages);

    return { success: true };
  }

  static async verifyOTP(userId: string, otp: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const otpRecord = await OTP.findOne({
      username: user.phoneNumber,
      otp,
    });

    if (!otpRecord) {
      throw new Error("Invalid OTP");
    }

    // Check if OTP is expired (5 minutes)
    const now = new Date();
    const diff = now.getTime() - otpRecord.createdAt.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    
    if (minutes > 5) {
      throw new Error("OTP has expired");
    }

    // Delete used OTP
    await otpRecord.deleteOne();

    return { success: true };
  }
}
