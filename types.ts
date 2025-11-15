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
