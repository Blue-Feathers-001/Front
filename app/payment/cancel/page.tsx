'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Cancel Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Cancelled
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your payment was not completed
        </p>

        {/* Information */}
        <div className="bg-yellow-50 dark:bg-gray-700 border border-yellow-200 dark:border-gray-600 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-bold text-yellow-900 dark:text-gray-200 mb-4 text-center">What Happened?</h2>
          <ul className="space-y-3 text-yellow-800 dark:text-gray-300 text-sm">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>You may have cancelled the payment process</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The payment page may have timed out</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>No charges were made to your account</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-bold text-blue-900 dark:text-gray-200 mb-3 text-center">Try Again?</h2>
          <p className="text-blue-800 dark:text-gray-300 text-sm text-center">
            You can return to the packages page and complete your purchase whenever you're ready.
            Your membership is waiting for you!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/packages"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
          >
            View Packages
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Having trouble with payment? Contact us at{' '}
          <a href="mailto:support@bluefeathersgym.com" className="text-purple-600 hover:underline">
            support@bluefeathersgym.com
          </a>
        </p>
      </div>
    </div>
  );
}
