'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

interface Entry {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    membershipPlan: string;
    membershipStatus: string;
    role: 'admin' | 'user' | 'trainer';
  };
  timestamp: string;
  status: 'allowed' | 'denied';
  reason: string;
  membershipStatus: string;
}

interface Stats {
  today: number;
  todayDenied: number;
  thisWeek: number;
  thisMonth: number;
}

interface FlaggedUser {
  _id: string;
  name: string;
  email: string;
  isFlagged: boolean;
  flaggedAt: string;
  flagReason: string;
}

export default function AdminEntriesPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchEntries();
      fetchStats();
      fetchFlaggedUsers();
    }
  }, [isAdmin, page, filterStatus]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(`${API_URL}/entry/logs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/entry/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchFlaggedUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/entries/flagged`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setFlaggedUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch flagged users:', error);
    }
  };

  const clearFlag = async (userId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/entries/flagged/${userId}/clear`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh flagged users list
        fetchFlaggedUsers();
      }
    } catch (error) {
      console.error('Failed to clear flag:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Entry Logs
          </h1>
          <p className="text-base md:text-lg text-white/90 drop-shadow">
            Track gym member check-ins and access history
          </p>
        </div>

        {/* Flagged Users Alert */}
        {flaggedUsers.length > 0 && (
          <div className="glass-card-solid rounded-xl p-6 shadow-lg mb-6 border-2 border-yellow-500">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  ⚠️ Suspicious Activity Detected
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {flaggedUsers.length} user{flaggedUsers.length > 1 ? 's have' : ' has'} been flagged for suspicious activity:
                </p>
                <div className="space-y-2">
                  {flaggedUsers.map((flaggedUser) => (
                    <div key={flaggedUser._id} className="bg-white dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{flaggedUser.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{flaggedUser.flagReason}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Flagged: {new Date(flaggedUser.flaggedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearFlag(flaggedUser._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Clear Flag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Entries</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.today}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Denied Today</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.todayDenied}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.thisWeek}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.thisMonth}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card-solid p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Entries</option>
                <option value="allowed">Allowed Only</option>
                <option value="denied">Denied Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('');
                  setPage(1);
                  fetchEntries();
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Entry Logs Table */}
        <div className="glass-card-solid rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Time</th>
                  <th className="px-6 py-4 text-left font-bold">Member</th>
                  <th className="px-6 py-4 text-left font-bold">Role</th>
                  <th className="px-6 py-4 text-left font-bold">Plan</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Result</th>
                  <th className="px-6 py-4 text-left font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-primary-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 dark:text-gray-200 text-sm">
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 dark:text-gray-200">
                      <div>
                        <p className="font-semibold">{entry.user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                          entry.user.role === 'trainer'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : entry.user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {entry.user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 dark:text-gray-200 capitalize">
                      {entry.user.membershipPlan || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          entry.membershipStatus === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {entry.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          entry.status === 'allowed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200'
                        }`}
                      >
                        {entry.status === 'allowed' ? '✓ ALLOWED' : '✗ DENIED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 dark:text-gray-200 text-sm">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all dark:text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
