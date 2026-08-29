// controllers/gradeStationery/gradeStationery.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { GRADE_STATIONERY_SERVICE_TOKEN } from "@/interfaces/gradeStationery/gradeStationery.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { ICreateGradeStationery, IUpdateGradeStationery, IStationeryItem } from "@/types/gradeStationery/gradeStationery.interface";

export class GradeStationeryController {
    private gradeStationeryService;

    constructor() {
        this.gradeStationeryService = Container.get(GRADE_STATIONERY_SERVICE_TOKEN);
    }



    // NEW: Get stationery with products and collections
    public getStationeryWithProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const result = await this.gradeStationeryService.getStationeryWithProducts(gradeId);

            const response: CustomResponse<any> = {
                data: result,
                message: "Grade stationery with products retrieved successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    // NEW: Search stationery products
    public searchStationeryProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const { search, page, limit } = req.query;

            const result = await this.gradeStationeryService.searchStationeryProducts(
                gradeId,
                search as string,
                page ? parseInt(page as string) : 1,
                limit ? parseInt(limit as string) : 50
            );

            const response: CustomResponse<any> = {
                data: result,
                message: "Stationery products searched successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getStationeryByGrade = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const stationery = await this.gradeStationeryService.getStationeryByGrade(gradeId);

            const response: CustomResponse<any> = {
                data: stationery,
                message: stationery ? "Grade stationery retrieved successfully" : "No stationery found for this grade",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getStationeryWithFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const stationery = await this.gradeStationeryService.getStationeryWithFile(gradeId);

            const response: CustomResponse<any> = {
                data: stationery,
                message: stationery ? "Grade stationery with file retrieved successfully" : "No stationery with file found for this grade",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public createStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stationeryData: ICreateGradeStationery = req.body;
            const stationery = await this.gradeStationeryService.createStationery(stationeryData);

            const response: CustomResponse<any> = {
                data: stationery,
                message: "Stationery created successfully",
                error: false,
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const stationeryData: IUpdateGradeStationery = req.body;
            const stationery = await this.gradeStationeryService.updateStationery(id, stationeryData);

            const response: CustomResponse<any> = {
                data: stationery,
                message: "Stationery updated successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateStationeryByGrade = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const stationeryData: IUpdateGradeStationery = req.body;
            const stationery = await this.gradeStationeryService.updateStationeryByGrade(gradeId, stationeryData);

            const response: CustomResponse<any> = {
                data: stationery,
                message: "Stationery updated successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public deleteStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            await this.gradeStationeryService.deleteStationery(id);

            const response: CustomResponse<any> = {
                data: null,
                message: "Stationery deleted successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public addItemsToStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const { items } = req.body as { items: IStationeryItem[] };
            
            const result = await this.gradeStationeryService.addItemsToStationery(gradeId, items);

            const response: CustomResponse<any> = {
                data: result,
                message: "Items added to stationery successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const productCode = req.params.productCode;
            const { minQuantity } = req.body as { minQuantity: number };
            
            const result = await this.gradeStationeryService.updateItemQuantity(gradeId, productCode, minQuantity);

            const response: CustomResponse<any> = {
                data: result,
                message: "Item quantity updated successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public removeItemFromStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const productCode = req.params.productCode;
            
            const result = await this.gradeStationeryService.removeItemFromStationery(gradeId, productCode);

            const response: CustomResponse<any> = {
                data: result,
                message: "Item removed from stationery successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public clearStationery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            await this.gradeStationeryService.clearStationery(gradeId);

            const response: CustomResponse<any> = {
                data: null,
                message: "Stationery cleared successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateFileUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const { fileUrl } = req.body as { fileUrl: string | null };
            
            const result = await this.gradeStationeryService.updateFileUrl(gradeId, fileUrl);

            const response: CustomResponse<any> = {
                data: result,
                message: fileUrl ? "File URL updated successfully" : "File URL removed successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public uploadStationeryFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            
            // Assuming you have file upload middleware that sets req.file or req.fileUrl
            const fileUrl = (req as any).fileUrl || (req.file as any)?.path || null;
            
            if (!fileUrl) {
                const response: CustomResponse<any> = {
                    data: null,
                    message: "No file uploaded",
                    error: true,
                };
                return res.status(400).json(response);
            }

            const result = await this.gradeStationeryService.updateFileUrl(gradeId, fileUrl);

            const response: CustomResponse<any> = {
                data: result,
                message: "Stationery file uploaded successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public removeStationeryFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            
            const result = await this.gradeStationeryService.updateFileUrl(gradeId, null);

            const response: CustomResponse<any> = {
                data: result,
                message: "Stationery file removed successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    // Bulk operations
    public bulkUpdateStationeryItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gradeId = parseInt(req.params.gradeId);
            const { items } = req.body as { items: IStationeryItem[] };
            
            // This replaces all existing items with the new ones
            const result = await this.gradeStationeryService.updateStationeryByGrade(gradeId, { stationeryItems: items });

            const response: CustomResponse<any> = {
                data: result,
                message: "Stationery items updated successfully",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    // Validation endpoint
    public validateStationeryItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { items } = req.body as { items: IStationeryItem[] };
            
            this.gradeStationeryService.validateStationeryItems(items);

            const response: CustomResponse<any> = {
                data: { valid: true },
                message: "Stationery items are valid",
                error: false,
            };
            res.status(200).json(response);
        } catch (error) {
            if (error instanceof Error) {
                const response: CustomResponse<any> = {
                    data: { valid: false, error: error.message },
                    message: "Stationery items validation failed",
                    error: true,
                };
                res.status(400).json(response);
            } else {
                next(error);
            }
        }
    };
}