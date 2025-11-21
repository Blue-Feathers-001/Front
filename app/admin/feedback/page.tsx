'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Feedback {
  _id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  isAnonymous: boolean;
  status: 'New' | 'Under Review' | 'Resolved';
  adminResponse?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

interface Stats {
  total: number;
  new: number;
  underReview: number;
  resolved: number;
}

export default function AdminFeedbackPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, underReview: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchFeedback();
    }
  }, [isAdmin, filterStatus, filterCategory]);

  const fetchFeedback = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const response = await api.get('/feedback', { params });
      if (response.data.success) {
        setFeedback(response.data.feedback);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const submitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const response = await api.put(`/feedback/${selectedFeedback._id}/response`, {
        adminResponse: responseText,
      });
      if (response.data.success) {
        toast.success('Response sent successfully');
        setSelectedFeedback(null);
        setResponseText('');
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suggestion':
        return '💡';
      case 'Complaint':
        return '😞';
      case 'Compliment':
        return '👍';
      case 'Facility Issue':
        return '🏢';
      case 'Equipment Issue':
        return '🏋️';
      default:
        return '📝';
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Member Feedback
          </h1>
          <p className="text-base text-white/90 drop-shadow">
            Review and respond to member feedback to improve gym experience
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card-solid rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card-solid rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.new}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card-solid rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Under Review</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.underReview}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card-solid rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.resolved}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card-solid rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Complaint">Complaint</option>
                <option value="Compliment">Compliment</option>
                <option value="Facility Issue">Facility Issue</option>
                <option value="Equipment Issue">Equipment Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFilterStatus('');
                setFilterCategory('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {feedback.length === 0 ? (
          <div className="glass-card-solid rounded-xl p-12 text-center shadow-lg">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">No feedback found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Feedback submissions will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedback.map((item) => (
              <div key={item._id} className="glass-card-solid rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {item.isAnonymous ? 'Anonymous' : item.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {item.category}
                        </span>
                      </div>
                      {!item.isAnonymous && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.email}</p>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{item.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                      className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => deleteFeedback(item._id)}
                      className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {item.adminResponse && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Admin Response:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">{item.adminResponse}</p>
                  </div>
                )}

                {!item.adminResponse && !item.isAnonymous && (
                  <button
                    onClick={() => setSelectedFeedback(item)}
                    className="mt-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                  >
                    Send Response
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-solid rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Send Response</h2>
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    setResponseText('');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Original Message:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFeedback.message}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Type your response here..."
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    setResponseText('');
                  }}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResponse}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
