import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CustomResponse } from "@/types/response.interface";
import { SUB_CATEGORY_SERVICE_TOKEN } from "@/interfaces/subcategory/subcategory.service.interface";

export class SubCategoryController {
  private subCategoryService;

  constructor() {
    this.subCategoryService = Container.get(SUB_CATEGORY_SERVICE_TOKEN);
  }

  public createSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subCategoryData = req.body;
      const subCategory = await this.subCategoryService.createSubCategory(subCategoryData);

      const response: CustomResponse<any> = {
        data: subCategory,
        message: "SubCategory created successfully",
        error: false
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getAllSubCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subCategories = await this.subCategoryService.getAllSubCategories();

      const response: CustomResponse<any> = {
        data: subCategories,
        message: "SubCategories retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getSubCategoriesByCategoryId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const id = parseInt(categoryId);
      
      if (isNaN(id)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const subCategories = await this.subCategoryService.getSubCategoriesByCategoryId(id);

      const response: CustomResponse<any> = {
        data: subCategories,
        message: "SubCategories retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getSubCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subCategoryId = parseInt(id);
      
      if (isNaN(subCategoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid subcategory ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const subCategory = await this.subCategoryService.getSubCategoryById(subCategoryId);

      const response: CustomResponse<any> = {
        data: subCategory,
        message: "SubCategory retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subCategoryId = parseInt(id);
      const updateData = req.body;
      
      if (isNaN(subCategoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid subcategory ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const subCategory = await this.subCategoryService.updateSubCategory(subCategoryId, updateData);

      const response: CustomResponse<any> = {
        data: subCategory,
        message: "SubCategory updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public deleteSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subCategoryId = parseInt(id);
      
      if (isNaN(subCategoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid subcategory ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const result = await this.subCategoryService.deleteSubCategory(subCategoryId);

      const response: CustomResponse<any> = {
        data: { deleted: result },
        message: "SubCategory deleted successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}