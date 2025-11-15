export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'membership_expiry' | 'payment_success' | 'payment_failed' | 'membership_activated' | 'promotion' | 'general';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  discountedPrice?: number;
  isAvailable?: boolean;
}

export interface Payment {
  _id: string;
  user: string | any;
  package: string | MembershipPackage;
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  payHerePaymentId?: string;
  payHereStatusCode?: string;
  payHereCardHolderName?: string;
  payHereCardNo?: string;
  statusMessage?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    rawResponse?: any;
  };
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaymentInitiateResponse {
  orderId: string;
  paymentData: {
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    order_id: string;
    items: string;
    currency: string;
    amount: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    hash: string;
    sandbox?: boolean;
    [key: string]: any;
  };
}
