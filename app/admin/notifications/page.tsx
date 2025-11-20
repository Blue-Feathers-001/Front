'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminNotificationsPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'general' | 'membership_expiry' | 'payment_success' | 'payment_failed' | 'membership_activated' | 'promotion'>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sending, setSending] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data.users.filter((u: User) => u.role === 'user'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u._id));
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message || !type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetUserIds = sendToAll ? users.map(u => u._id) : selectedUserIds;

    if (targetUserIds.length === 0) {
      toast.error('Please select at least one user or enable "Send to All"');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${API_URL}/notifications/bulk`,
        {
          userIds: targetUserIds,
          title,
          message,
          type,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Notification sent to ${targetUserIds.length} user(s) successfully!`);
        setTitle('');
        setMessage('');
        setType('general');
        setPriority('medium');
        setSelectedUserIds([]);
        setSendToAll(false);
      }
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Send Notifications</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Send notifications to individual users, multiple selected users, or all users at once
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSendNotification} className="space-y-6">
            {/* Send to All Users Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Send to All Users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send this notification to all {users.length} users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => {
                    setSendToAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedUserIds([]);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* User Selection */}
            {!sendToAll && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Select Users ({selectedUserIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllUsers}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                  >
                    {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-700">
                  {users.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center p-2 hover:bg-white dark:hover:bg-gray-600 rounded cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">
                        {user.name} <span className="text-gray-500 dark:text-gray-400">({user.email})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter notification title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter notification message"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="general">General</option>
                  <option value="membership_expiry">Membership Expiry</option>
                  <option value="payment_success">Payment Success</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="membership_activated">Membership Activated</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : `Send to ${sendToAll ? users.length : selectedUserIds.length} User(s)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
