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

interface DetailedTransaction {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  package: {
    _id: string;
    name: string;
    price: number;
    durationMonths: number;
  };
  amount: number;
  status: string;
  createdAt: string;
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
  const [detailedTransactions, setDetailedTransactions] = useState<DetailedTransaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [monthsToShow, setMonthsToShow] = useState(12);
  const [showTransactions, setShowTransactions] = useState(false);

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
        setDetailedTransactions(response.data.detailedTransactions || []);
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

  const exportToCSV = () => {
    if (monthlyData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    let csvContent = 'Month,Year,Transactions,Revenue,Avg per Transaction\n';

    monthlyData.forEach((month) => {
      const avgPerTransaction = month.revenue / month.count;
      csvContent += `${getMonthName(month._id.month)},${month._id.year},${month.count},${month.revenue.toFixed(2)},${avgPerTransaction.toFixed(2)}\n`;
    });

    // Add package distribution
    if (packageDistribution.length > 0) {
      csvContent += '\n\nPackage Distribution\n';
      csvContent += 'Package Name,Sales Count,Total Revenue,Revenue Share (%)\n';

      const totalRevenue = packageDistribution.reduce((sum, p) => sum + p.revenue, 0);
      packageDistribution.forEach((pkg) => {
        const share = (pkg.revenue / totalRevenue) * 100;
        csvContent += `${pkg._id},${pkg.count},${pkg.revenue.toFixed(2)},${share.toFixed(1)}\n`;
      });
    }

    // Add detailed transactions
    if (detailedTransactions.length > 0) {
      csvContent += '\n\nDetailed Transactions\n';
      csvContent += 'Date,Member Name,Email,Package,Order ID,Amount,Duration (months)\n';

      detailedTransactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString();
        csvContent += `${date},"${transaction.user.name}",${transaction.user.email},"${transaction.package.name}",${transaction.orderId},${transaction.amount.toFixed(2)},${transaction.package.durationMonths}\n`;
      });
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly-revenue-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exported successfully!');
  };

  const exportToPDF = () => {
    if (monthlyData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create a printable version
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Revenue Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
          h2 { color: #764ba2; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #667eea; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .summary-card { padding: 15px; border: 2px solid #667eea; border-radius: 8px; }
          .summary-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #667eea; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Monthly Revenue Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p><strong>Period:</strong> Last ${monthsToShow} Months</p>
    `;

    // Add summary
    if (summary) {
      html += `
        <div class="summary">
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p>${formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div class="summary-card">
            <h3>Avg Monthly Revenue</h3>
            <p>${formatCurrency(summary.averageMonthlyRevenue)}</p>
          </div>
          <div class="summary-card">
            <h3>Total Transactions</h3>
            <p>${summary.totalTransactions}</p>
          </div>
          <div class="summary-card">
            <h3>Active Members</h3>
            <p>${summary.activeMembers} / ${summary.totalUsers}</p>
          </div>
        </div>
      `;
    }

    // Add monthly data
    html += `
      <h2>Monthly Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th style="text-align: right;">Transactions</th>
            <th style="text-align: right;">Revenue</th>
            <th style="text-align: right;">Avg per Transaction</th>
          </tr>
        </thead>
        <tbody>
    `;

    monthlyData.forEach((month) => {
      const avgPerTransaction = month.revenue / month.count;
      html += `
        <tr>
          <td>${getMonthName(month._id.month)}</td>
          <td>${month._id.year}</td>
          <td style="text-align: right;">${month.count}</td>
          <td style="text-align: right;">${formatCurrency(month.revenue)}</td>
          <td style="text-align: right;">${formatCurrency(avgPerTransaction)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    // Add package distribution
    if (packageDistribution.length > 0) {
      const totalRevenue = packageDistribution.reduce((sum, p) => sum + p.revenue, 0);

      html += `
        <h2>Package Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Package Name</th>
              <th style="text-align: right;">Sales Count</th>
              <th style="text-align: right;">Total Revenue</th>
              <th style="text-align: right;">Revenue Share</th>
            </tr>
          </thead>
          <tbody>
      `;

      packageDistribution.forEach((pkg) => {
        const share = (pkg.revenue / totalRevenue) * 100;
        html += `
          <tr>
            <td>${pkg._id}</td>
            <td style="text-align: right;">${pkg.count}</td>
            <td style="text-align: right;">${formatCurrency(pkg.revenue)}</td>
            <td style="text-align: right;">${share.toFixed(1)}%</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    }

    // Add detailed transactions
    if (detailedTransactions.length > 0) {
      html += `
        <h2>Detailed Transactions (Last 100)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Package</th>
              <th>Order ID</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: center;">Duration</th>
            </tr>
          </thead>
          <tbody>
      `;

      detailedTransactions.slice(0, 50).forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString();
        html += `
          <tr>
            <td>${date}</td>
            <td>
              <div style="font-weight: bold;">${transaction.user.name}</div>
              <div style="font-size: 11px; color: #666;">${transaction.user.email}</div>
            </td>
            <td>${transaction.package.name}</td>
            <td style="font-family: monospace; font-size: 11px;">${transaction.orderId}</td>
            <td style="text-align: right;">${formatCurrency(transaction.amount)}</td>
            <td style="text-align: center;">${transaction.package.durationMonths} ${transaction.package.durationMonths === 1 ? 'month' : 'months'}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
        <p style="font-size: 11px; color: #666; margin-top: 10px;">*Showing first 50 transactions out of ${detailedTransactions.length} total</p>
      `;
    }

    html += `
        <div class="footer">
          <p>Blue Feathers Gym - Monthly Revenue Report</p>
          <p>&copy; ${new Date().getFullYear()} Blue Feathers Gym. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      toast.success('PDF export initiated - check your print dialog');
    };
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
          <div className="flex flex-wrap items-center gap-3">
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
              onClick={exportToCSV}
              disabled={loading || monthlyData.length === 0}
              className="bg-green-600/80 backdrop-blur-sm hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg border-2 border-green-500/50 hover:border-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Export to CSV"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={exportToPDF}
              disabled={loading || monthlyData.length === 0}
              className="bg-red-600/80 backdrop-blur-sm hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg border-2 border-red-500/50 hover:border-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Export to PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
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

        {/* Detailed Transactions */}
        {detailedTransactions.length > 0 && (
          <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden mb-8 animate-fadeInUp">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-indigo-600 to-indigo-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <p className="text-white/80 text-sm mt-1">Detailed payment records (Last 100 transactions)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransactions(!showTransactions)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                {showTransactions ? 'Hide' : 'Show'} Details
                <svg className={`w-5 h-5 transition-transform ${showTransactions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showTransactions && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {detailedTransactions.map((transaction, index) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{transaction.user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                            {transaction.package.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                          {transaction.orderId}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-700 dark:text-green-400">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                          {transaction.package.durationMonths} {transaction.package.durationMonths === 1 ? 'month' : 'months'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Package Distribution */}
        {packageDistribution.length > 0 && (
          <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
              <h2 className="text-xl font-bold text-white">Package Distribution</h2>
              <p className="text-white/80 text-sm mt-1">Revenue breakdown by membership package</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Sales Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Revenue Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {packageDistribution.map((pkg, index) => {
                    const totalRevenue = packageDistribution.reduce((sum, p) => sum + p.revenue, 0);
                    const share = (pkg.revenue / totalRevenue) * 100;

                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
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
