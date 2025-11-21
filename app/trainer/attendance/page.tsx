'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AttendanceStats {
  totalEntries: number;
  allowedEntries: number;
  deniedEntries: number;
  uniqueUsers: number;
  dailyStats: any[];
  hourlyStats: any[];
  recentEntries: any[];
}

interface CheckedInUser {
  _id: string;
  timestamp: string;
  user: {
    _id: string;
    name: string;
    email: string;
    membershipStatus: string;
    membershipPlan?: string;
    profileImage?: string;
    avatar?: string;
  };
}

export default function TrainerAttendancePage() {
  const { user, loading: authLoading, isTrainer } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [checkedInUsers, setCheckedInUsers] = useState<CheckedInUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    if (!authLoading && !isTrainer) {
      router.push('/dashboard');
    }
  }, [authLoading, isTrainer, router]);

  useEffect(() => {
    if (isTrainer) {
      fetchStats();
      fetchCheckedInUsers();
    }
  }, [isTrainer, period]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/trainers/attendance/stats', {
        params: { period },
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch attendance statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckedInUsers = async () => {
    try {
      const response = await api.get('/trainers/attendance/current');
      if (response.data.success) {
        setCheckedInUsers(response.data.users);
      }
    } catch (error: any) {
      console.error('Error fetching checked-in users:', error);
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

  if (!isTrainer) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Attendance Statistics
            </h1>
            <p className="text-base text-white/90 drop-shadow">
              View gym attendance data and currently checked-in members
            </p>
          </div>
          <div className="flex gap-2">
            {['7', '14', '30'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === days
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalEntries}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Allowed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.allowedEntries}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Denied</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.deniedEntries}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unique Members</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueUsers}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currently Checked In */}
        <div className="glass-card-solid rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Currently Checked In ({checkedInUsers.length})
          </h2>

          {checkedInUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">No members currently checked in</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkedInUsers.map((entry) => (
                <div key={entry._id} className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                  {entry.user.profileImage || entry.user.avatar ? (
                    <img
                      src={entry.user.profileImage || entry.user.avatar}
                      alt={entry.user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{entry.user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        {stats && stats.hourlyStats.length > 0 && (
          <div className="glass-card-solid rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Peak Hours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.hourlyStats.map((stat: any, index: number) => (
                <div key={index} className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {stat._id}:00
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {stat.count} entries
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
