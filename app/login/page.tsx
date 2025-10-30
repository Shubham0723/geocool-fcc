'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Choose identifier: prefer phone if provided, else email
    const phoneDigits = String(phone).replace(/\D/g, '');
    const hasPhone = phoneDigits.length >= 8;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasEmail = emailRegex.test(email);

    if (!hasPhone && !hasEmail) {
      setError('Enter a valid phone number or email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = hasPhone ? '/api/send-otp-whatsapp' : '/api/send-otp';
      const chosenIdentifier = hasPhone ? phoneDigits : email;
      const payload = hasPhone ? { phone: phoneDigits } : { email };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to send OTP');
        return;
      }

      if (data.status || data.success) {
        setStep('otp');
        setIdentifier(chosenIdentifier);
        setSuccess(`OTP sent successfully to ${chosenIdentifier}!`);
      } else {
        setError(data.error || data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Server uses this identifier (email or phone string) to verify and set cookie
        body: JSON.stringify({ email: identifier || email || phone, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    setIdentifier('');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Resend based on original choice
      const phoneDigits = String(phone).replace(/\D/g, '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const hasPhone = identifier ? /^\d+$/.test(identifier) : phoneDigits.length >= 8;
      const hasEmail = identifier ? !/^\d+$/.test(identifier) : emailRegex.test(email);
      const endpoint = hasPhone ? '/api/send-otp-whatsapp' : '/api/send-otp';
      const payload = hasPhone ? { phone: identifier || phoneDigits } : { email: identifier || email };
      const display = hasPhone ? (identifier || phoneDigits) : (identifier || email);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to resend OTP');
        return;
      }

      if (data.status || data.success) {
        setSuccess(`New OTP sent successfully to ${display}!`);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.error || data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Secure Login</h1>
            <p className="text-red-100 text-center text-sm">
              {step === 'phone'
                ? 'Enter phone number or email to receive a one-time password'
                : 'Enter the 6-digit verification code'}
            </p>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (WhatsApp) — optional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                      placeholder="e.g., 9198XXXXXXXX"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email — optional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                      placeholder="e.g., user@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none"
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Code sent to <span className="font-medium text-gray-900">{phone}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Verify & Login
                    </>
                  )}
                </button>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use Different Number
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="bg-red-50 px-8 py-4 border-t border-red-100">
            <p className="text-xs text-center text-gray-600">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? <a href="#" className="text-red-600 hover:text-red-700 font-medium hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
