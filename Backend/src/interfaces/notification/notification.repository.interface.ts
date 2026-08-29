import { 
    INotification, 
    INotificationCreate, 
    INotificationUpdate, 
    INotificationFilters,
    INotificationStats,
    NotificationType 
} from "@/types/notification/notification.types";

export interface INotificationRepository {
    /**
     * Create a new notification
     */
    createNotification(data: INotificationCreate): Promise<INotification>;

    /**
     * Find notification by ID
     */
    findById(id: number): Promise<INotification | null>;

    /**
     * Find notifications by user ID with filtering
     */
    findByUserId(
        userId: number, 
        filters?: INotificationFilters
    ): Promise<{ notifications: INotification[]; total: number }>;

    /**
     * Find unread notifications for a user
     */
    findUnreadByUserId(userId: number): Promise<INotification[]>;

    /**
     * Update notification
     */
    updateNotification(
        id: number, 
        userId: number, 
        data: INotificationUpdate
    ): Promise<INotification | null>;

    /**
     * Mark notification as read
     */
    markAsRead(id: number, userId: number): Promise<boolean>;

    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: number): Promise<number>;

    /**
     * Delete notification
     */
    deleteNotification(id: number, userId: number): Promise<boolean>;

    /**
     * Get notification statistics for a user
     */
    getNotificationStats(userId: number): Promise<INotificationStats>;

    /**
     * Delete old notifications (cleanup)
     */
    deleteOldNotifications(daysOld?: number): Promise<number>;

    /**
     * Find notifications by type
     */
    findByType(
        type: NotificationType, 
        limit?: number,
        offset?: number
    ): Promise<INotification[]>;
}