import nodemailer from "nodemailer";
import Keys from "../constants/keys";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

export const sendEmail = async (mailOptions: MailOptions) => {
  try {
    console.log('Starting email send process...');
    console.log('Email recipient:', mailOptions.to);
    console.log('Email subject:', mailOptions.subject);
    
    // Validate required environment variables
    if (!Keys.TRANSPORTER_SERVICE || !Keys.SERVICE_USERNAME || !Keys.SERVICE_PASSWORD) {
      throw new Error('Email service configuration is incomplete. Required environment variables: TRANSPORTER_SERVICE, SERVICE_USERNAME, SERVICE_PASSWORD');
    }

    // Validate port configuration
    const port = Number(Keys.SERVICE_PORT);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error('Invalid email service port configuration');
    }

    const transportConfig = {
      host: Keys.TRANSPORTER_SERVICE,
      port: port,
      secure: port === 465,
      auth: {
        user: Keys.SERVICE_USERNAME,
        pass: Keys.SERVICE_PASSWORD,
      },
      logger: true,
      debug: true,
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
    };

    console.log('Transport configuration:', {
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      auth: { user: transportConfig.auth.user }
    });

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify transporter configuration
    try {
      console.log('Verifying transporter configuration...');
      await transporter.verify();
      console.log('Transporter verification successful');
    } catch (verifyError: any) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error(`Email service configuration error: ${verifyError.message}`);
    }

    const emailData = {
      from: `"NLA Dispute Resolution" <${Keys.SERVICE_USERNAME}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      attachments: mailOptions.attachments,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('Attempting to send email...');
    console.log('Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachments: !!emailData.attachments?.length
    });

    const result = await transporter.sendMail(emailData);
    
    console.log('Email sent successfully');
    console.log('Message ID:', result.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
    
    return {
      success: true,
      messageId: result.messageId,
      previewUrl: nodemailer.getTestMessageUrl(result)
    };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      response: error.response
    });

    // Provide more specific error messages based on the error type
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Failed to connect to email server. Please check your network connection and server configuration.');
    } else if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your credentials.');
    } else if (error.responseCode >= 500) {
      throw new Error('Email server error. Please try again later.');
    } else if (error.responseCode >= 400) {
      throw new Error('Invalid email configuration or recipient. Please check your settings.');
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }
}
