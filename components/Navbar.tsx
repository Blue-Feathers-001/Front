'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useSocket } from '@/lib/socketContext';
import { useTheme } from '@/lib/themeContext';
import { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '@/lib/api';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { unreadCount: socketUnreadCount, notifications: socketNotifications, connected } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local state when socket provides new unread count
  useEffect(() => {
    setUnreadCount(socketUnreadCount);
  }, [socketUnreadCount]);

  // Merge socket notifications with existing notifications
  useEffect(() => {
    if (socketNotifications.length > 0) {
      setNotifications((prev) => {
        // Add new socket notifications that aren't already in the list
        const existingIds = new Set(prev.map(n => n._id));
        const newNotifications = socketNotifications.filter(n => !existingIds.has(n._id));
        return [...newNotifications, ...prev];
      });
    }
  }, [socketNotifications]);

  // Fetch initial unread count on mount
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    if (notificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationDropdownOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await notificationAPI.getAll({ limit: 5 });
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationIconClick = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
    if (!notificationDropdownOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'membership_expiry':
        return '⚠️';
      case 'payment_success':
      case 'membership_activated':
        return '✅';
      case 'payment_failed':
        return '❌';
      case 'promotion':
        return '🎉';
      default:
        return 'ℹ️';
    }
  };

  return (
    <nav className="bg-primary-900/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-primary-200 transition-colors flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Blue Feathers Gym
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/packages"
              className="text-white hover:text-primary-200 transition-colors font-medium"
            >
              Packages
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white font-semibold bg-primary-700/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                  Welcome, {user?.name}
                </span>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/users"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Manage Users
                    </Link>
                    <Link
                      href="/admin/packages"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Manage Packages
                    </Link>
                    <Link
                      href="/admin/revenue"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Revenue Stats
                    </Link>
                    <Link
                      href="/admin/reports/monthly"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Reports
                    </Link>
                    <Link
                      href="/admin/notifications"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Send Notifications
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="text-white hover:text-primary-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="text-white hover:text-primary-200 transition-colors font-medium"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="text-white hover:text-primary-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                    </button>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={handleNotificationIconClick}
                        className="relative text-white hover:text-primary-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                        title="Notifications"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {notificationDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden animate-fadeInDown z-50">
                          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications
                                {unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                  </span>
                                )}
                              </h3>
                              {unreadCount > 0 && (
                                <button
                                  onClick={handleMarkAllAsRead}
                                  className="text-xs text-white hover:text-primary-100 font-semibold transition underline"
                                >
                                  Mark all read
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            {loadingNotifications ? (
                              <div className="flex items-center justify-center py-12">
                                <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="text-center py-12 px-4">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-600 font-semibold">No notifications</p>
                                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                  <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50/80 transition cursor-pointer ${
                                      !notification.isRead ? 'bg-blue-50/50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1 break-words">
                                          {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-2 break-words line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                                          {!notification.isRead && (
                                            <button
                                              onClick={() => handleMarkAsRead(notification._id)}
                                              className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition"
                                            >
                                              Mark read
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50/80">
                              <Link
                                href="/dashboard#notifications"
                                onClick={() => setNotificationDropdownOpen(false)}
                                className="block text-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
                              >
                                View All Notifications
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-primary-200 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium backdrop-blur-sm border border-white/30"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/20 pt-4 animate-fadeInDown">
            <Link
              href="/packages"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
            >
              Packages
            </Link>
            {isAuthenticated ? (
              <>
                <div className="text-sm text-white font-semibold bg-primary-700/60 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                  Welcome, {user?.name}
                </div>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Manage Users
                    </Link>
                    <Link
                      href="/admin/packages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Manage Packages
                    </Link>
                    <Link
                      href="/admin/revenue"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Revenue Stats
                    </Link>
                    <Link
                      href="/admin/reports/monthly"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Reports
                    </Link>
                    <Link
                      href="/admin/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Send Notifications
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 w-full text-left py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      {theme === 'dark' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Light Mode
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Dark Mode
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard#notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 w-full text-left py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                    >
                      {theme === 'dark' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Light Mode
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Dark Mode
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition text-center font-medium border border-white/30"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
