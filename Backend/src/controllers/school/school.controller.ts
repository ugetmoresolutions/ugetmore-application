// controllers/school/school.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { SCHOOL_SERVICE_TOKEN } from "@/interfaces/school/school.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class SchoolController {
  private schoolService;

  constructor() {
    this.schoolService = Container.get(SCHOOL_SERVICE_TOKEN);
  }

  public getAllSchools = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schools = await this.schoolService.getAllSchools();

      const response: CustomResponse<any> = {
        data: schools,
        message: "Schools retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSchoolById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const school = await this.schoolService.getSchoolById(id);

      const response: CustomResponse<any> = {
        data: school,
        message: "School retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createSchool = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schoolData = req.body;

      // Updated validation to include 'combined' type
      if (
        !schoolData.type ||
        !["preschool", "primary", "high", "combined"].includes(schoolData.type)
      ) {
        throw new HttpException(
          400,
          "School type is required and must be 'preschool', 'primary', 'high', or 'combined'"
        );
      }

      const school = await this.schoolService.createSchool(schoolData);

      const response: CustomResponse<any> = {
        data: school,
        message: "School created successfully with automatic grade setup",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateSchool = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const schoolData = req.body;
      const school = await this.schoolService.updateSchool(id, schoolData);

      const response: CustomResponse<any> = {
        data: school,
        message: "School updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteSchool = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      await this.schoolService.deleteSchool(id);

      const response: CustomResponse<any> = {
        data: null,
        message: "School deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveSchools = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schools = await this.schoolService.getActiveSchools();

      const response: CustomResponse<any> = {
        data: schools,
        message: "Active schools retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}