// routes/gradeStationery/gradeStationery.route.ts
import { Router } from "express";
import { GradeStationeryController } from "../../controllers/gradeStationery/gradeStationery.controller";
import { Routes } from "@/types/routes.interface";


export class GradeStationeryRoute implements Routes {
  public path = "/grade-stationery";
  public router = Router();
  public gradeStationeryController = new GradeStationeryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get stationery by grade ID

    // NEW: Get stationery with products and collections
    this.router.get(
      `${this.path}/grade/:gradeId/with-products`,
      this.gradeStationeryController.getStationeryWithProducts
    );

    // NEW: Search stationery products
    this.router.get(
      `${this.path}/grade/:gradeId/search`,
      this.gradeStationeryController.searchStationeryProducts
    );
    this.router.get(
      `${this.path}/grade/:gradeId`,
      this.gradeStationeryController.getStationeryByGrade
    );

    // Get stationery with file by grade ID
    this.router.get(
      `${this.path}/grade/:gradeId/with-file`,
      this.gradeStationeryController.getStationeryWithFile
    );

    // Create new stationery
    this.router.post(
      `${this.path}`,
      this.gradeStationeryController.createStationery
    );

    // Update stationery by ID
    this.router.put(
      `${this.path}/:id`,
      this.gradeStationeryController.updateStationery
    );

    // Update stationery by grade ID
    this.router.put(
      `${this.path}/grade/:gradeId`,
      this.gradeStationeryController.updateStationeryByGrade
    );

    // Delete stationery by ID
    this.router.delete(
      `${this.path}/:id`,
      this.gradeStationeryController.deleteStationery
    );

    // Add items to stationery
    this.router.post(
      `${this.path}/grade/:gradeId/items`,
      this.gradeStationeryController.addItemsToStationery
    );

    // Update item quantity
    this.router.put(
      `${this.path}/grade/:gradeId/items/:productCode/quantity`,
      this.gradeStationeryController.updateItemQuantity
    );

    // Remove item from stationery
    this.router.delete(
      `${this.path}/grade/:gradeId/items/:productCode`,
      this.gradeStationeryController.removeItemFromStationery
    );

    // Clear all items from stationery
    this.router.delete(
      `${this.path}/grade/:gradeId/items`,
      this.gradeStationeryController.clearStationery
    );

    // Bulk update stationery items (replace all)
    this.router.put(
      `${this.path}/grade/:gradeId/items/bulk`,
      this.gradeStationeryController.bulkUpdateStationeryItems
    );

    // Update file URL
    this.router.put(
      `${this.path}/grade/:gradeId/file`,
      this.gradeStationeryController.updateFileUrl
    );

    // Upload stationery file
    

    // Remove stationery file
    this.router.delete(
      `${this.path}/grade/:gradeId/file`,
      this.gradeStationeryController.removeStationeryFile
    );

    // Validate stationery items
    this.router.post(
      `${this.path}/validate-items`,
      this.gradeStationeryController.validateStationeryItems
    );

    // Get all stationeries (if needed)
    this.router.get(
      `${this.path}`,
      // You might want to implement this method in controller
      // this.gradeStationeryController.getAllStationeries
    );
  }
}