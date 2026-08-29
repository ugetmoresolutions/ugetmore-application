import { Router } from "express";
import { CategoryController } from "@/controllers/category/category.controller";
import { Routes } from "@/types/routes.interface";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";

export class CategoryRoute implements Routes {
  public path = "/categories";
  public router = Router();
  public categoryController = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Main Categories (GET only - static data)
    this.router.get(
      `${this.path}/main`,
      this.categoryController.getAllMainCategories
    );
    this.router.get(
      `${this.path}/main/:id`,
      this.categoryController.getMainCategoryById
    );

    // Hierarchical endpoints
    this.router.get(
      `${this.path}/hierarchy`,
      this.categoryController.getAllMainCategoriesWithHierarchy
    );
    this.router.get(
      `${this.path}/main-category/:mainCategoryId`,
      this.categoryController.getCategoriesByMainCategory
    );

    // Categories CRUD
    this.router.get(`${this.path}`, this.categoryController.getAllCategories);
    this.router.get(
      `${this.path}/:id`,
      this.categoryController.getCategoryById
    );

   
    this.router.post(
      `${this.path}/create`,
      this.categoryController.createCategory
    );

    this.router.put(`${this.path}/:id`, this.categoryController.updateCategory);

    this.router.delete(
      `${this.path}/:id`,
      this.categoryController.deleteCategory
    );
  }
}
