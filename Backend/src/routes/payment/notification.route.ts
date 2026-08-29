// routes/payment/pfNotification.routes.ts
import { Router } from "express";
import { Routes } from "@/types/routes.interface";
import express from "express";
import { PFNotificationController } from "@/controllers/payment/notification.controller";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";

class PFNotificationRoutes implements Routes {
  public path = "/payfast";
  public router = Router();
  public notificationController = new PFNotificationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ITN endpoint - MUST be publicly accessible (no auth middleware)
    // Use express.text() for PayFast ITN data
    this.router.use(
      `${this.path}/notification`,
      express.text({ type: 'application/x-www-form-urlencoded', limit: '10mb' })
    );

    this.router.post(
      `${this.path}/notification`,
      this.notificationController.handlePayFastITN
    );

    // Payment generation endpoint
    this.router.post(
      `${this.path}/generate-payment`,
      this.notificationController.generatePayment
    );

    // Payment status checking
    this.router.post(
      `${this.path}/check-payment-status`,
      this.notificationController.checkPaymentStatus
    );

    // Payment verification and order creation
    this.router.post(
      `${this.path}/verify-and-create-order`,
      this.notificationController.verifyAndCreateOrder
    );

    // Get payment status by ID
    this.router.get(
      `${this.path}/status/:paymentId`,
      this.notificationController.getPaymentStatus
    );

    // Get payment verification details
    this.router.get(
      `${this.path}/verification/:paymentId`,
      this.notificationController.getPaymentVerification
    );

    // Check if order can be created
    this.router.get(
      `${this.path}/can-create-order/:paymentId`,
      this.notificationController.canCreateOrder
    );

    // Manual payment verification
    this.router.post(
      `${this.path}/manual-verify`,
      this.notificationController.manualVerifyPayment
    );

    // Notification management endpoints
    this.router.get(
      `${this.path}/notifications`,
      this.notificationController.getNotifications
    );
    
    this.router.get(
      `${this.path}/notifications/stats`,
      this.notificationController.getNotificationStats
    );

    this.router.get(
      `${this.path}/notifications/merchant/:merchantId`,
      this.notificationController.getNotificationsByMerchant
    );

    this.router.get(
      `${this.path}/notifications/status/:status`,
      this.notificationController.getNotificationsByStatus
    );

    this.router.get(
      `${this.path}/notifications/pf/:pfPaymentId`,
      this.notificationController.getNotificationByPfPaymentId
    );

    this.router.get(
      `${this.path}/notifications/ref/:paymentReference`,
      this.notificationController.getNotificationByPaymentReference
    );

    this.router.get(
      `${this.path}/notifications/pf/:pfPaymentId/success`,
      this.notificationController.checkPaymentSuccess
    );

    this.router.get(
      `${this.path}/notifications/ref/:paymentReference/success`,
      this.notificationController.checkPaymentSuccessByReference
    );

    this.router.post(
      `${this.path}/notifications/manual`,
      this.notificationController.createManualNotification
    );
  }
}

export default PFNotificationRoutes;