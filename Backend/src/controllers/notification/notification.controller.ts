import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { NOTIFICATION_SERVICE_TOKEN } from "@/interfaces/notification/notification.service.interface";
import { INotificationFilters, NotificationType } from "@/types/notification/notification.types";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class NotificationController {
  private notificationService;

  constructor() {
    this.notificationService = Container.get(NOTIFICATION_SERVICE_TOKEN);
  }

  public getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const { type, isRead, limit = 50, offset = 0 } = req.query;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const filters: INotificationFilters = {
        type: type as NotificationType,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0
      };

      const result = await this.notificationService.getUserNotifications(userId, filters);

      const response: CustomResponse<typeof result> = {
        data: result,
        message: "Notifications fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUnreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const notifications = await this.notificationService.getUnreadNotifications(userId);

      const response: CustomResponse<typeof notifications> = {
        data: notifications,
        message: "Unread notifications fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

      if (!notificationId || notificationId <= 0) {
        throw new HttpException(400, "Valid notification ID is required");
      }

      const notification = await this.notificationService.getNotificationById(notificationId, userId);

      if (!notification) {
        throw new HttpException(404, "Notification not found");
      }

      const response: CustomResponse<typeof notification> = {
        data: notification,
        message: "Notification fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!notificationId || notificationId <= 0) {
        throw new HttpException(400, "Valid notification ID is required");
      }

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const success = await this.notificationService.markNotificationAsRead(notificationId, userId);

      const response: CustomResponse<{ success: boolean }> = {
        data: { success },
        message: "Notification marked as read successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const updatedCount = await this.notificationService.markAllNotificationsAsRead(userId);

      const response: CustomResponse<{ updatedCount: number }> = {
        data: { updatedCount },
        message: "All notifications marked as read successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id);
      const { userId, ...updateData } = req.body;

      if (!notificationId || notificationId <= 0) {
        throw new HttpException(400, "Valid notification ID is required");
      }

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const updatedNotification = await this.notificationService.updateNotification(
        notificationId,
        userId,
        updateData
      );

      const response: CustomResponse<typeof updatedNotification> = {
        data: updatedNotification,
        message: "Notification updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!notificationId || notificationId <= 0) {
        throw new HttpException(400, "Valid notification ID is required");
      }

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const success = await this.notificationService.deleteNotification(notificationId, userId);

      const response: CustomResponse<{ success: boolean }> = {
        data: { success },
        message: "Notification deleted successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const stats = await this.notificationService.getNotificationStats(userId);

      const response: CustomResponse<typeof stats> = {
        data: stats,
        message: "Notification stats fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createGeneralNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, message, paymentReference, orderId, data } = req.body;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!title || !message) {
        throw new HttpException(400, "Title and message are required");
      }

      const notification = await this.notificationService.createGeneralNotification(
        userId,
        title,
        message,
        paymentReference,
        orderId,
        data
      );

      const response: CustomResponse<typeof notification> = {
        data: notification,
        message: "General notification created successfully",
        error: false,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createSystemNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, message, paymentReference, orderId, data } = req.body;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!title || !message) {
        throw new HttpException(400, "Title and message are required");
      }

      const notification = await this.notificationService.createSystemNotification(
        userId,
        title,
        message,
        paymentReference,
        orderId,
        data
      );

      const response: CustomResponse<typeof notification> = {
        data: notification,
        message: "System notification created successfully",
        error: false,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationsByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      if (!type) {
        throw new HttpException(400, "Notification type is required");
      }

      const notifications = await this.notificationService.getNotificationsByType(
        type as any,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const response: CustomResponse<typeof notifications> = {
        data: notifications,
        message: "Notifications fetched by type successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationsByPaymentReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentReference } = req.params;

      if (!paymentReference) {
        throw new HttpException(400, "Payment reference is required");
      }

      const notifications = await this.notificationService.getNotificationsByPaymentReference(paymentReference);

      const response: CustomResponse<typeof notifications> = {
        data: notifications,
        message: "Notifications fetched by payment reference successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationsByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        throw new HttpException(400, "Order ID is required");
      }

      const notifications = await this.notificationService.getNotificationsByOrderId(orderId);

      const response: CustomResponse<typeof notifications> = {
        data: notifications,
        message: "Notifications fetched by order ID successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public cleanupOldNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { daysOld = 90 } = req.query;

      const deletedCount = await this.notificationService.cleanupOldNotifications(
        parseInt(daysOld as string)
      );

      const response: CustomResponse<{ deletedCount: number }> = {
        data: { deletedCount },
        message: "Old notifications cleaned up successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}