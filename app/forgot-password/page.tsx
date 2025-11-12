'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {!emailSent ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your email address and we'll send you a 6-digit OTP code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              OTP Sent!
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit OTP code to <strong>{email}</strong>.
              Please check your inbox.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The OTP will expire in 1 hour for security reasons.
            </p>
            <div className="space-y-3">
              <Link
                href="/reset-password"
                className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-center"
              >
                Enter OTP & Reset Password
              </Link>
              <Link
                href="/login"
                className="block text-blue-600 hover:text-blue-700 font-medium text-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
