'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function FeedbackPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'Suggestion',
    message: '',
    isAnonymous: false,
  });

  const categories = [
    'Suggestion',
    'Complaint',
    'Compliment',
    'Facility Issue',
    'Equipment Issue',
    'Other',
  ];

  // Redirect after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/feedback/submit', formData);

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  // Show thank you message if submitted
  if (submitted) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl">
          <div className="glass-card-solid rounded-2xl p-8 md:p-12 text-center animate-fadeInUp">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Thank You for Your Feedback!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              We've received your feedback and will review it shortly. Your input helps us improve our services.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You'll be redirected to the homepage in 3 seconds...
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            We Value Your Feedback
          </h1>
          <p className="text-base md:text-lg text-white/90 drop-shadow">
            Help us improve your gym experience. Share your thoughts, suggestions, or concerns with us.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="glass-card-solid rounded-2xl p-6 md:p-8 shadow-2xl animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={formData.isAnonymous}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                  required={!formData.isAnonymous}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={formData.isAnonymous}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="john@example.com"
                  required={!formData.isAnonymous}
                />
              </div>
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isAnonymous" className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                Submit anonymously (your name and email will be hidden from admins)
              </label>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Your Message *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Share your thoughts, suggestions, or concerns..."
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please be as detailed as possible to help us understand your feedback better.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                * Required fields
              </p>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="glass-card-solid rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Quick Response</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">We review all feedback within 24-48 hours</p>
          </div>

          <div className="glass-card-solid rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Confidential</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your feedback is private and secure</p>
          </div>

          <div className="glass-card-solid rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Action-Oriented</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">We act on your suggestions to improve</p>
          </div>
        </div>
      </div>
    </div>
  );
}
