import { QueryParams } from "@/@types/pagination";
import Dispute, { Disputes } from "@/models/Dispute";
import User from "@/models/User";
import { generateFilter, paginate } from "@/utils/helpers/function";
import EmailService from "./email.service";
import mongoose from "mongoose";
import SmsService from "./SmsService";
import LogService from "./log.service";
import Keys from "@/utils/constants/keys";

export default class DisputeService {
  public static getAllClaims = async (params?: QueryParams) => {
    const user = await User.findById(params?.userId);
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);

    const search = params?.search;

    const filter = generateFilter(params as QueryParams, [
      "status",
      "claimant.level.role",
      "_id",
      "openedBy._id",
      "resolvedBy._id",
      "level",
    ]);

    if (user?.level?.role === "user") {
      filter["claimant"] = new mongoose.Types.ObjectId(user._id);
    } else if (user?.level?.district) {
      filter["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      filter["level"] = "nla";
    }

    let $or = [{}];

    if (search) {
      $or = [
        { upiNumber: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { "claimant.profile.ForeName": { $regex: search, $options: "i" } },
        { "claimant.profile.Surnames": { $regex: search, $options: "i" } },
        {
          "claimant.nationalId": { $regex: search, $options: "i" },
        },
        {
          disputeType: { $regex: search, $options: "i" },
        },
        {
          "claimant.phoneNumber": { $regex: search, $options: "i" },
        },
        {
          "claimant.profile.Email": { $regex: search, $options: "i" },
        },
        {
          "defendant.fullName": { $regex: search, $options: "i" },
        },
        {
          "defendant.phoneNumber": { $regex: search, $options: "i" },
        },
        {
          claimId: { $regex: search, $options: "i" },
        },
      ];
    }

    const claims = await Dispute.find({
      ...filter,
      $or,
    })
      .populate("claimant resolvedBy openedBy")
      .sort({ createdAt: -1 })
      .skip(Math.abs(limit * (page - 1)))
      .limit(limit);

    const count = await Dispute.countDocuments({
      ...filter,
      $or,
    });
    const pagination = paginate(count, limit, page);

    const disputes = claims.map((dispute) => ({
      ...dispute.toJSON(),
      overdueDays: DisputeService.calculateOverdueDays(dispute),
    }));
    return { data: disputes, pagination };
  };

  public static getById = async (id: string, options: object = {}) => {
    const claim = await Dispute.findOne({
      ...(Number(id) ? { claimId: id } : { _id: id }),
      ...options,
    }).populate("claimant resolvedBy disputeType openedBy");
    return claim;
  };

  public static createClaim = async (data: any, userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User account is not found");
    }
    const claim = await Dispute.create({
      ...data,
      claimant: userId,
    });
    const { phoneNumber } = user;
    const message = `Your claim ${claim.claimId} has been submitted`;
    SmsService.sendSms(phoneNumber, message);
    const { phoneNumber: defendantPhone } = claim.defendant;
    const defendantMessage = `Claim ${claim.claimId} filed against you has been submitted`;
    SmsService.sendSms(defendantPhone, defendantMessage);
    const witnessMessage = `Claim ${claim.claimId} where you are a witness has been submitted`;
    claim.witnesses.forEach((witness: any) => {
      SmsService.sendSms(witness.phoneNumber, witnessMessage);
    });
    claim.claimant = user;

    EmailService.notifyCreateDispute(claim, user);

    EmailService.notifyAssignedDispute(claim);

    // res.locals.user.id, claim.id, "Create", "Claim"
    LogService.create({
      user: userId,
      action: `Submitted claim ${claim.claimId}`,
      targettype: "Dispute",
      target: claim.id,
    });

    return claim;
  };

  public static updateClaim = async (data: any) => {
    const _claim = await Dispute.updateOne(data);
    return _claim;
  };

  public static updateClaimStatus = async (
    claimId: string,
    status: Disputes["status"],
    openedBy: string,
    feedback: string,
    attachment?: string
  ) => {
    const _claim = await Dispute.findById(claimId).populate("claimant");
    if (!_claim) {
      throw new Error("Dispute not found");
    }
    _claim.status = status;

    if (status === "processing") {
      _claim.openedBy = openedBy;
    } else if (status === "resolved") {
      _claim.resolvedBy = openedBy;
      _claim.feedback = feedback;
      _claim.stampedLetter = attachment;
    } else if (status === "rejected") {
      _claim.rejectReason = feedback;
      _claim.rejectedBy = openedBy;
      _claim.stampedLetter = attachment;
    } else if (status === "appealed") {
      _claim.appealReason = feedback;
      _claim.appealedAt = new Date().toISOString();
      _claim.level = "nla";
      _claim.stampedLetter = attachment;
    } else if (status === "withdrawn") {
      _claim.stampedLetter = attachment;
      _claim.withdrawReason = feedback;
    }

    if (!_claim.district) {
      _claim.district = _claim.land.districtName?.toLowerCase();
    }

    await _claim.save();
    const { phoneNumber } = _claim.claimant;
    const { phoneNumber: defendantPhone } = _claim.defendant;
    let defendantMessage = `Claim ${_claim.claimId} filed against you has been updated to ${status}`;
    let claimantMessage = `Your claim ${_claim.claimId} has been updated to ${status}`;
    let witnessMessage = `Claim ${_claim.claimId} where you are a witness has been updated to ${status}`;
    if (feedback) {
      defendantMessage += `\nFeedback: ${feedback}`;
      claimantMessage += `\nFeedback: ${feedback}`;
      witnessMessage += `\nFeedback: ${feedback}`;
    }
    SmsService.sendSms(phoneNumber, claimantMessage);
    SmsService.sendSms(defendantPhone, defendantMessage);
    _claim.witnesses.forEach((witness: any) => {
      SmsService.sendSms(witness.phoneNumber, witnessMessage);
    });

    EmailService.notifyUpdateDispute(_claim, _claim.claimant);

    LogService.create({
      user: openedBy,
      action: `Updated to ${status} with feedback: ${feedback ?? "-"}`,
      targettype: "Dispute",
      target: _claim.id,
    });

    return _claim;
  };

  public static deleteClaim = async (claim: Document) => {
    const _claim = await Dispute.deleteOne();
    return _claim;
  };

  public static createComment = async (comment: string, userId: string) => {
    const _claim = await Dispute.updateOne({
      $push: {
        comments: {
          user: userId,
          comment,
        },
      },
    });
    return _claim;
  };

  public static updateStatus = async (claim: Document, status: string) => {
    const _claim = await Dispute.updateOne({
      status: status,
    });
    return _claim;
  };

  public static countAndGroupByStatus = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const user = await User.findById(userId);
    const $where: Record<string, any> = {};
    if (user?.level?.role === "user") {
      $where["claimant"] = new mongoose.Types.ObjectId(userId);
    } else if (user?.level?.district) {
      $where["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      $where["level"] = "nla";
    }

    if (startDate && endDate) {
      $where["createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const claims = await Dispute.aggregate([
      { $match: $where },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          statuses: {
            $push: {
              k: "$_id",
              v: "$count",
            },
          },
        },
      },
      {
        $addFields: {
          statuses: {
            $arrayToObject: "$statuses",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$statuses",
        },
      },
    ]);
    return claims;
  };

  public static countAndGroupByStatusAndMonth = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const user = await User.findById(userId);
    const $where: Record<string, any> = {};
    if (user?.level?.role === "user") {
      $where["claimant"] = new mongoose.Types.ObjectId(userId);
    } else if (user?.level?.district) {
      $where["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      $where["level"] = "nla";
    }

    if (startDate && endDate) {
      $where["createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const claims = await Dispute.aggregate([
      { $match: $where },
      {
        $group: {
          _id: {
            status: "$status",
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: {
            $let: {
              vars: {
                monthsInString: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", { $subtract: ["$_id", 1] }],
              },
            },
          },
          statuses: 1,
        },
      },
      {
        $unwind: "$statuses",
      },
      {
        $group: {
          _id: "$name",
          data: {
            $push: {
              k: "$statuses.status",
              v: "$statuses.count",
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $arrayToObject: "$data",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ name: "$_id" }, "$data"],
          },
        },
      },
    ]);

    return claims;
  };

  public static countAndGroupByDistrictAndStatus = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const user = await User.findById(userId);
    const $where: Record<string, any> = {};
    if (user?.level?.role === "user") {
      $where["claimant"] = new mongoose.Types.ObjectId(userId);
    } else if (user?.level?.district) {
      $where["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      $where["level"] = "nla";
    }

    if (startDate && endDate) {
      $where["createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const claims = await Dispute.aggregate([
      { $match: $where },
      {
        $group: {
          _id: {
            status: "$status",
            district: "$land.districtName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.district",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $unwind: "$statuses",
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $push: {
              k: "$statuses.status",
              v: "$statuses.count",
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $arrayToObject: "$data",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ district: "$_id" }, "$data"],
          },
        },
      },
    ]);

    return claims;
  };

  public static countAndGroupByLandSectorAndStatus = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const user = await User.findById(userId);
    const $where: Record<string, any> = {};
    if (user?.level?.role === "user") {
      $where["claimant"] = new mongoose.Types.ObjectId(userId);
    } else if (user?.level?.district) {
      $where["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      $where["level"] = "nla";
    }

    if (startDate && endDate) {
      $where["createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const claims = await Dispute.aggregate([
      { $match: $where },
      {
        $group: {
          _id: {
            status: "$status",
            sectorName: "$land.sectorName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.sectorName",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $unwind: "$statuses",
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $push: {
              k: "$statuses.status",
              v: "$statuses.count",
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $arrayToObject: "$data",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ sectorName: "$_id" }, "$data"],
          },
        },
      },
    ]);

    return claims;
  };

  public static countAndGroupByLevel = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const user = await User.findById(userId);
    const $where: Record<string, any> = {};
    if (user?.level?.role === "user") {
      $where["claimant"] = new mongoose.Types.ObjectId(userId);
    } else if (user?.level?.district) {
      $where["district"] = user?.level?.district?.toLocaleLowerCase();
    }

    if (startDate && endDate) {
      $where["createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const claims = await Dispute.aggregate([
      { $match: $where },
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              k: "$_id",
              v: "$count",
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $arrayToObject: "$data",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$data",
        },
      },
    ]);

    return claims;
  };

  public static getAllClaims_Pageless = async (params?: QueryParams) => {
    const user = await User.findById(params?.userId);

    const filter = generateFilter(params as QueryParams, [
      "status",
      "_id",
      "openedBy._id",
      "resolvedBy._id",
      "level",
    ]);

    if (user?.level?.role === "user") {
      filter["claimant"] = new mongoose.Types.ObjectId(user._id);
    } else if (user?.level?.district) {
      filter["district"] = user?.level?.district?.toLocaleLowerCase();
    } else if (user?.level?.role === "admin") {
      filter["level"] = "nla";
    }

    const startDate = params?.startDate as string;
    const endDate = params?.endDate as string;

    if (startDate && endDate) {
      filter["createdAt"] = {
        $gte: [
          {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          startDate,
        ],
        $lte: [
          {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          endDate,
        ],
      };
    }

    const claims = await Dispute.find({
      ...filter,
    })
      .populate("claimant resolvedBy openedBy")
      .sort({ district: 1 });

    const count = await Dispute.countDocuments({
      ...filter,
    });
    return {
      data: claims,
      count,
      sessionUser: {
        id: user?.id,
        fullNames: `${user?.profile.ForeName} ${user?.profile.Surnames}`,
      },
    };
  };

  static calculateOverdueDays = (dispute: Disputes) => {
    if (!["appealed", "open"].includes(dispute.status)) return 0;
    let initialDate: Date;
    if (dispute.appealedAt) {
      initialDate = new Date(dispute.appealedAt);
    } else if (dispute.createdAt) {
      initialDate = new Date(dispute.createdAt);
    } else {
      return 0;
    }
    const now = new Date();
    const diff = Math.abs(now.getTime() - initialDate.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const overdueDays =
      dispute.level === "nla"
        ? Keys.NLA_OVERDUE_DAYS
        : Keys.DISTRICT_OVERDUE_DAYS;
    if (days > overdueDays) {
      return days - overdueDays;
    }
    return 0;
  };
}
