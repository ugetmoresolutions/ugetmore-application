// routes/supplier/supplier.route.ts
import { Router } from "express";
import { SupplierController } from "@/controllers/supplier/supplier.controller";
import { Routes } from "@/types/routes.interface";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";

export class SupplierRoute implements Routes {
  public path = "/suppliers";
  public router = Router();
  public supplierController = new SupplierController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET Routes
    this.router.get(`${this.path}`, this.supplierController.getAllSuppliers);
    this.router.get(
      `${this.path}/:account`,
      this.supplierController.getSupplierByAccount
    );

    // POST Routes
    this.router.post(
      `${this.path}/create`,

      this.supplierController.createSupplier
    );

    // PUT Routes
    this.router.put(
      `${this.path}/:account`,

      this.supplierController.updateSupplier
    );

    // DELETE Routes
    this.router.delete(
      `${this.path}/:account`,

      this.supplierController.deleteSupplier
    );
  }
}
