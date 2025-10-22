import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your OTP Code - Vehicle Management Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Vehicle Management Dashboard</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0;">Secure Login Verification</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #374151; margin: 0 0 20px 0;">Your One-Time Password</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0;">Use the following code to complete your login:</p>
            
            <div style="background: #f9fafb; border: 2px dashed #d1d5db; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px;">${otp}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error };
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
