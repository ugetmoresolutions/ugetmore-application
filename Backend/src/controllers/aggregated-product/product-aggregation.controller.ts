// controllers/aggregated-product/product-aggregation.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { IAggregatedProduct, IProductAggregationService, PRODUCT_AGGREGATION_SERVICE_TOKEN, ProductFilters } from "@/interfaces/aggregated-product/product/product-aggregation.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class ProductAggregationController {
  private productAggregationService: IProductAggregationService;

  constructor() {
    this.productAggregationService = Container.get(PRODUCT_AGGREGATION_SERVICE_TOKEN);
  }

  public getUnifiedProductsWithPriceAndStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      const paginatedResponse = await this.productAggregationService.getUnifiedProductsWithPriceAndStock(page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Unified products with price and stock fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };


   /**
   * FAST UNIVERSAL SEARCH - Combines all products with lightning-fast filtering
   */
  public getUniversalSearch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        search,
        category,
        subCategory,
        page = 1,
        limit = 12,
        sortBy = 'name-asc'
      } = req.query;

      const filters: ProductFilters = {
        search: search as string,
        category: category as string,
        subCategory: subCategory as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string
      };

      console.log(`🔍 Universal search request:`, filters);

      const paginatedResponse = await this.productAggregationService.getUniversalSearch(filters);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Universal search completed successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ Universal search error:', error);
      next(error);
    }
  };

  /**
   * Get search suggestions for autocomplete
   */
  public getSearchSuggestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { query, limit = 10 } = req.query;

      if (!query || (query as string).length < 2) {
        const response: CustomResponse<{
          products: Array<{ name: string; code: string; supplier: string }>;
          categories: string[];
          brands: string[];
        }> = {
          data: { products: [], categories: [], brands: [] },
          message: "Query too short for suggestions",
          error: false,
        };
        return res.status(200).json(response);
      }

      const suggestions = await this.productAggregationService.getSearchSuggestions(
        query as string, 
        parseInt(limit as string)
      );

      const response: CustomResponse<typeof suggestions> = {
        data: suggestions,
        message: "Search suggestions fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ Search suggestions error:', error);
      next(error);
    }
  };

   /**
   * Get merged categories from specified category methods
   */
  public getMergedCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.productAggregationService.getMergedCategories();

      const response: CustomResponse<typeof categories> = {
        data: categories,
        message: "Merged categories fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

    /**
   * ENHANCED: Get Amrod products with search and category filtering
   */
  public getAmrodProductsWithFilters = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        search,
        category,
        subCategory,
        page = 1,
        limit = 12,
        sortBy = 'name-asc'
      } = req.query;

      const filters = {
        search: search as string,
        category: category as string,
        subCategory: subCategory as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string
      };

      const paginatedResponse = await this.productAggregationService.getAmrodProductsWithFilters(filters);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Amrod products fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };


  /**
 * Get product by fullCode with lightning-fast response
 */
public getProductByFullCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullCode } = req.params;
    
    if (!fullCode) {
      throw new HttpException(400, "fullCode parameter is required");
    }

    console.log(`🔍 Looking up product by code: ${fullCode}`);
    const startTime = Date.now();
    
    const product = await this.productAggregationService.getProductByFullCode(fullCode);
    
    const endTime = Date.now();
    console.log(`✅ Product lookup completed in ${endTime - startTime}ms`);

    if (!product) {
      throw new HttpException(404, `Product with code '${fullCode}' not found`);
    }

    const response: CustomResponse<typeof product> = {
      data: product,
      message: "Product fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get related products for a given product
 */
public getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullCode } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    if (!fullCode) {
      throw new HttpException(400, "fullCode parameter is required");
    }

    console.log(`🔍 Finding related products for: ${fullCode}`);
    const startTime = Date.now();
    
    // First get the main product
    const mainProduct = await this.productAggregationService.getProductByFullCode(fullCode);
    
    if (!mainProduct) {
      throw new HttpException(404, `Product with code '${fullCode}' not found`);
    }

    // Then find related products
    const relatedProducts = await this.productAggregationService.getRelatedProducts(mainProduct, limit);
    
    const endTime = Date.now();
    console.log(`✅ Related products found: ${relatedProducts.length} in ${endTime - startTime}ms`);

    const response: CustomResponse<{
      mainProduct: IAggregatedProduct;
      relatedProducts: IAggregatedProduct[];
    }> = {
      data: {
        mainProduct,
        relatedProducts
      },
      message: "Related products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh product index (admin endpoint)
 */
// public refreshProductIndex = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     console.log('🔄 Manually refreshing product index...');
//     const startTime = Date.now();
    
//     await this.productAggregationService.refreshProductIndex();
    
//     const endTime = Date.now();
    
//     const response: CustomResponse<{ refreshTime: number }> = {
//       data: { refreshTime: endTime - startTime },
//       message: "Product index refreshed successfully",
//       error: false,
//     };

//     res.status(200).json(response);
    
//   } catch (error) {
//     next(error);
//   }
// };

  /**
   * Get Amrod categories for sidebar
   */
  public getAmrodCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.productAggregationService.getAmrodCategories();

      const response: CustomResponse<typeof categories> = {
        data: categories,
        message: "Amrod categories fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  // Add to ProductAggregationController class

/**
 * Get Parrot categories for analysis
 */
public getParrotCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getParrotCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Parrot categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};


// Add to ProductAggregationController class

/**
 * Get Parrot janitorial categories
 */
public getParrotJanitorialCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getParrotJanitorialCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Parrot janitorial categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot stationery categories
 */
public getParrotStationeryCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getParrotStationeryCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Parrot stationery categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot electronics categories
 */
public getParrotElectronicsCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getParrotElectronicsCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Parrot electronics categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot display solutions categories
 */
public getParrotDisplaySolutionsCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getParrotDisplaySolutionsCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Parrot display solutions categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

// Add to ProductAggregationController class

/**
 * Get Parrot janitorial products with filtering
 */
public getParrotJanitorialWithFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'name-asc'
    } = req.query;

    const filters = {
      search: search as string,
      category: category as string,
      subCategory: subCategory as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    const paginatedResponse = await this.productAggregationService.getParrotJanitorialWithFilter(filters);

    const response: CustomResponse<typeof paginatedResponse> = {
      data: paginatedResponse,
      message: "Parrot janitorial products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot stationery products with filtering
 */
public getParrotStationeryWithFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'name-asc'
    } = req.query;

    const filters = {
      search: search as string,
      category: category as string,
      subCategory: subCategory as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    const paginatedResponse = await this.productAggregationService.getParrotStationeryWithFilter(filters);

    const response: CustomResponse<typeof paginatedResponse> = {
      data: paginatedResponse,
      message: "Parrot stationery products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot electronics products with filtering
 */
public getParrotElectronicsWithFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'name-asc'
    } = req.query;

    const filters = {
      search: search as string,
      category: category as string,
      subCategory: subCategory as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    const paginatedResponse = await this.productAggregationService.getParrotElectronicsWithFilter(filters);

    const response: CustomResponse<typeof paginatedResponse> = {
      data: paginatedResponse,
      message: "Parrot electronics products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get Parrot display solutions products with filtering
 */
public getParrotDisplaySolutionsWithFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'name-asc'
    } = req.query;

    const filters = {
      search: search as string,
      category: category as string,
      subCategory: subCategory as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    const paginatedResponse = await this.productAggregationService.getParrotDisplaySolutionsWithFilter(filters);

    const response: CustomResponse<typeof paginatedResponse> = {
      data: paginatedResponse,
      message: "Parrot display solutions products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

  public getAmrodProductsWithPriceAndStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      const paginatedResponse = await this.productAggregationService.getAmrodProductsWithPriceAndStock(page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Amrod products with price and stock fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  public getParrotProductsWithPriceAndStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      const paginatedResponse = await this.productAggregationService.getParrotProductsWithPriceAndStock(page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Parrot products with price and stock fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  public getTarsusProductsWithPriceAndStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      const paginatedResponse = await this.productAggregationService.getTarsusProductsWithPriceAndStock(page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Tarsus products with price and stock fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };



  public clearProductCache = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      this.productAggregationService.clearCache();

      const response: CustomResponse<null> = {
        data: null,
        message: "Product cache cleared successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  // AMROD CODE LOOKUP METHODS
  public getAmrodProductByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        throw new HttpException(400, "Product code is required");
      }

      const product = await this.productAggregationService.getAmrodProductByCode(code);

      const response: CustomResponse<typeof product> = {
        data: product,
        message: "Amrod product fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  public searchAmrodProductsByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { q: query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      if (!query || typeof query !== 'string') {
        throw new HttpException(400, "Search query is required");
      }

      const paginatedResponse = await this.productAggregationService.searchAmrodProductsByCode(query, page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Amrod products search completed successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  // PARROT CODE LOOKUP METHODS
  public getParrotProductByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        throw new HttpException(400, "Product code is required");
      }

      const product = await this.productAggregationService.getParrotProductByCode(code);

      const response: CustomResponse<typeof product> = {
        data: product,
        message: "Parrot product fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  public searchParrotProductsByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { q: query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      if (!query || typeof query !== 'string') {
        throw new HttpException(400, "Search query is required");
      }

      const paginatedResponse = await this.productAggregationService.searchParrotProductsByCode(query, page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Parrot products search completed successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  /**
 * Get Tarsus categories for sidebar
 */
public getTarsusCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await this.productAggregationService.getTarsusCategories();

    const response: CustomResponse<typeof categories> = {
      data: categories,
      message: "Tarsus categories fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};


/**
 * Get Tarsus products with search and category filtering
 */
public getTarsusProductsWithFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'name-asc'
    } = req.query;

    const filters = {
      search: search as string,
      category: category as string,
      subCategory: subCategory as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    const paginatedResponse = await this.productAggregationService.getTarsusProductsWithFilters(filters);

    const response: CustomResponse<typeof paginatedResponse> = {
      data: paginatedResponse,
      message: "Tarsus products fetched successfully",
      error: false,
    };

    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};
  // TARSUS CODE LOOKUP METHODS
  public getTarsusProductByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        throw new HttpException(400, "Product code is required");
      }

      const product = await this.productAggregationService.getTarsusProductByCode(code);

      const response: CustomResponse<typeof product> = {
        data: product,
        message: "Tarsus product fetched successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };

  

  public searchTarsusProductsByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { q: query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 12;
      
      if (!query || typeof query !== 'string') {
        throw new HttpException(400, "Search query is required");
      }

      const paginatedResponse = await this.productAggregationService.searchTarsusProductsByCode(query, page, pageSize);

      const response: CustomResponse<typeof paginatedResponse> = {
        data: paginatedResponse,
        message: "Tarsus products search completed successfully",
        error: false,
      };

      res.status(200).json(response);
      
    } catch (error) {
      next(error);
    }
  };
}