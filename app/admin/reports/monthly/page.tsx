'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface MonthlyData {
  _id: {
    year: number;
    month: number;
  };
  revenue: number;
  count: number;
  monthStart: string;
}

interface PackageDistribution {
  _id: string;
  count: number;
  revenue: number;
}

interface MonthlySummary {
  totalUsers: number;
  activeMembers: number;
  expiredMembers: number;
  totalMonths: number;
  totalRevenue: number;
  totalTransactions: number;
  averageMonthlyRevenue: number;
}

export default function MonthlyReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<PackageDistribution[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [monthsToShow, setMonthsToShow] = useState(12);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchMonthlyReport();
  }, [monthsToShow]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getMonthlyReport(monthsToShow);

      if (response.success) {
        setMonthlyData(response.data.monthlyData);
        setPackageDistribution(response.data.packageDistribution);
        setSummary(response.data.summary);
      } else {
        toast.error('Failed to fetch monthly report');
      }
    } catch (error: any) {
      console.error('Error fetching monthly report:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch monthly report');
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

  const getMonthName = (month: number) => {
    return monthNames[month - 1];
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
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading monthly report...</span>
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
              Monthly Revenue Report
            </h1>
            <p className="text-white/90 mt-2">Track monthly gym revenue, transactions and package distribution</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="px-4 py-2.5 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value={6} className="bg-gray-800">Last 6 Months</option>
              <option value={12} className="bg-gray-800">Last 12 Months</option>
              <option value={24} className="bg-gray-800">Last 24 Months</option>
            </select>
            <button
              onClick={() => router.push('/admin/reports/weekly')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            >
              Weekly Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-fadeInUp">
            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(summary.averageMonthlyRevenue)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{summary.totalTransactions}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Members</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{summary.activeMembers}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {summary.totalUsers} total</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Data Table */}
        <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden mb-8 animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Month</th>
                  <th className="px-6 py-4 text-left font-bold">Year</th>
                  <th className="px-6 py-4 text-right font-bold">Transactions</th>
                  <th className="px-6 py-4 text-right font-bold">Revenue</th>
                  <th className="px-6 py-4 text-right font-bold">Avg per Transaction</th>
                  <th className="px-6 py-4 text-right font-bold">vs Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyData.length > 0 ? (
                  monthlyData.map((month, index) => {
                    const avgRevenue = summary ? summary.averageMonthlyRevenue : 0;
                    const variance = avgRevenue > 0 ? ((month.revenue - avgRevenue) / avgRevenue) * 100 : 0;
                    const isAboveAvg = variance > 0;

                    return (
                      <tr
                        key={index}
                        className="hover:bg-primary-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">
                          {getMonthName(month._id.month)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{month._id.year}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {month.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-700">
                          {formatCurrency(month.revenue)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                          {formatCurrency(month.revenue / month.count)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${
                            isAboveAvg ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {isAboveAvg ? '↑' : '↓'} {Math.abs(variance).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
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
                      <p className="text-lg font-medium">No monthly data available</p>
                      <p className="text-sm mt-1">There are no successful payments in the selected period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Distribution */}
        {packageDistribution.length > 0 && (
          <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
              <h2 className="text-xl font-bold text-white">Package Distribution</h2>
              <p className="text-white/80 text-sm mt-1">Revenue breakdown by membership package</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Sales Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Revenue Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {packageDistribution.map((pkg, index) => {
                    const totalRevenue = packageDistribution.reduce((sum, p) => sum + p.revenue, 0);
                    const share = (pkg.revenue / totalRevenue) * 100;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{pkg._id}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                            {pkg.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-700">
                          {formatCurrency(pkg.revenue)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full"
                                style={{ width: `${share}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-12 text-right">
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
