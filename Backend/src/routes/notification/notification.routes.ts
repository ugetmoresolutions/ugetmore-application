import { Router } from "express";
import { NotificationController } from "@/controllers/notification/notification.controller";
import { Routes } from "@/types/routes.interface";
import { PFNotificationController } from "@/controllers/notification/PFNotification.controller";

export class NotificationRoute implements Routes {
  public path = "/notifications";
  public router = Router();
  public notificationController = new NotificationController();
  public PFNotificationController = new PFNotificationController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/user/:userId`, this.notificationController.getUserNotifications);
    this.router.get(`${this.path}/user/:userId/unread`, this.notificationController.getUnreadNotifications);
    this.router.get(`${this.path}/user/:userId/stats`, this.notificationController.getNotificationStats);
    this.router.get(`${this.path}/:id`, this.notificationController.getNotificationById);
    this.router.put(`${this.path}/:id/read`, this.notificationController.markNotificationAsRead);
    this.router.put(`${this.path}/mark-all-read`, this.notificationController.markAllNotificationsAsRead);
    this.router.put(`${this.path}/:id`, this.notificationController.updateNotification);
    this.router.delete(`${this.path}/:id`, this.notificationController.deleteNotification);
    this.router.post(`${this.path}/general`, this.notificationController.createGeneralNotification);
        this.router.get(`${this.path}/payfast/getTotalAmount`, this.PFNotificationController.getTotalAmount);
    this.router.post(`${this.path}/system`, this.notificationController.createSystemNotification);
    this.router.get(`${this.path}/type/:type`, this.notificationController.getNotificationsByType);
    this.router.get(`${this.path}/payment/:paymentReference`, this.notificationController.getNotificationsByPaymentReference);
    this.router.get(`${this.path}/order/:orderId`, this.notificationController.getNotificationsByOrderId);
    this.router.delete(`${this.path}/cleanup`, this.notificationController.cleanupOldNotifications);
  }
}