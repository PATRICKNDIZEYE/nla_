import { QueryParams } from "@/@types/pagination";
import Dispute from "@/models/Dispute";
import Invitation, { Invitations } from "@/models/Invitation";
import User from "@/models/User";
import { generateFilter, paginate } from "@/utils/helpers/function";
import SmsService from "./SmsService";
import mongoose from "mongoose";
import LogService from "./log.service";

export default class InvitationService {
  static async create(newData: Invitations) {
    const dispute = await Dispute.findById(newData.dispute).populate(
      "claimant"
    );
    if (!dispute) {
      throw new Error("Dispute is not found");
    }
    newData.claimant = dispute.claimant?._id;
    newData.district = dispute.district?.toLocaleLowerCase();
    const result = await Invitation.create(newData);

    if (newData.invitees?.includes("witnesses")) {
      const inviteesPhoneNumbers = dispute.witnesses?.map(
        (witness) => witness.phoneNumber
      );
      SmsService.sendSmsToAll(
        inviteesPhoneNumbers,
        `You are invited to the dispute of ${dispute.claimant?.profile?.ForeName} ${dispute.claimant?.profile?.Surnames} with Dispute ID: ${dispute.claimId}, date: ${newData.dateTime} at ${newData.location}`
      );
    }

    if (newData.invitees?.includes("claimant")) {
      SmsService.sendSms(
        dispute.claimant?.phoneNumber,
        `You are invited to your Dispute ID: ${dispute.claimId}, date: ${newData.dateTime} at ${newData.location}`
      );
    }

    if (newData.invitees?.includes("defendant")) {
      SmsService.sendSms(
        dispute.defendant?.phoneNumber,
        `You are invited to Dispute ID: ${dispute.claimId} as a defendant, date: ${newData.dateTime} at ${newData.location}`
      );
    }

    LogService.create({
      user: newData.claimant!,
      action: `Invited ${newData.invitees?.join(", ")} to Dispute ID: ${
        dispute.claimId
      } at ${newData.location}`,
      targettype: `Invitation`,
      target: result._id,
    });

    return result;
  }

  static async getAll(params?: QueryParams) {
    const user = await User.findById(params?.userId);
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);

    const search = params?.search;
    let $or: any[] = [{}];

    if (search) {
      $or = [
        { "dispute.claimId": { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const filter = generateFilter(params as QueryParams, ["_id"]);

    if (user?.level?.role === "user") {
      filter["claimant"] = new mongoose.Types.ObjectId(user._id);
    } else if (user?.level?.district && user?.level?.role === "manager") {
      filter["district"] = user?.level?.district?.toLocaleLowerCase();
    } else {
      filter["invitedBy.level.role"] = "admin";
    }

    const invitations = await Invitation.find({
      ...filter,
      $or,
    })
      // .populate("dispute dispute.claimant invitedBy")
      .populate([
        {
          path: "dispute",
          populate: {
            path: "claimant",
            model: "User",
          },
        },
        // {
        //   path: "invitedBy",
        //   model: "User",
        // },
      ])
      .sort({ createdAt: -1 })
      .skip(Math.abs(limit * (page - 1)))
      .limit(limit);

    const count = await Invitation.countDocuments({
      ...filter,
      $or,
    });
    const pagination = paginate(count, limit, page);

    return { data: invitations, pagination };
  }

  static async cancelInvitation(invitationId: string) {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      throw new Error("Invitation is not found");
    }
    const dispute = await Dispute.findById(invitation.dispute).populate(
      "claimant"
    );
    invitation.isCanceled = true;
    await invitation.save();

    if (invitation.invitees?.includes("witnesses") && dispute) {
      const inviteesPhoneNumbers = dispute.witnesses?.map(
        (witness) => witness.phoneNumber
      );
      SmsService.sendSmsToAll(
        inviteesPhoneNumbers,
        `The invitation of Dispute ID: ${dispute.claimId} at ${invitation.location} has been canceled`
      );
    }

    if (invitation.invitees?.includes("claimant") && dispute) {
      SmsService.sendSms(
        dispute.claimant?.phoneNumber,
        `The invitation of Dispute ID: ${dispute.claimId} at ${invitation.location} has been canceled`
      );
    }

    if (invitation.invitees?.includes("defendant") && dispute) {
      SmsService.sendSms(
        dispute.defendant?.phoneNumber,
        `The invitation of Dispute ID: ${dispute.claimId} at ${invitation.location} has been canceled`
      );
    }
    LogService.create({
      user: invitation.invitedBy!,
      action: `Canceled invitation of Dispute ID: ${invitation.dispute} at ${invitation.location}`,
      targettype: `Invitation`,
      target: invitation._id,
    });
    return invitation;
  }
}
