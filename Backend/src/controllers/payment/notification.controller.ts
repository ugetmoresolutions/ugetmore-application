// controllers/payment/notification.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import querystring from "querystring";
import { UNIFIED_PAYFAST_SERVICE_TOKEN } from "@/interfaces/payment/payment.service.interface";
import { PFNOTIFICATION_SERVICE_TOKEN } from "@/interfaces/notification/payment/notification.repository.interface";


export class PFNotificationController {
  private pfNotificationService;
  private unifiedPayFastService;

  constructor() {
    this.pfNotificationService = Container.get(PFNOTIFICATION_SERVICE_TOKEN);
    this.unifiedPayFastService = Container.get(UNIFIED_PAYFAST_SERVICE_TOKEN);
  }

  /**
   * Handle PayFast ITN with automatic order creation
   */
public handlePayFastITN = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`🔔 PayFast ITN received`);
    console.log(`📋 ITN Data:`, req.body);

    // Simple validation - just check if we have data
    if (!req.body || typeof req.body !== 'object') {
      console.log(`❌ Invalid ITN body`);
      return res.status(400).send('Bad Request');
    }

    // Check for required payment reference
    if (!req.body.m_payment_id) {
      console.log(`❌ Missing payment reference`);
      return res.status(400).send('Bad Request');
    }

    console.log(`✅ Processing payment: ${req.body.m_payment_id}`);

    // Process through the unified service
    const result = await this.unifiedPayFastService.handlePayFastITN(req.body);

    if (result.success) {
      console.log(`✅ ITN processed: ${result.message}`);
      return res.status(200).send('OK');
    } else {
      console.log(`❌ ITN failed: ${result.message}`);
      return res.status(200).send('OK'); // Still return 200 to PayFast to avoid retries
    }

  } catch (err) {
    console.error('❌ ITN error:', err);
    return res.status(200).send('OK'); // Always return 200 to PayFast
  }
};
  /**
   * Check payment status
   */
  public checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new HttpException(400, "Payment ID is required");
      }

      console.log(`🔍 Checking payment status for: ${paymentId}`);

      const paymentStatus = await this.unifiedPayFastService.checkPaymentStatus(paymentId);

      const response: CustomResponse<typeof paymentStatus> = {
        error: false,
        message: "Payment status retrieved successfully",
        data: paymentStatus,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error checking payment status:', err);
      next(err);
    }
  };

  /**
   * Verify payment and create order
   */
  public verifyAndCreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        paymentId,
        userId,
        cartId,
        address,
        deliveryOption
      } = req.body;

      if (!paymentId || !userId || !cartId || !address || !deliveryOption) {
        throw new HttpException(400, "Missing required fields: paymentId, userId, cartId, address, deliveryOption");
      }

      console.log(`🛒 Creating order from payment verification:`, {
        paymentId,
        userId,
        cartId,
        deliveryOption
      });

      const result = await this.unifiedPayFastService.verifyPaymentAndCreateOrder(
        paymentId,
        userId,
        cartId,
        address,
        deliveryOption
      );

      const statusCode = result.success ? 200 : 400;

      const response: CustomResponse<typeof result> = {
        error: !result.success,
        message: result.message,
        data: result,
      };
      
      res.status(statusCode).json(response);
    } catch (err) {
      console.error('💥 Error verifying payment and creating order:', err);
      next(err);
    }
  };

  /**
   * Generate payment URL from cart
   */
  public generatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        cartId,
        address,
        deliveryOption
      } = req.body;

      if (!userId || !cartId || !address || !deliveryOption) {
        throw new HttpException(400, "Missing required fields: userId, cartId, address, deliveryOption");
      }

      console.log(`🚀 Generating payment for user ${userId}, cart ${cartId}`);

      const result = await this.unifiedPayFastService.generatePaymentFromCart({
        userId,
        cartId,
        address,
        deliveryOption
      });

      const response: CustomResponse<typeof result> = {
        error: false,
        message: "Payment URL generated successfully",
        data: result,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error generating payment:', err);
      next(err);
    }
  };

  /**
   * Get notifications with pagination
   */
  public getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const result = await this.pfNotificationService.getAllNotifications(
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      const response: CustomResponse<typeof result> = {
        error: false,
        message: "Notifications retrieved successfully",
        data: result,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving notifications:', err);
      next(err);
    }
  };

  /**
   * Get notification by PayFast payment ID
   */
  public getNotificationByPfPaymentId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pfPaymentId } = req.params;
      
      if (!pfPaymentId || isNaN(Number(pfPaymentId))) {
        throw new HttpException(400, "Valid PayFast Payment ID is required");
      }
      
      const notification = await this.pfNotificationService.findByPfPaymentId(
        parseInt(pfPaymentId)
      );
      
      if (!notification) {
        throw new HttpException(404, "Notification not found");
      }
      
      const response: CustomResponse<typeof notification> = {
        error: false,
        message: "Notification found",
        data: notification,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving notification:', err);
      next(err);
    }
  };

  /**
   * Get notification by payment reference (m_payment_id)
   */
  public getNotificationByPaymentReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentReference } = req.params;
      
      if (!paymentReference) {
        throw new HttpException(400, "Payment reference is required");
      }
      
      const notification = await this.pfNotificationService.findByPaymentReference(paymentReference);
      
      if (!notification) {
        throw new HttpException(404, "Notification not found");
      }
      
      const response: CustomResponse<typeof notification> = {
        error: false,
        message: "Notification found",
        data: notification,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving notification by payment reference:', err);
      next(err);
    }
  };

  /**
   * Get notifications by merchant ID
   */
  public getNotificationsByMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { merchantId } = req.params;
      
      if (!merchantId || isNaN(Number(merchantId))) {
        throw new HttpException(400, "Valid Merchant ID is required");
      }
      
      const notifications = await this.pfNotificationService.findByMerchantId(
        parseInt(merchantId)
      );
      
      const response: CustomResponse<typeof notifications> = {
        error: false,
        message: `Found ${notifications.length} notifications for merchant ${merchantId}`,
        data: notifications,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving merchant notifications:', err);
      next(err);
    }
  };

  /**
   * Get notifications by payment status
   */
  public getNotificationsByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;
      
      if (!status) {
        throw new HttpException(400, "Payment status is required");
      }
      
      const notifications = await this.pfNotificationService.findByPaymentStatus(status);
      
      const response: CustomResponse<typeof notifications> = {
        error: false,
        message: `Found ${notifications.length} notifications with status: ${status}`,
        data: notifications,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving notifications by status:', err);
      next(err);
    }
  };

  /**
   * Get notification statistics
   */
  public getNotificationStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.pfNotificationService.getNotificationStats();
      
      const response: CustomResponse<typeof stats> = {
        error: false,
        message: "Notification statistics retrieved",
        data: stats,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error retrieving notification stats:', err);
      next(err);
    }
  };

  /**
   * Check if payment was successful
   */
  public checkPaymentSuccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pfPaymentId } = req.params;
      
      if (!pfPaymentId || isNaN(Number(pfPaymentId))) {
        throw new HttpException(400, "Valid PayFast Payment ID is required");
      }
      
      const isSuccessful = await this.pfNotificationService.isPaymentSuccessful(
        parseInt(pfPaymentId)
      );
      
      const response: CustomResponse<{ successful: boolean }> = {
        error: false,
        message: isSuccessful ? "Payment was successful" : "Payment was not successful",
        data: { successful: isSuccessful },
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error checking payment success:', err);
      next(err);
    }
  };

  /**
   * Check payment success by payment reference
   */
  public checkPaymentSuccessByReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentReference } = req.params;
      
      if (!paymentReference) {
        throw new HttpException(400, "Payment reference is required");
      }
      
      const isSuccessful = await this.pfNotificationService.isPaymentSuccessfulByReference(paymentReference);
      
      const response: CustomResponse<{ successful: boolean }> = {
        error: false,
        message: isSuccessful ? "Payment was successful" : "Payment was not successful",
        data: { successful: isSuccessful },
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error checking payment success by reference:', err);
      next(err);
    }
  };

  /**
   * Create manual notification (for testing/debugging)
   */
  public createManualNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        merchantId,
        pfPaymentId,
        paymentStatus,
        paymentReference,
        itemName,
        amountGross,
        amountFee,
        amountNet,
        emailAddress,
        signature
      } = req.body;

      if (!merchantId || !pfPaymentId || !paymentReference) {
        throw new HttpException(400, "Merchant ID, PayFast Payment ID, and Payment Reference are required");
      }

      const notification = await this.pfNotificationService.saveNotification({
        merchantId: parseInt(merchantId),
        pfPaymentId: parseInt(pfPaymentId),
        paymentStatus: paymentStatus || 'COMPLETE',
        paymentReference,
        itemName,
        amountGross: amountGross ? parseFloat(amountGross) : null,
        amountFee: amountFee ? parseFloat(amountFee) : null,
        amountNet: amountNet ? parseFloat(amountNet) : null,
        emailAddress,
        billingDate: new Date(),
        signature,
        rawItnData: JSON.stringify(req.body)
      });

      const response: CustomResponse<typeof notification> = {
        error: false,
        message: "Manual notification created successfully",
        data: notification,
      };
      
      res.status(201).json(response);
    } catch (err) {
      console.error('💥 Error creating manual notification:', err);
      next(err);
    }
  };

  /**
   * Get payment verification details for UI
   */
  public getPaymentVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        throw new HttpException(400, "Payment ID is required");
      }

      console.log(`🔍 Getting payment verification details for: ${paymentId}`);

      const verification = await this.pfNotificationService.getPaymentVerificationForUI(paymentId);

      const response: CustomResponse<typeof verification> = {
        error: false,
        message: "Payment verification details retrieved",
        data: verification,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error getting payment verification:', err);
      next(err);
    }
  };

  /**
   * Check if order can be created from payment
   */
  public canCreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        throw new HttpException(400, "Payment ID is required");
      }

      console.log(`🔍 Checking if order can be created for payment: ${paymentId}`);

      const canCreate = await this.pfNotificationService.canCreateOrder(paymentId);

      const response: CustomResponse<typeof canCreate> = {
        error: false,
        message: canCreate.canCreate ? "Order can be created" : canCreate.reason,
        data: canCreate,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error checking if order can be created:', err);
      next(err);
    }
  };

  /**
   * Manual payment verification (for debugging)
   */
  public manualVerifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new HttpException(400, "Payment ID is required");
      }

      console.log(`🔍 Manual payment verification for: ${paymentId}`);

      const paymentStatus = await this.pfNotificationService.getPaymentStatus(paymentId);

      const response: CustomResponse<typeof paymentStatus> = {
        error: false,
        message: "Manual payment verification completed",
        data: paymentStatus,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error in manual payment verification:', err);
      next(err);
    }
  };

  /**
   * Get comprehensive payment status
   */
  public getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        throw new HttpException(400, "Payment ID is required");
      }

      console.log(`🔍 Getting comprehensive payment status for: ${paymentId}`);

      const paymentStatus = await this.pfNotificationService.getPaymentStatus(paymentId);

      const response: CustomResponse<typeof paymentStatus> = {
        error: false,
        message: "Payment status retrieved",
        data: paymentStatus,
      };
      
      res.status(200).json(response);
    } catch (err) {
      console.error('💥 Error getting payment status:', err);
      next(err);
    }
  };
}