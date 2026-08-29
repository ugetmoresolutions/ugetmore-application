// controllers/grade/grade.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { GRADE_SERVICE_TOKEN } from "@/interfaces/grade/grade.service.interface";
import { CustomResponse } from "@/types/response.interface";

export class GradeController {
    private gradeService;

    constructor() {
        this.gradeService = Container.get(GRADE_SERVICE_TOKEN);
    }

    public getGradesBySchool = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const schoolId = parseInt(req.params.schoolId);
            const grades = await this.gradeService.getGradesBySchool(schoolId);

            const response: CustomResponse<any> = {
                data: grades,
                message: "Grades retrieved successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getGradeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const grade = await this.gradeService.getGradeById(id);

            const response: CustomResponse<any> = {
                data: grade,
                message: "Grade retrieved successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getGradeWithSchool = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const grade = await this.gradeService.getGradeWithSchool(id);

            const response: CustomResponse<any> = {
                data: grade,
                message: "Grade with school info retrieved successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public createGrade = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeData = req.body;
            const grade = await this.gradeService.createGrade(gradeData);

            const response: CustomResponse<any> = {
                data: grade,
                message: "Grade created successfully",
                error: false,
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateGrade = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const gradeData = req.body;
            const grade = await this.gradeService.updateGrade(id, gradeData);

            const response: CustomResponse<any> = {
                data: grade,
                message: "Grade updated successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public deleteGrade = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            await this.gradeService.deleteGrade(id);

            const response: CustomResponse<any> = {
                data: null,
                message: "Grade deleted successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}