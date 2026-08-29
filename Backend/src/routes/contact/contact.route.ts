import { Router } from "express";
import { Routes } from "@/types/routes.interface";
import { EmailController } from "@/controllers/email/email.controller";

export class EmailRoute implements Routes {
  public path = "/email";
  public router = Router();
  public emailController = new EmailController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/sendEmail`, this.emailController.sendQuote);
  }
}