// services/order/orderNotification.service.ts
import { Service, Inject } from "typedi";
import { 
  INotificationService, 
  NOTIFICATION_SERVICE_TOKEN 
} from "@/interfaces/notification/notification.service.interface";
import { OrderStatus } from "@/types/order/order.types";
import { NotificationType } from "@/types/notification/notification.types";
import { IOrderNotificationService, ORDER_NOTIFICATION_SERVICE_TOKEN } from "@/interfaces/order/order.noification.service.interface";
import { AuthRepository } from "@/repositories/auth/auth.repository";

@Service({ id: ORDER_NOTIFICATION_SERVICE_TOKEN })
export class OrderNotificationService implements IOrderNotificationService {
  constructor(
    @Inject(NOTIFICATION_SERVICE_TOKEN) 
    private notificationService: INotificationService,
    private authRepository: AuthRepository
  ) {}


   /**
   * Get all admin users
   */
  private async getAdminUsers(): Promise<number[]> {
    try {
      const admins = await this.authRepository.findUsersByRole('admin');
      return admins.map(admin => admin.id);
    } catch (error) {
      console.error('❌ Failed to get admin users:', error);
      return [];
    }
  }

  /**
   * Send notification to all admins
   */
  private async notifyAdmins(
    title: string,
    message: string,
    type: NotificationType,
    data: any
  ): Promise<void> {
    try {
      const adminIds = await this.getAdminUsers();
      
      // Send notification to each admin
      for (const adminId of adminIds) {
        await this.notificationService.createNotification({
          userId: adminId,
          type,
          title,
          message,
          orderId: data.orderId?.toString(),
          paymentReference: 'admin-notification',
          isRead: false,
          data
        });
      }
      
      console.log(`✅ Admin notification sent to ${adminIds.length} admins`);
    } catch (error) {
      console.error('❌ Failed to send admin notifications:', error);
    }
  }


   /**
   * Create notification when mockup is added (for admins)
   */
  public async createAdminMockupAddedNotification(
    orderId: number,
    itemId: string,
    adminId?: number,
    adminName?: string
  ): Promise<void> {
    try {
      const adminText = adminName ? ` by ${adminName}` : ' by a team member';
      
      await this.notifyAdmins(
        'Mockup Added to Order',
        `A mockup has been added${adminText} for order #${orderId}.`,
        'design_update',
        {
          orderId,
          itemId,
          adminId,
          adminName,
          timestamp: new Date().toISOString(),
          action: 'mockup_added_admin'
        }
      );

      console.log(`✅ Admin mockup added notification created for order #${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to create admin mockup added notification:`, error);
    }
  }


   /**
   * Create notification when mockup status is updated by user (for admins)
   */
  public async createAdminMockupStatusNotification(
    orderId: number,
    itemId: string,
    isApproved: boolean,
    userId: number,
    notes?: string
  ): Promise<void> {
    try {
      const statusText = isApproved ? 'approved' : 'requested changes for';
      
      await this.notifyAdmins(
        'Mockup Feedback Received',
        `A customer has ${statusText} a mockup in order #${orderId}.`,
        'design_update',
        {
          orderId,
          itemId,
          userId,
          isApproved,
          notes,
          timestamp: new Date().toISOString(),
          action: 'mockup_feedback_received'
        }
      );

      console.log(`✅ Admin mockup status notification created for order #${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to create admin mockup status notification:`, error);
    }
  }

   /**
   * Create order status change notification for admins
   */
  public async createAdminOrderStatusNotification(
    orderId: number,
    status: OrderStatus,
    userId?: number,
    additionalInfo?: string
  ): Promise<void> {
    try {
      const { title, message, type } = this.getAdminNotificationContent(
        orderId,
        status,
        additionalInfo
      );

      await this.notifyAdmins(title, message, type, {
        orderId,
        status,
        userId,
        timestamp: new Date().toISOString(),
        additionalInfo,
        action: 'order_status_update'
      });

      console.log(`✅ Admin order status notification created for order #${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to create admin order notification:`, error);
    }
  }


  /**
 * Create payment success notification for admins
 */
public async createAdminPaymentSuccessNotification(
  orderId: number,
  amount: number,
  paymentReference: string,
  userId: number
): Promise<void> {
  try {
    await this.notifyAdmins(
      'New Payment Received',
      `A payment of R${amount.toFixed(2)} has been successfully processed for order #${orderId}.`,
      'payment_success',
      {
        orderId,
        amount,
        paymentReference,
        userId,
        timestamp: new Date().toISOString(),
        action: 'payment_received'
      }
    );

    console.log(`✅ Admin payment success notification created for order #${orderId}`);
  } catch (error) {
    console.error(`❌ Failed to create admin payment success notification:`, error);
  }
}


   /**
   * Get notification content for admins
   */
  private getAdminNotificationContent(
    orderId: number,
    status: OrderStatus,
    additionalInfo?: string
  ): { title: string; message: string; type: NotificationType } {
    const orderNumber = `#${orderId}`;
    
    switch (status) {
      case OrderStatus.PENDING:
        return {
          title: 'New Order Received',
          message: `Order ${orderNumber} is pending and requires processing. ${additionalInfo || ''}`,
          type: 'order_created'
        };
      
      case OrderStatus.CANCELLED:
        return {
          title: 'Order Cancelled',
          message: `Order ${orderNumber} has been cancelled. ${additionalInfo || 'Review for potential action.'}`,
          type: 'order_cancelled'
        };
      
      default:
        return {
          title: 'Order Status Updated',
          message: `Order ${orderNumber} status has been updated to: ${status}. ${additionalInfo || ''}`,
          type: 'general'
        };
    }
  }

  /**
   * Create order status change notification
   */
  public async createOrderStatusNotification(
    userId: number,
    orderId: number,
    status: OrderStatus,
    additionalInfo?: string
  ): Promise<void> {
    try {
      const { title, message, type } = this.getNotificationContent(
        orderId,
        status,
        additionalInfo
      );

      await this.notificationService.createNotification({
        userId,
        type,
        title,
        message,
        orderId: orderId.toString(),
        paymentReference: 'order-notification', // Empty for order notifications
        isRead: false,
        data: {
          orderId,
          status,
          timestamp: new Date().toISOString(),
          additionalInfo
        }
      });

      console.log(`✅ Order status notification created for order #${orderId}`);
    } catch (error) {
      console.error(`❌ Failed to create order notification:`, error);
      // Don't throw here - we don't want to break the order update flow
    }
  }

  /**
   * Get notification content based on order status
   */
  private getNotificationContent(
    orderId: number,
    status: OrderStatus,
    additionalInfo?: string
  ): { title: string; message: string; type: NotificationType } {
    const orderNumber = `#${orderId}`;
    
    switch (status) {
      case OrderStatus.PENDING:
        return {
          title: 'Order Created',
          message: `Your order ${orderNumber} has been created successfully. ${additionalInfo || ''}`,
          type: 'order_created'
        };
      
      case OrderStatus.SHIPPED:
        return {
          title: 'Order Shipped',
          message: `Your order ${orderNumber} has been shipped! ${additionalInfo || 'Tracking information will be available soon.'}`,
          type: 'order_shipped'
        };
      
      case OrderStatus.COMPLETED:
        return {
          title: 'Order Completed',
          message: `Your order ${orderNumber} has been completed. Thank you for shopping with us! ${additionalInfo || ''}`,
          type: 'order_delivered'
        };
      
      case OrderStatus.CANCELLED:
        return {
          title: 'Order Cancelled',
          message: `Your order ${orderNumber} has been cancelled. ${additionalInfo || 'Please contact support if this was a mistake.'}`,
          type: 'order_cancelled'
        };
      
      default:
        return {
          title: 'Order Updated',
          message: `Your order ${orderNumber} status has been updated to: ${status}. ${additionalInfo || ''}`,
          type: 'general'
        };
    }
  }


    /**
   * Create notification when mockup is added to an order item
   */
  public async createMockupAddedNotification(
    userId: number,
    orderId: number,
    itemId: string,
    adminName?: string
  ): Promise<void> {
    try {
      const adminText = adminName ? ` by ${adminName}` : '';
      
      await this.notificationService.createNotification({
        userId,
        type: 'design_update',
        title: 'Mockup Added to Your Order',
        message: `A new mockup has been added${adminText} for item in order #${orderId}. Please review and provide feedback.`,
        orderId: orderId.toString(),
        paymentReference: 'mockup-added',
        isRead: false,
        data: {
          orderId,
          itemId,
          action: 'mockup_added',
          adminName,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`✅ Mockup added notification created for order #${orderId}, item ${itemId}`);
    } catch (error) {
      console.error(`❌ Failed to create mockup added notification:`, error);
    }
  }

  /**
   * Create notification when mockup status is updated (approved/rejected)
   */
  public async createMockupStatusNotification(
    userId: number,
    orderId: number,
    itemId: string,
    isApproved: boolean,
    adminName?: string,
    notes?: string
  ): Promise<void> {
    try {
      const statusText = isApproved ? 'approved' : 'requires changes';
      const adminText = adminName ? ` by ${adminName}` : '';
      const notesText = notes ? ` Notes: ${notes}` : '';
      
      await this.notificationService.createNotification({
        userId,
        type: 'design_update',
        title: `Mockup ${isApproved ? 'Approved' : 'Needs Revision'}`,
        message: `Your mockup for order #${orderId} has been ${statusText}${adminText}.${notesText}`,
        orderId: orderId.toString(),
        paymentReference: 'mockup-added',
        isRead: false,
        data: {
          orderId,
          itemId,
          isApproved,
          action: 'mockup_status_update',
          adminName,
          notes,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`✅ Mockup status notification created for order #${orderId}, item ${itemId}`);
    } catch (error) {
      console.error(`❌ Failed to create mockup status notification:`, error);
    }
  }


}