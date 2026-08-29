import { Service } from "typedi";
import Notification from "@/models/notification/notification.model";
import { 
    INotification, 
    INotificationCreate, 
    INotificationUpdate, 
    INotificationFilters,
    INotificationStats,
    NotificationType 
} from "@/types/notification/notification.types";
import { HttpException } from "@/exceptions/HttpException";
import { Op } from "sequelize";
import { INotificationRepository } from "@/interfaces/notification/notification.repository.interface";

@Service()
export class NotificationRepository implements INotificationRepository {

    public async createNotification(data: INotificationCreate): Promise<INotification> {
        try {
            const notification = await Notification.create({
                ...data,
                isRead: data.isRead || false
            });
            
            console.log(`✅ Notification created: ${notification.id} for user ${notification.userId}`);
            return notification.toJSON() as INotification;
        } catch (error: any) {
            console.error("❌ Error creating notification:", error);
            throw new HttpException(500, `Failed to create notification: ${error.message}`);
        }
    }

    public async findById(id: number): Promise<INotification | null> {
        try {
            const notification = await Notification.findByPk(id);
            return notification ? notification.toJSON() as INotification : null;
        } catch (error: any) {
            console.error(`❌ Error finding notification by ID ${id}:`, error);
            throw new HttpException(500, `Failed to find notification: ${error.message}`);
        }
    }

    public async findByUserId(
        userId: number, 
        filters: INotificationFilters = {}
    ): Promise<{ notifications: INotification[]; total: number }> {
        try {
            const where: any = { userId };

            if (filters.type) {
                where.type = filters.type;
            }

            if (filters.isRead !== undefined) {
                where.isRead = filters.isRead;
            }

            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate) {
                    where.createdAt[Op.gte] = filters.startDate;
                }
                if (filters.endDate) {
                    where.createdAt[Op.lte] = filters.endDate;
                }
            }

            const { count, rows } = await Notification.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: filters.limit || 20,
                offset: filters.offset || 0
            });

            return {
                notifications: rows.map(row => row.toJSON() as INotification),
                total: count
            };
        } catch (error: any) {
            console.error(`❌ Error finding notifications for user ${userId}:`, error);
            throw new HttpException(500, `Failed to find notifications: ${error.message}`);
        }
    }

    public async findUnreadByUserId(userId: number): Promise<INotification[]> {
        try {
            const notifications = await Notification.findAll({
                where: { 
                    userId,
                    isRead: false 
                },
                order: [['createdAt', 'DESC']]
            });

            return notifications.map(notification => notification.toJSON() as INotification);
        } catch (error: any) {
            console.error(`❌ Error finding unread notifications for user ${userId}:`, error);
            throw new HttpException(500, `Failed to find unread notifications: ${error.message}`);
        }
    }

    public async updateNotification(id: number, userId: number, data: INotificationUpdate): Promise<INotification | null> {
        const transaction = await Notification.sequelize!.transaction();

        try {
            const notification = await Notification.findOne({
                where: { 
                    id,
                    userId 
                },
                transaction
            });

            if (!notification) {
                await transaction.rollback();
                return null;
            }

            await notification.update(data, { transaction });
            await transaction.commit();

            console.log(`✅ Notification updated: ${id}`);
            return notification.toJSON() as INotification;
        } catch (error: any) {
            await transaction.rollback();
            console.error(`❌ Error updating notification ${id}:`, error);
            throw new HttpException(500, `Failed to update notification: ${error.message}`);
        }
    }

    public async markAsRead(id: number, userId: number): Promise<boolean> {
        try {
            const [updatedCount] = await Notification.update(
                { isRead: true },
                { 
                    where: { 
                        id,
                        userId 
                    } 
                }
            );

            const success = updatedCount > 0;
            
            if (success) {
                console.log(`✅ Notification ${id} marked as read`);
            }
            
            return success;
        } catch (error: any) {
            console.error(`❌ Error marking notification ${id} as read:`, error);
            throw new HttpException(500, `Failed to mark notification as read: ${error.message}`);
        }
    }

    public async markAllAsRead(userId: number): Promise<number> {
        try {
            const [updatedCount] = await Notification.update(
                { isRead: true },
                { 
                    where: { 
                        userId,
                        isRead: false 
                    } 
                }
            );

            console.log(`✅ Marked ${updatedCount} notifications as read for user ${userId}`);
            return updatedCount;
        } catch (error: any) {
            console.error(`❌ Error marking all notifications as read for user ${userId}:`, error);
            throw new HttpException(500, `Failed to mark all notifications as read: ${error.message}`);
        }
    }

    public async deleteNotification(id: number, userId: number): Promise<boolean> {
        try {
            const deletedCount = await Notification.destroy({
                where: {
                    id,
                    userId
                }
            });

            const success = deletedCount > 0;
            if (success) {
                console.log(`✅ Notification ${id} deleted`);
            }

            return success;
        } catch (error: any) {
            console.error(`❌ Error deleting notification ${id}:`, error);
            throw new HttpException(500, `Failed to delete notification: ${error.message}`);
        }
    }

    public async getNotificationStats(userId: number): Promise<INotificationStats> {
        try {
            const totalCount = await Notification.count({
                where: { userId }
            });

            const unreadCount = await Notification.count({
                where: {
                    userId,
                    isRead: false
                }
            });

            const readCount = totalCount - unreadCount;

            const typeBreakdown = await Notification.findAll({
                where: { userId },
                attributes: [
                    'type',
                    [Notification.sequelize!.fn('COUNT', Notification.sequelize!.col('type')), 'count']
                ],
                group: ['type'],
                raw: true
            }) as any[];

            const typeBreakdownMap: Record<NotificationType, number> = {
                payment_success: 0,
                payment_failed: 0,
                payment_cancelled: 0,
                order_created: 0,
                order_shipped: 0,
                order_delivered: 0,
                order_cancelled: 0,
                general: 0,
                system: 0
            };

            typeBreakdown.forEach(item => {
                typeBreakdownMap[item.type as NotificationType] = parseInt(item.count);
            });

            return {
                totalCount,
                unreadCount,
                readCount,
                typeBreakdown: typeBreakdownMap
            };
        } catch (error: any) {
            console.error(`❌ Error getting notification stats for user ${userId}:`, error);
            throw new HttpException(500, `Failed to get notification stats: ${error.message}`);
        }
    }

    public async deleteOldNotifications(daysOld: number = 90): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const deletedCount = await Notification.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: cutoffDate
                    }
                }
            });

            console.log(`🧹 Deleted ${deletedCount} old notifications (older than ${daysOld} days)`);
            return deletedCount;
        } catch (error: any) {
            console.error("❌ Error deleting old notifications:", error);
            throw new HttpException(500, `Failed to delete old notifications: ${error.message}`);
        }
    }

    public async findByType(
        type: NotificationType, 
        limit: number = 100,
        offset: number = 0
    ): Promise<INotification[]> {
        try {
            const notifications = await Notification.findAll({
                where: { type },
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            return notifications.map(notification => notification.toJSON() as INotification);
        } catch (error: any) {
            console.error(`❌ Error finding notifications by type ${type}:`, error);
            throw new HttpException(500, `Failed to find notifications by type: ${error.message}`);
        }
    }

    public async findByPaymentReference(paymentReference: string): Promise<INotification[]> {
        try {
            const notifications = await Notification.findAll({
                where: { paymentReference },
                order: [['createdAt', 'DESC']]
            });

            return notifications.map(notification => notification.toJSON() as INotification);
        } catch (error: any) {
            console.error(`❌ Error finding notifications by payment reference ${paymentReference}:`, error);
            throw new HttpException(500, `Failed to find notifications by payment reference: ${error.message}`);
        }
    }

    public async findByOrderId(orderId: string): Promise<INotification[]> {
        try {
            const notifications = await Notification.findAll({
                where: { orderId },
                order: [['createdAt', 'DESC']]
            });

            return notifications.map(notification => notification.toJSON() as INotification);
        } catch (error: any) {
            console.error(`❌ Error finding notifications by order ID ${orderId}:`, error);
            throw new HttpException(500, `Failed to find notifications by order ID: ${error.message}`);
        }
    }
}