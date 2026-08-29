import { Router } from "express";
import { SubCategoryController } from "@/controllers/subcategory/subcategory.controller";
import { Routes } from "@/types/routes.interface";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";

export class SubCategoryRoute implements Routes {
  public path = "/subcategories";
  public router = Router();
  public subCategoryController = new SubCategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET Routes (Public)
    this.router.get(
      `${this.path}`,
      this.subCategoryController.getAllSubCategories
    );
    this.router.get(
      `${this.path}/category/:categoryId`,
      this.subCategoryController.getSubCategoriesByCategoryId
    );
    this.router.get(
      `${this.path}/:id`,
      this.subCategoryController.getSubCategoryById
    );


    this.router.post(
      `${this.path}/create`,
      this.subCategoryController.createSubCategory
    );

    this.router.put(
      `${this.path}/:id`,
      this.subCategoryController.updateSubCategory
    );

    this.router.delete(
      `${this.path}/:id`,
      this.subCategoryController.deleteSubCategory
    );
  }
}
