// controllers/supplier/supplier.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CustomResponse } from "@/types/response.interface";
import { SUPPLIER_SERVICE_TOKEN } from "@/interfaces/supplier/supplier.service.interface";

export class SupplierController {
  private supplierService;

  constructor() {
    this.supplierService = Container.get(SUPPLIER_SERVICE_TOKEN);
  }

  public createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplierData = req.body;
      const supplier = await this.supplierService.createSupplier(supplierData);

      const response: CustomResponse<any> = {
        data: supplier,
        message: "Supplier created successfully",
        error: false
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getAllSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();

      const response: CustomResponse<any> = {
        data: suppliers,
        message: "Suppliers retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getSupplierByAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const supplier = await this.supplierService.getSupplierByAccount(account);

      const response: CustomResponse<any> = {
        data: supplier,
        message: "Supplier retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const updateData = req.body;
      const supplier = await this.supplierService.updateSupplier(account, updateData);

      const response: CustomResponse<any> = {
        data: supplier,
        message: "Supplier updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const result = await this.supplierService.deleteSupplier(account);

      const response: CustomResponse<any> = {
        data: { deleted: result },
        message: "Supplier deleted successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}