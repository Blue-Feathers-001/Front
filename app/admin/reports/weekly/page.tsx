'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface WeeklyData {
  _id: {
    year: number;
    week: number;
  };
  revenue: number;
  count: number;
  weekStart: string;
}

interface WeeklySummary {
  totalUsers: number;
  activeMembers: number;
  expiredMembers: number;
  totalWeeks: number;
  totalRevenue: number;
  totalTransactions: number;
}

export default function WeeklyReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [weeksToShow, setWeeksToShow] = useState(8);

  useEffect(() => {
    fetchWeeklyReport();
  }, [weeksToShow]);

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getWeeklyReport(weeksToShow);

      if (response.success) {
        setWeeklyData(response.data.weeklyData);
        setSummary(response.data.summary);
      } else {
        toast.error('Failed to fetch weekly report');
      }
    } catch (error: any) {
      console.error('Error fetching weekly report:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch weekly report');
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(weekStart)} - ${formatDate(end.toISOString())}`;
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
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading weekly report...</span>
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
              Weekly Revenue Report
            </h1>
            <p className="text-white/90 mt-2">Track weekly gym revenue and transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={weeksToShow}
              onChange={(e) => setWeeksToShow(Number(e.target.value))}
              className="px-4 py-2.5 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value={4} className="bg-gray-800">Last 4 Weeks</option>
              <option value={8} className="bg-gray-800">Last 8 Weeks</option>
              <option value={12} className="bg-gray-800">Last 12 Weeks</option>
              <option value={26} className="bg-gray-800">Last 26 Weeks</option>
            </select>
            <button
              onClick={() => router.push('/admin/reports/monthly')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            >
              Monthly Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 animate-fadeInUp">
            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-primary-600 mt-1">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Transactions</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{summary.totalTransactions}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Members</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{summary.activeMembers}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">of {summary.totalUsers} total</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Data Table */}
        <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Week Period</th>
                  <th className="px-6 py-4 text-left font-bold">Year</th>
                  <th className="px-6 py-4 text-left font-bold">Week #</th>
                  <th className="px-6 py-4 text-right font-bold">Transactions</th>
                  <th className="px-6 py-4 text-right font-bold">Revenue</th>
                  <th className="px-6 py-4 text-right font-bold">Avg per Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {weeklyData.length > 0 ? (
                  weeklyData.map((week, index) => (
                    <tr
                      key={index}
                      className="hover:bg-primary-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">
                        {getWeekRange(week.weekStart)}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{week._id.year}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Week {week._id.week}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {week.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">
                        {formatCurrency(week.revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                        {formatCurrency(week.revenue / week.count)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No weekly data available</p>
                      <p className="text-sm mt-1">There are no successful payments in the selected period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        {summary && weeklyData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 animate-fadeInUp">
            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Average Weekly Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Avg Weekly Revenue:</span>
                  <span className="font-semibold text-primary-700">
                    {formatCurrency(summary.totalRevenue / summary.totalWeeks)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Avg Weekly Transactions:</span>
                  <span className="font-semibold text-green-700">
                    {(summary.totalTransactions / summary.totalWeeks).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Membership Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Active Rate:</span>
                  <span className="font-semibold text-green-700">
                    {summary.totalUsers > 0
                      ? ((summary.activeMembers / summary.totalUsers) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Expired Members:</span>
                  <span className="font-semibold text-red-700">{summary.expiredMembers}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
