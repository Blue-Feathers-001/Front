'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { packageAPI } from '@/lib/api';
import type { MembershipPackage } from '@/types';
import toast from 'react-hot-toast';

export default function PackagesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll({ active: true });
      if (response.success && response.data) {
        setPackages(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPackage = (packageId: string) => {
    if (!isAuthenticated && !loading) {
      toast.error('Please login to purchase a package');
      router.push(`/login?redirect=/payment/${packageId}`);
      return;
    }
    router.push(`/payment/${packageId}`);
  };

  const filteredPackages =
    selectedCategory === 'all'
      ? packages
      : packages.filter((pkg) => pkg.category === selectedCategory);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      vip: 'bg-yellow-100 text-yellow-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.custom;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading packages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInDown">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Choose Your Membership Plan
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Select the perfect plan that fits your fitness goals and budget
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fadeInUp">
          {['all', 'basic', 'premium', 'vip', 'custom'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold capitalize transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'glass-card-solid text-gray-700 dark:text-gray-200 hover:shadow-lg'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl"
            >
              {/* Package Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold">{pkg.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryBadgeColor(
                      pkg.category
                    )}`}
                  >
                    {pkg.category}
                  </span>
                </div>
                <p className="text-purple-100 text-sm">{pkg.description}</p>
              </div>

              {/* Pricing */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    LKR {pkg.discount > 0 ? (pkg.discountedPrice || (pkg.price - (pkg.price * pkg.discount) / 100)).toFixed(2) : pkg.price.toFixed(2)}
                  </span>
                  {pkg.discount > 0 && (
                    <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                      LKR {pkg.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  for {pkg.durationMonths} month{pkg.durationMonths > 1 ? 's' : ''}
                </p>
                {pkg.discount > 0 && (
                  <div className="mt-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {pkg.discount}%
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">What's Included:</h4>
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Availability */}
              {pkg.maxMembers && (
                <div className="px-6 pb-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <span className="font-semibold">
                        {pkg.maxMembers - pkg.currentMembers}
                      </span>{' '}
                      spots remaining
                    </p>
                    <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(pkg.currentMembers / pkg.maxMembers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSelectPackage(pkg._id)}
                  disabled={!pkg.isAvailable}
                  className={`w-full py-3 rounded-lg font-bold text-white transition ${
                    pkg.isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {pkg.isAvailable ? 'Choose Plan' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-16 glass-card-solid rounded-2xl shadow-2xl">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
              No packages available in this category
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 glass-card-solid rounded-2xl shadow-2xl p-8 md:p-12 animate-fadeInUp">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-8">
            Why Choose Blue Feathers Gym?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                State-of-the-Art Equipment
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access to the latest fitness equipment and facilities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Expert Trainers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get guidance from certified fitness professionals
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Flexible Timings
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                24/7 access to fit your busy schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
