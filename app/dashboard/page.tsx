'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user && user.membershipEndDate) {
      const endDate = new Date(user.membershipEndDate);
      const today = new Date();
      const timeDiff = endDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysRemaining(daysDiff);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-4 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Here's your membership overview</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Membership Status</h3>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span
              className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm ${getMembershipStatusColor(
                user.membershipStatus
              )}`}
            >
              {user.membershipStatus.toUpperCase()}
            </span>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Current Plan</h3>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">
              {user.membershipPlan || 'No Plan'}
            </p>
            {planDetails && <p className="text-xs sm:text-sm text-gray-600 mt-1">{planDetails.price}</p>}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Days Remaining</h3>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : 0) : '-'}
            </p>
            {user.membershipEndDate && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Until {new Date(user.membershipEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center border-b border-gray-200 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm">Full Name</p>
                  <p className="text-base sm:text-lg font-semibold break-words">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm">Email Address</p>
                  <p className="text-base sm:text-lg font-semibold break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center border-b border-gray-200 pb-2 sm:pb-3">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm">Phone Number</p>
                  <p className="text-base sm:text-lg font-semibold">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm">Member Since</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {user.membershipStartDate
                      ? new Date(user.membershipStartDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {planDetails && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
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
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {user.membershipStatus === 'inactive' && (
          <div className="mt-6 sm:mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-6 rounded">
            <h3 className="text-base sm:text-lg font-bold text-yellow-800 mb-2">
              No Active Membership
            </h3>
            <p className="text-sm sm:text-base text-yellow-700">
              Contact the gym administrator to activate your membership and choose a plan.
            </p>
          </div>
        )}

        {user.membershipStatus === 'expired' && (
          <div className="mt-6 sm:mt-8 bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded">
            <h3 className="text-base sm:text-lg font-bold text-red-800 mb-2">
              Membership Expired
            </h3>
            <p className="text-sm sm:text-base text-red-700">
              Your membership has expired. Please contact the gym to renew.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
