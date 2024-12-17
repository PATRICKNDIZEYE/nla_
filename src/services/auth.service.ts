export default class AuthService {
  static async generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(user: IUser): Promise<void> {
    const otp = await this.generateOTP();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in user document
    await User.findByIdAndUpdate(user._id, {
      'mfa.otp': otp,
      'mfa.otpExpiry': expiryTime
    });

    // Send via SMS if phone number exists
    if (user.phoneNumber) {
      await SmsService.sendSms(
        user.phoneNumber,
        `Your OTP for login is: ${otp}. Valid for 5 minutes.`
      );
    }

    // Send via Email if email exists
    if (user.email) {
      await EmailService.sendOTPEmail(user.email, otp);
    }
  }

  static async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user || !user.mfa?.otp || !user.mfa?.otpExpiry) {
      return false;
    }

    if (new Date() > new Date(user.mfa.otpExpiry)) {
      return false;
    }

    return user.mfa.otp === otp;
  }
} 