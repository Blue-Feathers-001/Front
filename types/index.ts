// Package Types
export interface MembershipPackage {
  _id: string;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  features: string[];
  isActive: boolean;
  category: 'basic' | 'premium' | 'vip' | 'custom';
  maxMembers?: number;
  currentMembers: number;
  discount?: number;
  discountedPrice: number;
  isAvailable: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  package: {
    _id: string;
    name: string;
    price: number;
    durationMonths: number;
  };
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  payHerePaymentId?: string;
  statusMessage?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'membership_expiry' | 'payment_success' | 'payment_failed' | 'membership_activated' | 'general' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  metadata?: {
    membershipEndDate?: string;
    packageName?: string;
    amount?: number;
    orderId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// User Type Extension
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  membershipStatus: 'active' | 'inactive' | 'expired' | 'grace_period';
  membershipPackage?: MembershipPackage;
  membershipPlan?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  gracePeriodEndDate?: string;
  autoRenewal: boolean;
  paymentHistory: string[];
  lastPaymentDate?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    reminderDays: number[];
  };
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
}

// PayHere Payment Data
export interface PayHerePaymentData {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  custom_1: string;
  custom_2: string;
}

export interface PaymentInitiateResponse {
  payment: Payment;
  paymentData: PayHerePaymentData;
}
