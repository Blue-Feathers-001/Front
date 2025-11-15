'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  membershipStatus: string;
  membershipPlan?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  gracePeriodEndDate?: string;
  lastPaymentDate?: string;
  createdAt: string;
  membershipPackage?: {
    name: string;
    price: number;
    durationMonths: number;
    category: string;
  };
}

interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  package: {
    name: string;
    price: number;
    durationMonths: number;
    category: string;
  };
  membershipStartDate?: string;
  membershipEndDate?: string;
}

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalSpent: number;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getUserPaymentHistory(userId);

      if (response.success) {
        setUser(response.data.user);
        setPayments(response.data.payments);
        setPaymentStats(response.data.paymentStats);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch user details');
        router.push('/admin/users');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl font-semibold text-gray-700">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeInDown">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/users')}
                className="text-white hover:text-white/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                User Profile
              </h1>
            </div>
            <p className="text-white/90 mt-2 ml-9">Detailed information and payment history</p>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeInUp">
          {/* Personal Information */}
          <div className="lg:col-span-2 glass-card-solid p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-800">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg font-semibold text-gray-800">{user.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered Date</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Payment</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.lastPaymentDate ? formatDate(user.lastPaymentDate) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Statistics */}
          {paymentStats && (
            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Payment Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="text-2xl font-bold text-primary-600">{paymentStats.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Successful</span>
                  <span className="text-xl font-semibold text-green-600">{paymentStats.successfulPayments}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Failed</span>
                  <span className="text-xl font-semibold text-red-600">{paymentStats.failedPayments}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 font-medium">Total Spent</span>
                  <span className="text-xl font-bold text-primary-700">{formatCurrency(paymentStats.totalSpent)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Membership Information */}
        <div className="glass-card-solid p-6 rounded-xl shadow-lg mb-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Membership Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border ${getMembershipStatusColor(user.membershipStatus)}`}>
                {user.membershipStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Plan</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {user.membershipPackage?.name || user.membershipPlan || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.membershipStartDate ? formatDate(user.membershipStartDate) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">End Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.membershipEndDate ? formatDate(user.membershipEndDate) : '-'}
              </p>
            </div>
          </div>
          {user.gracePeriodEndDate && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Grace Period:</span> Valid until {formatDate(user.gracePeriodEndDate)}
              </p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment History
            </h2>
            <p className="text-white/80 text-sm mt-1">Complete transaction history for this user</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Membership Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-800">
                        {payment.orderId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{payment.package?.name || '-'}</p>
                          <p className="text-xs text-gray-500 capitalize">{payment.package?.category || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-800">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.membershipStartDate && payment.membershipEndDate ? (
                          <div>
                            <p>{formatDate(payment.membershipStartDate)}</p>
                            <p className="text-xs text-gray-500">to {formatDate(payment.membershipEndDate)}</p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No payment history</p>
                      <p className="text-sm mt-1">This user has not made any payments yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
