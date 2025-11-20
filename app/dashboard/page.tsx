'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationCenter from '@/components/NotificationCenter';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'event' | 'promotion';
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Refresh user data on mount to get latest membership status
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user && user.membershipEndDate) {
      const endDate = new Date(user.membershipEndDate);
      const today = new Date();
      const timeDiff = endDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysRemaining(daysDiff);
    }
  }, [user]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/announcements?activeOnly=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements.slice(0, 3)); // Show only latest 3
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnnouncements();
    }
  }, [isAuthenticated]);

  if (loading) {
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

  if (!user) {
    return null;
  }

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'event':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'promotion':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getPlanDetails = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'basic':
        return {
          price: '$29/month',
          features: ['Off-peak hours access', 'Basic equipment', 'Locker facilities'],
          color: 'bg-blue-500'
        };
      case 'premium':
        return {
          price: '$59/month',
          features: ['24/7 access', 'All equipment', '1 PT session/month', 'Nutrition consultation'],
          color: 'bg-purple-500'
        };
      case 'vip':
        return {
          price: '$99/month',
          features: ['All Premium features', 'Unlimited PT sessions', 'Spa access', 'Priority booking', 'Guest passes'],
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
        };
      default:
        return null;
    }
  };

  const planDetails = user.membershipPlan ? getPlanDetails(user.membershipPlan) : null;

  return (
    <div className="min-h-screen py-4 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="animate-fadeInDown mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm sm:text-base text-white/90 drop-shadow">Here's your membership overview</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fadeInUp">
          <div className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-white">Membership Status</h3>
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <span
              className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow-md ${getMembershipStatusColor(
                user.membershipStatus
              )}`}
            >
              {user.membershipStatus.toUpperCase()}
            </span>
          </div>

          <div className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-white">Current Plan</h3>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {user.membershipPlan || 'No Plan'}
            </p>
            {planDetails && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">{planDetails.price}</p>}
          </div>

          <div className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-white">Days Remaining</h3>
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : 0) : '-'}
            </p>
            {user.membershipEndDate && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Until {new Date(user.membershipEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        {!announcementsLoading && announcements.length > 0 && (
          <div className="mb-6 sm:mb-8 animate-fadeInUp">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center drop-shadow-lg">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Latest Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border capitalize ${getAnnouncementTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 animate-fadeInUp">
          <div className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center border-b border-gray-200 dark:border-gray-600 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">Full Name</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white break-words">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 dark:border-gray-600 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">Email Address</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 dark:border-gray-600 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">Phone Number</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">Member Since</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                    {user.membershipStartDate
                      ? new Date(user.membershipStartDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {planDetails && (
            <div className="glass-card-solid p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Plan Benefits
              </h2>
              <div className={`${planDetails.color} text-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4`}>
                <h3 className="text-xl sm:text-2xl font-bold capitalize">{user.membershipPlan} Plan</h3>
                <p className="text-lg sm:text-xl font-semibold mt-1">{planDetails.price}</p>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="mt-6 sm:mt-8 animate-fadeInUp">
          <NotificationCenter maxDisplay={5} />
        </div>

        {user.membershipStatus === 'inactive' && (
          <div className="mt-6 sm:mt-8 glass-card-solid border-l-4 border-yellow-500 p-4 sm:p-6 rounded-xl shadow-lg animate-fadeInUp">
            <div className="flex items-start">
              <div className="bg-yellow-500 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
                  No Active Membership
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Contact the gym administrator to activate your membership and choose a plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {user.membershipStatus === 'expired' && (
          <div className="mt-6 sm:mt-8 glass-card-solid border-l-4 border-red-500 p-4 sm:p-6 rounded-xl shadow-lg animate-fadeInUp">
            <div className="flex items-start">
              <div className="bg-red-500 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Membership Expired
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Your membership has expired. Please contact the gym to renew.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
