import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CustomResponse } from "@/types/response.interface";
import { CATEGORY_SERVICE_TOKEN } from "@/interfaces/category/category.service.interface";
import { MainCategoryType, isValidMainCategory } from "@/types/main-category/main-category.type";

export class CategoryController {
  private categoryService;

  constructor() {
    this.categoryService = Container.get(CATEGORY_SERVICE_TOKEN);
  }

  // Main Categories

  public getAllMainCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mainCategories = await this.categoryService.getAllMainCategories();

      const response: CustomResponse<any> = {
        data: mainCategories,
        message: "Main categories retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getMainCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      if (!isValidMainCategory(id)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid main category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const mainCategory = await this.categoryService.getMainCategoryById(id as MainCategoryType);

      const response: CustomResponse<any> = {
        data: mainCategory,
        message: "Main category retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Categories CRUD

  public createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryData = req.body;
      const category = await this.categoryService.createCategory(categoryData);

      const response: CustomResponse<any> = {
        data: category,
        message: "Category created successfully",
        error: false
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getAllCategories();

      const response: CustomResponse<any> = {
        data: categories,
        message: "Categories retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      if (isNaN(categoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const category = await this.categoryService.getCategoryById(categoryId);

      const response: CustomResponse<any> = {
        data: category,
        message: "Category retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      const updateData = req.body;
      
      if (isNaN(categoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const category = await this.categoryService.updateCategory(categoryId, updateData);

      const response: CustomResponse<any> = {
        data: category,
        message: "Category updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      if (isNaN(categoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const result = await this.categoryService.deleteCategory(categoryId);

      const response: CustomResponse<any> = {
        data: { deleted: result },
        message: "Category deleted successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Hierarchical endpoints

  public getAllMainCategoriesWithHierarchy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hierarchy = await this.categoryService.getAllMainCategoriesWithHierarchy();

      const response: CustomResponse<any> = {
        data: hierarchy,
        message: "Category hierarchy retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getCategoriesByMainCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mainCategoryId } = req.params;
      
      if (!isValidMainCategory(mainCategoryId)) {
        const response: CustomResponse<any> = {
          data: null,
          message: "Invalid main category ID",
          error: true
        };
        return res.status(400).json(response);
      }

      const categories = await this.categoryService.getCategoriesByMainCategory(mainCategoryId as MainCategoryType);

      const response: CustomResponse<any> = {
        data: categories,
        message: "Categories retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}