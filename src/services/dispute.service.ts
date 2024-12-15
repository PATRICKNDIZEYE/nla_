import { QueryParams } from "@/@types/pagination";
import Dispute, { Disputes } from "@/models/Dispute";
import User from "@/models/User";
import { generateFilter, paginate } from "@/utils/helpers/function";
import EmailService from "./email.service";
import mongoose from "mongoose";
import SmsService from "./SmsService";
import LogService from "./log.service";
import Keys from "@/utils/constants/keys";
import { DisputeVersion } from "@/models/DisputeVersion";
import jwt from "jsonwebtoken";
import { uploadToStorage } from "@/utils/helpers/storage";

export default class DisputeService {
  public static getAllClaims = async (params?: QueryParams) => {
    try {
      console.log('Fetching disputes with params:', params);
      
      const user = await User.findById(params?.userId);
      const role = params?.role;
      const targetUserId = params?.targetUserId;
      console.log('User found:', user?._id, 'Role from session:', role, 'Target User:', targetUserId);
      
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const search = params?.search;

      // Base query object
      const query: any = {
        datetimedeleted: { $exists: false }
      };

      // If targetUserId is provided, show cases for that user regardless of role
      if (targetUserId) {
        query.claimant = new mongoose.Types.ObjectId(targetUserId);
      } else {
        // Regular role-based filtering
        if (role === "user") {
          query.claimant = new mongoose.Types.ObjectId(params?.userId);
        } else if (user?.level?.district) {
          query.district = user.level.district.toLowerCase();
        } else if (role === "admin") {
          // Admin can see all disputes, so no additional filter needed
          console.log('Admin user - showing all disputes');
        }
      }

      // Add any additional filters from params
      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'claimant') {
              query.claimant = new mongoose.Types.ObjectId(value as string);
            } else {
              query[key] = value;
            }
          }
        });
      }

      console.log('Base query after filters:', query);

      // Add status filter if provided
      if (params?.status) {
        query.status = params.status;
      }

      // Add search conditions if search term provided
      if (search) {
        query.$or = [
          { upiNumber: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { claimId: { $regex: search, $options: "i" } },
          { disputeType: { $regex: search, $options: "i" } },
          { "defendant.fullName": { $regex: search, $options: "i" } },
          { "defendant.phoneNumber": { $regex: search, $options: "i" } }
        ];
      }

      console.log('Final query:', JSON.stringify(query, null, 2));

      // First check if there are any disputes matching the query
      const totalCount = await Dispute.countDocuments(query);
      console.log('Total matching disputes:', totalCount);

      if (totalCount === 0) {
        console.log('No disputes found matching the query');
        return { 
          data: [], 
          pagination: paginate(0, limit, page)
        };
      }

      // Execute query with pagination
      const claims = await Dispute.find(query)
        .populate('claimant', 'profile phoneNumber nationalId email level')
        .populate('resolvedBy', 'profile level')
        .populate('openedBy', 'profile level')
        .populate('disputeType')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      console.log('Disputes found:', claims.length);
      
      // Add overdue days calculation
      const disputes = claims.map(dispute => ({
        ...dispute,
        overdueDays: DisputeService.calculateOverdueDays(dispute as Disputes)
      }));

      console.log('Returning disputes with pagination:', {
        count: disputes.length,
        totalCount,
        page,
        limit,
        role
      });

      return { 
        data: disputes, 
        pagination: paginate(totalCount, limit, page)
      };
    } catch (error) {
      console.error('Error in getAllClaims:', error);
      throw error;
    }
  };

  
  public static getById = async (disputeId: string, options: object = {}) => {
    try {
      console.log('Getting dispute by ID:', disputeId);
      
      const claim = await Dispute.findOne({
        ...(Number(disputeId) ? { claimId: disputeId } : { _id: disputeId }),
        ...options,
      })
      .populate({
        path: 'claimant',
        select: 'profile phoneNumber nationalId email level _id'
      })
      .populate({
        path: 'resolvedBy',
        select: 'profile level _id'
      })
      .populate({
        path: 'openedBy',
        select: 'profile level _id'
      })
      .populate('disputeType')
      .lean();

      if (!claim) {
        console.log('No dispute found with ID:', disputeId);
        return null;
      }

      console.log('Found dispute:', {
        id: claim._id,
        claimantId: claim.claimant?._id,
        defendantId: claim.defendant?._id,
        openedById: claim.openedBy?._id,
        resolvedById: claim.resolvedBy?._id,
        status: claim.status
      });

      // Ensure defendant data is properly structured
      if (claim.defendant) {
        claim.defendant = {
          ...claim.defendant,
          _id: claim.defendant._id || claim.defendant.id || undefined,
          fullName: claim.defendant.fullName || `${claim.defendant.ForeName || ''} ${claim.defendant.Surnames || ''}`.trim()
        };
      }

      return claim;
    } catch (error) {
      console.error('Error getting dispute by ID:', error);
      throw error;
    }
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
    const defendantMessage = `Claim ${claim.claimId} filed against you has been submitted. `;
    SmsService.sendSms(defendantPhone, defendantMessage);
    const witnessMessage = `Claim ${claim.claimId} where you are a witness has been submitted`;
    claim.witnesses.forEach((witness: any) => {
      SmsService.sendSms(witness.phoneNumber, witnessMessage);
    });
    claim.claimant = user;

    EmailService.notifyCreateDispute(claim, user);

    EmailService.notifyAssignedDispute(claim);

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

  public static async updateDispute(
    disputeId: string,
    updates: Partial<IDispute>,
    userId: string,
    reason?: string
  ) {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    // Check edit permissions
    if (!this.canEditDispute(dispute, userId)) {
      throw new Error('Not authorized to edit this dispute');
    }

    // Create version record
    const version = new DisputeVersion({
      disputeId: dispute._id,
      version: (await DisputeVersion.countDocuments({ disputeId: dispute._id })) + 1,
      changes: updates,
      changedBy: userId,
      reason
    });
    await version.save();

    // Update dispute
    Object.assign(dispute, updates);
    dispute.lastUpdated = new Date();
    await dispute.save();

    return dispute;
  }

  private static canEditDispute(dispute: IDispute, userId: string): boolean {
    // If dispute is processing, only managers can edit
    if (dispute.status === 'processing') {
      return ['manager', 'admin'].includes(getUserRole(userId));
    }

    // If dispute is rejected, claimant can edit
    if (dispute.status === 'rejected') {
      return dispute.claimant._id.toString() === userId;
    }

    return false;
  }

  public static async getCaseCountsByUser(userId: string) {
    const $match: Record<string, any> = {};
    if (userId) {
      $match["claimant"] = new mongoose.Types.ObjectId(userId);
    }

    const counts = await Dispute.aggregate([
      { $match },
      {
        $group: {
          _id: "$claimant",
          total: { $sum: 1 },
          opened: {
            $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] }
          },
          processing: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          },
          appealed: {
            $sum: { $cond: [{ $eq: ["$status", "appealed"] }, 1, 0] }
          }
        }
      }
    ]);

    return counts[0] || {
      total: 0,
      opened: 0,
      processing: 0,
      resolved: 0,
      rejected: 0,
      appealed: 0
    };
  }

  public static async assignDefendant(disputeId: string, defendantData: {
    email: string;
    phoneNumber: string;
    fullName: string;
    nationalId?: string;
  }) {
    try {
      const dispute = await Dispute.findById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Generate unique signup token
      const signupToken = jwt.sign(
        {
          disputeId,
          email: defendantData.email,
          phoneNumber: defendantData.phoneNumber,
          role: 'defendant'
        },
        Keys.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update dispute with defendant info
      dispute.defendant = {
        ...dispute.defendant,
        ...defendantData,
        assignedAt: new Date(),
        signupToken
      };
      await dispute.save();

      // Send welcome email
      const signupLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?token=${signupToken}`;
      await EmailService.sendEmail({
        to: defendantData.email,
        subject: `Case Assignment - ${dispute.claimId}`,
        html: `
          <p>Dear ${defendantData.fullName},</p>
          <p>You have been assigned as a defendant in case ${dispute.claimId}.</p>
          <p>Please click the link below to create your account and access the case:</p>
          <a href="${signupLink}">${signupLink}</a>
          <p>This link will expire in 7 days.</p>
        `
      });

      // Send SMS notification
      if (defendantData.phoneNumber) {
        await SmsService.sendSms(
          defendantData.phoneNumber,
          `You have been assigned as a defendant in case ${dispute.claimId}. Please check your email ${defendantData.email} for account creation instructions.`
        );
      }

      // Log the action
      await LogService.create({
        action: `Defendant assigned to case ${dispute.claimId}`,
        targettype: "Dispute",
        target: dispute._id,
        details: {
          defendantEmail: defendantData.email,
          defendantPhone: defendantData.phoneNumber
        }
      });

      return dispute;
    } catch (error) {
      console.error('Error assigning defendant:', error);
      throw error;
    }
  }

  public static async shareDocuments(
    disputeId: string,
    {
      documents,
      recipientType,
      message
    }: {
      documents: Array<{
        buffer: Buffer;
        filename: string;
        mimetype: string;
      }>;
      recipientType: ('committee' | 'defendant' | 'claimant')[];
      message?: string;
    }
  ) {
    try {
      const dispute = await Dispute.findById(disputeId)
        .populate('claimant')
        .populate('defendant');
      
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Upload documents to storage
      const uploadedFiles = await Promise.all(
        documents.map(async (doc) => {
          const fileName = `${dispute.claimId}-${Date.now()}-${doc.filename}`;
          const fileUrl = await uploadToStorage(doc.buffer, fileName, doc.mimetype);
          return { fileName, fileUrl };
        })
      );

      // Save document references to dispute
      dispute.sharedDocuments = [
        ...(dispute.sharedDocuments || []),
        ...uploadedFiles.map(file => ({
          url: file.fileUrl,
          name: file.fileName,
          sharedAt: new Date(),
          recipientType
        }))
      ];
      await dispute.save();

      // Get recipients
      const recipients: { email: string; name: string }[] = [];
      
      if (recipientType.includes('committee')) {
        // Add committee members from configuration or database
        const committeeMembers = await User.find({ 'level.role': 'committee' });
        recipients.push(...committeeMembers.map(member => ({
          email: member.email,
          name: `${member.profile?.ForeName} ${member.profile?.Surnames}`
        })));
      }
      
      if (recipientType.includes('defendant') && dispute.defendant?.email) {
        recipients.push({
          email: dispute.defendant.email,
          name: dispute.defendant.fullName
        });
      }
      
      if (recipientType.includes('claimant') && dispute.claimant?.email) {
        recipients.push({
          email: dispute.claimant.email,
          name: `${dispute.claimant.profile?.ForeName} ${dispute.claimant.profile?.Surnames}`
        });
      }

      // Send emails with documents
      await Promise.all(
        recipients.map(async (recipient) => {
          await EmailService.sendEmail({
            to: recipient.email,
            subject: `Documents Shared - Case ${dispute.claimId}`,
            html: `
              <p>Dear ${recipient.name},</p>
              <p>New documents have been shared for case ${dispute.claimId}.</p>
              ${message ? `<p>Message: ${message}</p>` : ''}
              <p>Documents:</p>
              <ul>
                ${uploadedFiles.map(file => `
                  <li><a href="${file.fileUrl}">${file.fileName}</a></li>
                `).join('')}
              </ul>
            `
          });
        })
      );

      // Log the action
      await LogService.create({
        action: `Documents shared for case ${dispute.claimId}`,
        targettype: "Dispute",
        target: dispute._id,
        details: {
          documentCount: uploadedFiles.length,
          recipientType,
          recipientCount: recipients.length
        }
      });

      return {
        success: true,
        sharedWith: recipients.length,
        documents: uploadedFiles
      };
    } catch (error) {
      console.error('Error sharing documents:', error);
      throw error;
    }
  }
}
