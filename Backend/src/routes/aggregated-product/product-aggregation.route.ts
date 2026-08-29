// routes/aggregated-product/product-aggregation.route.ts
import { Router } from "express";
import { ProductAggregationController } from "@/controllers/aggregated-product/product-aggregation.controller";
import { Routes } from "@/types/routes.interface";

export class ProductAggregationRoute implements Routes {
  public path = "/aggregated-products";
  public router = Router();
  public controller = new ProductAggregationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/`,
      this.controller.getUnifiedProductsWithPriceAndStock
    );

    this.router.get(
      `${this.path}/amrod`,
      this.controller.getAmrodProductsWithPriceAndStock
    );

    this.router.get(
      `${this.path}/parrot`,
      this.controller.getParrotProductsWithPriceAndStock
    );

    // ENHANCED: Tarsus products with search and category filtering
    this.router.get(
      `${this.path}/tarsus/filtered`,
      this.controller.getTarsusProductsWithFilters
    );

    // Get Tarsus categories for sidebar
    this.router.get(
      `${this.path}/tarsus/categories`,
      this.controller.getTarsusCategories
    );

    // Lightning-fast product lookup by fullCode
    this.router.get(
      `${this.path}/code/:fullCode`,
      this.controller.getProductByFullCode
    );

    // Get related products
    this.router.get(
      `${this.path}/code/:fullCode/related`,
      this.controller.getRelatedProducts
    );

    this.router.get(
      `${this.path}/tarsus`,
      this.controller.getTarsusProductsWithPriceAndStock
    );

    // ENHANCED: Amrod products with search and category filtering
    this.router.get(
      `${this.path}/amrod/filtered`,
      this.controller.getAmrodProductsWithFilters
    );

    // Get Amrod categories for sidebar
    this.router.get(
      `${this.path}/amrod/categories`,
      this.controller.getAmrodCategories
    );

    // Add to ProductAggregationRoute initializeRoutes method

    // Parrot category analysis
    this.router.get(
      `${this.path}/parrot/categories`,
      this.controller.getParrotCategories
    );

    // Parrot filtered categories
    this.router.get(
      `${this.path}/parrot/janitorial`,
      this.controller.getParrotJanitorialWithFilter
    );

    this.router.get(
      `${this.path}/parrot/stationery`,
      this.controller.getParrotStationeryWithFilter
    );

    // 🔥 FAST UNIVERSAL SEARCH ROUTES
    this.router.get(
      `${this.path}/search/universal`,
      this.controller.getUniversalSearch
    );

    this.router.get(
      `${this.path}/search/suggestions`,
      this.controller.getSearchSuggestions
    );

    this.router.get(
      `${this.path}/parrot/electronics`,
      this.controller.getParrotElectronicsWithFilter
    );

    // Merged categories endpoint
    this.router.get(
      `${this.path}/categories/merged`,
      this.controller.getMergedCategories
    );

    // Update ProductAggregationRoute initializeRoutes method

    // Parrot category analysis
    this.router.get(
      `${this.path}/parrot/categories`,
      this.controller.getParrotCategories
    );

    // Parrot filtered categories with their own category endpoints
    this.router.get(
      `${this.path}/parrot/janitorial/categories`,
      this.controller.getParrotJanitorialCategories
    );

    this.router.get(
      `${this.path}/parrot/janitorial`,
      this.controller.getParrotJanitorialWithFilter
    );

    this.router.get(
      `${this.path}/parrot/stationery/categories`,
      this.controller.getParrotStationeryCategories
    );

    this.router.get(
      `${this.path}/parrot/stationery`,
      this.controller.getParrotStationeryWithFilter
    );

    this.router.get(
      `${this.path}/parrot/electronics/categories`,
      this.controller.getParrotElectronicsCategories
    );

    this.router.get(
      `${this.path}/parrot/electronics`,
      this.controller.getParrotElectronicsWithFilter
    );

    this.router.get(
      `${this.path}/parrot/display-solutions/categories`,
      this.controller.getParrotDisplaySolutionsCategories
    );

    this.router.get(
      `${this.path}/parrot/display-solutions`,
      this.controller.getParrotDisplaySolutionsWithFilter
    );
    this.router.delete(`${this.path}/cache`, this.controller.clearProductCache);

    // FAST: Amrod code lookup routes
    this.router.get(
      `${this.path}/amrod/code/:code`,
      this.controller.getAmrodProductByCode
    );

    this.router.get(
      `${this.path}/amrod/search`,
      this.controller.searchAmrodProductsByCode
    );

    // FAST: Parrot code lookup routes
    this.router.get(
      `${this.path}/parrot/code/:code`,
      this.controller.getParrotProductByCode
    );

    this.router.get(
      `${this.path}/parrot/search`,
      this.controller.searchParrotProductsByCode
    );

    // FAST: Tarsus code lookup routes
    this.router.get(
      `${this.path}/tarsus/code/:code`,
      this.controller.getTarsusProductByCode
    );

    this.router.get(
      `${this.path}/tarsus/search`,
      this.controller.searchTarsusProductsByCode
    );
  }
}
