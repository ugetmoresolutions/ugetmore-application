// interfaces/payment/IPFNotificationService.interface.ts


import { IPFNotificationCreate, IPFNotificationSummary } from "@/models/notification/payfast.notification.model";
import { ITNData, NotificationProcessResult } from "@/services/notification/payment.notification.service";
import { Token } from "typedi";



export interface IPFNotificationService {
  // Core notification processing
  processITNNotification(itnData: ITNData): Promise<NotificationProcessResult>;
  saveNotification(notificationData: IPFNotificationCreate): Promise<IPFNotificationSummary>;
  
  // Duplicate detection
  isDuplicateNotification(pfPaymentId: number, signature: string): Promise<boolean>;
  
  // Signature validation
  validateSignature(itnData: ITNData): Promise<boolean>;
  
  // Data retrieval
  findByPfPaymentId(pfPaymentId: number): Promise<IPFNotificationSummary | null>;
  findByMerchantId(merchantId: number): Promise<IPFNotificationSummary[]>;
  findByPaymentStatus(paymentStatus: string): Promise<IPFNotificationSummary[]>;
  
  // Pagination and stats
  getAllNotifications(page?: number, limit?: number): Promise<{ 
    notifications: IPFNotificationSummary[], 
    total: number, 
    totalPages: number 
  }>;
  getNotificationStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    today: number;
  }>;

  getTotalAmount(): Promise<{
  totalGrossAmount: number;
  totalNetAmount: number;
  totalFeeAmount: number;
  completedGrossAmount: number;
  completedNetAmount: number;
  notificationCount: number;
}>
  
  // Business logic
  isPaymentSuccessful(pfPaymentId: number): Promise<boolean>;
}


export const PFNOTIFICATION_SERVICE_TOKEN = new Token<IPFNotificationService>("IPFNotificationService");