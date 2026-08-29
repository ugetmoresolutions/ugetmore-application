import { Router } from "express";
import { SoftwareInquiryController } from "../../controllers/softwareInquiry/softwareInquiry.controller";
import { Routes } from "@/types/routes.interface";

export class SoftwareInquiryRoute implements Routes {
    public path = "/software-inquiry";
    public router = Router();
    public softwareInquiryController = new SoftwareInquiryController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public inquiry submission
        this.router.post(`${this.path}`, this.softwareInquiryController.createInquiry);
        
        // Admin routes
        this.router.get(`${this.path}`, this.softwareInquiryController.getAllInquiries);
        this.router.get(`${this.path}/stats`, this.softwareInquiryController.getInquiryStats);
        this.router.get(`${this.path}/status/:status`, this.softwareInquiryController.getInquiriesByStatus);
        this.router.get(`${this.path}/:id`, this.softwareInquiryController.getInquiry);
        this.router.put(`${this.path}/:id/status`, this.softwareInquiryController.updateInquiryStatus);
        this.router.delete(`${this.path}/:id`, this.softwareInquiryController.deleteInquiry);
    }
}