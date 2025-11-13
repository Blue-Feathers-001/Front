'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useState, useEffect } from 'react';
import { notificationAPI } from '@/lib/api';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdmin]);

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
                    <Link
                      href="/dashboard#notifications"
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
                    </Link>
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
