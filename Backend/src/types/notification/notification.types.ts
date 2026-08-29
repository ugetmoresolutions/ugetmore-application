// @/types/notification/notification.interface.ts

export interface INotification {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    paymentReference: string;
    orderId: string
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotificationCreate {
    userId: number;
    type: NotificationType;
    title: string;
    paymentReference: string;
    orderId: string
    message: string;
    data?: Record<string, any>;
    isRead?: boolean;
}

export interface INotificationUpdate {
    isRead?: boolean;
    title?: string;
    message?: string;
    data?: Record<string, any>;
}

export type NotificationType =
    | 'payment_success'
    | 'payment_failed'
    | 'payment_cancelled'
    | 'order_created'
    | 'order_shipped'
    | 'order_delivered'
    | 'order_cancelled'
    | "design_update"
    | 'general'
    | 'system';


    

export interface INotificationFilters {
    userId?: number;
    type?: NotificationType;
    isRead?: boolean;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface INotificationStats {
    totalCount: number;
    unreadCount: number;
    readCount: number;
    typeBreakdown: Record<NotificationType, number>;
}