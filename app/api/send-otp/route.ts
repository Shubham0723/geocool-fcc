import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail, generateOTP } from '@/lib/email';
import { getDatabase } from '@/lib/mongodb';
import { OTPService } from '@/lib/otp-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email exists in users collection
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database with 10-minute expiration
    const otpService = await OTPService.getInstance();
    await otpService.createOTP(email, otp);

    // Send email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
