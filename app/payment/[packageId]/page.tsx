'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter, useParams } from 'next/navigation';
import { packageAPI, paymentAPI } from '@/lib/api';
import type { MembershipPackage } from '@/types';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<MembershipPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=/payment/${packageId}`);
    }
  }, [isAuthenticated, loading, router, packageId]);

  useEffect(() => {
    if (isAuthenticated && packageId) {
      fetchPackage();
    }
  }, [isAuthenticated, packageId]);

  const fetchPackage = async () => {
    try {
      const response = await packageAPI.getById(packageId);
      if (response.success && response.data) {
        if (!response.data.isActive || !response.data.isAvailable) {
          toast.error('This package is not available');
          router.push('/packages');
          return;
        }
        setPkg(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load package details');
      router.push('/packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!pkg || isProcessing) return;

    setIsProcessing(true);

    try {
      // Initiate payment with backend
      const response = await paymentAPI.initiate(pkg._id);

      if (response.success && response.data) {
        const { paymentData } = response.data;

        // Create and submit PayHere form
        const form = formRef.current;
        if (!form) return;

        // Clear any existing inputs
        form.innerHTML = '';

        // Add all payment data as hidden inputs
        Object.entries(paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        // Set form action
        form.action = paymentData.sandbox
          ? 'https://sandbox.payhere.lk/pay/checkout'
          : 'https://www.payhere.lk/pay/checkout';

        form.method = 'POST';

        // Submit form
        toast.success('Redirecting to PayHere...');
        form.submit();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <p className="text-xl text-gray-600 font-semibold">Package not found</p>
        </div>
      </div>
    );
  }

  const finalPrice = pkg.discount && pkg.discount > 0 ? (pkg.discountedPrice || (pkg.price - (pkg.price * pkg.discount) / 100)) : pkg.price;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg animate-fadeInDown">
          Complete Your Purchase
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeInUp">
          {/* Package Summary */}
          <div className="glass-card-solid rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Package Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-purple-600">{pkg.name}</h3>
                <span className="text-sm text-gray-500 capitalize">{pkg.category} Plan</span>
              </div>

              <p className="text-gray-600">{pkg.description}</p>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Duration:</span>
                  <span className="font-semibold">
                    {pkg.durationMonths} month{pkg.durationMonths > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Original Price:</span>
                  <span className={pkg.discount && pkg.discount > 0 ? 'line-through' : 'font-semibold'}>
                    LKR {pkg.price.toFixed(2)}
                  </span>
                </div>
                {pkg.discount && pkg.discount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600 mb-2">
                      <span>Discount ({pkg.discount}%):</span>
                      <span className="font-semibold">
                        -LKR {(pkg.price - finalPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-purple-600 pt-2 border-t">
                      <span>Final Price:</span>
                      <span>LKR {finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="glass-card-solid rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Your Details</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Name:</span> {user?.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {user?.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Payment Method</h3>
                <div className="flex items-center gap-3">
                  <img
                    src="/payhere-logo.png"
                    alt="PayHere"
                    className="h-8"
                  />
                  <span className="text-sm text-purple-800">
                    Secure payment gateway
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  Supports Visa, Mastercard, and other payment methods
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">What Happens Next?</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• You'll be redirected to PayHere payment page</li>
                  <li>• Complete your payment securely</li>
                  <li>• Your membership will be activated instantly</li>
                  <li>• You'll receive a confirmation email</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg transition ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Processing...
                    </span>
                  ) : (
                    `Pay LKR ${finalPrice.toFixed(2)}`
                  )}
                </button>

                <button
                  onClick={() => router.push('/packages')}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Back to Packages
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure SSL encrypted payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden PayHere Form */}
        <form ref={formRef} style={{ display: 'none' }}></form>
      </div>
    </div>
  );
}
