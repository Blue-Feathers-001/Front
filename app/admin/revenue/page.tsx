'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  successRate: number;
}

export default function RevenueStatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getStats();

      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Failed to fetch revenue statistics');
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch statistics');
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
          <span className="text-xl font-semibold text-gray-700">Loading statistics...</span>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              Revenue Statistics
            </h1>
            <p className="text-white/90 mt-2">Overview of gym revenue and payment statistics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/reports/weekly')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            >
              Weekly Report
            </button>
            <button
              onClick={() => router.push('/admin/reports/monthly')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            >
              Monthly Report
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fadeInUp">
              {/* Total Revenue */}
              <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue (All Time)</h3>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(stats.totalRevenue)}</p>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  From {stats.successfulPayments} successful payments
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Monthly Revenue (Last 30 Days)</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</p>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Recent performance
                </div>
              </div>

              {/* Success Rate */}
              <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Payment Success Rate</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fadeInUp">
              {/* Payment Status Breakdown */}
              <div className="glass-card-solid rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-white">Payment Status Breakdown</h2>
                  <p className="text-white/80 text-sm mt-1">Transaction status distribution</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Successful Payments</p>
                        <p className="text-2xl font-bold text-green-700">{stats.successfulPayments}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-semibold text-green-700">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Failed Payments</p>
                        <p className="text-2xl font-bold text-red-700">{stats.failedPayments}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Failure Rate</p>
                      <p className="text-lg font-semibold text-red-700">
                        {stats.totalPayments > 0 ? ((stats.failedPayments / stats.totalPayments) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.pendingPayments}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pending Rate</p>
                      <p className="text-lg font-semibold text-yellow-700">
                        {stats.totalPayments > 0 ? ((stats.pendingPayments / stats.totalPayments) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="glass-card-solid rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-white">Summary Statistics</h2>
                  <p className="text-white/80 text-sm mt-1">Key performance indicators</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Total Transactions</span>
                    <span className="text-2xl font-bold text-primary-600">{stats.totalPayments}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Average Transaction Value</span>
                    <span className="text-xl font-bold text-gray-800">
                      {stats.successfulPayments > 0
                        ? formatCurrency(stats.totalRevenue / stats.successfulPayments)
                        : formatCurrency(0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Monthly Average Transaction Value</span>
                    <span className="text-xl font-bold text-gray-800">
                      {stats.monthlyRevenue > 0 && stats.totalPayments > 0
                        ? formatCurrency(stats.monthlyRevenue / Math.max(1, Math.round(stats.successfulPayments * (30 / 365))))
                        : formatCurrency(0)}
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Revenue Health Score</p>
                        <p className="text-3xl font-bold text-primary-700">
                          {stats.successRate > 80 ? 'Excellent' : stats.successRate > 60 ? 'Good' : 'Needs Attention'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-full ${
                        stats.successRate > 80 ? 'bg-green-500' : stats.successRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {stats.successRate > 80 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : stats.successRate > 60 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card-solid p-6 rounded-xl shadow-lg animate-fadeInUp">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/admin/reports/weekly')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-lg border border-primary-200 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-primary-700">Weekly Report</p>
                    <p className="text-xs text-gray-600">View weekly data</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/reports/monthly')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-green-700">Monthly Report</p>
                    <p className="text-xs text-gray-600">View monthly data</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/users')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-blue-700">Manage Users</p>
                    <p className="text-xs text-gray-600">View all members</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/packages')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-purple-700">Manage Packages</p>
                    <p className="text-xs text-gray-600">View all plans</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
