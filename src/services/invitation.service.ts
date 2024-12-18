import { QueryParams } from "@/@types/pagination";
import Dispute from "@/models/Dispute";
import Invitation, { Invitations } from "@/models/Invitation";
import User from "@/models/User";
import { generateFilter, paginate } from "@/utils/helpers/function";
import SmsService from "./SmsService";
import mongoose from "mongoose";
import LogService from "./log.service";
import { generatePDF } from "@/utils/helpers/pdfGenerator";
import EmailService from "./email.service";
import { uploadToStorage } from "@/utils/helpers/fileStorage";

export default class InvitationService {
  static async create(newData: Invitations) {
    const dispute = await Dispute.findById(newData.dispute).populate(
      "claimant"
    );
    if (!dispute) {
      throw new Error("Dispute is not found");
    }
    newData.claimant = dispute.claimant?._id;
    newData.district = dispute.district?.toLowerCase();
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

  static async getAll(params: QueryParams) {
    try {
      console.log('\n=== Invitation Service: getAll ===');
      console.log('1. Received params:', {
        userId: params?.userId,
        role: params?.role,
        isSwitch: params?.isSwitch,
        district: params?.district
      });

      const user = await User.findById(params?.userId);
      if (!user) {
        throw new Error("User not found");
      }

      console.log('2. Found user:', {
        id: user?._id,
        actualRole: user?.level?.role,
        district: user?.level?.district,
        isSwitch: user?.level?.isSwitch
      });

      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const search = params?.search;

      // Base query object
      const $match: Record<string, any> = {
        datetimedeleted: { $exists: false }
      };

      console.log('3. Building query based on role...');
      
      // Handle role-based filtering
      if (params?.role === "user" || params?.isSwitch) {
        $match.claimant = new mongoose.Types.ObjectId(params?.userId);
        console.log('→ User/Switch mode: Filtering for user invitations:', params?.userId);
      } else if ((params?.role === "admin" || params?.role === "manager") && !params?.isSwitch) {
        if (user?.level?.district) {
          $match.district = user.level.district.toLowerCase();
          console.log('→ Admin/Manager mode: Filtering by district:', user.level.district);
        } else {
          console.log('→ Admin mode: No district filter applied');
        }
      } else if (user?.level?.district && !params?.isSwitch) {
        $match.district = user.level.district.toLowerCase();
        console.log('→ District user: Filtering by district:', user.level.district);
      }

      if (search) {
        $match.$or = [
          { location: { $regex: search, $options: 'i' } },
          { 'dispute.claimId': { $regex: search, $options: 'i' } }
        ];
        console.log('4. Added search filters:', search);
      }

      console.log('5. Final query:', JSON.stringify($match, null, 2));

      // Get total count
      const totalCount = await Invitation.countDocuments($match);
      console.log('6. Total matching invitations:', totalCount);

      // Execute query with pagination
      const invitations = await Invitation.find($match)
        .populate({
          path: 'dispute',
          populate: [
            {
              path: 'claimant',
              select: 'profile phoneNumber email level'
            },
            {
              path: 'defendant',
              select: 'profile phoneNumber email level'
            }
          ]
        })
        .populate('invitedBy', 'profile level')
        .populate('claimant', 'profile level')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      console.log('7. Retrieved invitations:', invitations.length);
      if (invitations.length > 0) {
        console.log('Sample invitation:', {
          id: invitations[0]._id,
          district: invitations[0].district,
          claimant: invitations[0].claimant?._id,
          userRole: invitations[0].userRole
        });
      }

      // Process invitations to add userRole
      const processedInvitations = invitations.map(invitation => {
        let userRole = 'viewer';

        if (params?.isSwitch) {
          userRole = 'claimant';
        } else if (params?.role === "manager" && !params?.isSwitch && 
                  user?.level?.district?.toLowerCase() === invitation.district?.toLowerCase()) {
          userRole = 'manager';
        } else if (params?.role === "admin" && !params?.isSwitch) {
          userRole = 'admin';
        } else if (params?.role === "user") {
          userRole = 'claimant';
        }

        console.log('8. Processed invitation:', {
          id: invitation._id,
          assignedRole: userRole,
          userDistrict: user?.level?.district,
          invitationDistrict: invitation.district
        });

        return {
          ...invitation,
          _id: invitation._id.toString(),
          userRole
        };
      });

      console.log('=== End Invitation Service ===\n');

      return {
        data: processedInvitations,
        pagination: {
          totalItems: totalCount,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error('Error in getAll invitations:', error);
      throw error;
    }
  }

  static async cancelInvitation(invitationId: string) {
    try {
      const invitation = await Invitation.findById(invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Update isCanceled to true
      invitation.isCanceled = true;
      const updatedInvitation = await invitation.save();

      // Return the updated invitation with populated fields
      const populatedInvitation = await Invitation.findById(updatedInvitation._id)
        .populate({
          path: 'dispute',
          populate: [
            { path: 'claimant', select: 'profile phoneNumber email' },
            { path: 'defendant', select: 'profile phoneNumber email' }
          ]
        })
        .populate('claimant', 'profile phoneNumber email')
        .populate('invitedBy', 'profile');

      return populatedInvitation;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  }

  static async generateLetter(
    invitationId: string,
    params: {
      letterType: 'first' | 'reminder' | 'final';
      meetingDate: string;
      venue: string;
      additionalNotes?: string;
    }
  ) {
    const invitation = await Invitation.findById(invitationId)
      .populate('dispute')
      .populate({
        path: 'dispute',
        populate: {
          path: 'claimant defendant',
          model: 'User',
        },
      });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Generate PDF content based on letter type and parameters
    const letterContent = {
      title: `${params.letterType.toUpperCase()} INVITATION`,
      date: new Date().toLocaleDateString(),
      recipient: invitation.dispute.defendant?.profile?.ForeName,
      caseId: invitation.dispute.claimId,
      meetingDate: new Date(params.meetingDate).toLocaleString(),
      venue: params.venue,
      additionalNotes: params.additionalNotes,
      // Add more content based on your requirements
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(letterContent);
    
    // Upload to storage
    const fileName = `invitation-${invitation.dispute.claimId}-${params.letterType}.pdf`;
    const letterUrl = await uploadToStorage(pdfBuffer, fileName, 'application/pdf');

    // Send email with the letter
    if (invitation.dispute.defendant?.email) {
      await EmailService.sendEmail({
        to: invitation.dispute.defendant.email,
        subject: `${params.letterType.toUpperCase()} Invitation - Case ${invitation.dispute.claimId}`,
        html: `
          <p>Dear ${invitation.dispute.defendant.profile?.ForeName},</p>
          <p>Please find attached the invitation letter for your case.</p>
          <p>Meeting Details:</p>
          <ul>
            <li>Date: ${new Date(params.meetingDate).toLocaleString()}</li>
            <li>Venue: ${params.venue}</li>
          </ul>
          ${params.additionalNotes ? `<p>Additional Notes: ${params.additionalNotes}</p>` : ''}
        `,
        attachments: [{
          filename: fileName,
          content: pdfBuffer,
        }],
      });
    }

    // Send SMS notification
    await SmsService.sendSms(
      invitation.dispute.defendant?.phoneNumber,
      `You have received a ${params.letterType} invitation for case ${invitation.dispute.claimId}. Please check your email for details.`
    );

    // Log the action
    await LogService.create({
      user: invitation.invitedBy!,
      action: `Generated ${params.letterType} invitation letter for case ${invitation.dispute.claimId}`,
      targettype: 'Invitation',
      target: invitation._id,
    });

    return { letterUrl };
  }

  static async assignDefendant(invitationId: string) {
    const invitation = await Invitation.findById(invitationId).populate('dispute');
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const dispute = await Dispute.findById(invitation.dispute._id);
    if (!dispute) {
      throw new Error("Dispute not found");
    }

    // Generate signup token/link
    const signupToken = generateSignupToken(dispute.claimId);
    const signupLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${signupToken}&case=${dispute.claimId}`;

    // Send welcome message with signup link
    if (dispute.defendant?.phoneNumber) {
      await SmsService.sendSms(
        dispute.defendant.phoneNumber,
        `You have been assigned as a defendant in case ${dispute.claimId}. Please register your account using this link: ${signupLink}`
      );
    }

    if (dispute.defendant?.email) {
      await EmailService.sendEmail({
        to: dispute.defendant.email,
        subject: `Case Assignment - ${dispute.claimId}`,
        html: `
          <p>Dear ${dispute.defendant.profile?.ForeName},</p>
          <p>You have been assigned as a defendant in case ${dispute.claimId}.</p>
          <p>Please click the link below to register your account:</p>
          <a href="${signupLink}">${signupLink}</a>
        `,
      });
    }

    // Log the action
    await LogService.create({
      user: invitation.invitedBy!,
      action: `Assigned defendant and sent welcome message for case ${dispute.claimId}`,
      targettype: 'Invitation',
      target: invitation._id,
    });

    return invitation;
  }

  static async shareDocuments(
    invitationId: string,
    params: {
      documents: Array<{
        filename: string;
        buffer: Buffer;
        mimetype: string;
      }>;
      recipientType: string[];
      message?: string;
    }
  ) {
    const invitation = await Invitation.findById(invitationId)
      .populate('dispute')
      .populate({
        path: 'dispute',
        populate: {
          path: 'claimant defendant',
          model: 'User',
        },
      });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Upload documents to storage
    const uploadedFiles = await Promise.all(
      params.documents.map(async (doc) => {
        const fileName = `${invitation.dispute.claimId}-${Date.now()}-${doc.filename}`;
        const fileUrl = await uploadToStorage(doc.buffer, fileName, doc.mimetype);
        return { fileName, fileUrl };
      })
    );

    // Prepare recipients
    const recipients: { email: string; name: string }[] = [];
    
    if (params.recipientType.includes('committee')) {
      // Add committee members' emails
      // This would come from your committee members data
    }
    
    if (params.recipientType.includes('defendant') && invitation.dispute.defendant?.email) {
      recipients.push({
        email: invitation.dispute.defendant.email,
        name: `${invitation.dispute.defendant.profile?.ForeName} ${invitation.dispute.defendant.profile?.Surnames}`,
      });
    }
    
    if (params.recipientType.includes('plaintiff') && invitation.dispute.claimant?.email) {
      recipients.push({
        email: invitation.dispute.claimant.email,
        name: `${invitation.dispute.claimant.profile?.ForeName} ${invitation.dispute.claimant.profile?.Surnames}`,
      });
    }

    // Send emails with documents
    await Promise.all(
      recipients.map(async (recipient) => {
        await EmailService.sendEmail({
          to: recipient.email,
          subject: `Documents Shared - Case ${invitation.dispute.claimId}`,
          html: `
            <p>Dear ${recipient.name},</p>
            <p>New documents have been shared for case ${invitation.dispute.claimId}.</p>
            ${params.message ? `<p>Message: ${params.message}</p>` : ''}
            <p>Please find the documents attached.</p>
          `,
          attachments: uploadedFiles.map((file) => ({
            filename: file.fileName,
            path: file.fileUrl,
          })),
        });
      })
    );

    // Log the action
    await LogService.create({
      user: invitation.invitedBy!,
      action: `Shared ${uploadedFiles.length} documents for case ${invitation.dispute.claimId}`,
      targettype: 'Invitation',
      target: invitation._id,
    });

    return { success: true };
  }

  // Helper function to generate signup token
  static generateSignupToken(caseId: string) {
    // Implement your token generation logic here
    // This could be a JWT or any other secure token format
    return Buffer.from(`${caseId}-${Date.now()}`).toString('base64');
  }
}
