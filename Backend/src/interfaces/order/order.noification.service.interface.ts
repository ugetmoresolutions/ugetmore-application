import { OrderStatus } from "@/types/order/order.types";
import { Token } from "typedi";

export interface IOrderNotificationService {
  // User notifications
  createOrderStatusNotification(
    userId: number,
    orderId: number,
    status: OrderStatus,
    additionalInfo?: string
  ): Promise<void>;

  createMockupAddedNotification(
    userId: number,
    orderId: number,
    itemId: string,
    adminName?: string
  ): Promise<void>;
  
  createMockupStatusNotification(
    userId: number,
    orderId: number,
    itemId: string,
    isApproved: boolean,
    adminName?: string,
    notes?: string
  ): Promise<void>;

  // Admin notifications
  createAdminOrderStatusNotification(
    orderId: number,
    status: OrderStatus,
    userId?: number,
    additionalInfo?: string
  ): Promise<void>;

  createAdminMockupAddedNotification(
    orderId: number,
    itemId: string,
    adminId?: number,
    adminName?: string
  ): Promise<void>;

  createAdminMockupStatusNotification(
    orderId: number,
    itemId: string,
    isApproved: boolean,
    userId: number,
    notes?: string
  ): Promise<void>;

   // Payment success notification for admins
  createAdminPaymentSuccessNotification(
    orderId: number,
    amount: number,
    paymentReference: string,
    userId: number
  ): Promise<void>;
}

export const ORDER_NOTIFICATION_SERVICE_TOKEN = new Token<IOrderNotificationService>("ORDER_NOTIFICATION_SERVICE_TOKEN");