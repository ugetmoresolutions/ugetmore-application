import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { NOTIFICATION_SERVICE_TOKEN } from "@/interfaces/notification/notification.service.interface";
import { INotificationFilters, NotificationType } from "@/types/notification/notification.types";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { PFNOTIFICATION_SERVICE_TOKEN } from "@/interfaces/notification/payment/notification.repository.interface";

export class PFNotificationController {
  private notificationService;

  constructor() {
    this.notificationService = Container.get(PFNOTIFICATION_SERVICE_TOKEN);
  }

  public getTotalAmount = async (req: Request, res: Response, next: NextFunction) => {
    try {
     const totalAmount = await this.notificationService.getTotalAmount();
     const response: CustomResponse<any> = {
        data: totalAmount,
        message: "Notifications total amount fetched successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };


}