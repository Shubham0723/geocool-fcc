import { getDatabase } from './mongodb';
import { OTP } from './schemas';

export class OTPService {
  private static instance: OTPService;
  private db: any;

  private constructor() {}

  public static async getInstance(): Promise<OTPService> {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
      OTPService.instance.db = await getDatabase();
    }
    return OTPService.instance;
  }

  // Create OTP with 10-minute expiration
  async createOTP(email: string, otp: string): Promise<OTP> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    const otpData: Omit<OTP, '_id'> = {
      email: email.toLowerCase(),
      otp,
      expiresAt,
      isUsed: false,
      createdAt: now,
    };

    // Clean up any existing OTPs for this email
    await this.db.collection('otps').deleteMany({ 
      email: email.toLowerCase() 
    });

    const result = await this.db.collection('otps').insertOne(otpData);
    return { ...otpData, _id: result.insertedId };
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const now = new Date();
    
    const otpRecord = await this.db.collection('otps').findOne({
      email: email.toLowerCase(),
      otp,
      isUsed: false,
      expiresAt: { $gt: now }, // Not expired
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await this.db.collection('otps').updateOne(
      { _id: otpRecord._id },
      { $set: { isUsed: true } }
    );

    return true;
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs(): Promise<number> {
    const now = new Date();
    const result = await this.db.collection('otps').deleteMany({
      expiresAt: { $lt: now }
    });
    return result.deletedCount;
  }

  // Get OTP by email (for debugging)
  async getOTPByEmail(email: string): Promise<OTP | null> {
    return await this.db.collection('otps').findOne({
      email: email.toLowerCase(),
      isUsed: false,
    });
  }
}
