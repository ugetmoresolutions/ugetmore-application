// controllers/newsletter/newsletter.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { NEWSLETTER_SERVICE_TOKEN } from "@/interfaces/newsletter/newsletter.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class NewsletterController {
  private newsletterService;

  constructor() {
    this.newsletterService = Container.get(NEWSLETTER_SERVICE_TOKEN);
  }

  public subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, source } = req.body;

      if (!email) {
        throw new HttpException(400, "Email is required");
      }

      const subscriber = await this.newsletterService.subscribe({ email, source });

      const response: CustomResponse<any> = {
        data: subscriber,
        message: "Successfully subscribed to newsletter",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public unsubscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new HttpException(400, "Email is required");
      }

      await this.newsletterService.unsubscribe(email);

      const response: CustomResponse<any> = {
        data: null,
        message: "Successfully unsubscribed from newsletter",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.params;

      if (!email) {
        throw new HttpException(400, "Email is required");
      }

      const subscriber = await this.newsletterService.getSubscriberByEmail(email);

      const response: CustomResponse<any> = {
        data: subscriber,
        message: "Subscriber retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllSubscribers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subscribers = await this.newsletterService.getAllSubscribers();

      const response: CustomResponse<any> = {
        data: subscribers,
        message: "Subscribers retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriberStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.newsletterService.getSubscriberStats();

      const response: CustomResponse<any> = {
        data: stats,
        message: "Subscriber stats retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}