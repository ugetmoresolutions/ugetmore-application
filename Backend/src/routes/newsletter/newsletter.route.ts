// routes/newsletter/newsletter.route.ts
import { Router } from "express";
import { NewsletterController } from "../../controllers/newsletter/newsletter.controller";
import { Routes } from "@/types/routes.interface";

export class NewsletterRoute implements Routes {
    public path = "/newsletter";
    public router = Router();
    public newsletterController = new NewsletterController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public subscription routes
        this.router.post(`${this.path}/subscribe`, this.newsletterController.subscribe);
        this.router.post(`${this.path}/unsubscribe`, this.newsletterController.unsubscribe);
        
        // Admin routes
        this.router.get(`${this.path}/subscribers`, this.newsletterController.getAllSubscribers);
        this.router.get(`${this.path}/subscribers/stats`, this.newsletterController.getSubscriberStats);
        this.router.get(`${this.path}/subscribers/:email`, this.newsletterController.getSubscriber);
    }
}