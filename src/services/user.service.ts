import { QueryParams } from "@/@types/pagination";
import OTP from "@/models/OTP";
import User, { Users } from "@/models/User";
import Keys from "@/utils/constants/keys";
import { generateFilter, paginate } from "@/utils/helpers/function";
import { compare, genSaltSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import LogService from "./log.service";

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
}
