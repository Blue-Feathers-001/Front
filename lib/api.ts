import axios from 'axios';
import type {
  MembershipPackage,
  Payment,
  Notification,
  ApiResponse,
  PaymentInitiateResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Package API
export const packageAPI = {
  getAll: async (params?: { active?: boolean; category?: string }) => {
    const { data } = await api.get<ApiResponse<MembershipPackage[]>>('/packages', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<MembershipPackage>>(`/packages/${id}`);
    return data;
  },

  create: async (packageData: Partial<MembershipPackage>) => {
    const { data } = await api.post<ApiResponse<MembershipPackage>>('/packages', packageData);
    return data;
  },

  update: async (id: string, packageData: Partial<MembershipPackage>) => {
    const { data } = await api.put<ApiResponse<MembershipPackage>>(`/packages/${id}`, packageData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/packages/${id}`);
    return data;
  },

  toggleActive: async (id: string) => {
    const { data } = await api.patch<ApiResponse<MembershipPackage>>(`/packages/${id}/toggle-active`);
    return data;
  },

  getStats: async (id: string) => {
    const { data } = await api.get(`/packages/${id}/stats`);
    return data;
  },
};

// Payment API
export const paymentAPI = {
  initiate: async (packageId: string) => {
    const { data } = await api.post<ApiResponse<PaymentInitiateResponse>>('/payments/initiate', {
      packageId,
    });
    return data;
  },

  getMyPayments: async () => {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments/my-payments');
    return data;
  },

  getByOrderId: async (orderId: string) => {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/order/${orderId}`);
    return data;
  },

  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments', { params });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/payments/stats');
    return data;
  },
};

// Notification API
export const notificationAPI = {
  getAll: async (params?: { limit?: number; page?: number; isRead?: boolean }) => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch<ApiResponse<void>>('/notifications/mark-all-read');
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
    return data;
  },

  // Admin only
  create: async (notificationData: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    metadata?: any;
  }) => {
    const { data } = await api.post<ApiResponse<Notification>>('/notifications', notificationData);
    return data;
  },

  sendBulk: async (bulkData: {
    userIds: string[];
    title: string;
    message: string;
    type: string;
    priority?: string;
  }) => {
    const { data } = await api.post<ApiResponse<{ count: number }>>('/notifications/bulk', bulkData);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/notifications/stats');
    return data;
  },
};

export default api;
