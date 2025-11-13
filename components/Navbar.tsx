'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-primary-200 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
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
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 hover:bg-white/10 px-3 rounded-lg transition text-white font-medium"
                  >
                    Dashboard
                  </Link>
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
