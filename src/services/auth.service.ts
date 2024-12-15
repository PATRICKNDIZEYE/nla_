export default class AuthService {
  static async generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(user: IUser): Promise<void> {
    const otp = await this.generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document
    await User.findByIdAndUpdate(user._id, {
      'mfa.otp': otp,
      'mfa.otpExpiry': expiryTime
    });

    // Send via SMS
    await SmsService.sendSms(
      user.phoneNumber,
      `Your OTP for LDMS login is: ${otp}. Valid for 10 minutes.`
    );

    // Send via Email
    if (user.email) {
      await EmailService.sendEmail(
        user.email,
        'LDMS Login OTP',
        `Your OTP for LDMS login is: ${otp}. Valid for 10 minutes.`
      );
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