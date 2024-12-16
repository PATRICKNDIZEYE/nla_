import { QueryParams } from "@/@types/pagination";
import Dispute, { Disputes } from "@/models/Dispute";
import User from "@/models/User";
import { generateFilter, paginate } from "@/utils/helpers/function";
import EmailService from "./email.service";
import mongoose, { Document, ObjectId } from "mongoose";
import SmsService from "./SmsService";
import LogService from "./log.service";
import Keys from "@/utils/constants/keys";
import { DisputeVersion } from "@/models/DisputeVersion";
import jwt from "jsonwebtoken";
import { uploadToStorage } from "@/utils/helpers/storage";

interface IDefendant {
  fullName: string;
  phoneNumber: string;
  email?: string;
  _id?: string | ObjectId;
  id?: string;
  ForeName?: string;
  Surnames?: string;
  assignedAt?: Date;
  signupToken?: string;
  status?: string;
}

interface ISharedDocument {
  url: string;
  name: string;
  sharedAt: string;
  recipientType: string[];
}

interface IDispute extends Document {
  _id: string | ObjectId;
  claimId: string;
  status: string;
  level?: string;
  district?: string;
  claimant: any;
  defendant?: IDefendant;
  sharedDocuments?: ISharedDocument[];
  lastUpdated?: Date;
  createdAt?: Date;
  land?: {
    districtName?: string;
    sectorName?: string;
  };
  disputeType?: any;
  openedBy?: any;
  resolvedBy?: any;
  overdueDays?: number;
}

interface DisputeResponse {
  data: IDispute[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  totalItems: number;
  count: number;
}

const getUserRole = async (userId: string): Promise<string> => {
  const user = await User.findById(userId);
  return user?.level?.role || '';
};

export default class DisputeService {
  public static getAllClaims = async (params?: QueryParams): Promise<DisputeResponse> => {
    try {
      console.log('Fetching disputes with params:', params);
      
      const user = await User.findById(params?.userId);
      const role = user?.level?.role;
      const targetUserId = params?.targetUserId;
      console.log('User found:', user?._id, 'Role:', role, 'Target User:', targetUserId);
      
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const search = params?.search;

      // Base query object
      const query: Record<string, any> = {
        datetimedeleted: { $exists: false }
      };

      // If targetUserId is provided, show cases for that user regardless of role
      if (targetUserId) {
        query.claimant = new mongoose.Types.ObjectId(targetUserId);
      } else {
        // Regular role-based filtering
        if (role === "user") {
          query.claimant = new mongoose.Types.ObjectId(params?.userId || '');
        } else if (role === "admin" || role === "manager") {
          // Admin and manager can see all cases - no additional filters needed
          console.log('Admin/Manager role - showing all cases');
        } else if (user?.level?.district) {
          // District user filtering
          query.district = user.level.district.toLowerCase();
          query.level = { $ne: "nla" }; // Exclude NLA cases for district users
        }
      }

      // Handle level filter
      if (params?.filter?.level) {
        if (params.filter.level === "nla") {
          query.level = "nla";
        } else if (params.filter.level === "district") {
          query.$or = [
            { level: "district" },
            { level: { $exists: false } },
            { level: "" },
            { level: null }
          ];
        }
      }

      // Handle search
      if (search) {
        query.$or = [
          { claimId: { $regex: search, $options: 'i' } },
          { 'land.districtName': { $regex: search, $options: 'i' } },
          { 'land.sectorName': { $regex: search, $options: 'i' } }
        ];
      }

      console.log('Final query:', JSON.stringify(query, null, 2));

      // Get total counts for all disputes (not just paginated)
      const [totalCount, levelCounts] = await Promise.all([
        Dispute.countDocuments(query),
        Dispute.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              nla: {
                $sum: {
                  $cond: [{ $eq: ["$level", "nla"] }, 1, 0]
                }
              },
              district: {
                $sum: {
                  $cond: [{ $eq: ["$level", "district"] }, 1, 0]
                }
              }
            }
          }
        ])
      ]);

      console.log('Total counts:', {
        total: totalCount,
        levels: levelCounts[0] || { nla: 0, district: 0 }
      });

      if (totalCount === 0) {
        console.log('No disputes found matching the query');
        return { 
          data: [], 
          pagination: {
            totalPages: 0,
            currentPage: page,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          totalItems: 0,
          count: 0,
          levelCounts: {
            nla: 0,
            district: 0,
            total: 0
          }
        };
      }

      // Execute query with pagination
      const disputes = await Dispute.find(query)
        .populate({
          path: 'claimant',
          select: 'profile phoneNumber nationalId email level'
        })
        .populate({
          path: 'resolvedBy',
          select: 'profile level'
        })
        .populate({
          path: 'openedBy',
          select: 'profile level'
        })
        .populate('disputeType')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      console.log('Disputes found:', disputes.length);
      
      // Process disputes to ensure consistent data structure
      const processedDisputes = disputes.map(dispute => ({
        ...dispute,
        _id: dispute._id.toString(),
        status: dispute.status?.toLowerCase(), // Normalize status to lowercase
        level: dispute.level === "nla" ? "nla" : "district", // Normalize level
        claimant: dispute.claimant ? {
          ...dispute.claimant,
          _id: dispute.claimant._id.toString()
        } : undefined,
        resolvedBy: dispute.resolvedBy ? {
          ...dispute.resolvedBy,
          _id: dispute.resolvedBy._id.toString()
        } : undefined,
        openedBy: dispute.openedBy ? {
          ...dispute.openedBy,
          _id: dispute.openedBy._id.toString()
        } : undefined
      }));

      const counts = levelCounts[0] || { nla: 0, district: 0 };
      console.log('Level counts for response:', {
        nla: counts.nla,
        district: counts.district,
        total: totalCount
      });

      return { 
        data: processedDisputes, 
        pagination: {
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          totalItems: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1
        },
        totalItems: totalCount,
        count: processedDisputes.length,
        levelCounts: {
          nla: counts.nla,
          district: counts.district,
          total: totalCount
        }
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
        const defendant = claim.defendant as IDefendant;
        claim.defendant = {
          ...defendant,
          _id: defendant._id || defendant.id || undefined,
          fullName: defendant.fullName || `${defendant.ForeName || ''} ${defendant.Surnames || ''}`.trim()
        };
      }

      return claim;
    } catch (error) {
      console.error('Error getting dispute by ID:', error);
      throw error;
    }
  };

  

  public static createClaim = async (data: any, userId: string) => {
    // Normalize the level field
    const normalizedData = {
      ...data,
      level: data.level?.toLowerCase() === "nla" ? "nla" : "district",
      // Ensure district is properly set
      district: data.land?.districtName?.toLowerCase() || data.district?.toLowerCase()
    };
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User account is not found");
    }
    
    console.log('Creating claim with normalized data:', {
      ...normalizedData,
      level: normalizedData.level,
      district: normalizedData.district
    });

    const claim = await Dispute.create({
      ...normalizedData,
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
    endDate?: string,
    role?: string
  ) => {
    try {
      const user = await User.findById(userId);
      const $match: Record<string, any> = {
        datetimedeleted: { $exists: false }
      };

      // Add status field existence check
      $match.status = { $exists: true };

      // Handle role-based filtering
      if (role === "user") {
        $match.claimant = new mongoose.Types.ObjectId(userId);
      } else if (role === "admin" || role === "manager") {
        // Admin and manager can see all cases
        if (user?.level?.district) {
          // If admin/manager has district, only show their district cases
          $match.district = user.level.district.toLowerCase();
        }
      } else if (user?.level?.district) {
        // District user can only see cases in their district
        $match.district = user.level.district.toLowerCase();
        $match.level = { $ne: "nla" }; // Exclude NLA cases for district users
      }

      // Add date range filter if provided
      if (startDate && endDate) {
        $match.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      console.log('Status aggregation match:', $match);

      const claims = await Dispute.aggregate([
        { $match },
        {
          $addFields: {
            // Normalize status to lowercase and ensure valid status
            normalizedStatus: {
              $cond: {
                if: { $eq: [{ $type: "$status" }, "string"] },
                then: { $toLower: "$status" },
                else: "unknown"
              }
            }
          }
        },
        {
          $group: {
            _id: "$normalizedStatus",
            count: { $sum: 1 },
            disputes: { $push: "$$ROOT" } // Collect disputes for debugging
          }
        },
        {
          $group: {
            _id: null,
            data: {
              $push: {
                k: "$_id",
                v: "$count"
              }
            },
            details: { 
              $push: { 
                status: "$_id",
                count: "$count",
                disputes: "$disputes"
              }
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  open: 0,
                  processing: 0,
                  resolved: 0,
                  rejected: 0,
                  appealed: 0,
                  withdrawn: 0,
                  closed: 0
                },
                {
                  $arrayToObject: "$data"
                }
              ]
            }
          }
        }
      ]);

      console.log('Status aggregation result:', claims);
      
      // Log detailed status breakdown for debugging
      if (claims.length > 0 && claims[0].details) {
        console.log('Detailed status breakdown:');
        claims[0].details.forEach((detail: any) => {
          console.log(`Status: ${detail.status}, Count: ${detail.count}`);
          console.log('Sample disputes:', detail.disputes.slice(0, 3).map((d: any) => ({
            id: d._id,
            status: d.status,
            level: d.level,
            district: d.district
          })));
        });
      }

      // If no results, return default structure
      const defaultStats = {
        open: 0,
        processing: 0,
        resolved: 0,
        rejected: 0,
        appealed: 0,
        withdrawn: 0,
        closed: 0
      };

      if (!claims.length) {
        console.log('No claims found, returning defaults');
        return defaultStats;
      }

      // Ensure all status fields exist and values are numbers
      const result = {
        ...defaultStats,
        ...Object.fromEntries(
          Object.entries(claims[0]).map(([key, value]) => [
            key,
            typeof value === 'number' ? value : 0
          ])
        )
      };

      console.log('Final processed result:', result);
      return result;
    } catch (error) {
      console.error('Error in countAndGroupByStatus:', error);
      throw error;
    }
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
    endDate?: string,
    role?: string
  ) => {
    try {
      console.log('\n=== DISPUTE LEVEL COUNT START ===');
      const user = await User.findById(userId);
      console.log('User Role:', user?.level?.role);
      
      const $match: Record<string, any> = {
        datetimedeleted: { $exists: false }
      };

      // Handle role-based filtering
      if (role === "user") {
        $match.claimant = new mongoose.Types.ObjectId(userId);
        console.log('Filtering for user:', userId);
      } else if (role === "admin" || role === "manager" || user?.level?.role === "admin") {
        console.log('Admin/Manager access - showing all cases');
      } else if (user?.level?.district) {
        $match.district = user.level.district.toLowerCase();
        console.log('District filtering:', user.level.district);
      }

      // Add date range filter if provided
      if (startDate && endDate) {
        $match.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
        console.log('Date range:', { startDate, endDate });
      }

      console.log('Match criteria:', JSON.stringify($match, null, 2));

      const results = await Dispute.aggregate([
        { $match },
        {
          $facet: {
            district: [
              {
                $match: {
                  $or: [
                    { level: "district" },
                    { level: { $exists: false } },
                    { level: "" },
                    { level: null }
                  ]
                }
              },
              { $count: "count" }
            ],
            nla: [
              {
                $match: {
                  level: "nla"
                }
              },
              { $count: "count" }
            ]
          }
        },
        {
          $project: {
            district: { $ifNull: [{ $arrayElemAt: ["$district.count", 0] }, 0] },
            nla: { $ifNull: [{ $arrayElemAt: ["$nla.count", 0] }, 0] }
          }
        }
      ]);

      const counts = results[0] || { district: 0, nla: 0 };
      
      // Log detailed counts
      console.log('\nDISPUTE COUNTS:');
      console.log('----------------');
      console.log('NLA Disputes:', counts.nla);
      console.log('District Disputes:', counts.district);
      console.log('Total Disputes:', counts.nla + counts.district);
      console.log('=== DISPUTE LEVEL COUNT END ===\n');

      return counts;
    } catch (error) {
      console.error('Level count error:', error);
      throw error;
    }
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
      filter["claimant"] = new ObjectId(user._id.toString());
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
      console.log('Starting defendant assignment process...');
      console.log('Dispute ID:', disputeId);
      console.log('Defendant data:', { ...defendantData, email: '***' });

      if (!disputeId) {
        throw new Error("Dispute ID is required");
      }

      if (!defendantData.email || !defendantData.phoneNumber || !defendantData.fullName) {
        throw new Error("Email, phone number, and full name are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(defendantData.email)) {
        throw new Error("Invalid email format");
      }

      // Improved phone number validation and formatting
      let formattedPhone = defendantData.phoneNumber.replace(/\D/g, '');
      // Remove leading 250 if present
      if (formattedPhone.startsWith('250')) {
        formattedPhone = formattedPhone.substring(3);
      }
      // Validate phone format (must be 9 digits starting with 7)
      const phoneRegex = /^7[2-9]\d{7}$/;
      if (!phoneRegex.test(formattedPhone)) {
        throw new Error("Invalid phone number format. Must be a valid Rwanda phone number.");
      }
      defendantData.phoneNumber = formattedPhone;

      const dispute = await Dispute.findById(disputeId).populate('claimant', 'profile');
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      console.log('Found dispute:', dispute.claimId);

      // Check if defendant is already assigned with this email
      const existingDefendant = await User.findOne({ email: defendantData.email });
      if (existingDefendant) {
        throw new Error("A user with this email already exists. Please use a different email.");
      }

      // Check if dispute already has a defendant with different details
      if (dispute.defendant?.email && dispute.defendant.email !== defendantData.email) {
        throw new Error("This case already has a different defendant assigned");
      }

      // Generate signup token with comprehensive context
      const signupToken = jwt.sign(
        {
          disputeId,
          email: defendantData.email,
          phoneNumber: defendantData.phoneNumber,
          role: 'defendant',
          fullName: defendantData.fullName,
          caseId: dispute.claimId,
          nationalId: defendantData.nationalId,
          timestamp: new Date().toISOString()
        },
        Keys.JWT_SECRET,
        { expiresIn: '7d' }
      );

      let notificationErrors = [];

      try {
        // Update dispute with defendant info
        dispute.defendant = {
          ...dispute.defendant,
          ...defendantData,
          assignedAt: new Date(),
          signupToken,
          status: 'PENDING_REGISTRATION'
        };
        await dispute.save();
        console.log('Dispute updated with defendant information');
      } catch (error) {
        console.error('Error saving dispute:', error);
        throw new Error("Failed to update dispute with defendant information");
      }

      try {
        // Send invitation email using the new email service
        await EmailService.sendDefendantInvitation(
          dispute,
          signupToken,
          defendantData.email,
          defendantData.fullName
        );
        console.log('Invitation email sent successfully');
      } catch (error) {
        console.error('Error sending invitation email:', error);
        notificationErrors.push('Failed to send invitation email');
      }

      try {
        // Send SMS notification with better formatting
        const smsMessage = `IMPORTANT: You have been assigned as defendant in case ${dispute.claimId}. Check your email (${defendantData.email}) for account creation instructions. Link expires in 7 days.`;
        await SmsService.sendSms(defendantData.phoneNumber, smsMessage);
        console.log('SMS notification sent successfully');
      } catch (error) {
        console.error('Error sending SMS:', error);
        notificationErrors.push('Failed to send SMS notification');
      }

      try {
        // Create detailed log
        await LogService.create({
          action: `Defendant assigned to case ${dispute.claimId}`,
          targettype: "Dispute",
          target: dispute._id,
          details: {
            defendantEmail: defendantData.email,
            defendantPhone: defendantData.phoneNumber,
            assignedAt: new Date(),
            caseId: dispute.claimId,
            notificationStatus: notificationErrors.length ? 'PARTIAL_SUCCESS' : 'SUCCESS',
            notificationErrors: notificationErrors.length ? notificationErrors : undefined
          }
        });
        console.log('Assignment logged successfully');
      } catch (error) {
        console.error('Error creating log:', error);
      }

      // If there were notification errors but the assignment succeeded
      if (notificationErrors.length > 0) {
        return {
          dispute,
          warnings: notificationErrors,
          status: 'PARTIAL_SUCCESS'
        };
      }

      return {
        dispute,
        status: 'SUCCESS'
      };
    } catch (error) {
      console.error('Error in assignDefendant:', error);
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
      console.log('Starting document share process for dispute:', disputeId);
      console.log('Documents count:', documents.length);
      console.log('Recipient types:', recipientType);

      if (!documents || documents.length === 0) {
        throw new Error('No documents provided');
      }

      if (!recipientType || recipientType.length === 0) {
        throw new Error('No recipient types specified');
      }

      const dispute = await Dispute.findById(disputeId)
        .populate('claimant')
        .populate('defendant');
      
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      console.log('Found dispute:', dispute.claimId);

      // Upload documents to storage
      console.log('Starting document upload to storage');
      const uploadedFiles = await Promise.all(
        documents.map(async (doc) => {
          try {
            const fileName = `${dispute.claimId}-${Date.now()}-${doc.filename}`;
            console.log('Uploading file:', fileName);
            const fileUrl = await uploadToStorage(doc.buffer, fileName, doc.mimetype);
            console.log('File uploaded successfully:', fileName);
            return { fileName, fileUrl };
          } catch (error) {
            console.error('Error uploading file:', doc.filename, error);
            throw new Error(`Failed to upload file ${doc.filename}: ${error.message}`);
          }
        })
      );

      console.log('All files uploaded successfully');

      // Save document references to dispute
      const newSharedDocuments: ISharedDocument[] = uploadedFiles.map(file => ({
        url: file.fileUrl,
        name: file.fileName,
        sharedAt: new Date().toISOString(),
        recipientType
      }));

      dispute.sharedDocuments = [
        ...(dispute.sharedDocuments || []),
        ...newSharedDocuments
      ];

      console.log('Saving document references to dispute');
      await dispute.save();
      console.log('Document references saved successfully');

      // Get recipients
      const recipients: { email: string; name: string }[] = [];

      if (recipientType.includes('committee')) {
        console.log('Finding committee members');
        const committeeMembers = await User.find({ 'level.role': 'committee' });
        console.log('Found committee members:', committeeMembers.length);
        recipients.push(...committeeMembers.map(member => ({
          email: member.email,
          name: `${member.profile?.ForeName} ${member.profile?.Surnames}`
        })));
      }
      
      if (recipientType.includes('defendant') && dispute.defendant?.email) {
        console.log('Adding defendant to recipients');
        recipients.push({
          email: dispute.defendant.email,
          name: dispute.defendant.fullName
        });
      }
      
      if (recipientType.includes('claimant') && dispute.claimant?.email) {
        console.log('Adding claimant to recipients');
        recipients.push({
          email: dispute.claimant.email,
          name: `${dispute.claimant.profile?.ForeName} ${dispute.claimant.profile?.Surnames}`
        });
      }

      console.log('Total recipients:', recipients.length);

      // Send emails with documents
      console.log('Starting email sending process');
      await Promise.all(
        recipients.map(async (recipient) => {
          try {
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
            console.log('Email sent successfully to:', recipient.email);
          } catch (error) {
            console.error('Error sending email to:', recipient.email, error);
            // Don't throw here to allow other emails to be sent
          }
        })
      );

      console.log('All emails sent successfully');

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

      console.log('Action logged successfully');

      return {
        success: true,
        sharedWith: recipients.length,
        documents: uploadedFiles
      };
    } catch (error) {
      console.error('Error in shareDocuments:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private static normalizeDisputeLevel(dispute: IDispute) {
    if (!dispute.level) {
      dispute.level = "district"; // Default value
    }
    dispute.level = dispute.level.toLowerCase() === "nla" ? "nla" : "district";
    return dispute;
  }

  private static normalizeDistrict(district: string): string {
    return district?.toLowerCase() ?? "";
  }
}
