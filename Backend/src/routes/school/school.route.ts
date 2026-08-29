// routes/school/school.route.ts
import { Router } from "express";
import { SchoolController } from "../../controllers/school/school.controller";
import { Routes } from "@/types/routes.interface";

export class SchoolRoute implements Routes {
    public path = "/schools";
    public router = Router();
    public schoolController = new SchoolController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}`,
            this.schoolController.getAllSchools
        );
        
        this.router.get(
            `${this.path}/active`,
            this.schoolController.getActiveSchools
        );
        
        this.router.get(
            `${this.path}/:id`,
            this.schoolController.getSchoolById
        );
        
        this.router.post(
            `${this.path}`,
            this.schoolController.createSchool
        );
        
        this.router.put(
            `${this.path}/:id`,
            this.schoolController.updateSchool
        );
        
        this.router.delete(
            `${this.path}/:id`,
            this.schoolController.deleteSchool
        );
    }
}