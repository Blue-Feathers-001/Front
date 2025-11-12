'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            GymFit Pro
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Welcome, {user?.name}</span>
                {isAdmin ? (
                  <Link
                    href="/admin/users"
                    className="hover:text-blue-200 transition"
                  >
                    Manage Users
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="hover:text-blue-200 transition"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-blue-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
