import { INotification, NotificationType } from "@/types/notification/notification.types";
import { Model, DataTypes, Sequelize } from "sequelize";
import Order from "../order/order.model";

class Notification extends Model<INotification> implements INotification {
    public id!: number;
    public userId!: number;
    public type!: NotificationType;
    public title!: string;
    public message!: string;
    public data?: Record<string, any>;
    public paymentReference!: string;
    public orderId!: string;
    public isRead!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Notification.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id"
                    }
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                paymentReference: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                orderId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                     references: {
                        model: Order,
                        key: "id"
                    }
                },
                data: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    get() {
                        const rawValue = this.getDataValue('data') as any;
                        return rawValue ? JSON.parse(rawValue) : null;
                    },
                    set(value: Record<string, any> | null) {
                        this.setDataValue('data', value ? JSON.stringify(value) : null as any);
                    }
                },
                isRead: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                }
            },
            {
                sequelize,
                modelName: "Notification",
                tableName: "notifications",
                timestamps: true,
                indexes: [
                    {
                        fields: ['userId']
                    },
                    {
                        fields: ['userId', 'isRead']
                    },
                    {
                        fields: ['type']
                    },
                    {
                        fields: ['paymentReference']
                    },
                    {
                        fields: ['orderId']
                    },
                    {
                        fields: ['createdAt']
                    }
                ]
            }
        );
    }

    static async findByUserId(userId: number, limit: number = 20, offset: number = 0) {
        return this.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
    }

    static async findUnreadByUserId(userId: number) {
        return this.findAll({
            where: { 
                userId,
                isRead: false 
            },
            order: [['createdAt', 'DESC']]
        });
    }

    static async markAsRead(notificationId: number, userId: number) {
        return this.update(
            { isRead: true },
            { 
                where: { 
                    id: notificationId,
                    userId 
                } 
            }
        );
    }

    static async markAllAsRead(userId: number) {
        return this.update(
            { isRead: true },
            { 
                where: { 
                    userId,
                    isRead: false 
                } 
            }
        );
    }

    static async getUnreadCount(userId: number): Promise<number> {
        return this.count({
            where: {
                userId,
                isRead: false
            }
        });
    }

    static async findByPaymentReference(paymentReference: string) {
        return this.findAll({
            where: { paymentReference },
            order: [['createdAt', 'DESC']]
        });
    }

    static async findByOrderId(orderId: string) {
        return this.findAll({
            where: { orderId },
            order: [['createdAt', 'DESC']]
        });
    }
}

export default Notification;