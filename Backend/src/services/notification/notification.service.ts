import { Service } from "typedi";
import { NotificationRepository } from "@/repositories/notification/notification.repository";
import { 
    INotification, 
    INotificationCreate, 
    INotificationUpdate, 
    INotificationFilters,
    INotificationStats,
    NotificationType 
} from "@/types/notification/notification.types";
import { HttpException } from "@/exceptions/HttpException";
import { NOTIFICATION_SERVICE_TOKEN, INotificationService } from "@/interfaces/notification/notification.service.interface";

@Service({ id: NOTIFICATION_SERVICE_TOKEN })
export class NotificationService implements INotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository
    ) {}

    public async createNotification(data: INotificationCreate): Promise<INotification> {
        try {
            console.log(`📢 Creating notification for user ${data.userId}: ${data.title}`);
            
            if (!data.userId || !data.type || !data.title || !data.message || !data.paymentReference || !data.orderId) {
                throw new HttpException(400, "Missing required notification fields");
            }

            const notification = await this.notificationRepository.createNotification(data);
            
            console.log(`✅ Notification created successfully: ${notification.id}`);
            
            return notification;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create notification: ${error.message}`);
        }
    }

    public async getUserNotifications(
        userId: number, 
        filters: INotificationFilters = {}
    ): Promise<{ notifications: INotification[]; total: number }> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`📋 Getting notifications for user ${userId}`);
            return await this.notificationRepository.findByUserId(userId, filters);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get user notifications: ${error.message}`);
        }
    }

    public async getUnreadNotifications(userId: number): Promise<INotification[]> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`📬 Getting unread notifications for user ${userId}`);
            return await this.notificationRepository.findUnreadByUserId(userId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get unread notifications: ${error.message}`);
        }
    }

    public async getNotificationById(id: number, userId?: number): Promise<INotification | null> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid notification ID is required");
            }

            const notification = await this.notificationRepository.findById(id);
            
            if (notification && userId && notification.userId !== userId) {
                throw new HttpException(403, "Access denied to this notification");
            }
            
            return notification;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get notification: ${error.message}`);
        }
    }

    public async markNotificationAsRead(id: number, userId: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid notification ID is required");
            }

            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`👁️ Marking notification ${id} as read for user ${userId}`);
            const success = await this.notificationRepository.markAsRead(id, userId);
            
            if (!success) {
                throw new HttpException(404, "Notification not found or access denied");
            }
            
            return success;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to mark notification as read: ${error.message}`);
        }
    }

    public async markAllNotificationsAsRead(userId: number): Promise<number> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`👁️ Marking all notifications as read for user ${userId}`);
            return await this.notificationRepository.markAllAsRead(userId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to mark all notifications as read: ${error.message}`);
        }
    }

    public async updateNotification(
        id: number, 
        userId: number, 
        data: INotificationUpdate
    ): Promise<INotification | null> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid notification ID is required");
            }

            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`✏️ Updating notification ${id} for user ${userId}`);
            const updatedNotification = await this.notificationRepository.updateNotification(id, userId, data);
            
            if (!updatedNotification) {
                throw new HttpException(404, "Notification not found or access denied");
            }
            
            return updatedNotification;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to update notification: ${error.message}`);
        }
    }

    public async deleteNotification(id: number, userId: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid notification ID is required");
            }

            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`🗑️ Deleting notification ${id} for user ${userId}`);
            const success = await this.notificationRepository.deleteNotification(id, userId);
            
            if (!success) {
                throw new HttpException(404, "Notification not found or access denied");
            }
            
            return success;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to delete notification: ${error.message}`);
        }
    }

    public async getNotificationStats(userId: number): Promise<INotificationStats> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            console.log(`📊 Getting notification stats for user ${userId}`);
            return await this.notificationRepository.getNotificationStats(userId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get notification stats: ${error.message}`);
        }
    }

    public async createPaymentSuccessNotification(
        userId: number, 
        orderId: number, 
        amount: number, 
        paymentReference: string
    ): Promise<INotification> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            if (!orderId || orderId <= 0) {
                throw new HttpException(400, "Valid order ID is required");
            }

            if (amount < 0) {
                throw new HttpException(400, "Amount cannot be negative");
            }

            if (!paymentReference || paymentReference.trim().length === 0) {
                throw new HttpException(400, "Valid payment reference is required");
            }

            return this.createNotification({
                userId,
                type: 'payment_success',
                title: 'Payment Successful',
                message: `Your payment of R${amount.toFixed(2)} has been processed successfully. Order #${orderId} has been created.`,
                paymentReference,
                orderId: orderId.toString(),
                data: {
                    orderId,
                    paymentReference,
                    amount,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create payment success notification: ${error.message}`);
        }
    }

    public async createPaymentFailedNotification(
        userId: number, 
        amount: number, 
        paymentReference: string,
        reason?: string
    ): Promise<INotification> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            if (amount < 0) {
                throw new HttpException(400, "Amount cannot be negative");
            }

            if (!paymentReference || paymentReference.trim().length === 0) {
                throw new HttpException(400, "Valid payment reference is required");
            }

            const reasonText = reason ? ` Reason: ${reason}` : '';
            
            return this.createNotification({
                userId,
                type: 'payment_failed',
                title: 'Payment Failed',
                message: `Your payment of R${amount.toFixed(2)} could not be processed.${reasonText} Please try again or contact support if the problem persists.`,
                paymentReference,
                orderId: '', // No order created for failed payments
                data: {
                    paymentReference,
                    amount,
                    reason,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create payment failed notification: ${error.message}`);
        }
    }

    public async createOrderStatusNotification(
        userId: number,
        orderId: number,
        status: string,
        paymentReference?: string,
        customMessage?: string
    ): Promise<INotification> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            if (!orderId || orderId <= 0) {
                throw new HttpException(400, "Valid order ID is required");
            }

            if (!status || status.trim().length === 0) {
                throw new HttpException(400, "Valid status is required");
            }

            let title: string;
            let message: string;
            let type: NotificationType;

            switch (status.toLowerCase()) {
                case 'shipped':
                    title = 'Order Shipped';
                    message = customMessage || `Your order #${orderId} has been shipped and is on its way to you.`;
                    type = 'order_shipped';
                    break;
                case 'delivered':
                    title = 'Order Delivered';
                    message = customMessage || `Your order #${orderId} has been delivered. Thank you for your purchase!`;
                    type = 'order_delivered';
                    break;
                case 'cancelled':
                    title = 'Order Cancelled';
                    message = customMessage || `Your order #${orderId} has been cancelled. If you have any questions, please contact support.`;
                    type = 'order_cancelled';
                    break;
                default:
                    title = 'Order Update';
                    message = customMessage || `Your order #${orderId} status has been updated to: ${status}`;
                    type = 'order_created';
            }

            return this.createNotification({
                userId,
                type,
                title,
                message,
                paymentReference: paymentReference || '',
                orderId: orderId.toString(),
                data: {
                    orderId,
                    status,
                    paymentReference,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create order status notification: ${error.message}`);
        }
    }

    public async createGeneralNotification(
        userId: number,
        title: string,
        message: string,
        paymentReference?: string,
        orderId?: string,
        data?: Record<string, any>
    ): Promise<INotification> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            if (!title || title.trim().length === 0) {
                throw new HttpException(400, "Valid title is required");
            }

            if (!message || message.trim().length === 0) {
                throw new HttpException(400, "Valid message is required");
            }

            return this.createNotification({
                userId,
                type: 'general',
                title,
                message,
                paymentReference: paymentReference || '',
                orderId: orderId || '',
                data
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create general notification: ${error.message}`);
        }
    }

    public async createSystemNotification(
        userId: number,
        title: string,
        message: string,
        paymentReference?: string,
        orderId?: string,
        data?: Record<string, any>
    ): Promise<INotification> {
        try {
            if (!userId || userId <= 0) {
                throw new HttpException(400, "Valid user ID is required");
            }

            if (!title || title.trim().length === 0) {
                throw new HttpException(400, "Valid title is required");
            }

            if (!message || message.trim().length === 0) {
                throw new HttpException(400, "Valid message is required");
            }

            return this.createNotification({
                userId,
                type: 'system',
                title,
                message,
                paymentReference: paymentReference || '',
                orderId: orderId || '',
                data
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create system notification: ${error.message}`);
        }
    }

    public async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
        try {
            if (daysOld <= 0) {
                throw new HttpException(400, "Days old must be greater than 0");
            }

            console.log(`🧹 Cleaning up notifications older than ${daysOld} days`);
            return await this.notificationRepository.deleteOldNotifications(daysOld);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to cleanup old notifications: ${error.message}`);
        }
    }

    public async getNotificationsByType(
        type: NotificationType,
        limit: number = 100,
        offset: number = 0
    ): Promise<INotification[]> {
        try {
            if (!type || type.trim().length === 0) {
                throw new HttpException(400, "Valid notification type is required");
            }

            if (limit <= 0 || limit > 1000) {
                throw new HttpException(400, "Limit must be between 1 and 1000");
            }

            if (offset < 0) {
                throw new HttpException(400, "Offset cannot be negative");
            }

            console.log(`📋 Getting notifications by type: ${type}`);
            return await this.notificationRepository.findByType(type, limit, offset);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get notifications by type: ${error.message}`);
        }
    }

    public async getNotificationsByPaymentReference(paymentReference: string): Promise<INotification[]> {
        try {
            if (!paymentReference || paymentReference.trim().length === 0) {
                throw new HttpException(400, "Valid payment reference is required");
            }

            console.log(`🔍 Getting notifications by payment reference: ${paymentReference}`);
            return await this.notificationRepository.findByPaymentReference(paymentReference);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get notifications by payment reference: ${error.message}`);
        }
    }

    public async getNotificationsByOrderId(orderId: string): Promise<INotification[]> {
        try {
            if (!orderId || orderId.trim().length === 0) {
                throw new HttpException(400, "Valid order ID is required");
            }

            console.log(`🔍 Getting notifications by order ID: ${orderId}`);
            return await this.notificationRepository.findByOrderId(orderId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get notifications by order ID: ${error.message}`);
        }
    }
}