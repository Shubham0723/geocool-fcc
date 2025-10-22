import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OTPService } from '@/lib/otp-service';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP using database
    const otpService = await OTPService.getInstance();
    const isValid = await otpService.verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, create authentication cookie
    const cookieStore = cookies();
    const authToken = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString('base64');
    
    cookieStore.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      redirect: '/',
    });
  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
