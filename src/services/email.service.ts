import { Disputes } from "@/models/Dispute";
import User, { Users } from "@/models/User";
import { sendEmail } from "@/utils/config/mail.config";
import Keys from "@/utils/constants/keys";
import UserService from "./user.service";

export default class EmailService {
  static async notifyCreateDispute(dispute: Disputes, user: Users) {
    try {
      if (!user.email) {
        // throw new Error("User has no email");
        return;
      }

      const mailOptions = {
        email: user.email,
        subject: "Dispute created successfully",
        message: `<p>Dear ${user.profile.Surnames} ${user.profile.ForeName},</p>
                <p>Your dispute with <b>ID: ${dispute.claimId}</b> has been created successfully. Please wait for our response.</p>
                <p>Thank you.</p>`,
      };
      sendEmail(mailOptions);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async notifyUpdateDispute(dispute: Disputes, user: Users) {
    try {
      if (!user.email) {
        throw new Error("User has no email");
      }

      const token = UserService.signInToken({ id: user._id }, "30d");

      const mailOptions = {
        email: user.email,
        subject: "Dispute updated successfully",
        message: `<p>Dear ${user.profile.Surnames} ${user.profile.ForeName},</p>
                    <p>Your dispute with <b>ID: ${dispute.claimId}</b> has been updated to <b>${dispute.status}</b> successfully. Click <a href="${Keys.BASE_URL}/dispute/${dispute._id}?token=${token}&user=${user._id}">here</a> to view your dispute.</p>
                    <p>Thank you.</p>`,
      };
      await sendEmail(mailOptions);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async disputeLink(dispute: Disputes, user: Users) {
    try {
      if (!user.email) {
        // throw new Error("User has no email");
        return;
      }

      const token = UserService.signInToken({ id: user._id }, "30d");

      const mailOptions = {
        email: user.email,
        subject: "Dispute link",
        message: `<p>Dear ${user.profile.Surnames} ${user.profile.ForeName},</p>
                    <p>Click <a href="${Keys.BASE_URL}/dispute/${dispute._id}?token=${token}&user=${user._id}">here</a> to view your dispute with <b>ID: ${dispute.claimId}</b>.</p>
                    <p>Thank you.</p>`,
      };
      sendEmail(mailOptions);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async notifyAssignedDispute(dispute: Disputes) {
    try {
      const user = await User.findOne({
        level: {
          role: "manager",
          district: dispute.district?.toLowerCase(),
        },
      });
      if (!user?.email) {
        // throw new Error("User has no email");
        return;
      }

      const mailOptions = {
        email: user.email,
        subject: "Dispute assigned successfully",
        message: `<p>Dear ${user.profile.Surnames} ${user.profile.ForeName},</p>
                    <p>You have been assigned to dispute with <b>ID: ${dispute.claimId}</b>. Click <a href="${Keys.BASE_URL}/dispute/${dispute._id}">here</a> to view the dispute.</p>
                    <p>Thank you.</p>`,
      };
      sendEmail(mailOptions);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
