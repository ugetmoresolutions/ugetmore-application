// routes/grade/grade.route.ts
import { Router } from "express";
import { GradeController } from "../../controllers/grade/grade.controller";
import { Routes } from "@/types/routes.interface";

export class GradeRoute implements Routes {
    public path = "/grades";
    public router = Router();
    public gradeController = new GradeController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Get all grades for a school
        this.router.get(
            `${this.path}/school/:schoolId`,
            this.gradeController.getGradesBySchool
        );
        
        // Get specific grade
        this.router.get(
            `${this.path}/:id`,
            this.gradeController.getGradeById
        );
        
        // Get grade with school info
        this.router.get(
            `${this.path}/:id/with-school`,
            this.gradeController.getGradeWithSchool
        );
        
        // Create new grade
        this.router.post(
            `${this.path}`,
            this.gradeController.createGrade
        );
        
        // Update grade
        this.router.put(
            `${this.path}/:id`,
            this.gradeController.updateGrade
        );
        
        // Delete grade (soft delete)
        this.router.delete(
            `${this.path}/:id`,
            this.gradeController.deleteGrade
        );
    }
}