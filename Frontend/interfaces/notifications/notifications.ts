export interface INotification {
  data: NotificationData;
  id: number;
  userId: number;
  type: "payment_success" | string; // could be union of known event types
  title: string;
  message: string;
  paymentReference: string;
  orderId: number;
  isRead: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface NotificationData {
  orderId: number;
  paymentReference: string;
  amount: number;
  timestamp: string; // ISO timestamp
}
