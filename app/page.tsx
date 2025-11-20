'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { packageAPI } from '@/lib/api';
import type { MembershipPackage } from '@/types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll({ active: true });
      if (response.success && response.data) {
        // Get top 3 packages
        setPackages(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      basic: 'text-primary-600',
      premium: 'text-primary-600',
      vip: 'text-purple-600 dark:text-purple-400',
      custom: 'text-primary-600',
    };
    return colors[category as keyof typeof colors] || colors.custom;
  };

  const getBorderColor = (category: string) => {
    const colors = {
      basic: 'border-white/60 dark:border-gray-600 hover:border-primary-400',
      premium: 'border-primary-500',
      vip: 'border-white/60 dark:border-gray-600 hover:border-purple-400',
      custom: 'border-white/60 dark:border-gray-600',
    };
    return colors[category as keyof typeof colors] || colors.custom;
  };

  const getCardBg = (category: string) => {
    if (category === 'premium') {
      return 'bg-gradient-to-br from-primary-600 to-primary-700';
    }
    return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg';
  };

  const getTextColor = (category: string) => {
    if (category === 'premium') {
      return 'text-white';
    }
    return 'text-gray-700 dark:text-gray-300';
  };
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeInDown">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30 shadow-lg">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            PREMIUM GYM EXPERIENCE
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to Blue Feathers Gym
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow">
            Your Complete Gym Membership Management Solution
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </Link>
            <Link
              href="/login"
              className="btn-secondary inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 animate-fadeInUp">
          <div className="glass-card-solid p-8 rounded-xl hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Track Your Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your gym attendance and membership status in real-time with advanced analytics.
            </p>
          </div>

          <div className="glass-card-solid p-8 rounded-xl hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Manage Members
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive admin tools to manage all gym members efficiently with ease.
            </p>
          </div>

          <div className="glass-card-solid p-8 rounded-xl hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Flexible Plans
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose from Basic, Premium, or VIP membership plans tailored to your needs.
            </p>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mt-24 glass-card-solid p-10 rounded-2xl animate-fadeInUp">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-center">
            Membership Plans
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Select the perfect plan that fits your fitness journey
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <svg className="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <div
                    key={pkg._id}
                    className={`${getCardBg(pkg.category)} p-8 rounded-xl border-2 ${getBorderColor(pkg.category)} transition-all duration-300 ${index === 1 ? 'transform scale-105' : 'hover:scale-105'} shadow-2xl relative overflow-hidden`}
                  >
                    {index === 1 && (
                      <div className="absolute top-0 right-0 bg-white/20 text-white px-4 py-1 text-sm font-bold rounded-bl-lg backdrop-blur-sm">
                        Popular
                      </div>
                    )}
                    <h4 className={`text-2xl font-bold ${pkg.category === 'premium' ? 'text-white' : 'text-gray-800 dark:text-white'} mb-2 ${index === 1 ? 'mt-6' : ''}`}>
                      <span className="uppercase">{pkg.category}</span> - {pkg.name}
                    </h4>
                    <div className="mb-6">
                      <p className={`text-4xl font-bold ${getCategoryColor(pkg.category)} ${pkg.category === 'premium' ? '!text-white' : ''}`}>
                        LKR {pkg.discount > 0 ? (pkg.discountedPrice || (pkg.price - (pkg.price * pkg.discount) / 100)).toFixed(0) : pkg.price.toFixed(0)}
                      </p>
                      {pkg.discount > 0 && (
                        <>
                          <p className={`text-sm ${pkg.category === 'premium' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} line-through`}>
                            LKR {pkg.price.toFixed(0)}
                          </p>
                          <span className="inline-block mt-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Save {pkg.discount}%
                          </span>
                        </>
                      )}
                      <p className={`text-sm ${pkg.category === 'premium' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} mt-2`}>
                        for {pkg.durationMonths} month{pkg.durationMonths > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ul className={`${getTextColor(pkg.category)} ${pkg.category === 'premium' ? '!text-white' : ''} space-y-3`}>
                      {pkg.features.slice(0, 6).map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg transition-colors"
                >
                  View All Packages
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
