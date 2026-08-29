import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { SOFTWARE_INQUIRY_SERVICE_TOKEN } from "@/interfaces/softwareInquiry/softwareInquiry.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class SoftwareInquiryController {
  private softwareInquiryService;

  constructor() {
    this.softwareInquiryService = Container.get(SOFTWARE_INQUIRY_SERVICE_TOKEN);
  }

  public createInquiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inquiryData = req.body;

      const inquiry = await this.softwareInquiryService.createInquiry(inquiryData);

      const response: CustomResponse<any> = {
        data: inquiry,
        message: "Software inquiry submitted successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getInquiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, "Inquiry ID is required");
      }

      const inquiry = await this.softwareInquiryService.getInquiryById(parseInt(id));

      if (!inquiry) {
        throw new HttpException(404, "Inquiry not found");
      }

      const response: CustomResponse<any> = {
        data: inquiry,
        message: "Inquiry retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllInquiries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inquiries = await this.softwareInquiryService.getAllInquiries();

      const response: CustomResponse<any> = {
        data: inquiries,
        message: "Inquiries retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getInquiriesByStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status } = req.params;

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      const inquiries = await this.softwareInquiryService.getInquiriesByStatus(status);

      const response: CustomResponse<any> = {
        data: inquiries,
        message: "Inquiries retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateInquiryStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status, reviewedBy } = req.body;

      if (!id) {
        throw new HttpException(400, "Inquiry ID is required");
      }

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      const inquiry = await this.softwareInquiryService.updateInquiryStatus(
        parseInt(id),
        status,
        reviewedBy
      );

      const response: CustomResponse<any> = {
        data: inquiry,
        message: "Inquiry status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteInquiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, "Inquiry ID is required");
      }

      await this.softwareInquiryService.deleteInquiry(parseInt(id));

      const response: CustomResponse<any> = {
        data: null,
        message: "Inquiry deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getInquiryStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.softwareInquiryService.getInquiryStats();

      const response: CustomResponse<any> = {
        data: stats,
        message: "Inquiry stats retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}