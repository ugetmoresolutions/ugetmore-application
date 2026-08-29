// routes/payment/unifiedPayFast.routes.ts
import { Router } from "express";
import { Routes } from "@/types/routes.interface";
import express from "express";
import { UnifiedPayFastController } from "@/controllers/payment/payfast.controller";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";

class UnifiedPayFastRoutes implements Routes {
  public path = "/payfast";
  public router = Router();
  public payFastController = new UnifiedPayFastController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
   
    this.router.post(
      `${this.path}/generate-user-payment`,
      this.payFastController.generatePaymentFromCart
    );

  


   
  }
}

export default UnifiedPayFastRoutes;