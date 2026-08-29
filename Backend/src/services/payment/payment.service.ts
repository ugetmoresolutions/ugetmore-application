import crypto from "crypto";
import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  INotificationService,
  NOTIFICATION_SERVICE_TOKEN,
} from "@/interfaces/notification/notification.service.interface";
import {
  IOrder,
  PaymentStatus,
  DeliveryOption,
} from "@/types/order/order.types";

import {
  UNIFIED_PAYFAST_SERVICE_TOKEN,
  IUnifiedPayFastService,
  PayFastConfig,
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  ITNHandleResponse,
} from "@/interfaces/payment/payment.service.interface";
import { PFNotificationRepository } from "@/repositories/notification/payment.notification.repository";
import { IPFNotificationCreate } from "@/models/notification/payfast.notification.model";
import {
  IOrderService,
  ORDER_SERVICE_TOKEN,
} from "@/interfaces/order/order.service.intreface";
import {
  CART_SERVICE_TOKEN,
  ICartService,
} from "@/interfaces/cart/cart.service.interface";
import {
  AUTH_SERVICE_TOKEN,
  IAuthService,
} from "@/interfaces/auth/IAuthService.interface";
import {
  adminOrderNotificationTemplate,
  orderConfirmationTemplate,
  sendMail,
} from "@/utils/email";
import {
  IOrderNotificationService,
  ORDER_NOTIFICATION_SERVICE_TOKEN,
} from "@/interfaces/order/order.noification.service.interface";
import { COUPON_SERVICE_TOKEN, ICouponService } from "@/interfaces/coupon/coupon.service.interface";

interface PaymentContext {
  userId: number;
  address: string;
  deliveryOption: DeliveryOption;
  fullName: string;
  email: string;
  phone: string;
  timestamp: number;
  
  appliedCouponCode?: string; // ADD THIS
}

@Service({ id: UNIFIED_PAYFAST_SERVICE_TOKEN })
export class UnifiedPayFastService implements IUnifiedPayFastService {
  private paymentContexts: Map<string, PaymentContext> = new Map();

  constructor(
    @Inject(ORDER_SERVICE_TOKEN) private orderService: IOrderService,
    @Inject(CART_SERVICE_TOKEN) private cartService: ICartService,
    @Inject(NOTIFICATION_SERVICE_TOKEN)
    private notificationService: INotificationService,
    @Inject(AUTH_SERVICE_TOKEN) private authService: IAuthService,
    private pfNotificationRepository: PFNotificationRepository,
    @Inject(ORDER_NOTIFICATION_SERVICE_TOKEN) // Add this injection
    private orderNotificationService: IOrderNotificationService,
    @Inject(COUPON_SERVICE_TOKEN) // Add this injection
    private couponService: ICouponService
  ) {
    setInterval(() => this.cleanupOldContexts(), 60 * 60 * 1000);
  }

  public async generatePaymentFromCart(
    userId: number,
    appliedCouponCode?: string
  ): Promise<PaymentResponse> {
    try {
      console.log(
        `🚀 Generating payment for user ${userId}`,
        appliedCouponCode
      );

      const config = this.getPayFastConfig();
      this.validatePayFastConfig();

      // Get user details from database
      const user = await this.authService.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      // Validate required user fields
      if (!user.email || !user.fullName || !user.phone) {
        throw new HttpException(
          400,
          "User profile incomplete. Please update your email, full name, and phone number"
        );
      }

      const cart = await this.cartService.getUserCart(userId);
      if (!cart || !cart.items?.length) {
        throw new HttpException(404, "Cart not found or empty");
      }

      // Validate required user fields
    if (!user.email || !user.fullName || !user.phone) {
      throw new HttpException(400, "User profile incomplete");
    }

    // FIX: Extract school ID from cart items (for school coupons)
    let schoolId: number | null = null;
    
    // Look for school ID in bulk stationery items
    const bulkStationeryItem = cart.items.find(item => item.isBulk === true && item.schoolInfo?.schoolId);
    if (bulkStationeryItem) {
      schoolId = bulkStationeryItem.schoolInfo.schoolId;
      console.log(`🏫 Found school ID from cart: ${schoolId}`);
    }

    let finalTotal: number;
    let couponBreakdown: any = null;

    // USE COUPON CALCULATION IF PROVIDED
    if (appliedCouponCode) {
      const cartTotal = await this.cartService.applyCouponToCart({
        userId,
        couponCode: appliedCouponCode,
        schoolId
      });

      finalTotal = cartTotal.finalTotal;
      couponBreakdown = cartTotal;

      console.log('✅ Used coupon calculation:', {
        original: cartTotal.subtotal,
        discount: cartTotal.discountAmount,
        final: finalTotal
      });

    } else {
      // USE ORIGINAL CALCULATION (no coupon)
      const cart = await this.cartService.getUserCart(userId);
      if (!cart || !cart.items?.length) {
        throw new HttpException(404, "Cart not found or empty");
      }

      const shippingAmount = cart.totalPrice >= 2000 ? 0 : 180;
      const vatRate = 0.15;
      const vatAmount = cart.totalPrice * vatRate;
      finalTotal = cart.totalPrice + shippingAmount + vatAmount;

      console.log('✅ Used regular calculation (no coupon)');
    }

      if (isNaN(finalTotal) || finalTotal <= 0) {
        throw new HttpException(400, "Invalid cart amount");
      }

      const paymentReference = this.generatePaymentReference(userId);

      // Store payment context with user details from database
      this.storePaymentContext(paymentReference, {
        userId: userId,
        address: user.address || "",
        deliveryOption: "shipping" as DeliveryOption,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        timestamp: Date.now(),
        appliedCouponCode: appliedCouponCode // Store coupon for order creation
      });

      const paymentUrl = this.buildPayFastUrl(config, {
        amount: finalTotal,
        paymentReference,
        deliveryOption: "shipping" as DeliveryOption,
        itemCount: cart.items.length,
        email: user.email,
      });

      console.log(`✅ Payment URL generated successfully: ${paymentReference}`);

      return {
        paymentUrl,
        paymentReference,
        amount: finalTotal,
        merchantId: config.merchantId,
      };
    } catch (error) {
      console.error(`❌ Error generating payment:`, error);
      throw error;
    }
  }

  public async handlePayFastITN(itnData: any): Promise<ITNHandleResponse> {
    try {
      console.log("🔔 PayFast ITN received");
      console.log("📋 Raw ITN data:", JSON.stringify(itnData, null, 2));

      const {
        m_payment_id,
        pf_payment_id,
        payment_status,
        amount_gross,
        amount_fee,
        amount_net,
        merchant_id,
        signature,
        email_address,
        item_name,
        billing_date,
      } = itnData;

      // Basic validation - just check for required fields
      if (!m_payment_id || !pf_payment_id || !payment_status || !merchant_id) {
        console.log("❌ Missing required ITN fields");
        return { success: false, message: "Missing required ITN fields" };
      }

      console.log(
        `📊 Processing payment: ${m_payment_id} with status: ${payment_status}`
      );

      // Check for duplicate notifications
      if (pf_payment_id && signature) {
        const isDuplicate = await this.isDuplicateNotification(
          parseInt(pf_payment_id),
          signature
        );
        if (isDuplicate) {
          console.log(
            `⚠️ Duplicate notification detected for PF Payment ID: ${pf_payment_id}`
          );

          try {
            const existingOrder =
              await this.orderService.getOrderByPaymentReference(m_payment_id);
            return {
              success: true,
              order: existingOrder,
              message: "Duplicate notification - order already exists",
            };
          } catch (error) {
            return {
              success: true,
              message: "Duplicate notification - already processed",
            };
          }
        }
      }

      // Save PayFast notification for audit trail (always save regardless of status)
      try {
        console.log(`💾 Saving PayFast transaction notification...`);

        const pfNotificationData: IPFNotificationCreate = {
          merchantId: parseInt(merchant_id),
          pfPaymentId: parseInt(pf_payment_id),
          paymentStatus: payment_status.toUpperCase(),
          paymentReference: m_payment_id,
          amountGross: amount_gross ? parseFloat(amount_gross) : null,
          amountFee: amount_fee ? parseFloat(amount_fee) : null,
          amountNet: amount_net ? parseFloat(amount_net) : null,
          signature: signature || null,
          rawItnData: JSON.stringify(itnData),
        };

        await this.pfNotificationRepository.createNotification(
          pfNotificationData
        );
        console.log(`✅ PayFast transaction notification saved successfully`);
      } catch (dbError) {
        console.error(
          `❌ Failed to save PayFast notification to database:`,
          dbError
        );
        // Continue processing even if notification save fails
      }

      // Check if order already exists
      try {
        const existingOrder =
          await this.orderService.getOrderByPaymentReference(m_payment_id);
        console.log(
          `✅ Order already exists for payment reference: ${m_payment_id}`
        );
        return {
          success: true,
          order: existingOrder,
          message: "Order already exists",
        };
      } catch (error) {
        console.log(
          `ℹ️ No existing order found for payment reference: ${m_payment_id}`
        );
      }

      // Check if payment was successful
      const isPaymentSuccessful =
        payment_status &&
        (payment_status.toUpperCase() === "COMPLETE" ||
          payment_status.toUpperCase() === "COMPLETED" ||
          payment_status.toUpperCase() === "PAID" ||
          payment_status.toUpperCase() === "SUCCESS");

      console.log(
        `📊 Payment successful: ${isPaymentSuccessful} (status: ${payment_status})`
      );

      if (isPaymentSuccessful) {
        console.log(
          `✅ Payment confirmed via ITN - attempting auto order creation for: ${m_payment_id}`
        );

        try {
          const createdOrder = await this.createOrderFromPayment(m_payment_id);
          if (createdOrder) {
            console.log(`🎉 Order automatically created: ${createdOrder.id}`);

            // Create user-facing notification
            await this.notificationService.createPaymentSuccessNotification(
              createdOrder.userId,
              createdOrder.id,
              createdOrder.total,
              m_payment_id
            );

            // Create admin notification for successful payment
            await this.orderNotificationService.createAdminPaymentSuccessNotification(
              createdOrder.id,
              createdOrder.total,
              m_payment_id,
              createdOrder.userId
            );

            return {
              success: true,
              order: createdOrder,
              message: "Payment confirmed and order created automatically",
            };
          } else {
            console.log(
              `⚠️ Auto order creation failed - payment context not found or expired`
            );
            return {
              success: true,
              message:
                "Payment confirmed via ITN - order creation requires manual verification",
            };
          }
        } catch (orderError) {
          console.error(`❌ Auto order creation failed:`, orderError);
          return {
            success: true,
            message:
              "Payment confirmed but auto order creation failed - manual verification required",
          };
        }
      } else {
        console.log(`ℹ️ Payment not completed, status: ${payment_status}`);

        // Handle failed payments
        if (
          payment_status &&
          (payment_status.toUpperCase() === "FAILED" ||
            payment_status.toUpperCase() === "CANCELLED" ||
            payment_status.toUpperCase() === "DECLINED")
        ) {
          const context = this.getPaymentContext(m_payment_id);
          if (context) {
            await this.notificationService.createPaymentFailedNotification(
              context.userId,
              0,
              m_payment_id,
              `Payment status: ${payment_status}`
            );
          }
        }

        return {
          success: true,
          message: `Payment status: ${payment_status}`,
        };
      }
    } catch (error) {
      console.error("❌ ITN handling error:", error);
      return {
        success: false,
        message: `ITN processing failed: ${error.message}`,
      };
    }
  }

  public async checkPaymentStatus(
    paymentReference: string
  ): Promise<PaymentStatusResponse> {
    try {
      console.log(`🔍 Checking payment status for: ${paymentReference}`);

      try {
        const existingOrder =
          await this.orderService.getOrderByPaymentReference(paymentReference);
        console.log(`✅ Order already exists for payment: ${paymentReference}`);
        return {
          status: PaymentStatus.PAID,
          orderExists: true,
          order: existingOrder,
          verified: true,
        };
      } catch (error) {
        console.log(`ℹ️ No order found for payment: ${paymentReference}`);
      }

      const notificationRecord = await this.findNotificationByPaymentReference(
        paymentReference
      );
      if (
        notificationRecord &&
        notificationRecord.paymentStatus === "COMPLETE"
      ) {
        console.log(
          `✅ Payment verified from notification record: ${paymentReference}`
        );
        return {
          status: PaymentStatus.PAID,
          orderExists: false,
          verified: true,
        };
      }

      console.log(`ℹ️ No notification found for payment: ${paymentReference}`);
      return {
        status: PaymentStatus.PENDING,
        orderExists: false,
        verified: false,
      };
    } catch (error) {
      console.error(
        `❌ Error checking payment status for ${paymentReference}:`,
        error
      );
      return {
        status: PaymentStatus.FAILED,
        orderExists: false,
        verified: false,
      };
    }
  }

  public async createOrderFromPayment(
    paymentReference: string
  ): Promise<IOrder | null> {
    try {
      console.log(
        `🤖 Attempting order creation for payment: ${paymentReference}`
      );

      const context = this.getPaymentContext(paymentReference);
      if (!context) {
        console.log(`❌ No payment context found for: ${paymentReference}`);
        return null;
      }

      try {
        const existingOrder =
          await this.orderService.getOrderByPaymentReference(paymentReference);
        console.log(
          `✅ Order already exists for payment ${paymentReference}: Order ${existingOrder.id}`
        );
        this.paymentContexts.delete(paymentReference);
        return existingOrder;
      } catch (error) {
        console.log(`ℹ️ No existing order found, proceeding with creation`);
      }

      const cart = await this.cartService.getUserCart(context.userId);
      const user = await this.authService.findUserById(context.userId);
      if (!cart || !cart.items?.length) {
        console.log(`❌ Cart validation failed for user ${context.userId}`);
        return null;
      }

      console.log(`✅ Cart validation passed:`, {
        userId: context.userId,
        itemCount: cart.items.length,
        totalPrice: cart.totalPrice,
        appliedCouponCode: context.appliedCouponCode 
      });


      // 🚨 CRITICAL FIX: Register coupon usage BEFORE creating order
    if (context.appliedCouponCode) {
      try {
        console.log(`🎫 Registering coupon usage for user ${context.userId}, coupon: ${context.appliedCouponCode}`);
        
        
        
        const coupon = await this.couponService.getCouponByCode(context.appliedCouponCode);
        if (coupon) {
          // ✅ FIX: Use the new service method
      await this.couponService.registerCouponUsage(coupon.id, context.userId);
      console.log(`✅ Successfully registered coupon usage for user ${context.userId}`);
        } else {
          console.warn(`⚠️ Coupon not found: ${context.appliedCouponCode}`);
        }
      } catch (couponError) {
        console.error(`❌ Failed to register coupon usage:`, couponError);
        // Don't fail the order creation if coupon registration fails
      }
    }

      const orderData = {
        total: cart.totalPrice,
        items: cart.items,
        paymentReference: paymentReference,
        address: user.address,
      };

      const order = await this.orderService.createOrder(
        context.userId,
        orderData
      );

      await this.orderService.updatePaymentStatus(
        order.id,
        PaymentStatus.PAID,
        paymentReference
      );

      console.log(`✅ Order created successfully:`, {
        orderId: order.id,
        paymentReference,
        total: order.total,
        paymentStatus: PaymentStatus.PAID,
      });

      // Send confirmation emails after successful order creation
      try {
        await this.sendOrderConfirmationEmails(order, user);
      } catch (emailError) {
        console.error("❌ Failed to send order emails:", emailError);
        // Don't throw here as the order was successfully created
      }
      // Clear the cart after successful order creation
      try {
        await this.cartService.clearUserCart(context.userId);
        console.log(`🗑️ User cart cleared successfully after order creation`);
      } catch (cartError) {
        console.error(`⚠️ Failed to clear user cart:`, cartError);
      }

      this.paymentContexts.delete(paymentReference);
      console.log(`🧹 Payment context cleaned up for: ${paymentReference}`);

      return order;
    } catch (error) {
      console.error(
        `❌ Error in order creation for ${paymentReference}:`,
        error
      );

      if (error.name === "SequelizeUniqueConstraintError") {
        console.error(
          `🔒 Unique constraint error - checking for existing order`
        );
        try {
          const existingOrder =
            await this.orderService.getOrderByPaymentReference(
              paymentReference
            );
          if (existingOrder) {
            console.log(
              `✅ Found existing order ${existingOrder.id} for payment ${paymentReference}`
            );

            const context = this.getPaymentContext(paymentReference);
            if (context) {
              try {
                await this.cartService.clearUserCart(context.userId);
                console.log(`🗑️ User cart cleared for existing order`);
              } catch (cartError) {
                console.error(
                  `⚠️ Failed to clear cart for existing order:`,
                  cartError
                );
              }
            }

            this.paymentContexts.delete(paymentReference);
            return existingOrder;
          }
        } catch (findError) {
          console.error(`❌ Error finding existing order:`, findError);
        }
      }

      return null;
    }
  }

  private async sendOrderConfirmationEmails(
    order: IOrder,
    user: any
  ): Promise<void> {
    try {
      // Get complete order with items and user details
      const completeOrder = await this.orderService.getOrderById(order.id);

      if (!completeOrder || !user.email) {
        console.warn("⚠️ Cannot send emails: Order or user email not found");
        return;
      }

      const orderDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Prepare order items with images
      const orderItems = completeOrder.items.map((item) => ({
        name: item.product?.productName || "Product",
        price: item.price,
        quantity: item.quantity || 1,
        image: item.product?.images?.[0]?.urls?.[0]?.url || null,
      }));

      // Customer email
      const viewOrdersLink = `https://www.ugetmogroup.com/client/profile/orders`;

      const customerHtml = orderConfirmationTemplate(
        user.fullName || "Customer",
        order.id.toString(),
        orderDate,
        orderItems,
        order.total,
        user.address || "",
        viewOrdersLink
      );

      await sendMail(
        user.email,
        `Your UGETMO Order Confirmation #${order.id}`,
        `Thank you for your order #${order.id}`,
        customerHtml
      );

      console.log(
        `✅ Order confirmation email sent to customer: ${user.email}`
      );

      // Admin email
      const adminEmail = process.env.ADMIN_EMAIL || "sales@ugtmoregroup.com";
      const orderDetailsLink = `https://ugetmogroup.com/admin/orders`;

      const adminHtml = adminOrderNotificationTemplate(
        user.fullName || "Customer",
        user.email,
        order.id.toString(),
        orderDate,
        orderItems,
        order.total,
        user.address || "",
        orderDetailsLink
      );

      await sendMail(
        adminEmail,
        `New Order Received #${order.id}`,
        `New order from ${user.fullName || "Customer"}`,
        adminHtml
      );

      console.log(`✅ Order notification email sent to admin: ${adminEmail}`);
    } catch (error) {
      console.error("❌ Error sending order confirmation emails:", error);
      throw error;
    }
  }

  public validatePayFastConfig(): void {
    const config = this.getPayFastConfig();
    if (!config.merchantId || !config.merchantKey) {
      throw new HttpException(
        500,
        "Missing PayFast configuration - check merchant ID and key"
      );
    }

    if (!process.env.BACKEND_URL) {
      throw new HttpException(500, "Missing BACKEND_URL configuration");
    }

    if (!process.env.PAYFAST_RETURN_URL) {
      throw new HttpException(500, "Missing PAYFAST_RETURN_URL configuration");
    }
  }

  private storePaymentContext(
    paymentReference: string,
    context: PaymentContext
  ): void {
    console.log(`💾 Storing payment context for: ${paymentReference}`);
    this.paymentContexts.set(paymentReference, context);
  }

  private cleanupOldContexts(): void {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [paymentReference, context] of this.paymentContexts.entries()) {
      if (context.timestamp < twentyFourHoursAgo) {
        this.paymentContexts.delete(paymentReference);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old payment contexts`);
    }
  }

  private getPaymentContext(paymentReference: string): PaymentContext | null {
    const context = this.paymentContexts.get(paymentReference);

    if (!context) {
      console.log(`❌ Payment context not found for: ${paymentReference}`);
      return null;
    }

    const isExpired = Date.now() - context.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      console.log(`⏰ Payment context expired for: ${paymentReference}`);
      this.paymentContexts.delete(paymentReference);
      return null;
    }

    return context;
  }

  private async findNotificationByPaymentReference(
    paymentReference: string
  ): Promise<any> {
    try {
      console.log(
        `🔍 Looking for PayFast notification with payment reference: ${paymentReference}`
      );
      return await this.pfNotificationRepository.findByPaymentReference(
        paymentReference
      );
    } catch (error) {
      console.error(
        "Error finding PayFast notification by payment reference:",
        error
      );
      return null;
    }
  }

  private async isDuplicateNotification(
    pfPaymentId: number,
    signature: string
  ): Promise<boolean> {
    try {
      return await this.pfNotificationRepository.notificationExists(
        pfPaymentId,
        signature
      );
    } catch (error) {
      console.error("Error checking duplicate notification:", error);
      return false;
    }
  }

  private buildPayFastUrl(
    config: PayFastConfig,
    params: {
      amount: number;
      paymentReference: string;
      cartId?: number;
      deliveryOption?: DeliveryOption;
      itemCount?: number;
      email: string;
    }
  ): string {
    const returnUrl = `${process.env.PAYFAST_RETURN_URL}?paymentReference=${params.paymentReference}&status=success`;
    const cancelUrl = `${
      process.env.PAYFAST_CANCEL_URL || process.env.PAYFAST_RETURN_URL
    }?paymentReference=${params.paymentReference}&status=cancelled`;

    const itemName = `Cart Order for #${params.email}`;
    const itemDescription = `Cart Order - ${params.deliveryOption} - ${params.itemCount} items`;

    const paymentParams: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.BACKEND_URL}/api/payfast/notification`,
      m_payment_id: params.paymentReference,
      amount: params.amount.toFixed(2),
      item_name: itemName,
      item_description: itemDescription,
      email_address: params.email || "customer@example.com",
    };

    const signature = this.generateSignature(paymentParams, false); // false for payment URL generation

    const finalParams: Record<string, string> = {
      ...paymentParams,
      signature: signature,
    };

    const queryString = Object.entries(finalParams)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    const finalUrl = `${config.paymentUrl}/eng/process?${queryString}`;

    console.log("🔗 Final PayFast URL generated");
    return finalUrl;
  }

  // FIXED: Correct signature generation for PayFast ITN
  private generateSignature(
    params: Record<string, any>,
    isITNVerification: boolean = false
  ): string {
    try {
      const signatureParams = { ...params };
      delete signatureParams.signature;

      // Use the CORRECT sorting method from document 1
      const sortedKeys = Object.keys(signatureParams).sort();
      const parameterString = sortedKeys
        .filter((key) => {
          const value = signatureParams[key];
          // For ITN verification, include ALL fields even if empty (but not null/undefined)
          if (isITNVerification) {
            return value !== null && value !== undefined;
          }
          // For payment URL generation, exclude empty values
          return value !== null && value !== undefined && value !== "";
        })
        .map((key) => `${key}=${signatureParams[key]}`)
        .join("&");

      console.log("🔍 Parameter string for signature:", parameterString);

      // PayFast production does NOT use passphrase for ITN verification
      // Only use the parameter string as-is
      const signature = crypto
        .createHash("md5")
        .update(parameterString)
        .digest("hex");
      console.log("🔐 Generated signature:", signature);

      return signature;
    } catch (error) {
      console.error("❌ Error generating signature:", error);
      throw new HttpException(500, "Failed to generate payment signature");
    }
  }

  private generatePaymentReference(
    userId: number,
    prefix: string = "Order"
  ): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}_${timestamp}_${userId}_${random}`;
  }

  private getPayFastConfig(): PayFastConfig {
    const isProduction = true;

    console.log(
      `🌍 PayFast Environment: ${isProduction ? "PRODUCTION" : "SANDBOX"}`
    );

    if (isProduction) {
      if (
        !process.env.PAYFAST_MERCHANT_ID ||
        !process.env.PAYFAST_MERCHANT_KEY
      ) {
        throw new HttpException(500, "Missing production PayFast credentials");
      }

      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY,
        paymentUrl: "https://www.payfast.co.za",
        isProduction: true,
      };
    } else {
      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID_SANDBOX || "10000100",
        merchantKey:
          process.env.PAYFAST_MERCHANT_KEY_SANDBOX || "46f0cd694581a",
        paymentUrl: "https://sandbox.payfast.co.za",
        isProduction: false,
      };
    }
  }

  private parsePaymentStatus(paymentStatus: string): PaymentStatus {
    const status = paymentStatus?.toUpperCase().trim();
    switch (status) {
      case "COMPLETED":
      case "COMPLETE":
      case "PAID":
      case "SUCCESS":
        return PaymentStatus.PAID;
      case "FAILED":
      case "FAILURE":
      case "ERROR":
        return PaymentStatus.FAILED;
      case "CANCELLED":
      case "CANCELED":
      case "CANCEL":
        return PaymentStatus.CANCELLED;
      case "DECLINED":
      case "DECLINE":
        return PaymentStatus.DECLINED;
      case "PROCESSING":
      case "PENDING":
        return PaymentStatus.PROCESSING;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
