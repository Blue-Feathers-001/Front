'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { refreshUser } = useAuth();

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [retryCount, setRetryCount] = useState(0);
  const [isManuallyActivating, setIsManuallyActivating] = useState(false);
  const MAX_RETRIES = 30; // Poll for up to 30 seconds

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
      setPaymentStatus('success'); // No order ID, assume success
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const response = await paymentAPI.getByOrderId(orderId!);

      if (response.success && response.data) {
        const status = response.data.status;

        if (status === 'success') {
          setPaymentStatus('success');
          setIsVerifying(false);
          // Refresh user data to get updated membership status
          await refreshUser();
        } else if (status === 'pending' && retryCount < MAX_RETRIES) {
          // Payment still pending, retry after 1 second
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyPayment(), 1000);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          setIsVerifying(false);
          toast.error('Payment verification failed');
        } else {
          // Max retries reached, stop polling
          setIsVerifying(false);
          setPaymentStatus('pending');
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => verifyPayment(), 1000);
      } else {
        setIsVerifying(false);
      }
    }
  };

  const handleManualActivation = async () => {
    if (!orderId || isManuallyActivating) return;

    setIsManuallyActivating(true);
    try {
      const response = await paymentAPI.manualComplete(orderId);

      if (response.success) {
        toast.success('Membership activated successfully!');
        setPaymentStatus('success');
        // Refresh user data to get updated membership status
        await refreshUser();
      } else {
        toast.error(response.message || 'Failed to activate membership');
      }
    } catch (error: any) {
      console.error('Error manually activating:', error);
      toast.error(error.response?.data?.message || 'Failed to activate membership');
    } finally {
      setIsManuallyActivating(false);
    }
  };

  // Show verifying state while waiting for webhook
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Loading Icon */}
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          {/* Verifying Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Verifying Your Payment...
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Please wait while we confirm your payment
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            This usually takes just a few seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
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
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {paymentStatus === 'pending' ? 'Payment Received!' : 'Payment Successful!'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
          {paymentStatus === 'pending'
            ? 'Your payment is being processed'
            : 'Your membership has been activated'}
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
        {paymentStatus === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              The payment webhook is taking longer than expected. This usually happens during local testing.
            </p>
            <button
              type="button"
              onClick={handleManualActivation}
              disabled={isManuallyActivating}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                isManuallyActivating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
              }`}
            >
              {isManuallyActivating ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
                  Activating...
                </span>
              ) : (
                'Activate Membership Manually'
              )}
            </button>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-bold text-blue-900 dark:text-gray-200 mb-4 text-center">What's Next?</h2>
          <ul className="space-y-3 text-blue-800 dark:text-gray-300">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
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
              <span>Check your email for the membership confirmation</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
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
              <span>Visit your dashboard to view membership details</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
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
              <span>You'll receive reminders before your membership expires</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
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
              <span>Start your fitness journey today!</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/packages"
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Browse More Packages
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Need help? Contact us at{' '}
          <a href="mailto:support@bluefeathersgym.com" className="text-purple-600 dark:text-purple-400 hover:underline">
            support@bluefeathersgym.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
