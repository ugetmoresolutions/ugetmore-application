// repositories/payment/notification.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import PFNotification, { IPFNotificationCreate, IPFNotificationSummary } from "@/models/notification/payfast.notification.model";

@Service()
export class PFNotificationRepository {

  /**
   * Create a new PayFast notification record
   */
  public async createNotification(notificationData: IPFNotificationCreate): Promise<IPFNotificationSummary> {
    try {
      console.log(`💾 Saving PayFast notification for PF Payment ID: ${notificationData.pfPaymentId}`);
      
      const notification = await PFNotification.create(notificationData);
      
      console.log(`✅ PayFast notification saved: ID ${notification.id}, PF Payment ID ${notification.pfPaymentId}`);
      return notification.toJSON();
    } catch (error) {
      console.error('❌ Error creating PayFast notification:', error);
      throw new HttpException(500, `Failed to create PayFast notification: ${error.message}`);
    }
  }

  /**
   * Find notification by PayFast payment ID
   */
  public async findByPfPaymentId(pfPaymentId: number): Promise<IPFNotificationSummary | null> {
    try {
      console.log(`🔍 Looking for notification with PF Payment ID: ${pfPaymentId}`);
      
      const notification = await PFNotification.findOne({
        where: { pfPaymentId }
      });
      
      if (notification) {
        console.log(`✅ Found notification for PF Payment ID: ${pfPaymentId}`);
        return notification.toJSON();
      } else {
        console.log(`ℹ️ No notification found for PF Payment ID: ${pfPaymentId}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error finding notification by PF Payment ID:', error);
      throw new HttpException(500, `Failed to find notification: ${error.message}`);
    }
  }

  /**
   * Find notification by payment reference (m_payment_id)
   */
  public async findByPaymentReference(paymentReference: string): Promise<IPFNotificationSummary | null> {
    try {
      console.log(`🔍 Looking for notification with payment reference: ${paymentReference}`);
      
      const notification = await PFNotification.findOne({
        where: { paymentReference }
      });
      
      if (notification) {
        console.log(`✅ Found notification for payment reference: ${paymentReference}`);
        console.log(`📋 Notification details:`, {
          id: notification.id,
          pfPaymentId: notification.pfPaymentId,
          paymentStatus: notification.paymentStatus,
          amountGross: notification.amountGross,
          createdAt: notification.createdAt
        });
        return notification.toJSON();
      } else {
        console.log(`ℹ️ No notification found for payment reference: ${paymentReference}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error finding notification by payment reference:', error);
      throw new HttpException(500, `Failed to find notification: ${error.message}`);
    }
  }

  /**
   * Find the most recent notification by payment reference
   */
  public async findLatestByPaymentReference(paymentReference: string): Promise<IPFNotificationSummary | null> {
    try {
      console.log(`🔍 Looking for latest notification with payment reference: ${paymentReference}`);
      
      const notification = await PFNotification.findOne({
        where: { paymentReference },
        order: [['createdAt', 'DESC']]
      });
      
      if (notification) {
        console.log(`✅ Found latest notification for payment reference: ${paymentReference}`);
        return notification.toJSON();
      } else {
        console.log(`ℹ️ No notification found for payment reference: ${paymentReference}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error finding latest notification by payment reference:', error);
      throw new HttpException(500, `Failed to find notification: ${error.message}`);
    }
  }

  /**
   * Find notifications by merchant ID
   */
  public async findByMerchantId(merchantId: number): Promise<IPFNotificationSummary[]> {
    try {
      console.log(`🔍 Looking for notifications for merchant: ${merchantId}`);
      
      const notifications = await PFNotification.findAll({
        where: { merchantId },
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Found ${notifications.length} notifications for merchant: ${merchantId}`);
      return notifications.map(notification => notification.toJSON());
    } catch (error) {
      console.error('❌ Error finding notifications by merchant ID:', error);
      throw new HttpException(500, `Failed to find notifications: ${error.message}`);
    }
  }

  /**
   * Find all notifications with pagination
   */
  public async findAllWithPagination(
    page: number = 1, 
    limit: number = 50
  ): Promise<{ 
    notifications: IPFNotificationSummary[], 
    total: number, 
    totalPages: number 
  }> {
    try {
      const offset = (page - 1) * limit;
      
      console.log(`🔍 Fetching notifications - Page: ${page}, Limit: ${limit}`);
      
      const { count, rows } = await PFNotification.findAndCountAll({
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      });

      console.log(`✅ Found ${count} total notifications, returning ${rows.length} for page ${page}`);

      return {
        notifications: rows.map(notification => notification.toJSON()),
        total: count,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('❌ Error finding notifications with pagination:', error);
      throw new HttpException(500, `Failed to find notifications: ${error.message}`);
    }
  }

  /**
   * Check if notification already exists (duplicate detection)
   */
  public async notificationExists(pfPaymentId: number, signature: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking for duplicate notification - PF Payment ID: ${pfPaymentId}, Signature: ${signature ? '***' + signature.slice(-4) : 'none'}`);
      
      const notification = await PFNotification.findOne({
        where: { 
          pfPaymentId,
          signature 
        }
      });
      
      const exists = !!notification;
      
      if (exists) {
        console.log(`⚠️ Duplicate notification detected for PF Payment ID: ${pfPaymentId}`);
        console.log(`📋 Existing notification details:`, {
          id: notification.id,
          paymentReference: notification.paymentReference,
          paymentStatus: notification.paymentStatus,
          createdAt: notification.createdAt
        });
      } else {
        console.log(`✅ No duplicate found for PF Payment ID: ${pfPaymentId}`);
      }
      
      return exists;
    } catch (error) {
      console.error('❌ Error checking if notification exists:', error);
      return false;
    }
  }

  public async getTotalAmount(): Promise<{
  totalGrossAmount: number;
  totalNetAmount: number;
  totalFeeAmount: number;
  completedGrossAmount: number;
  completedNetAmount: number;
  notificationCount: number;
}> {
  try {
    console.log(`💰 Calculating total amounts for all notifications`);
    
    // Get all notifications
    const notifications = await PFNotification.findAll({
      attributes: ['paymentStatus', 'amountGross', 'amountNet', 'amountFee']
    });

    // Calculate totals
    const totals = notifications.reduce((acc, notification) => {
      const gross = Number(notification.amountGross) || 0;
      const net = Number(notification.amountNet) || 0;
      const fee = Number(notification.amountFee) || 0;
      const isCompleted = notification.paymentStatus?.toUpperCase() === 'COMPLETE';

      acc.totalGrossAmount += gross;
      acc.totalNetAmount += net;
      acc.totalFeeAmount += fee;
      
      if (isCompleted) {
        acc.completedGrossAmount += gross;
        acc.completedNetAmount += net;
      }
      
      return acc;
    }, {
      totalGrossAmount: 0,
      totalNetAmount: 0,
      totalFeeAmount: 0,
      completedGrossAmount: 0,
      completedNetAmount: 0
    });

    const result = {
      ...totals,
      notificationCount: notifications.length
    };

    console.log(`💰 Total amount calculation completed:`, {
      totalGross: result.totalGrossAmount.toFixed(2),
      totalNet: result.totalNetAmount.toFixed(2),
      totalFees: result.totalFeeAmount.toFixed(2),
      completedGross: result.completedGrossAmount.toFixed(2),
      completedNet: result.completedNetAmount.toFixed(2),
      count: result.notificationCount
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error calculating total amounts:', error);
    throw new HttpException(500, `Failed to calculate total amounts: ${error.message}`);
  }
}


  /**
   * Find notifications by payment status
   */
  public async findByPaymentStatus(paymentStatus: string): Promise<IPFNotificationSummary[]> {
    try {
      console.log(`🔍 Looking for notifications with status: ${paymentStatus}`);
      
      const notifications = await PFNotification.findAll({
        where: { paymentStatus },
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Found ${notifications.length} notifications with status: ${paymentStatus}`);
      return notifications.map(notification => notification.toJSON());
    } catch (error) {
      console.error('❌ Error finding notifications by payment status:', error);
      throw new HttpException(500, `Failed to find notifications: ${error.message}`);
    }
  }

  /**
   * Check if payment is successful by payment reference
   */
  public async isPaymentSuccessfulByReference(paymentReference: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking if payment is successful: ${paymentReference}`);
      
      const notification = await this.findByPaymentReference(paymentReference);
      
      if (!notification) {
        console.log(`ℹ️ No notification found for payment reference: ${paymentReference}`);
        return false;
      }

      const successStatuses = ['COMPLETE', 'COMPLETED', 'SUCCESS', 'PAID'];
      const isSuccessful = successStatuses.includes(notification.paymentStatus?.toUpperCase() || '');
      
      console.log(`📊 Payment ${paymentReference} status: ${notification.paymentStatus} - Successful: ${isSuccessful}`);
      
      return isSuccessful;
    } catch (error) {
      console.error('❌ Error checking if payment successful by reference:', error);
      return false;
    }
  }

  /**
   * Get all notifications for a payment reference
   */
  public async findAllByPaymentReference(paymentReference: string): Promise<IPFNotificationSummary[]> {
    try {
      console.log(`🔍 Looking for all notifications with payment reference: ${paymentReference}`);
      
      const notifications = await PFNotification.findAll({
        where: { paymentReference },
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Found ${notifications.length} notifications for payment reference: ${paymentReference}`);
      return notifications.map(notification => notification.toJSON());
    } catch (error) {
      console.error('❌ Error finding all notifications by payment reference:', error);
      throw new HttpException(500, `Failed to find notifications: ${error.message}`);
    }
  }

  /**
   * Get payment verification details for frontend
   */
  public async getPaymentVerificationDetails(paymentReference: string): Promise<{
    exists: boolean;
    verified: boolean;
    status?: string;
    amount?: number;
    pfPaymentId?: number;
    createdAt?: Date;
  }> {
    try {
      const notification = await this.findByPaymentReference(paymentReference);
      
      if (!notification) {
        return {
          exists: false,
          verified: false
        };
      }

      const successStatuses = ['COMPLETE', 'COMPLETED', 'SUCCESS', 'PAID'];
      const isVerified = successStatuses.includes(notification.paymentStatus?.toUpperCase() || '');

      return {
        exists: true,
        verified: isVerified,
        status: notification.paymentStatus,
        amount: notification.amountGross || 0,
        pfPaymentId: notification.pfPaymentId,
        createdAt: notification.createdAt
      };
    } catch (error) {
      console.error('❌ Error getting payment verification details:', error);
      return {
        exists: false,
        verified: false
      };
    }
  }

  /**
   * Get notification statistics
   */
  public async getNotificationStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    today: number;
  }> {
    try {
      console.log(`📊 Calculating notification statistics`);
      
      const [
        total,
        completed,
        failed, 
        pending,
        today
      ] = await Promise.all([
        PFNotification.count(),
        PFNotification.count({ where: { paymentStatus: 'COMPLETE' } }),
        PFNotification.count({ where: { paymentStatus: 'FAILED' } }),
        PFNotification.count({ where: { paymentStatus: 'PENDING' } }),
        PFNotification.count({
          where: {
            createdAt: {
              [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      const stats = { total, completed, failed, pending, today };
      console.log(`📊 Notification stats:`, stats);
      
      return stats;
    } catch (error) {
      console.error('❌ Error calculating notification stats:', error);
      throw new HttpException(500, `Failed to calculate stats: ${error.message}`);
    }
  }
}