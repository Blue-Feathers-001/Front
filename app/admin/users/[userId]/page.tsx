'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  membershipStatus: string;
  membershipPlan?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  gracePeriodEndDate?: string;
  lastPaymentDate?: string;
  createdAt: string;
  membershipPackage?: {
    name: string;
    price: number;
    durationMonths: number;
    category: string;
  };
}

interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  package: {
    name: string;
    price: number;
    durationMonths: number;
    category: string;
  };
  membershipStartDate?: string;
  membershipEndDate?: string;
}

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalSpent: number;
}

interface Note {
  _id: string;
  user: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchNotes();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getUserPaymentHistory(userId);

      if (response.success) {
        setUser(response.data.user);
        setPayments(response.data.payments);
        setPaymentStats(response.data.paymentStats);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch user details');
        router.push('/admin/users');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/notes/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      setAddingNote(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/notes/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNoteContent }),
      });

      if (response.ok) {
        toast.success('Note added successfully');
        setNewNoteContent('');
        fetchNotes();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add note');
      }
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Note deleted successfully');
        fetchNotes();
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
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
          <span className="text-xl font-semibold text-gray-700">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeInDown">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/users')}
                className="text-white hover:text-white/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                User Profile
              </h1>
            </div>
            <p className="text-white/90 mt-2 ml-9">Detailed information and payment history</p>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeInUp">
          {/* Personal Information */}
          <div className="lg:col-span-2 glass-card-solid p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registered Date</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Payment</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {user.lastPaymentDate ? formatDate(user.lastPaymentDate) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Statistics */}
          {paymentStats && (
            <div className="glass-card-solid p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Payment Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Payments</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{paymentStats.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Successful</span>
                  <span className="text-xl font-semibold text-green-600 dark:text-green-400">{paymentStats.successfulPayments}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Failed</span>
                  <span className="text-xl font-semibold text-red-600 dark:text-red-400">{paymentStats.failedPayments}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Total Spent</span>
                  <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(paymentStats.totalSpent)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Membership Information */}
        <div className="glass-card-solid p-6 rounded-xl shadow-lg mb-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Membership Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border ${getMembershipStatusColor(user.membershipStatus)}`}>
                {user.membershipStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Plan</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                {user.membershipPackage?.name || user.membershipPlan || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {user.membershipStartDate ? formatDate(user.membershipStartDate) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {user.membershipEndDate ? formatDate(user.membershipEndDate) : '-'}
              </p>
            </div>
          </div>
          {user.gracePeriodEndDate && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">Grace Period:</span> Valid until {formatDate(user.gracePeriodEndDate)}
              </p>
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div className="glass-card-solid p-6 rounded-xl shadow-lg mb-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Admin Notes
          </h2>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="mb-6">
            <div className="flex gap-3">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Add a note about this member..."
                rows={3}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
              <button
                type="submit"
                disabled={addingNote || !newNoteContent.trim()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 self-start"
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {note.createdBy.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDateTime(note.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      title="Delete note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-lg font-medium">No notes yet</p>
                <p className="text-sm mt-1">Add a note about this member using the form above</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment History
            </h2>
            <p className="text-white/80 text-sm mt-1">Complete transaction history for this user</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Membership Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-800 dark:text-gray-200">
                        {payment.orderId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{payment.package?.name || '-'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{payment.package?.category || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {payment.membershipStartDate && payment.membershipEndDate ? (
                          <div>
                            <p>{formatDate(payment.membershipStartDate)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">to {formatDate(payment.membershipEndDate)}</p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No payment history</p>
                      <p className="text-sm mt-1">This user has not made any payments yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
