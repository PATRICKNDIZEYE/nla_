import nodemailer from "nodemailer";
import Keys from "../constants/keys";

interface MailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (mailOptions: MailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: Keys.TRANSPORTER_SERVICE,
      auth: {
        user: Keys.SERVICE_USERNAME,
        pass: Keys.SERVICE_PASSWORD,
      },
      secure: Keys.SERVICE_PORT === "465",
      port: Number(Keys.SERVICE_PORT) || 587,
      logger: false,
      debug: true,
    });
    const info = {
      from: `"NLA" <${Keys.SERVICE_USERNAME}>`,
      to: mailOptions.email,
      subject: mailOptions.subject,
      html: mailOptions.message,
    };
    await transporter.sendMail(info);
  } catch (error) {
    console.log(error);
  }
};
