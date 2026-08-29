import { 
    INotification, 
    INotificationCreate, 
    INotificationUpdate, 
    INotificationFilters,
    INotificationStats,
    NotificationType 
} from "@/types/notification/notification.types";
import { Token } from "typedi";

export interface INotificationService {
    createNotification(data: INotificationCreate): Promise<INotification>;
    getUserNotifications(userId: number, filters?: INotificationFilters): Promise<{ notifications: INotification[]; total: number }>;
    getUnreadNotifications(userId: number): Promise<INotification[]>;
    getNotificationById(id: number, userId?: number): Promise<INotification | null>;
    markNotificationAsRead(id: number, userId: number): Promise<boolean>;
    markAllNotificationsAsRead(userId: number): Promise<number>;
    updateNotification(id: number, userId: number, data: INotificationUpdate): Promise<INotification | null>;
    deleteNotification(id: number, userId: number): Promise<boolean>;
    getNotificationStats(userId: number): Promise<INotificationStats>;
    
    createPaymentSuccessNotification(
        userId: number, 
        orderId: number, 
        amount: number, 
        paymentReference: string
    ): Promise<INotification>;
    
    createPaymentFailedNotification(
        userId: number, 
        amount: number, 
        paymentReference: string, 
        reason?: string
    ): Promise<INotification>;
    
    createOrderStatusNotification(
        userId: number, 
        orderId: number, 
        status: string, 
        paymentReference?: string,
        customMessage?: string
    ): Promise<INotification>;
    
    createGeneralNotification(
        userId: number, 
        title: string, 
        message: string, 
        paymentReference?: string,
        orderId?: string,
        data?: Record<string, any>
    ): Promise<INotification>;
    
    createSystemNotification(
        userId: number, 
        title: string, 
        message: string, 
        paymentReference?: string,
        orderId?: string,
        data?: Record<string, any>
    ): Promise<INotification>;
    
    cleanupOldNotifications(daysOld?: number): Promise<number>;
    getNotificationsByType(type: NotificationType, limit?: number, offset?: number): Promise<INotification[]>;
    getNotificationsByPaymentReference(paymentReference: string): Promise<INotification[]>;
    getNotificationsByOrderId(orderId: string): Promise<INotification[]>;
}

export const NOTIFICATION_SERVICE_TOKEN = new Token<INotificationService>("INotificationService");