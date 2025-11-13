'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  membershipStatus: string;
  membershipPlan?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  avatar?: string;
  authProvider?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    reminderDays: number[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      // Handle Google OAuth user - use backend user data if available
      const sessionData = session as any;

      if (sessionData.backendUser) {
        // Backend user data is available
        const backendUser: User = {
          id: sessionData.backendUser.user?.id || sessionData.backendUser.id || '',
          name: sessionData.backendUser.user?.name || sessionData.backendUser.name || '',
          email: sessionData.backendUser.user?.email || sessionData.backendUser.email || '',
          phone: sessionData.backendUser.user?.phone || sessionData.backendUser.phone,
          role: sessionData.backendUser.user?.role || sessionData.backendUser.role || 'user',
          membershipStatus: sessionData.backendUser.user?.membershipStatus || sessionData.backendUser.membershipStatus || 'inactive',
          membershipPlan: sessionData.backendUser.user?.membershipPlan || sessionData.backendUser.membershipPlan,
          membershipEndDate: sessionData.backendUser.user?.membershipEndDate || sessionData.backendUser.membershipEndDate,
          avatar: sessionData.backendUser.user?.avatar || sessionData.backendUser.avatar || session.user.image || undefined,
          authProvider: sessionData.backendUser.user?.authProvider || sessionData.backendUser.authProvider || 'google',
        };
        setUser(backendUser);
        const token = sessionData.backendToken || 'google-oauth-token';

        // Store in localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(backendUser));

        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      // Check for stored auth data (traditional login)
      checkAuth();
    }
    setLoading(false);
  }, [session, status]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      toast.success('Login successful!');

      // Check for redirect URL in query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      if (redirect) {
        router.push(redirect);
      } else if (user.role === 'admin') {
        router.push('/admin/users');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phone,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const loginWithGoogle = useCallback(async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Google login failed');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (session) {
      // Google OAuth logout
      await signOut({ callbackUrl: '/login' });
    }
    // Traditional logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  }, [session, router]);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data.user);

        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Don't remove token on refresh failure - user might still be logged in
    }
  }, [API_URL]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
