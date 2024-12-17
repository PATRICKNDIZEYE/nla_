import { Disputes } from "@/models/Dispute";
import User, { Users } from "@/models/User";
import { sendEmail } from "@/utils/config/mail.config";
import Keys from "@/utils/constants/keys";
import UserService from "./user.service";

export default class EmailService {
  private static wrapEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NLA Dispute Resolution</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { background: #fff; padding: 20px; border-radius: 5px; }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NLA Dispute Resolution</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply directly to this email.</p>
              <p>If you need assistance, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async sendEmail({ to, subject, html, attachments }: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
  }) {
    console.log('Email Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER?.slice(0, 5) + '...',
    });
    
    try {
      console.log('EmailService sending email to:', to);
      console.log('Email subject:', subject);
      
      if (!to || !subject || !html) {
        throw new Error('Missing required email parameters');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error('Invalid email format');
      }

      const result = await sendEmail({
        to,
        subject,
        html: this.wrapEmailTemplate(html),
        attachments
      });

      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('EmailService sendEmail error:', error);
      throw error;
    }
  }

  static async sendDefendantInvitation(dispute: Disputes, signupToken: string, defendantEmail: string, defendantName: string) {
    try {
      if (!process.env.NEXT_PUBLIC_APP_URL) {
        throw new Error('Application URL is not configured');
      }

      const signupLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?token=${signupToken}`;
      
      await this.sendEmail({
        to: defendantEmail,
        subject: `Important: Legal Case Assignment - ${dispute.claimId}`,
        html: `
          <h3>Legal Case Assignment Notice</h3>
          <p>Dear ${defendantName},</p>
          <p>You have been identified as a defendant in a legal case with ID: <strong>${dispute.claimId}</strong>.</p>
          <p>To proceed with this case, you need to:</p>
          <ol>
            <li>Create your secure account using the button below</li>
            <li>Complete your profile information</li>
            <li>Review the case details and submit your response</li>
          </ol>
          <a href="${signupLink}" class="button" style="color: white;">Create Your Account</a>
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>This link will expire in 7 days</li>
              <li>For security reasons, do not share this link with anyone</li>
              <li>If you believe this was sent in error, please contact support</li>
            </ul>
          </div>
        `
      });

      console.log('Defendant invitation email sent successfully to:', defendantEmail);
      return true;
    } catch (error) {
      console.error('Error sending defendant invitation:', error);
      throw new Error(`Failed to send defendant invitation: ${error.message}`);
    }
  }

  static async notifyCreateDispute(dispute: Disputes, user: Users) {
    try {
      if (!user.email) {
        console.log('No email found for user:', user._id);
        return;
      }

      await this.sendEmail({
        to: user.email,
        subject: `Dispute Created - Case ${dispute.claimId}`,
        html: `
          <h3>Dispute Creation Confirmation</h3>
          <p>Dear ${user.profile.ForeName} ${user.profile.Surnames},</p>
          <p>Your dispute has been successfully created with the following details:</p>
          <ul>
            <li><strong>Case ID:</strong> ${dispute.claimId}</li>
            <li><strong>Status:</strong> ${dispute.status}</li>
            <li><strong>Created:</strong> ${new Date(dispute.createdAt).toLocaleDateString()}</li>
          </ul>
          <p>Our team will review your case and provide updates soon.</p>
        `
      });
    } catch (error: any) {
      console.error('Error in notifyCreateDispute:', error);
      throw new Error(`Failed to send dispute creation notification: ${error.message}`);
    }
  }

  static async notifyUpdateDispute(dispute: Disputes, user: Users) {
    try {
      if (!user.email) {
        console.log('No email found for user:', user._id);
        return;
      }

      const token = UserService.signInToken({ id: user._id }, "30d");
      const viewLink = `${Keys.BASE_URL}/dispute/${dispute._id}?token=${token}&user=${user._id}`;

      await this.sendEmail({
        to: user.email,
        subject: `Dispute Updated - Case ${dispute.claimId}`,
        html: `
          <h3>Dispute Update Notification</h3>
          <p>Dear ${user.profile.ForeName} ${user.profile.Surnames},</p>
          <p>Your dispute has been updated with the following changes:</p>
          <ul>
            <li><strong>Case ID:</strong> ${dispute.claimId}</li>
            <li><strong>New Status:</strong> ${dispute.status}</li>
            <li><strong>Updated:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Click the button below to view your updated dispute:</p>
          <a href="${viewLink}" class="button">View Dispute</a>
        `
      });
    } catch (error: any) {
      console.error('Error in notifyUpdateDispute:', error);
      throw new Error(`Failed to send dispute update notification: ${error.message}`);
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
        console.log('No manager found for district:', dispute.district);
        return;
      }

      const viewLink = `${Keys.BASE_URL}/dispute/${dispute._id}`;

      await this.sendEmail({
        to: user.email,
        subject: `New Dispute Assignment - Case ${dispute.claimId}`,
        html: `
          <h3>New Dispute Assignment</h3>
          <p>Dear ${user.profile.ForeName} ${user.profile.Surnames},</p>
          <p>A new dispute has been assigned to you:</p>
          <ul>
            <li><strong>Case ID:</strong> ${dispute.claimId}</li>
            <li><strong>District:</strong> ${dispute.district}</li>
            <li><strong>Status:</strong> ${dispute.status}</li>
            <li><strong>Assigned:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Please review this case as soon as possible.</p>
          <a href="${viewLink}" class="button">View Case Details</a>
        `
      });
    } catch (error: any) {
      console.error('Error in notifyAssignedDispute:', error);
      throw new Error(`Failed to send dispute assignment notification: ${error.message}`);
    }
  }

  static async sendOTPEmail(to: string, otp: string) {
    try {
      console.log('Sending OTP email to:', to);

      const html = this.wrapEmailTemplate(`
        <div style="text-align: center; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p>Please use the following code to verify your account:</p>
          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 24px 0;
            padding: 16px;
            background: #f4f4f4;
            border-radius: 8px;
          ">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `);

      await this.sendEmail({
        to,
        subject: 'Your Verification Code',
        html,
      });

      console.log('OTP email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw error;
    }
  }
}
