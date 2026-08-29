// services/aggregated-product/product-aggregated.service.ts
import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  IAmrodClientService,
  AMROD_CLIENT_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/amrod/amrod-client.service.interface";
import {
  IAmrodConfigService,
  AMROD_CONFIG_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/amrod/amrod-config.service.interface";
import {
  IParrotClientService,
  PARROT_CLIENT_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/parrot/parrot-client.service.interface";
import {
  ITarsusClientService,
  TARSUS_CLIENT_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/tarsus/tarsus-client.service.interface";
import {
  IProductAggregationService,
  PRODUCT_AGGREGATION_SERVICE_TOKEN,
  PaginatedResponse,
  ProductFilters,
  SidebarCategory,
  ICategory,
  IAggregatedProduct,
} from "@/interfaces/aggregated-product/product/product-aggregation.service.interface";
import { transformTarsusProductToAmrodStructure } from "@/utils/tarsus-transform";
import {
  IBrandingProductService,
  BRANDING_PRODUCT_SERVICE_TOKEN,
} from "@/interfaces/brandingProduct/brandingProduct.interface.service";
import {
  IProductService,
  PRODUCT_SERVICE_TOKEN,
} from "@/interfaces/product/product.service.interface";
import {
  FURNITURE_SERVICE_TOKEN,
  IFurnitureService,
} from "@/interfaces/furniture/furniture.service.interface";
import { FurnitureProductStatus, IFurnitureProduct } from "@/types/furniture/furniture.type";
import { CATEGORY_SERVICE_TOKEN, ICategoryService } from "@/interfaces/category/category.service.interface";
import { MainCategoryType } from "@/types/main-category/main-category.type";

@Service({ id: PRODUCT_AGGREGATION_SERVICE_TOKEN })
export class ProductAggregationService implements IProductAggregationService {
  private productsCache: any[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Indexes - ADD THESE 4 MAPS
  private productCodeIndex = new Map<string, IAggregatedProduct>();
  private variantCodeIndex = new Map<string, IAggregatedProduct>();
  private simpleCodeIndex = new Map<string, IAggregatedProduct>();
  private cleanCodeIndex = new Map<string, IAggregatedProduct>();

  private indexBuilt: boolean = false;

  // Separate caches for better performance
  private amrodCache: IAggregatedProduct[] | null = null;
  private parrotCache: IAggregatedProduct[] | null = null;
  private tarsusCache: IAggregatedProduct[] | null = null;
  private categoriesCache: ICategory[] | null = null;

  // === ADD THIS CONSTANT ===
  // Markup percentages by supplier and category
  private readonly MARKUP_PERCENTAGES = {
    amrod: 25, // 25% for Amrod
    tarsus: 15, // 15% for Tarsus
    parrot: {
      default: 25, // Default 25% for Parrot
      stationery: 25, // 25% for Stationery
      janitorial: 20, // 20% for Janitorial
      electronics: 25, // 25% for Electronics (default)
      "display-solutions": 25, // 25% for Display Solutions (default)
    },
  };

  constructor(
    @Inject(AMROD_CLIENT_SERVICE_TOKEN)
    private amrodClient: IAmrodClientService,

    @Inject(AMROD_CONFIG_SERVICE_TOKEN)
    private configService: IAmrodConfigService,

    @Inject(PARROT_CLIENT_SERVICE_TOKEN)
    private parrotClient: IParrotClientService,

    @Inject(TARSUS_CLIENT_SERVICE_TOKEN)
    private tarsusClient: ITarsusClientService,

    // Add branding product service
    @Inject(BRANDING_PRODUCT_SERVICE_TOKEN)
    private brandingProductService: IBrandingProductService,

    // ADD THIS: Inject the product service
    @Inject(PRODUCT_SERVICE_TOKEN) // Use your actual token
    private productService: IProductService,//This Products are Internal Stationery Products

    // ADD FURNITURE SERVICE INJECTION
    @Inject(FURNITURE_SERVICE_TOKEN)
    private furnitureService: IFurnitureService,

    @Inject(CATEGORY_SERVICE_TOKEN)
    private categoryService: ICategoryService,
  ) {
    // Build index after a short delay on startup
    setTimeout(() => {
      this.buildProductCodeIndex().catch(console.error);
    }, 5000); // Wait 5 seconds after service starts
  }

  /**
   * Calculate markup price based on supplier and category
   */
  private calculateMarkupPrice(
    originalPrice: number,
    supplier: string,
    product?: any
  ): number {
    let markupPercentage: number;

    switch (supplier) {
      case "amrod":
        markupPercentage = this.MARKUP_PERCENTAGES.amrod;
        break;
      case "tarsus":
        markupPercentage = this.MARKUP_PERCENTAGES.tarsus;
        break;
      case "parrot":
        // For Parrot, determine category-specific markup
        markupPercentage = this.getParrotMarkupPercentage(product);
        break;
      default:
        markupPercentage = 25; // Default fallback
    }

    const markupMultiplier = 1 + markupPercentage / 100;
    const markedUpPrice = originalPrice * markupMultiplier;
    return Math.round(markedUpPrice * 100) / 100;
  }


  private transformFurnitureProductToAggregated(furnitureProduct: IFurnitureProduct): IAggregatedProduct {
  // Transform main images
  const images = furnitureProduct.mainImages.map((img, index) => ({
    name: `main-${index}`,
    isDefault: index === 0,
    urls: [{
      url: img.url,
      width: 400, // You might want to get actual dimensions if available
      height: 400
    }],
    hasLogo: false,
    angle: null,
    type: 'main'
  }));

  // Transform color images if available
  const colourImages = furnitureProduct.colorImages?.map(colorImg => ({
    color: colorImg.name,
    colorCode: colorImg.code,
    images: colorImg.images.map(img => ({
      url: img.url,
      width: 400,
      height: 400
    }))
  })) || [];

  // Transform categories
  const categories = furnitureProduct.categories.map((category, index) => ({
    id: index + 1, // Generate sequential ID since furniture doesn't have category IDs
    name: category,
    path: category.toLowerCase().replace(/\s+/g, '-'),
    code: category.substring(0, 3).toUpperCase(),
    image: '' // Furniture categories don't have images
  }));

  // Transform variants based on sizes and colors
  const variants = furnitureProduct.sizes.map(size => ({
    simpleCode: `${furnitureProduct.sku}-${size}`,
    fullCode: `${furnitureProduct.sku}-${size}`,
    codeColour: null, // Furniture doesn't have color codes in the same way
    codeColourName: null,
    codeSize: size,
    codeSizeName: size,
    categorisedAttribute: [],
    packagingAndDimension: {
      cartonSizeDimensionL: furnitureProduct.dimensions?.length || 0,
      cartonSizeDimensionW: furnitureProduct.dimensions?.width || 0,
      cartonSizeDimensionH: furnitureProduct.dimensions?.height || 0,
      piecesPerCarton: 1,
      cartonWeight: furnitureProduct.weight || 0
    },
    productDimension: {
      length: furnitureProduct.dimensions?.length || 0,
      width: furnitureProduct.dimensions?.width || 0,
      weight: furnitureProduct.weight || 0
    },
    isLogo24: false,
    components: null
  }));

  // If no sizes, create a default variant
  if (variants.length === 0) {
    variants.push({
      simpleCode: furnitureProduct.sku,
      fullCode: furnitureProduct.sku,
      codeColour: null,
      codeColourName: null,
      codeSize: null,
      codeSizeName: null,
      categorisedAttribute: [],
      packagingAndDimension: {
        cartonSizeDimensionL: furnitureProduct.dimensions?.length || 0,
        cartonSizeDimensionW: furnitureProduct.dimensions?.width || 0,
        cartonSizeDimensionH: furnitureProduct.dimensions?.height || 0,
        piecesPerCarton: 1,
        cartonWeight: furnitureProduct.weight || 0
      },
      productDimension: {
        length: furnitureProduct.dimensions?.length || 0,
        width: furnitureProduct.dimensions?.width || 0,
        weight: furnitureProduct.weight || 0
      },
      isLogo24: false,
      components: null
    });
  }

  // Create keywords from product information
  const keywords = [
    furnitureProduct.title,
    furnitureProduct.brand,
    ...furnitureProduct.categories,
    ...furnitureProduct.subCategories,
    furnitureProduct.material,
    furnitureProduct.dimensions?.unit
  ].filter(Boolean).join(', ');

  const aggregatedProduct: IAggregatedProduct = {
    // Core identification
    simpleCode: furnitureProduct.sku,
    fullCode: furnitureProduct.sku, // Using SKU as fullCode for furniture
    supplier: furnitureProduct.supplierName,

    // Product information
    productName: furnitureProduct.title,
    description: furnitureProduct.description,
    brand: furnitureProduct.brand ? {
      name: furnitureProduct.brand,
      brandWebsiteLogo: '', // Furniture brands don't have logos
      code: furnitureProduct.brand.substring(0, 3).toUpperCase()
    } : null,

    // Categories and classification
    categories: categories,
    gender: null, // Furniture doesn't have gender
    material: furnitureProduct.material || '',
    fit: '', // Furniture doesn't have fit
    feature: '', // You could extract features from description if needed

    // Pricing
    originalPrice: furnitureProduct.price,
    price: furnitureProduct.price,

    // Inventory and quantities
    minimum: furnitureProduct.minQuantity,
    maximum: furnitureProduct.maxQuantity,
    incrementedBy: 1,
    
    // Stock information
    stockInfo: {
      colourCode: null,
      fullCode: furnitureProduct.sku,
      incomingStock: null,
      modifiedDate: furnitureProduct.updatedAt.toISOString(),
      reservedStock: 0,
      simpleCode: furnitureProduct.sku,
      stock: furnitureProduct.stockQuantity,
      stockType: 1
    },
    isAvailable: furnitureProduct.status === 'Active',

    // Media
    images: images,
    videos: [],
    colourImages: colourImages,

    // Variants
    variants: variants,

    // Branding (furniture typically doesn't have branding positions)
    brandings: [],
    isLogo24: false,
    logo24Branding: null,
    inclusiveBranding: null,
    requiredBrandingPositions: [],
    noCoBrandingPositions: null,
    brandingTemplates: [],

    // Product behavior
    inventoryType: 'physical',
    behaviour: 'standard',
    madeToOrder: 'no',
    madeToOrderMessage: '',
    displayCountryOfOrigin: '',

    // Metadata
    keywords: keywords,
    tags: furnitureProduct.categories.join(', '),
    promotion: '',
    fullBrandingGuide: '',
    logo24BrandingGuide: null,

    // Relationships
    companionCodes: null,
    relatedCodes: [],
    matchingCodes: [],
    groupingCodes: [],
    groupingCodeGiftsets: null,

    // Technical
    categorisedAttribute: [], // Furniture doesn't have categorized attributes
    decoupled: false,
    type: 'furniture',

    // Flags for filtering
    isInternalProduct: true,
    isBrandingProduct: false,
    isDisplaySolution: false
  };

  return aggregatedProduct;
}

/**
 * Fetch Furniture data and transform to aggregated format
 */
private async fetchFurnitureData(): Promise<IAggregatedProduct[]> {
  try {
    const furnitureResult = await this.furnitureService.getAllFurnitureProducts({
      page: 1,
      pageSize: 1000, // Get all furniture products
      status: 'Active' as FurnitureProductStatus
    });

    console.log(`🪑 Furniture products fetched: ${furnitureResult.products.length}`);

    // Transform furniture products to aggregated format
    const transformedProducts = furnitureResult.products.map(product => 
      this.transformFurnitureProductToAggregated(product)
    );

    return transformedProducts;
  } catch (error) {
    console.error('Error fetching furniture data:', error);
    return [];
  }
}

  // === ADD THESE NEW METHODS AFTER calculateMarkupPrice ===

  /**
   * Get Parrot-specific markup percentage based on category
   */
  private getParrotMarkupPercentage(product?: any): number {
    if (!product) {
      return this.MARKUP_PERCENTAGES.parrot.default;
    }

    // Check if product belongs to janitorial category
    if (this.isParrotJanitorialProduct(product)) {
      return this.MARKUP_PERCENTAGES.parrot.janitorial;
    }

    // Check if product belongs to stationery category
    if (this.isParrotStationeryProduct(product)) {
      return this.MARKUP_PERCENTAGES.parrot.stationery;
    }

    // Default Parrot markup
    return this.MARKUP_PERCENTAGES.parrot.default;
  }

  /**
   * Get internal products and merge them with Parrot stationery
   */
  private async fetchInternalProducts(): Promise<IAggregatedProduct[]> {
    try {
      const internalProductsResponse = await this.productService.getAllProducts(
        {}
      );
      const internalProducts = internalProductsResponse.products;

      // Get ALL products that have categories/subcategories (they use the same stationery categories)
      const stationeryProducts = internalProducts.filter((product) => {
        const hasCategories = (product.categories || []).length > 0;
        const hasSubCategories = (product.subCategories || []).length > 0;
        return hasCategories || hasSubCategories;
      });

      console.log(
        `🔄 Found ${stationeryProducts.length} internal products to merge with Parrot stationery`
      );

      return stationeryProducts.map((product) =>
        this.transformInternalToParrotStationery(product)
      );
    } catch (error) {
      console.error("Error fetching internal products:", error);
      return [];
    }
  }



/**
 * Transform internal categories to Parrot sidebar format
 */
private transformInternalToParrotFormat(
  internalCategories: any[]
): {
  mainCategories: string[];
  categoriesWithSubs: SidebarCategory[];
} {
  const mainCategories = new Set<string>();
  const categoriesWithSubs: SidebarCategory[] = [];

  // Add "All" category
  categoriesWithSubs.push({ name: "All", subCategories: null });

  // Process each internal category
  internalCategories.forEach((category) => {
    const mainCategoryName = category.name || "Uncategorized";
    mainCategories.add(mainCategoryName);

    // Get subcategories if they exist
    const subCategories = category.subCategories?.map(
      (sub: any) => sub.name
    ) || null;

    categoriesWithSubs.push({
      name: mainCategoryName,
      subCategories: subCategories,
    });
  });

  return {
    mainCategories: Array.from(mainCategories),
    categoriesWithSubs,
  };
}




  /**
   * Transform internal stationery product to Parrot stationery format
   */
  private transformInternalToParrotStationery(
    product: any
  ): IAggregatedProduct {
    // Create the EXACT same category structure as Parrot products
    const parrotCategories = this.createParrotCategoryStructure(
      product.categories || [],
      product.subCategories || []
    );

    const originalPrice = Number(product.price) || 0;
    const markedUpPrice = this.calculateMarkupPrice(originalPrice, "parrot");

    const images = (product.mainImages || []).map((img: any) => ({
      name: "Main Image",
      isDefault: true,
      urls: [{ url: img.url || img, width: 400, height: 400 }],
      hasLogo: false,
      angle: null,
      type: "main",
    }));

    return {
      simpleCode: product.sku,
      fullCode: product.sku,
      productName: product.title,
      description: product.description,
      categories: parrotCategories,
      brand: {
        name: product.brand || "Unknown brand",
        brandWebsiteLogo: "",
        code: "parrot",
      },
      images: images,
      colourImages: [],
      material: "",
      fit: "",
      feature: "",
      minimum: Number(product.minQuantity) || 1,
      maximum: Number(product.stockQuantity) || 24,
      incrementedBy: 1,
      keywords: product.title || "",
      tags: (product.subCategories || []).join(", "),
      inventoryType: "standard",
      behaviour: "standard",
      madeToOrder: "No",
      madeToOrderMessage: "",
      displayCountryOfOrigin: "",
      promotion: "",
      brandings: [],
      isLogo24: false,
      logo24Branding: null,
      inclusiveBranding: [],
      variants: [
        {
          simpleCode: product.sku,
          fullCode: product.sku,
          codeColour: "default",
          codeColourName: "Default",
          codeSize: "default",
          codeSizeName: "Default",
          categorisedAttribute: null,
          packagingAndDimension: {
            cartonSizeDimensionL: 0,
            cartonSizeDimensionW: 0,
            cartonSizeDimensionH: 0,
            piecesPerCarton: 1,
            cartonWeight: 0,
          },
          productDimension: {
            length: 0,
            width: 0,
            weight: 0,
          },
          isLogo24: false,
          components: null,
        },
      ],
      originalPrice: originalPrice,
      price: markedUpPrice,
      stockInfo: {
        colourCode: null,
        fullCode: product.sku,
        incomingStock: null,
        modifiedDate: product.updatedAt || new Date().toISOString(),
        reservedStock: 0,
        simpleCode: product.sku,
        stock: Number(product.stockQuantity) || 0,
        stockType: 0,
      },
      isAvailable:
        (Number(product.stockQuantity) || 0) > 0 && product.status === "Active",
      supplier: "parrot",
      isInternalProduct: true,
    } as IAggregatedProduct;
  }

  /**
   * Create Parrot category structure matching the exact format
   */
  private createParrotCategoryStructure(
    categories: string[],
    subCategories: string[]
  ): any[] {
    // Use the first category as main category, or default to "Office Supplies"
    const mainCategory = categories[0] || "Office Supplies";

    // Use the first subcategory, or empty string if none
    const subCategory = subCategories[0] || "";

    // Create the EXACT same structure as Parrot products
    // Example: "Accessories > Dusters - Wood Chalk Board"
    const categoryPath = subCategory
      ? `${mainCategory} > ${subCategory}`
      : mainCategory;

    return [
      {
        name: mainCategory,
        path: categoryPath,
        code: `parrot_0`,
        image: "",
      },
      {
        name: subCategory,
        path: categoryPath,
        code: `parrot_1`,
        image: "",
      },
    ];
  }

  /**
   * Check if Parrot product belongs to janitorial category
   */
  private isParrotJanitorialProduct(product: any): boolean {
    return this.checkParrotProductCategory(product, "janitorial");
  }

  /**
   * Check if Parrot product belongs to stationery category
   */
  private isParrotStationeryProduct(product: any): boolean {
    return this.checkParrotProductCategory(product, "stationery");
  }

  /**
   * Generic method to check Parrot product category
   */
  private checkParrotProductCategory(
    product: any,
    categoryType: "janitorial" | "stationery"
  ): boolean {
    if (!product.categories || !product.categories.length) {
      return false;
    }

    const categoryMappings = {
      janitorial: [
        // Cleaning Chemicals
        "1.5 Litres Cleaning Chemicals",
        "25 Litres Cleaning Chemicals",
        "5 Litres Cleaning Chemicals",
        "Janitorial Cleaning Chemicals",
        "Pine Gel",

        // Cleaning Tools & Equipment
        "Brooms",
        "Brooms and Mops",
        "Buckets",
        "Cloths",
        "Dustbins",
        "Dusters - Wood Chalk Board",
        "Industrial Vacuum Cleaner",
        "Mops",
        "Refuse Bags",
        "Telescopic Cleaning Brush",
        "Telescopic Squeegee",
        "Telescopic Waterfed Poles",

        // Hygiene & Sanitation
        "Hand Sanitizers",
        "Hand Soap",
        "Dispensers",
        "Toilet Roll & Paper Hand Towel Dispenser Holders",
        "PMAT Urine Mat",

        // General Janitorial
        "Janitorial",
        "Personal Protective Equipment (PPE)",
      ],
      stationery: [
        // Writing Instruments
        "Highlighters",
        "Markers",
        "Permanent Markers",
        "Whiteboard Markers",

        // Office Supplies
        "Calculators",
        "Clipboards",
        "Craft Knives & Refills",
        "Drawing & Push Pins",
        "Erasers & Aqua Wipes",
        "Glue",
        "Guillotines",
        "Paper Grippers",
        "Paper Hole Punches",
        "Rulers",
        "Scissors",
        "Staplers",
        "Staplers and Punches",
        "Staples",

        // Binding & Laminating
        "Binding Machines and Binders",
        "Comb Binding Machines",
        "Laminating Machines",
        "Laminator Consumables",
        "Rotary Trimmers",

        // Paper Products
        "Flipchart Paper",

        // General Stationery
        "Office Equipment",
        "Office Equipment & Whiteboard Cleaner",
      ],
    };

    const targetCategories = categoryMappings[categoryType];

    return product.categories?.some((cat: any) => {
      const categoryName = cat.name?.trim();
      return targetCategories.some((targetCat) =>
        categoryName?.includes(targetCat.trim())
      );
    });
  }

  /**
   * Transform Parrot products in chunks to avoid blocking
   */
  private async transformParrotProductsInChunks(
    parrotProducts: any[]
  ): Promise<IAggregatedProduct[]> {
    const chunkSize = 500;
    const results: IAggregatedProduct[] = [];

    for (let i = 0; i < parrotProducts.length; i += chunkSize) {
      const chunk = parrotProducts.slice(i, i + chunkSize);
      const transformedChunk = chunk.map((product) =>
        this.transformParrotProductToAmrodStructure(product)
      );
      results.push(...transformedChunk);

      // Yield to event loop every few chunks to prevent blocking
      if (i > 0 && i % 2000 === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return results;
  }

  private transformParrotProductToAmrodStructure(
    parrotProduct: any
  ): IAggregatedProduct {
    const categoryPath =
      parrotProduct.PublishingCategory?.CategoryName || "Uncategorized";
    const categories = categoryPath
      .split(" > ")
      .map((cat: string, index: number) => ({
        name: cat,
        path: categoryPath,
        code: `parrot_${index}`,
        image: "",
      }));

    const primaryImage =
      parrotProduct.ProductImageLinks &&
      parrotProduct.ProductImageLinks.length > 0
        ? parrotProduct.ProductImageLinks[0]
        : "";

    const images = primaryImage
      ? [
          {
            name: "Main Image",
            isDefault: true,
            urls: [
              {
                url: primaryImage,
                width: 400,
                height: 400,
              },
            ],
            hasLogo: false,
            angle: null,
            type: "main",
          },
        ]
      : [];

    const totalStock = parrotProduct.TotalWarehouseStock || 0;
    const originalPrice = parrotProduct.CustomerPrice || 0;

    // === CHANGED: Calculate price with category-specific markup ===
    const markedUpPrice = this.calculateMarkupPrice(originalPrice, "parrot", {
      categories: categories,
    });

    return {
      simpleCode: parrotProduct.StockCode,
      fullCode: parrotProduct.StockCode,
      productName: parrotProduct.FriendlyTitle || parrotProduct.Description,
      description:
        parrotProduct.DetailedDescription || parrotProduct.Description,
      categories: categories,
      brand: {
        name: parrotProduct.Brand || "PARROT PRODUCTS",
        brandWebsiteLogo: "",
        code: "parrot",
      },
      images: images,
      colourImages: [],
      material: "",
      fit: "",
      feature: parrotProduct.MetaKeywords || "",
      minimum: 1,
      maximum: totalStock,
      incrementedBy: 1,
      keywords: parrotProduct.MetaKeywords || "",
      tags: parrotProduct.MetaKeywords || "",
      inventoryType: "standard",
      behaviour: "standard",
      madeToOrder: "No",
      madeToOrderMessage: "",
      displayCountryOfOrigin: "",
      promotion: "",
      brandings: [],
      isLogo24: false,
      logo24Branding: null,
      inclusiveBranding: [],
      variants: [
        {
          simpleCode: parrotProduct.StockCode,
          fullCode: parrotProduct.StockCode,
          codeColour: "default",
          codeColourName: "Default",
          codeSize: "default",
          codeSizeName: "Default",
          categorisedAttribute: null,
          packagingAndDimension: {
            cartonSizeDimensionL: parrotProduct.ProductDimensions?.Length || 0,
            cartonSizeDimensionW: parrotProduct.ProductDimensions?.Width || 0,
            cartonSizeDimensionH: parrotProduct.ProductDimensions?.Height || 0,
            piecesPerCarton: 1,
            cartonWeight: parrotProduct.ProductDimensions?.Mass || 0,
          },
          productDimension: {
            length: parrotProduct.ProductDimensions?.Length || 0,
            width: parrotProduct.ProductDimensions?.Width || 0,
            weight: parrotProduct.ProductDimensions?.Mass || 0,
          },
          isLogo24: false,
          components: null,
        },
      ],
      requiredBrandingPositions: [],
      noCoBrandingPositions: [],
      brandingTemplates: [],
      decoupled: false,
      type: "physical",
      companionCodes: [],
      relatedCodes: [],
      matchingCodes: [],
      groupingCodes: [],
      groupingCodeGiftsets: [],
      originalPrice: originalPrice,
      price: markedUpPrice, // === CHANGED: Use the category-specific marked up price ===
      stockInfo: {
        colourCode: null,
        fullCode: parrotProduct.StockCode,
        incomingStock: null,
        modifiedDate: new Date().toISOString(),
        reservedStock: 0,
        simpleCode: parrotProduct.StockCode,
        stock: totalStock,
        stockType: 0,
      },
      isAvailable: totalStock > 0,
      supplier: "parrot",
    } as IAggregatedProduct;
  }

  /**
   * Transform Tarsus products in chunks to avoid blocking
   */
  private async transformTarsusProductsInChunks(
    tarsusProducts: any[]
  ): Promise<IAggregatedProduct[]> {
    const chunkSize = 500;
    const results: IAggregatedProduct[] = [];

    for (let i = 0; i < tarsusProducts.length; i += chunkSize) {
      const chunk = tarsusProducts.slice(i, i + chunkSize);
      const transformedChunk = chunk.map((product) => {
        const transformed = transformTarsusProductToAmrodStructure(product);
        // Apply Tarsus-specific markup
        const originalPrice = transformed.originalPrice || 0;
        transformed.price = this.calculateMarkupPrice(originalPrice, "tarsus");
        return transformed;
      });
      results.push(...transformedChunk);

      if (i > 0 && i % 2000 === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return results;
  }

  /**
   * Get merged categories from the specified category methods only
   */
  public async getMergedCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
    categoryBreakdown: {
      amrod: number;
      tarsus: number;
      parrotStationery: number;
      parrotJanitorial: number;
    };
  }> {
    try {
      console.log("🔄 Fetching merged categories from specified methods...");

      // Fetch only the specific categories you named
      const [
        amrodCategories,
        tarsusCategories,
        parrotStationeryCategories,
        parrotJanitorialCategories,
      ] = await Promise.all([
        this.getAmrodCategories(),
        this.getTarsusCategories(),
        this.getParrotStationeryCategories(),
        this.getParrotJanitorialCategories(),
      ]);

      // Merge the categories
      const mergedCategories = this.mergeSelectedCategories({
        amrod: amrodCategories,
        tarsus: tarsusCategories,
        parrotStationery: parrotStationeryCategories,
        parrotJanitorial: parrotJanitorialCategories,
      });

      console.log(
        `✅ Merged categories: ${mergedCategories.mainCategories.length} main categories loaded`
      );

      return mergedCategories;
    } catch (error) {
      console.error("Error fetching merged categories:", error);
      // Fallback to sequential fetching
      return this.getMergedCategoriesFallback();
    }
  }

  /**
   * Merge only the selected categories
   */
  private mergeSelectedCategories(categories: {
    amrod: { mainCategories: string[]; categoriesWithSubs: SidebarCategory[] };
    tarsus: { mainCategories: string[]; categoriesWithSubs: SidebarCategory[] };
    parrotStationery: {
      mainCategories: string[];
      categoriesWithSubs: SidebarCategory[];
    };
    parrotJanitorial: {
      mainCategories: string[];
      categoriesWithSubs: SidebarCategory[];
    };
  }): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
    categoryBreakdown: any;
  } {
    const allMainCategories = new Set<string>();
    const allCategoriesWithSubs = new Map<string, SidebarCategory>();

    // Helper to add categories to the unified structure
    const addCategories = (
      categoryData: {
        mainCategories: string[];
        categoriesWithSubs: SidebarCategory[];
      },
      prefix: string = ""
    ) => {
      categoryData.categoriesWithSubs.forEach((cat) => {
        if (cat.name === "All") return; // Skip "All" categories from individual sets

        const categoryName = prefix ? `${prefix} ${cat.name}` : cat.name;

        if (!allCategoriesWithSubs.has(categoryName)) {
          allCategoriesWithSubs.set(categoryName, {
            name: categoryName,
            subCategories: cat.subCategories ? [...cat.subCategories] : null,
          });
        } else {
          // Merge subcategories if they exist
          const existing = allCategoriesWithSubs.get(categoryName)!;
          if (cat.subCategories && existing.subCategories) {
            const mergedSubs = new Set([
              ...existing.subCategories,
              ...cat.subCategories,
            ]);
            existing.subCategories = Array.from(mergedSubs).sort();
          } else if (cat.subCategories && !existing.subCategories) {
            existing.subCategories = [...cat.subCategories].sort();
          }
        }

        allMainCategories.add(categoryName);
      });
    };

    // Add Amrod categories with prefix
    addCategories(categories.amrod);

    // Add Tarsus categories with prefix
    addCategories(categories.tarsus);

    // Add specialized Parrot categories without prefix to maintain existing structure
    addCategories(categories.parrotStationery);
    addCategories(categories.parrotJanitorial);

    // Convert to arrays and sort
    const mainCategories = Array.from(allMainCategories).sort();
    const categoriesWithSubs: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    // Add categories in alphabetical order
    mainCategories.forEach((categoryName) => {
      const category = allCategoriesWithSubs.get(categoryName);
      if (category) {
        categoriesWithSubs.push(category);
      }
    });

    // Count categories for breakdown
    const categoryBreakdown = {
      amrod: categories.amrod.mainCategories.length,
      tarsus: categories.tarsus.mainCategories.length,
      parrotStationery: categories.parrotStationery.mainCategories.length,
      parrotJanitorial: categories.parrotJanitorial.mainCategories.length,
    };

    return {
      mainCategories,
      categoriesWithSubs,
      categoryBreakdown,
    };
  }

  /**
   * Fallback method if parallel fetching fails
   */
  private async getMergedCategoriesFallback(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
    categoryBreakdown: any;
  }> {
    console.log("🔄 Using fallback method for merged categories...");

    // Fetch categories sequentially
    const amrodCategories = await this.getAmrodCategories();
    const tarsusCategories = await this.getTarsusCategories();
    const parrotStationeryCategories =
      await this.getParrotStationeryCategories();
    const parrotJanitorialCategories =
      await this.getParrotJanitorialCategories();

    return this.mergeSelectedCategories({
      amrod: amrodCategories,
      tarsus: tarsusCategories,
      parrotStationery: parrotStationeryCategories,
      parrotJanitorial: parrotJanitorialCategories,
    });
  }

  // Add this method to ProductAggregationService
  private async fetchBrandingData(): Promise<any[]> {
    try {
      const brandingProducts =
        await this.brandingProductService.getAllBrandingProducts();

      // Simple transformation - just add the missing stockInfo field and mark as amrod
      return brandingProducts.map((product) => {
        const originalPrice = product.price || 0;
        const markedUpPrice = this.calculateMarkupPrice(originalPrice, "amrod");
        return {
          ...product,
          stockInfo: {
            colourCode: null,
            fullCode: product.fullCode,
            incomingStock: null,
            modifiedDate: product.updatedAt || new Date().toISOString(),
            reservedStock: 0,
            simpleCode: product.simpleCode,
            stock: product.stock || 0, // Use the stock field from your response
            stockType: 0,
          },
          isAvailable: (product.stock || 0) > 0,
          supplier: "amrod", // Mark them as amrod so they appear as one
          originalPrice: originalPrice,
          price: markedUpPrice,
          isBrandingProduct: true,
        };
      }) as any[];
    } catch (error) {
      console.error("Error fetching Branding data:", error);
      return [];
    }
  }

  /**
   * Find price with VARIANT-AWARE matching - FIXED VERSION
   */
  private findPriceWithVariantAwareMatching(
    fullCode: string,
    simpleCode: string,
    priceMap: Map<string, any>
  ): any {
    if (!fullCode && !simpleCode) return null;

    const searchCode = fullCode || simpleCode;

    const strategies = [
      // Strategy 1: Exact match
      { name: "Exact Match", key: searchCode },

      // Strategy 2: Cleaned match (remove special chars)
      {
        name: "Cleaned Match",
        key: searchCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      },

      // Strategy 3: Base product match (remove size indicators)
      {
        name: "Base Product Match",
        key: this.extractBaseProductCode(searchCode),
      },

      // Strategy 4: Find any variant price
      {
        name: "Variant Match",
        key: this.findAnyVariantPrice(searchCode, priceMap),
      },
    ];

    for (const strategy of strategies) {
      if (strategy.key && priceMap.has(strategy.key)) {
        const price = priceMap.get(strategy.key);

        return price;
      }
    }

    return null;
  }

  /**
   * Extract base product code by removing size indicators
   */
  private extractBaseProductCode(productCode: string): string {
    if (!productCode) return productCode;

    // Common size indicators to remove from the end
    const sizeIndicators = [
      "-S$",
      "-M$",
      "-L$",
      "-XL$",
      "-XXL$",
      "-XXXL$",
      "-32$",
      "-34$",
      "-36$",
      "-38$",
      "-40$",
      "-42$",
      "-44$",
      "-46$",
    ];

    let baseCode = productCode;

    // Remove size indicators from the end
    for (const size of sizeIndicators) {
      const regex = new RegExp(size.replace("$", "") + "$");
      if (regex.test(baseCode)) {
        baseCode = baseCode.replace(regex, "");
        break;
      }
    }

    return baseCode !== productCode ? baseCode : productCode;
  }

  /**
   * Find any variant price for a base product
   */
  private findAnyVariantPrice(
    baseCode: string,
    priceMap: Map<string, any>
  ): string | null {
    // Look for any price that starts with the base code
    for (const [priceCode, price] of priceMap.entries()) {
      if (priceCode.startsWith(baseCode + "-") || priceCode === baseCode) {
        return priceCode;
      }
    }

    return null;
  }
  /**
   * Fetch Amrod data with fresh branding products
   */
  private async fetchAmrodData(): Promise<IAggregatedProduct[]> {
    // If we have cache, return it but with fresh branding data
    if (this.amrodCache) {
      const cachedAmrodProducts = this.amrodCache;
      const freshBrandingProducts = await this.fetchBrandingData();

      // Filter out old branding products and add fresh ones
      const nonBrandingProducts = cachedAmrodProducts.filter(
        (p) => !p.isBrandingProduct
      );
      return [...nonBrandingProducts, ...freshBrandingProducts];
    }

    try {
      console.log("🔄 Starting Amrod data fetch sequence...");

      // STEP 1: First fetch ALL products (both endpoints)
      const [productsWithBranding, productsFromEndpoint] = await Promise.all([
        this.amrodClient.getProducts(), // Products with branding
        this.amrodClient.getProductsFromProductsEndpoint(), // Products from /api/v1/Products
      ]);

      console.log(
        `📦 Amrod products fetched: ${productsWithBranding.length} with branding, ${productsFromEndpoint.length} from products endpoint`
      );

      // STEP 2: Merge products first
      const mergedProducts = this.mergeAmrodProducts(
        productsWithBranding,
        productsFromEndpoint
      );

      console.log(
        `✅ Merged Amrod products: ${mergedProducts.length} unique products`
      );

      // STEP 3: Wait a brief moment to ensure API readiness
      await new Promise((resolve) => setTimeout(resolve, 500));

      // STEP 4: Now fetch prices and stock SEQUENTIALLY to ensure completeness
      console.log("💰 Fetching Amrod prices...");
      const prices = await this.amrodClient.getPrices();
      console.log(`✅ Prices fetched: ${prices.length} price entries`);

      // STEP 5: Wait briefly before fetching stock
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("📊 Fetching Amrod stock...");
      const stock = await this.amrodClient.getStock();
      console.log(`✅ Stock fetched: ${stock.length} stock entries`);

      // STEP 6: Process Amrod products with the fetched prices and stock
      const processedAmrodProducts = this.processAmrodProducts(
        mergedProducts,
        prices,
        stock
      );

      console.log(
        `🔧 Processed Amrod products: ${processedAmrodProducts.length} with prices and stock`
      );

      // STEP 7: Fetch fresh branding products
      const brandingProducts = await this.fetchBrandingData();

      // Combine Amrod products with fresh branding products
      const allAmrodProducts = [...processedAmrodProducts, ...brandingProducts];

      // STEP 8: DEBUG - Check missing products
      const productsWithoutPrices = processedAmrodProducts.filter(
        (p) => p.originalPrice === 0
      );
      if (productsWithoutPrices.length > 0) {
        const missingCodes = productsWithoutPrices
          .map((p) => (p.fullCode || p.simpleCode || "").trim().toUpperCase())
          .filter((code) => code);

        console.log(
          `🔍 DEBUG: Found ${missingCodes.length} products without prices`
        );

        // Run debug analysis
        await this.debugMissingProductsInEndpoint(missingCodes);
        await this.debugMissingProductsPrices(missingCodes, prices);
      }

      // Log matching statistics for debugging
      this.logPriceMatchingStats(processedAmrodProducts, prices);

      this.amrodCache = allAmrodProducts;
      return allAmrodProducts;
    } catch (error) {
      console.error("❌ Error fetching Amrod data:", error);

      // If prices failed but products succeeded, return products with fallback prices
      if (error.message?.includes("prices")) {
        console.warn(
          "⚠️ Prices fetch failed, returning products with zero prices as fallback"
        );
        return await this.getAmrodProductsWithFallbackPrices();
      }

      return [];
    }
  }
  /**
   * Debug method to check missing products in the products endpoint
   */
  private async debugMissingProductsInEndpoint(
    missingProductCodes: string[]
  ): Promise<void> {
    console.log("🔍 CHECKING MISSING PRODUCTS IN PRODUCTS ENDPOINT...");

    try {
      // Get all products from the products endpoint
      const productsFromEndpoint =
        await this.amrodClient.getProductsFromProductsEndpoint();

      console.log(
        `📦 Total products in endpoint: ${productsFromEndpoint.length}`
      );

      // Create a map for quick lookup
      const endpointProductMap = new Map();
      productsFromEndpoint.forEach((product) => {
        const fullCode = (product.fullCode || product.productCode || "")
          .trim()
          .toUpperCase();
        const simpleCode = (product.simpleCode || "").trim().toUpperCase();

        if (fullCode) endpointProductMap.set(fullCode, product);
        if (simpleCode && simpleCode !== fullCode)
          endpointProductMap.set(simpleCode, product);
      });

      console.log(`📊 Endpoint product map size: ${endpointProductMap.size}`);

      // Check each missing product
      let foundInEndpoint = 0;
      let notFoundInEndpoint = 0;

      const sampleMissing = missingProductCodes.slice(0, 20); // Check first 20

      sampleMissing.forEach((productCode) => {
        if (endpointProductMap.has(productCode)) {
          foundInEndpoint++;
        } else {
          notFoundInEndpoint++;

          // Check for similar codes in endpoint
          const similarCodes = Array.from(endpointProductMap.keys())
            .filter(
              (key) => key.includes(productCode) || productCode.includes(key)
            )
            .slice(0, 3);
        }
      });
    } catch (error) {
      console.error("Error debugging missing products:", error);
    }
  }

  /**
   * Debug method to check if missing products have prices in the price data
   */
  private async debugMissingProductsPrices(
    missingProductCodes: string[],
    prices: any[]
  ): Promise<void> {
    console.log("🔍 CHECKING PRICES FOR MISSING PRODUCTS...");

    // Create price map
    const priceMap = new Map();
    prices.forEach((price) => {
      const fullCode = (price.fullCode || "").trim().toUpperCase();
      const simpleCode = (price.simplecode || "").trim().toUpperCase();

      if (fullCode) priceMap.set(fullCode, price);
      if (simpleCode && simpleCode !== fullCode)
        priceMap.set(simpleCode, price);
    });

    // Check each missing product
    let foundPrices = 0;
    let notFoundPrices = 0;

    const sampleMissing = missingProductCodes.slice(0, 20); // Check first 20

    sampleMissing.forEach((productCode) => {
      if (priceMap.has(productCode)) {
        foundPrices++;
        const price = priceMap.get(productCode);
      } else {
        notFoundPrices++;

        // Check for similar price codes
        const similarPriceCodes = Array.from(priceMap.keys())
          .filter(
            (key) => key.includes(productCode) || productCode.includes(key)
          )
          .slice(0, 3);

        if (similarPriceCodes.length > 0) {
          // Show prices for similar codes
          similarPriceCodes.forEach((similarCode) => {
            const similarPrice = priceMap.get(similarCode);
          });
        }
      }
    });

    console.log(`📊 Price analysis for missing products:`);
    console.log(`   - With prices: ${foundPrices}/${sampleMissing.length}`);
    console.log(
      `   - Without prices: ${notFoundPrices}/${sampleMissing.length}`
    );
  }

  /**
   * Log price matching statistics for debugging
   */
  private logPriceMatchingStats(
    products: IAggregatedProduct[],
    prices: any[]
  ): void {
    const productsWithPrice = products.filter(
      (p) => p.originalPrice > 0
    ).length;
    const productsWithoutPrice = products.filter(
      (p) => p.originalPrice === 0
    ).length;

    console.log(`📊 Price Matching Summary:`);
    console.log(`   - Total products: ${products.length}`);
    console.log(`   - Products with prices: ${productsWithPrice}`);
    console.log(`   - Products without prices: ${productsWithoutPrice}`);
    console.log(`   - Price entries available: ${prices.length}`);
    console.log(
      `   - Match rate: ${((productsWithPrice / products.length) * 100).toFixed(
        2
      )}%`
    );

    // Log first few unmatched products for debugging
    if (productsWithoutPrice > 0) {
      const unmatched = products
        .filter((p) => p.originalPrice === 0)
        .slice(0, 5);
      console.log(
        "🔍 Sample unmatched products:",
        unmatched.map((p) => ({
          simpleCode: p.simpleCode,
          fullCode: p.fullCode,
          productName: p.productName,
        }))
      );
    }
  }

  /**
   * Fallback method to return Amrod products with zero prices when price fetch fails
   */
  private async getAmrodProductsWithFallbackPrices(): Promise<
    IAggregatedProduct[]
  > {
    try {
      const [productsWithBranding, productsFromEndpoint] = await Promise.all([
        this.amrodClient.getProducts(),
        this.amrodClient.getProductsFromProductsEndpoint(),
      ]);

      const mergedProducts = this.mergeAmrodProducts(
        productsWithBranding,
        productsFromEndpoint
      );

      const brandingProducts = await this.fetchBrandingData();

      // Process products with zero prices as fallback
      const processedProducts = mergedProducts.map((product) => {
        const normalizedProduct = this.normalizeAmrodProduct(product);
        const markedUpPrice = this.calculateMarkupPrice(0, "amrod");

        return {
          ...normalizedProduct,
          originalPrice: 0,
          price: markedUpPrice,
          stockInfo: {
            colourCode: null,
            fullCode: normalizedProduct.fullCode,
            incomingStock: null,
            modifiedDate: new Date().toISOString(),
            reservedStock: 0,
            simpleCode: normalizedProduct.simpleCode,
            stock: 0,
            stockType: 0,
          },
          isAvailable: false,
          supplier: "amrod",
        } as IAggregatedProduct;
      });

      return [...processedProducts, ...brandingProducts];
    } catch (error) {
      console.error("Error in fallback Amrod products:", error);
      return [];
    }
  }

  /**
   * Merge products from both Amrod endpoints using fullCode to remove duplicates
   */
  private mergeAmrodProducts(
    productsWithBranding: any[],
    productsFromEndpoint: any[]
  ): any[] {
    const productMap = new Map<string, any>();

    // Helper function to get product fullCode
    const getProductFullCode = (product: any) =>
      product.fullCode || product.productCode;

    // First add all products from branding endpoint
    productsWithBranding.forEach((product) => {
      const fullCode = getProductFullCode(product);
      if (fullCode) {
        productMap.set(fullCode, product);
      }
    });

    // Then add products from products endpoint, only if they don't exist
    productsFromEndpoint.forEach((product) => {
      const fullCode = getProductFullCode(product);
      if (fullCode && !productMap.has(fullCode)) {
        productMap.set(fullCode, product);
      }
    });

    console.log(
      `🔄 Amrod merge: ${productsWithBranding.length} + ${productsFromEndpoint.length} = ${productMap.size} unique products`
    );

    return Array.from(productMap.values());
  }

  /**
   * Create lookup maps with DEBUG information
   */
  private createDebugLookupMaps(prices: any[], stock: any[]) {
    const priceMap = new Map();
    const stockMap = new Map();

    console.log(`📊 BUILDING PRICE MAP from ${prices.length} price entries...`);

    // For prices, create entries for BOTH fullCode and simpleCode with normalization
    prices.forEach((price, index) => {
      const priceFullCode = price.fullCode
        ? price.fullCode.trim().toUpperCase()
        : null;
      const priceSimpleCode = price.simplecode
        ? price.simplecode.trim().toUpperCase()
        : null;

      if (priceFullCode) {
        priceMap.set(priceFullCode, price);
        // console.log(`   Price entry ${index}: ${priceFullCode} -> ${price.price}`);
      }

      if (priceSimpleCode && priceSimpleCode !== priceFullCode) {
        priceMap.set(priceSimpleCode, price);
        // console.log(`   Price entry ${index}: ${priceSimpleCode} -> ${price.price}`);
      }

      // Also try to match by removing any special characters or spaces
      if (priceFullCode) {
        const cleanCode = priceFullCode
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase();
        if (cleanCode && !priceMap.has(cleanCode)) {
          priceMap.set(cleanCode, price);
          // console.log(`   Price entry ${index}: ${cleanCode} (cleaned) -> ${price.price}`);
        }
      }
    });

    console.log(`📊 BUILDING STOCK MAP from ${stock.length} stock entries...`);

    // For stock, do the same normalization
    stock.forEach((stockItem) => {
      if (stockItem.fullCode) {
        const normalizedFullCode = stockItem.fullCode.trim().toUpperCase();
        stockMap.set(normalizedFullCode, stockItem);
      }

      if (stockItem.simpleCode && stockItem.simpleCode !== stockItem.fullCode) {
        const normalizedSimpleCode = stockItem.simpleCode.trim().toUpperCase();
        stockMap.set(normalizedSimpleCode, stockItem);
      }
    });

    console.log(`📊 FINAL MAP SIZES:`);
    console.log(`   - Price map: ${priceMap.size} entries`);
    console.log(`   - Stock map: ${stockMap.size} entries`);

    // Log sample of price map contents
    const samplePrices = Array.from(priceMap.entries()).slice(0, 5);
    console.log(
      `📊 SAMPLE PRICE MAP ENTRIES:`,
      samplePrices.map(([key, value]) => `${key} -> ${value.price}`)
    );

    return { priceMap, stockMap };
  }

  /**
   * Find price with detailed debugging
   */
  private findPriceWithDebug(
    fullCode: string,
    simpleCode: string,
    priceMap: Map<string, any>
  ): any {
    if (!fullCode && !simpleCode) return null;

    const strategies = [
      { name: "Full Code Exact", key: fullCode },
      { name: "Simple Code Exact", key: simpleCode },
      {
        name: "Full Code Cleaned",
        key: fullCode
          ? fullCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
          : null,
      },
      {
        name: "Simple Code Cleaned",
        key: simpleCode
          ? simpleCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
          : null,
      },
    ];

    for (const strategy of strategies) {
      if (strategy.key && priceMap.has(strategy.key)) {
        const price = priceMap.get(strategy.key);

        return price;
      }
    }

    return null;
  }

  /**
   * Find stock with debugging
   */
  private findStockWithDebug(
    fullCode: string,
    simpleCode: string,
    stockMap: Map<string, any>
  ): any {
    if (!fullCode && !simpleCode) return null;

    const strategies = [
      { name: "Full Code Exact", key: fullCode },
      { name: "Simple Code Exact", key: simpleCode },
    ];

    for (const strategy of strategies) {
      if (strategy.key && stockMap.has(strategy.key)) {
        return stockMap.get(strategy.key);
      }
    }

    return null;
  }

  /**
   * Debug similar prices in the map
   */
  private debugSimilarPrices(
    productCode: string,
    priceMap: Map<string, any>
  ): void {
    const similarKeys = Array.from(priceMap.keys())
      .filter((key) => key.includes(productCode) || productCode.includes(key))
      .slice(0, 3);

    if (similarKeys.length > 0) {
      console.log(
        `   🔎 Similar keys in price map for ${productCode}:`,
        similarKeys
      );
    }
  }

  /**
   * Analyze price data quality
   */
  private analyzePriceData(products: any[], prices: any[]): void {
    console.log("🔍 ANALYZING PRICE DATA QUALITY...");

    // Get all product codes
    const productCodes = new Set<string>();
    products.forEach((product) => {
      const fullCode = (product.fullCode || product.productCode || "")
        .trim()
        .toUpperCase();
      const simpleCode = (product.simpleCode || "").trim().toUpperCase();
      if (fullCode) productCodes.add(fullCode);
      if (simpleCode && simpleCode !== fullCode) productCodes.add(simpleCode);
    });

    // Get all price codes
    const priceCodes = new Set<string>();
    prices.forEach((price) => {
      const fullCode = (price.fullCode || "").trim().toUpperCase();
      const simpleCode = (price.simplecode || "").trim().toUpperCase();
      if (fullCode) priceCodes.add(fullCode);
      if (simpleCode && simpleCode !== fullCode) priceCodes.add(simpleCode);
    });

    // Find intersection
    const matchingCodes = new Set(
      [...productCodes].filter((code) => priceCodes.has(code))
    );
    console.log(`   - Direct matching codes: ${matchingCodes.size}`);
    console.log(
      `   - Expected match rate: ${(
        (matchingCodes.size / productCodes.size) *
        100
      ).toFixed(2)}%`
    );

    // Check for partial matches
    let partialMatches = 0;
    productCodes.forEach((productCode) => {
      const found = Array.from(priceCodes).some(
        (priceCode) =>
          priceCode.includes(productCode) || productCode.includes(priceCode)
      );
      if (found) partialMatches++;
    });
  }

  /**
   * Create variant-aware price map with base product mappings
   */
  private createVariantAwarePriceMap(prices: any[], stock: any[]) {
    const priceMap = new Map();
    const stockMap = new Map();

    // Build enhanced price map with base product mappings
    prices.forEach((price) => {
      const priceFullCode = price.fullCode
        ? price.fullCode.trim().toUpperCase()
        : null;
      const priceSimpleCode = price.simplecode
        ? price.simplecode.trim().toUpperCase()
        : null;

      // Store the actual variant codes
      if (priceFullCode) {
        priceMap.set(priceFullCode, price);
      }

      if (priceSimpleCode && priceSimpleCode !== priceFullCode) {
        priceMap.set(priceSimpleCode, price);
      }

      // ALSO create base product mappings by removing size indicators
      if (priceFullCode) {
        const baseCode = this.extractBaseProductCode(priceFullCode);
        if (baseCode && baseCode !== priceFullCode) {
          // Only set base code mapping if it doesn't exist yet
          if (!priceMap.has(baseCode)) {
            priceMap.set(baseCode, price);
          }
        }
      }
    });

    // Build stock map (same as before)
    stock.forEach((stockItem) => {
      if (stockItem.fullCode) {
        const normalizedFullCode = stockItem.fullCode.trim().toUpperCase();
        stockMap.set(normalizedFullCode, stockItem);
      }

      if (stockItem.simpleCode && stockItem.simpleCode !== stockItem.fullCode) {
        const normalizedSimpleCode = stockItem.simpleCode.trim().toUpperCase();
        stockMap.set(normalizedSimpleCode, stockItem);
      }
    });

    return { priceMap, stockMap };
  }
  /**
   * Process Amrod products - KEEP ORIGINAL STRUCTURE, only add price/stock
   */
  private processAmrodProducts(
    products: any[],
    prices: any[],
    stock: any[]
  ): IAggregatedProduct[] {
    const { priceMap, stockMap } = this.createVariantAwarePriceMap(
      prices,
      stock
    );

    return products.map((product) => {
      const productFullCode = (product.fullCode || product.productCode || "")
        .trim()
        .toUpperCase();
      const productSimpleCode = (product.simpleCode || "").trim().toUpperCase();

      // Use variant-aware price matching
      let productPrice = this.findPriceWithVariantAwareMatching(
        productFullCode,
        productSimpleCode,
        priceMap
      );

      let productStock =
        stockMap.get(productFullCode) || stockMap.get(productSimpleCode);

      const originalPrice = productPrice?.price || 0;
      const markedUpPrice = this.calculateMarkupPrice(originalPrice, "amrod");

      // KEEP THE ORIGINAL PRODUCT STRUCTURE, just add price/stock fields
      return {
        ...product, // Keep all original Amrod fields
        originalPrice: originalPrice,
        price: markedUpPrice,
        stockInfo: productStock
          ? {
              colourCode: productStock.colourCode,
              fullCode: productStock.fullCode,
              incomingStock: productStock.incomingStock,
              modifiedDate: productStock.modifiedDate,
              reservedStock: productStock.reservedStock,
              simpleCode: productStock.simpleCode,
              stock: productStock.stock,
              stockType: productStock.stockType,
            }
          : {
              colourCode: null,
              fullCode: product.fullCode || product.productCode,
              incomingStock: null,
              modifiedDate: new Date().toISOString(),
              reservedStock: 0,
              simpleCode: product.simpleCode || product.productCode,
              stock: 0,
              stockType: 0,
            },
        isAvailable: (productStock?.stock || 0) > 0,
        supplier: "amrod",
      } as IAggregatedProduct;
    });
  }

  /**
   * Normalize Amrod product structure to ensure consistency between endpoints
   */
  private normalizeAmrodProduct(product: any): any {
    // Ensure we have the basic required fields
    const normalized: any = {
      simpleCode: product.simpleCode || product.productCode,
      fullCode: product.fullCode || product.productCode,
      productName: product.productName || product.name || "Unknown Product",
      description: product.description || "",
      categories: product.categories || [],
      brand: product.brand || { name: "Unknown Brand", code: "" },
      images: product.images || [],
      variants: product.variants || [],
      // Add other fields with defaults if missing
      material: product.material || "",
      fit: product.fit || "",
      feature: product.feature || "",
      minimum: product.minimum || 1,
      maximum: product.maximum || 9999,
      incrementedBy: product.incrementedBy || 1,
      keywords: product.keywords || "",
      tags: product.tags || "",
      inventoryType: product.inventoryType || "standard",
      behaviour: product.behaviour || "standard",
      madeToOrder: product.madeToOrder || "No",
      madeToOrderMessage: product.madeToOrderMessage || "",
      displayCountryOfOrigin: product.displayCountryOfOrigin || "",
      promotion: product.promotion || "",
      brandings: product.brandings || [],
      isLogo24: product.isLogo24 || false,
      logo24Branding: product.logo24Branding || null,
      inclusiveBranding: product.inclusiveBranding || [],
    };

    // Ensure variants have basic structure
    if (!normalized.variants || normalized.variants.length === 0) {
      normalized.variants = [
        {
          simpleCode: normalized.simpleCode,
          fullCode: normalized.fullCode,
          codeColour: "default",
          codeColourName: "Default",
          codeSize: "default",
          codeSizeName: "Default",
          categorisedAttribute: null,
          packagingAndDimension: {
            cartonSizeDimensionL: 0,
            cartonSizeDimensionW: 0,
            cartonSizeDimensionH: 0,
            piecesPerCarton: 1,
            cartonWeight: 0,
          },
          productDimension: {
            length: 0,
            width: 0,
            weight: 0,
          },
          isLogo24: false,
          components: null,
        },
      ];
    }

    return normalized;
  }

  // Add these methods to your ProductAggregationService

  /**
   * Get Tarsus categories from products
   */
  public async getTarsusCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }> {
    try {
      const tarsusProducts = await this.fetchTarsusData();

      if (!tarsusProducts || tarsusProducts.length === 0) {
        return { mainCategories: [], categoriesWithSubs: [] };
      }

      // Process Tarsus products to extract categories
      const { mainCategories, categoriesWithSubs } =
        this.processTarsusCategories(tarsusProducts);

      return {
        mainCategories,
        categoriesWithSubs,
      };
    } catch (error) {
      console.error("Error processing Tarsus categories:", error);
      return { mainCategories: [], categoriesWithSubs: [] };
    }
  }

  /**
   * Process Tarsus products to extract categories
   */
  private processTarsusCategories(products: IAggregatedProduct[]): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  } {
    const allCategories = new Set<string>();

    // Extract unique categories from Tarsus products
    products.forEach((product) => {
      product.categories?.forEach((cat: any) => {
        const categoryName = cat.name || "Uncategorized";

        if (categoryName && categoryName !== "Uncategorized") {
          allCategories.add(categoryName);
        }
      });
    });

    // Create sidebar structure - Tarsus typically doesn't have subcategories
    const categoriesWithSubs: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    // Add categories sorted alphabetically
    Array.from(allCategories)
      .sort()
      .forEach((categoryName) => {
        categoriesWithSubs.push({
          name: categoryName,
          subCategories: null, // Tarsus doesn't have subcategories
        });
      });

    return {
      mainCategories: Array.from(allCategories).sort(),
      categoriesWithSubs,
    };
  }
  /**
   * Fetch Parrot data with fresh internal products
   */
  private async fetchParrotData(): Promise<IAggregatedProduct[]> {
    // If we have cache, return it but with fresh internal products
    if (this.parrotCache) {
      const cachedParrotProducts = this.parrotCache;
      const freshInternalProducts = await this.fetchInternalProducts();

      // Filter out old internal products and add fresh ones
      const nonInternalProducts = cachedParrotProducts.filter(
        (p) => !p.isInternalProduct
      );
      return [...nonInternalProducts, ...freshInternalProducts];
    }

    try {
      // STEP 1: Fetch both data sources in parallel
      const [rawParrotProducts, internalStationeryProducts] = await Promise.all(
        [
          this.parrotClient.getProducts(), // Raw Parrot API data
          this.fetchInternalProducts(), // Fresh internal products
        ]
      );

      // STEP 2: Transform Parrot products using the SAME method as before
      const transformedParrotProducts =
        await this.transformParrotProductsInChunks(rawParrotProducts);

      // STEP 3: Merge both transformed product arrays
      const mergedProducts = [
        ...transformedParrotProducts,
        ...internalStationeryProducts,
      ];

      console.log(
        `✅ Parrot data merged: ${transformedParrotProducts.length} Parrot products + ${internalStationeryProducts.length} internal products = ${mergedProducts.length} total`
      );

      this.parrotCache = mergedProducts;
      return mergedProducts;
    } catch (error) {
      console.error("Error fetching Parrot data:", error);
      return [];
    }
  }

  /**
   * Fetch Tarsus data leveraging client cache
   */
  private async fetchTarsusData(): Promise<IAggregatedProduct[]> {
    try {
      const rawTarsusProducts = await this.tarsusClient.getProducts();
      const transformedProducts = await this.transformTarsusProductsInChunks(
        rawTarsusProducts
      );
      this.tarsusCache = transformedProducts;
      return transformedProducts;
    } catch (error) {
      console.error("Error fetching Tarsus data:", error);
      return [];
    }
  }

  // === REPLACE YOUR EXISTING getAllProductsWithCache METHOD WITH THIS ===
  /**
   * Optimized cache method with index invalidation
   */
  private async getAllProductsWithCache(): Promise<IAggregatedProduct[]> {
    const now = Date.now();

    if (this.productsCache && now - this.cacheTimestamp < this.CACHE_TTL) {
      const cachedProducts = this.productsCache;

      // Parallel fetch for dynamic data
      const [freshInternalProducts, freshBrandingProducts, freshFurnitureProducts] = await Promise.all([
        this.fetchInternalProducts(),
        this.fetchBrandingData(),
        this.fetchFurnitureData(), // Add furniture to dynamic data
      ]);

      // Use Set for faster filtering
      const internalIds = new Set(freshInternalProducts.map((p) => p.fullCode));
      const brandingIds = new Set(freshBrandingProducts.map((p) => p.fullCode));
      const furnitureIds = new Set(freshFurnitureProducts.map((p) => p.fullCode));

     const filteredProducts = cachedProducts.filter(
      (p) => !internalIds.has(p.fullCode) && !brandingIds.has(p.fullCode) && !furnitureIds.has(p.fullCode)
    );

      return [
        ...filteredProducts,
        ...freshInternalProducts,
        ...freshBrandingProducts,
        ...freshFurnitureProducts,
      ];
    }

    // Fresh data fetch
    try {
      const [
        amrodProducts,
        parrotProducts,
        tarsusProducts,
        internalProducts,
        brandingProducts,
        furnitureProducts,
      ] = await Promise.all([
        this.fetchAmrodData(),
        this.fetchParrotData(),
        this.fetchTarsusData(),
        this.fetchInternalProducts(),
        this.fetchBrandingData(),
        this.fetchFurnitureData(),
      ]);

      const allProducts = [
        ...amrodProducts,
        ...parrotProducts,
        ...tarsusProducts,
        ...internalProducts,
        ...brandingProducts,
        ...furnitureProducts,
      ];

      this.productsCache = allProducts;
      this.cacheTimestamp = now;

      // Invalidate index since cache was updated
      this.indexBuilt = false;

      return allProducts;
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch products: ${error.message}`
      );
    }
  }

  /**
   * Unified products with supplier breakdown
   */
  public async getUnifiedProductsWithPriceAndStock(
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      const allProducts = await this.getAllProductsWithCache();

      const amrodCount = allProducts.filter(
        (p) => p.supplier === "amrod"
      ).length;
      const parrotCount = allProducts.filter(
        (p) => p.supplier === "parrot"
      ).length;
      const tarsusCount = allProducts.filter(
        (p) => p.supplier === "tarsus"
      ).length;

      const totalProducts = allProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: amrodCount,
          parrot: parrotCount,
          tarsus: tarsusCount,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch unified products: ${error.message}`
      );
    }
  }

  public async getAmrodProductsWithPriceAndStock(
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      let amrodProducts: IAggregatedProduct[];
      if (this.amrodCache) {
        amrodProducts = this.amrodCache;
      } else {
        amrodProducts = await this.fetchAmrodData();
      }

      const totalProducts = amrodProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = amrodProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: totalProducts,
          parrot: 0,
          tarsus: 0,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Amrod products: ${error.message}`
      );
    }
  }

  public async getParrotProductsWithPriceAndStock(
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      let parrotProducts: IAggregatedProduct[];
      if (this.parrotCache) {
        parrotProducts = this.parrotCache;
      } else {
        parrotProducts = await this.fetchParrotData();
      }

      const totalProducts = parrotProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = parrotProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: totalProducts,
          tarsus: 0,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Parrot products: ${error.message}`
      );
    }
  }

  public async getTarsusProductsWithPriceAndStock(
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      let tarsusProducts: IAggregatedProduct[];
      if (this.tarsusCache) {
        tarsusProducts = this.tarsusCache;
      } else {
        tarsusProducts = await this.fetchTarsusData();
      }

      const totalProducts = tarsusProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = tarsusProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: 0,
          tarsus: totalProducts,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Tarsus products: ${error.message}`
      );
    }
  }

  /**
   * Get Amrod products with search and category filtering
   */
  public async getAmrodProductsWithFilters(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    try {
      let amrodProducts: IAggregatedProduct[];
      if (this.amrodCache) {
        amrodProducts = this.amrodCache;
      } else {
        amrodProducts = await this.fetchAmrodData();
      }

      // Apply all filters
      let filteredProducts = this.applyAllFilters(amrodProducts, filters);

      let page = filters.page || 1;
      const limit = filters.limit || 12;
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: totalProducts,
          parrot: 0,
          tarsus: 0,
        },
        filters,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Amrod products: ${error.message}`
      );
    }
  }

  /**
   * Get Tarsus products with search and category filtering
   */
  public async getTarsusProductsWithFilters(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    try {
      let tarsusProducts: IAggregatedProduct[];
      if (this.tarsusCache) {
        tarsusProducts = this.tarsusCache;
      } else {
        tarsusProducts = await this.fetchTarsusData();
      }

      // Apply all filters to Tarsus products
      let filteredProducts = this.applyAllFilters(tarsusProducts, filters);

      let page = filters.page || 1;
      const limit = filters.limit || 12;
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: 0,
          tarsus: totalProducts,
        },
        filters,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Tarsus products: ${error.message}`
      );
    }
  }

  /**
   * Get Parrot janitorial products with filtering - USING EXACT CATEGORIES
   */
  public async getParrotJanitorialWithFilter(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    return this.getParrotProductsByCategoryType("janitorial", filters);
  }

  /**
   * Get Parrot stationery products with filtering - USING EXACT CATEGORIES
   */
  public async getParrotStationeryWithFilter(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    return this.getParrotProductsByCategoryType("stationery", filters);
  }

  /**
   * Get Parrot electronics products with filtering - USING EXACT CATEGORIES
   */
  public async getParrotElectronicsWithFilter(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    return this.getParrotProductsByCategoryType("electronics", filters);
  }

  /**
   * Get Parrot display solutions products with filtering
   */
  public async getParrotDisplaySolutionsWithFilter(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    return this.getParrotProductsByCategoryType("display-solutions", filters);
  }

  /**
   * Helper method to get Parrot products by category type using exact category names
   * - ALWAYS includes fresh internal products (not cached)
   */
  private async getParrotProductsByCategoryType(
    categoryType:
      | "janitorial"
      | "stationery"
      | "electronics"
      | "display-solutions",
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    try {
      // ALWAYS fetch fresh Parrot data (like getUniversalSearch does)
      // This ensures internal products are always included
      const freshParrotProducts = await this.fetchParrotData();

      // Filter by exact category names
      const categoryFilteredProducts =
        this.filterParrotProductsByExactCategories(
          freshParrotProducts,
          categoryType
        );

      // Then apply other filters (search, sorting, etc.)
      let filteredProducts = this.applyAllFilters(
        categoryFilteredProducts,
        filters
      );

      let page = filters.page || 1;
      const limit = filters.limit || 12;
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: totalProducts,
          tarsus: 0,
        },
        filters,
        categoryType,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to fetch Parrot ${categoryType} products: ${error.message}`
      );
    }
  }

  /**
   * Filter Parrot products by exact category names
   */
  private filterParrotProductsByExactCategories(
    products: IAggregatedProduct[],
    categoryType:
      | "janitorial"
      | "stationery"
      | "electronics"
      | "display-solutions"
  ): IAggregatedProduct[] {
    const categoryMappings = {
      janitorial: [
        // Cleaning Chemicals
        "1.5 Litres Cleaning Chemicals",
        "25 Litres Cleaning Chemicals",
        "5 Litres Cleaning Chemicals",
        "Janitorial Cleaning Chemicals",
        "Pine Gel",

        // Cleaning Tools & Equipment
        "Brooms",
        "Brooms and Mops",
        "Buckets",
        "Cloths",
        "Dustbins",
        "Dusters - Wood Chalk Board",
        "Industrial Vacuum Cleaner",
        "Mops",
        "Refuse Bags",
        "Telescopic Cleaning Brush",
        "Telescopic Squeegee",
        "Telescopic Waterfed Poles",

        // Hygiene & Sanitation
        "Hand Sanitizers",
        "Hand Soap",
        "Dispensers",
        "Toilet Roll & Paper Hand Towel Dispenser Holders",
        "PMAT Urine Mat",

        // General Janitorial
        "Janitorial",
        "Personal Protective Equipment (PPE)",
      ],
      stationery: [
        // Writing Instruments
        "Highlighters",
        "Markers",
        "Permanent Markers",
        "Whiteboard Markers",

        // Office Supplies
        "Calculators",
        "Clipboards",
        "Craft Knives & Refills",
        "Drawing & Push Pins",
        "Erasers & Aqua Wipes",
        "Glue",
        "Guillotines",
        "Paper Grippers",
        "Paper Hole Punches",
        "Rulers",
        "Scissors",
        "Staplers",
        "Staplers and Punches",
        "Staples",

        // Binding & Laminating
        "Binding Machines and Binders",
        "Comb Binding Machines",
        "Laminating Machines",
        "Laminator Consumables",
        "Rotary Trimmers",

        // Paper Products
        "Flipchart Paper",

        // General Stationery
        "Office Equipment",
        "Office Equipment & Whiteboard Cleaner",
      ],
      electronics: [
        // Computer & IT
        "Computer Products & Accessories",
        "External Storage",
        "Handheld Portable Label Printer",
        "Security Cables",
        "Shredders",
        "USB Port Hubs",

        // Audio Equipment
        "Audio Solutions",
        "Conference Speakers",
        "Headphones and Earphones",
        "Megaphones",
        "Microphones",
        "PA Systems",
        "Speakers",

        // Projectors & Presentation
        "Data Projector Trolleys",
        "Data Projectors",
        "Data Projectors & Screens",
        "Laser Pointers",
        "Overhead Projectors & Trolleys",
        "Projector Screens",
        "Projectors and Interactive Solutions",
        "Visualizers",
        "Wireless Presentation",

        // Cables & Accessories
        "Adaptors",
        "Cables",
        "Cables & Adaptors",
        "Conduit",
        "Extension Cord Accessories",
        "Monitor Brackets",

        // Interactive & Digital
        "Digital Graphics Drawing Tablets",
        "Interactive LED Solutions",
        "Interactive Whiteboard Systems and Accessories",
      ],
      "display-solutions": [
        // Display Solutions Category
        "Display Solutions",

        // Boards & Whiteboards
        "Boards",
        "Bulletin Boards (Aluminium Frame, Carpet)",
        "Chalk Boards",
        "Combi-Boards",
        "Educational Boards",
        "Glass / Chalkboard",
        "Glassboards",
        "Magnetic Chalkboards",
        "Non-Magnetic Chalkboards",
        "Revolving Boards",
        "Standard Glass Whiteboards",
        "Standard Magnetic Whiteboards",
        "Standard Non-Magnetic Whiteboards",
        "Whiteboard Tiles",
        "Whiteboards",

        // Signage & Frames
        "50mm Wall Sign - Flush",
        "A Frame Poster Stands",
        "A-Frame Boards",
        "Alufine Frame Info Boards",
        "Certificate Holders",
        "Chrome Corner Poster Frames",
        "Crowd Control Barriers",
        "Desktop Signs",
        "Digital Signage",
        "Double Sided - Standing",
        "Double Sided Poster Stand",
        "Garage Floor Stands",
        "Info Boards",
        "Info Boards (Aluminium Frame, Felt)",
        "Magnetic Self Adhesive Poster Frames",
        "Mitred Corner Poster Frames",
        "Mitred Econo Poster Frames",
        "Photoluminescent Signs",
        "Poster Frame Supports",
        "Poster Frames",
        "Sign Frame Extrusions",
        "Sign Frames",
        "Symbolic Signs",
        "Table Top Poster Frame Support Feet",
        "Triangular-Sided - Standing",
        "Wall Signs - Double Sided",
        "Wall Signs - Flush",

        // Holders & Displays
        "Acrylic Menu Holders",
        "Brochure Holders",
        "Display Cases",
        "In / Out Slides",
        "Perspex Pockets",
        "Plexiglass Media Covers",

        // Mounting & Systems
        "Acoustic Panels",
        "Aluminium Composite Panels (ACP)",
        "Board Supports",
        "Designer Mounting Systems",
        "Desk Partitions",
        "Easy Rail System",
        "Easy Rail System Products",
        "Hanging Systems",
        "Mounting Brackets",
        "Partition Bracket & Hook",
        "Rail Systems",
        "Slatted Wall Panel",
        "Stands for LED Panels & eBoards",
        "Wall Rail + Brackets",

        // Stands & Easels
        "Acrylic Stands - (Mobile, Tablet or Laptop)",
        "Artist Easel",
        "Flipchart Stands",
        "Flipcharts",
        "Lap Trays",
        "Tripods",
        "Trolleys",

        // Accessories
        "Accessories",
        "Accessory Holders",
        "Adhesive Pinning Boards",
        "Bubble Wrap",
        "Carpet Protectors",
        "Magnetic - Flexible Sheeting",
        "Magnetic - Flexible Strips",
        "Magnetic - Label Carriers",
        "Magnetic - Map Pins",
        "Magnetic - Photo Paper & Flexible Magnetic Tape",
        "Moulded Magnets",
        "Planners",
        "Printed Glassboards",
        "Steel Sheets",
        "Vinyl Lettering & Tape",
        "Wall Art Laser Cut",
        "Wall Maps",

        // Glass Products
        "Decorative Glass Wall Tiles",
        "Glass Clocks",
        "Glass Products",
      ],
    };

    const targetCategories = categoryMappings[categoryType];

    return products.filter((product) => {

      // SIMPLE RULE: If it's stationery and internal product, include it
    if (categoryType === "stationery" && product.isInternalProduct) {
      return true; // ALL internal products are stationery
    }

      // Original logic for Parrot products
      return product.categories?.some((cat: any) => {
        const categoryName = cat.name?.trim();
        return targetCategories.some((targetCat) =>
          categoryName?.includes(targetCat.trim())
        );
      });
    });
  }

  /**
 * Get Parrot janitorial categories with internal categories merged
 */
public async getParrotJanitorialCategories(): Promise<{
  mainCategories: string[];
  categoriesWithSubs: SidebarCategory[];
}> {
  try {
    // Get Parrot janitorial categories
    const parrotCategories = await this.getParrotProductsByCategoryType(
      "janitorial",
      {}
    );
    
    // Get internal janitorial categories from CategoryService
    const internalCategories = await this.categoryService.getCategoriesByMainCategory(
      "JANITORIAL" as MainCategoryType
    );
    
    // Process Parrot categories to the right format
    const processedParrotCategories = this.processParrotSubCategories(
      parrotCategories.products,
      "janitorial"
    );
    
    // Transform internal categories to match Parrot format
    const processedInternalCategories = this.transformInternalToParrotFormat(
      internalCategories
    );
    
    // Merge them
    return this.mergeCategories(processedParrotCategories, processedInternalCategories);
  } catch (error) {
    console.error("Error processing Parrot janitorial categories:", error);
    return { mainCategories: [], categoriesWithSubs: [] };
  }
}

  /**
 * Get Parrot stationery categories with internal categories merged
 */
public async getParrotStationeryCategories(): Promise<{
  mainCategories: string[];
  categoriesWithSubs: SidebarCategory[];
}> {
  try {
    // Get Parrot stationery categories
    const parrotCategories = await this.getParrotProductsByCategoryType(
      "stationery",
      {}
    );
    
    // Get internal stationery categories from CategoryService
    const internalCategories = await this.categoryService.getCategoriesByMainCategory(
      "STATIONERY" as MainCategoryType
    );
    
    // Process Parrot categories to the right format
    const processedParrotCategories = this.processParrotSubCategories(
      parrotCategories.products,
      "stationery"
    );
    
    // Transform internal categories to match Parrot format
    const processedInternalCategories = this.transformInternalToParrotFormat(
      internalCategories
    );
    
    // Merge them
    return this.mergeCategories(processedParrotCategories, processedInternalCategories);
  } catch (error) {
    console.error("Error processing Parrot stationery categories:", error);
    return { mainCategories: [], categoriesWithSubs: [] };
  }
}

  /**
   * Get Parrot electronics categories with proper structure
   */
  public async getParrotElectronicsCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }> {
    try {
      const electronicsResponse = await this.getParrotProductsByCategoryType(
        "electronics",
        {}
      );
      return this.processParrotSubCategories(
        electronicsResponse.products,
        "electronics"
      );
    } catch (error) {
      console.error("Error processing Parrot electronics categories:", error);
      return { mainCategories: [], categoriesWithSubs: [] };
    }
  }

  /**
   * Get Parrot display solutions categories with proper structure
   */
  public async getParrotDisplaySolutionsCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }> {
    try {
      const displayResponse = await this.getParrotProductsByCategoryType(
        "display-solutions",
        {}
      );
      return this.processParrotSubCategories(
        displayResponse.products,
        "display-solutions"
      );
    } catch (error) {
      console.error(
        "Error processing Parrot display solutions categories:",
        error
      );
      return { mainCategories: [], categoriesWithSubs: [] };
    }
  }

  /**
   * Get Parrot categories from products
   */
  public async getParrotCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }> {
    try {
      const parrotProducts = await this.fetchParrotData();

      if (!parrotProducts || parrotProducts.length === 0) {
        return { mainCategories: [], categoriesWithSubs: [] };
      }

      // Process Parrot products to extract categories
      const { mainCategories, categoriesWithSubs } =
        this.processParrotCategories(parrotProducts);

      return {
        mainCategories,
        categoriesWithSubs,
      };
    } catch (error) {
      console.error("Error processing Parrot categories:", error);
      return { mainCategories: [], categoriesWithSubs: [] };
    }
  }

  /**
   * Process Parrot products to extract categories
   */
  private processParrotCategories(products: IAggregatedProduct[]): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  } {
    const allCategories = new Set<string>();

    // Extract unique categories from Parrot products
    products.forEach((product) => {
      product.categories?.forEach((cat: any) => {
        const categoryName = cat.name || "Uncategorized";

        if (categoryName && categoryName !== "Uncategorized") {
          allCategories.add(categoryName);
        }
      });
    });

    // Create sidebar structure
    const categoriesWithSubs: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    // Add categories sorted alphabetically
    Array.from(allCategories)
      .sort()
      .forEach((categoryName) => {
        categoriesWithSubs.push({
          name: categoryName,
          subCategories: null,
        });
      });

    return {
      mainCategories: Array.from(allCategories).sort(),
      categoriesWithSubs,
    };
  }

  /**
   * Process subcategories for each main category type
   */
  private processParrotSubCategories(
    products: IAggregatedProduct[],
    categoryType:
      | "janitorial"
      | "stationery"
      | "electronics"
      | "display-solutions"
  ): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  } {
    const allCategories = new Set<string>();

    // Extract unique categories from products
    products.forEach((product) => {
      product.categories?.forEach((cat: any) => {
        const categoryName = cat.name || "Uncategorized";
        if (categoryName && categoryName !== "Uncategorized") {
          allCategories.add(categoryName);
        }
      });
    });

    // Create organized category structure based on type
    const categoriesWithSubs = this.organizeParrotCategories(
      Array.from(allCategories),
      categoryType
    );

    return {
      mainCategories: categoriesWithSubs.map((cat) => cat.name),
      categoriesWithSubs,
    };
  }


  /**
 * Simple method to merge two sets of categories
 */
private mergeCategories(
  parrotCategories: { mainCategories: string[]; categoriesWithSubs: SidebarCategory[] },
  internalCategories: { mainCategories: string[]; categoriesWithSubs: SidebarCategory[] }
): {
  mainCategories: string[];
  categoriesWithSubs: SidebarCategory[];
} {
  // Start with "All" category
  const mergedCategoriesWithSubs: SidebarCategory[] = [
    { name: "All", subCategories: null }
  ];
  
  const mergedMainCategories = new Set<string>();
  
  // Create a map to easily find and merge categories
  const categoryMap = new Map<string, SidebarCategory>();
  
  // Add Parrot categories (skip "All")
  parrotCategories.categoriesWithSubs.forEach(cat => {
    if (cat.name !== "All") {
      categoryMap.set(cat.name, { ...cat });
      mergedMainCategories.add(cat.name);
    }
  });
  
  // Add or merge internal categories (skip "All")
  internalCategories.categoriesWithSubs.forEach(cat => {
    if (cat.name !== "All") {
      if (categoryMap.has(cat.name)) {
        // Merge subcategories if they exist
        const existingCat = categoryMap.get(cat.name)!;
        if (cat.subCategories && existingCat.subCategories) {
          // Combine and remove duplicates
          const combinedSubs = [...new Set([...existingCat.subCategories, ...cat.subCategories])];
          existingCat.subCategories = combinedSubs.sort();
        } else if (cat.subCategories && !existingCat.subCategories) {
          // Add subcategories if existing doesn't have them
          existingCat.subCategories = [...cat.subCategories].sort();
        }
      } else {
        // Add new category
        categoryMap.set(cat.name, { ...cat });
        mergedMainCategories.add(cat.name);
      }
    }
  });
  
  // Convert map back to array
  categoryMap.forEach(category => {
    mergedCategoriesWithSubs.push(category);
  });
  
  return {
    mainCategories: Array.from(mergedMainCategories).sort(),
    categoriesWithSubs: mergedCategoriesWithSubs,
  };
}

  /**
   * Organize categories into proper main categories and subcategories
   */
  private organizeParrotCategories(
    categories: string[],
    categoryType:
      | "janitorial"
      | "stationery"
      | "electronics"
      | "display-solutions"
  ): SidebarCategory[] {
    const mainCategories: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    const categoryStructures = {
      janitorial: [
        {
          main: "Cleaning Chemicals",
          subs: [
            "1.5 Litres Cleaning Chemicals",
            "25 Litres Cleaning Chemicals",
            "5 Litres Cleaning Chemicals",
            "Janitorial Cleaning Chemicals",
            "Pine Gel",
          ],
        },
        {
          main: "Cleaning Tools",
          subs: [
            "Brooms",
            "Brooms and Mops",
            "Buckets",
            "Cloths",
            "Dusters - Wood Chalk Board",
            "Industrial Vacuum Cleaner",
            "Mops",
            "Telescopic Cleaning Brush",
            "Telescopic Squeegee",
            "Telescopic Waterfed Poles",
          ],
        },
        {
          main: "Waste Management",
          subs: ["Dustbins", "Refuse Bags", "PMAT Urine Mat"],
        },
        {
          main: "Hygiene & Sanitation",
          subs: [
            "Hand Sanitizers",
            "Hand Soap",
            "Dispensers",
            "Toilet Roll & Paper Hand Towel Dispenser Holders",
          ],
        },
        {
          main: "Safety Equipment",
          subs: ["Personal Protective Equipment (PPE)"],
        },
        {
          main: "General Janitorial",
          subs: ["Janitorial"],
        },
      ],
      stationery: [
        {
          main: "Writing Instruments",
          subs: [
            "Highlighters",
            "Markers",
            "Permanent Markers",
            "Whiteboard Markers",
          ],
        },
        {
          main: "Office Supplies",
          subs: [
            "Calculators",
            "Clipboards",
            "Craft Knives & Refills",
            "Drawing & Push Pins",
            "Erasers & Aqua Wipes",
            "Glue",
            "Paper Grippers",
            "Rulers",
            "Scissors",
          ],
        },
        {
          main: "Binding & Fastening",
          subs: [
            "Staplers",
            "Staplers and Punches",
            "Staples",
            "Binding Machines and Binders",
            "Comb Binding Machines",
          ],
        },
        {
          main: "Cutting & Trimming",
          subs: ["Guillotines", "Paper Hole Punches", "Rotary Trimmers"],
        },
        {
          main: "Laminating",
          subs: ["Laminating Machines", "Laminator Consumables"],
        },
        {
          main: "Paper Products",
          subs: ["Flipchart Paper"],
        },
        {
          main: "Office Equipment",
          subs: ["Office Equipment", "Office Equipment & Whiteboard Cleaner"],
        },
      ],
      electronics: [
        {
          main: "Computer & IT",
          subs: [
            "Computer Products & Accessories",
            "External Storage",
            "Handheld Portable Label Printer",
            "Security Cables",
            "Shredders",
            "USB Port Hubs",
          ],
        },
        {
          main: "Audio Equipment",
          subs: [
            "Audio Solutions",
            "Conference Speakers",
            "Headphones and Earphones",
            "Megaphones",
            "Microphones",
            "PA Systems",
            "Speakers",
          ],
        },
        {
          main: "Projection & Presentation",
          subs: [
            "Data Projector Trolleys",
            "Data Projectors",
            "Data Projectors & Screens",
            "Laser Pointers",
            "Overhead Projectors & Trolleys",
            "Projector Screens",
            "Projectors and Interactive Solutions",
            "Visualizers",
            "Wireless Presentation",
          ],
        },
        {
          main: "Cables & Accessories",
          subs: [
            "Adaptors",
            "Cables",
            "Cables & Adaptors",
            "Conduit",
            "Extension Cord Accessories",
            "Monitor Brackets",
          ],
        },
        {
          main: "Interactive Technology",
          subs: [
            "Digital Graphics Drawing Tablets",
            "Interactive LED Solutions",
            "Interactive Whiteboard Systems and Accessories",
          ],
        },
      ],
      "display-solutions": [
        {
          main: "Boards & Writing Surfaces",
          subs: [
            "Boards",
            "Bulletin Boards (Aluminium Frame, Carpet)",
            "Chalk Boards",
            "Combi-Boards",
            "Educational Boards",
            "Glass / Chalkboard",
            "Glassboards",
            "Magnetic Chalkboards",
            "Non-Magnetic Chalkboards",
            "Revolving Boards",
            "Standard Glass Whiteboards",
            "Standard Magnetic Whiteboards",
            "Standard Non-Magnetic Whiteboards",
            "Whiteboard Tiles",
            "Whiteboards",
          ],
        },
        {
          main: "Signage & Frames",
          subs: [
            "50mm Wall Sign - Flush",
            "A Frame Poster Stands",
            "A-Frame Boards",
            "Alufine Frame Info Boards",
            "Certificate Holders",
            "Chrome Corner Poster Frames",
            "Desktop Signs",
            "Digital Signage",
            "Double Sided - Standing",
            "Double Sided Poster Stand",
            "Garage Floor Stands",
            "Info Boards",
            "Info Boards (Aluminium Frame, Felt)",
            "Magnetic Self Adhesive Poster Frames",
            "Mitred Corner Poster Frames",
            "Mitred Econo Poster Frames",
            "Photoluminescent Signs",
            "Poster Frame Supports",
            "Poster Frames",
            "Sign Frame Extrusions",
            "Sign Frames",
            "Symbolic Signs",
            "Table Top Poster Frame Support Feet",
            "Triangular-Sided - Standing",
            "Wall Signs - Double Sided",
            "Wall Signs - Flush",
          ],
        },
        {
          main: "Holders & Displays",
          subs: [
            "Acrylic Menu Holders",
            "Brochure Holders",
            "Display Cases",
            "In / Out Slides",
            "Perspex Pockets",
            "Plexiglass Media Covers",
          ],
        },
        {
          main: "Mounting & Systems",
          subs: [
            "Acoustic Panels",
            "Aluminium Composite Panels (ACP)",
            "Board Supports",
            "Designer Mounting Systems",
            "Desk Partitions",
            "Easy Rail System",
            "Easy Rail System Products",
            "Hanging Systems",
            "Mounting Brackets",
            "Partition Bracket & Hook",
            "Rail Systems",
            "Slatted Wall Panel",
            "Stands for LED Panels & eBoards",
            "Wall Rail + Brackets",
          ],
        },
        {
          main: "Stands & Easels",
          subs: [
            "Acrylic Stands - (Mobile, Tablet or Laptop)",
            "Artist Easel",
            "Flipchart Stands",
            "Flipcharts",
            "Lap Trays",
            "Tripods",
            "Trolleys",
          ],
        },
        {
          main: "Accessories",
          subs: [
            "Accessories",
            "Accessory Holders",
            "Adhesive Pinning Boards",
            "Bubble Wrap",
            "Carpet Protectors",
            "Magnetic - Flexible Sheeting",
            "Magnetic - Flexible Strips",
            "Magnetic - Label Carriers",
            "Magnetic - Map Pins",
            "Magnetic - Photo Paper & Flexible Magnetic Tape",
            "Moulded Magnets",
            "Planners",
            "Printed Glassboards",
            "Steel Sheets",
            "Vinyl Lettering & Tape",
            "Wall Art Laser Cut",
            "Wall Maps",
          ],
        },
        {
          main: "Glass Products",
          subs: [
            "Decorative Glass Wall Tiles",
            "Glass Clocks",
            "Glass Products",
          ],
        },
        {
          main: "Crowd Control",
          subs: ["Crowd Control Barriers"],
        },
        {
          main: "Display Solutions",
          subs: ["Display Solutions"],
        },
      ],
    };

    const structure = categoryStructures[categoryType];

    structure.forEach((group) => {
      // Check if any of the subcategories exist in the actual data
      const existingSubs = group.subs.filter((sub) =>
        categories.some((cat) => cat.includes(sub))
      );

      if (existingSubs.length > 0) {
        mainCategories.push({
          name: group.main,
          subCategories: existingSubs.sort(),
        });
      }
    });

    return mainCategories;
  }

  /**
   * Check if Parrot product belongs to a main organized category
   */
  private parrotProductBelongsToCategory(
    product: IAggregatedProduct,
    categoryName: string
  ): boolean {
    if (!product.categories || !product.categories.length) return false;

    // Define which subcategories belong to which main categories
    const categoryMappings = {
      "Cleaning Chemicals": [
        "1.5 Litres Cleaning Chemicals",
        "25 Litres Cleaning Chemicals",
        "5 Litres Cleaning Chemicals",
        "Janitorial Cleaning Chemicals",
        "Pine Gel",
      ],
      "Cleaning Tools": [
        "Brooms",
        "Brooms and Mops",
        "Buckets",
        "Cloths",
        "Dusters - Wood Chalk Board",
        "Industrial Vacuum Cleaner",
        "Mops",
        "Telescopic Cleaning Brush",
        "Telescopic Squeegee",
        "Telescopic Waterfed Poles",
      ],
      "Waste Management": ["Dustbins", "Refuse Bags", "PMAT Urine Mat"],
      "Hygiene & Sanitation": [
        "Hand Sanitizers",
        "Hand Soap",
        "Dispensers",
        "Toilet Roll & Paper Hand Towel Dispenser Holders",
      ],
      "Safety Equipment": ["Personal Protective Equipment (PPE)"],
      "General Janitorial": ["Janitorial"],
      "Writing Instruments": [
        "Highlighters",
        "Markers",
        "Permanent Markers",
        "Whiteboard Markers",
      ],
      "Office Supplies": [
        "Calculators",
        "Clipboards",
        "Craft Knives & Refills",
        "Drawing & Push Pins",
        "Erasers & Aqua Wipes",
        "Glue",
        "Paper Grippers",
        "Rulers",
        "Scissors",
      ],
      "Binding & Fastening": [
        "Staplers",
        "Staplers and Punches",
        "Staples",
        "Binding Machines and Binders",
        "Comb Binding Machines",
      ],
      "Cutting & Trimming": [
        "Guillotines",
        "Paper Hole Punches",
        "Rotary Trimmers",
      ],
      Laminating: ["Laminating Machines", "Laminator Consumables"],
      "Paper Products": ["Flipchart Paper"],
      "Office Equipment": [
        "Office Equipment",
        "Office Equipment & Whiteboard Cleaner",
      ],
      "Computer & IT": [
        "Computer Products & Accessories",
        "External Storage",
        "Handheld Portable Label Printer",
        "Security Cables",
        "Shredders",
        "USB Port Hubs",
      ],
      "Audio Equipment": [
        "Audio Solutions",
        "Conference Speakers",
        "Headphones and Earphones",
        "Megaphones",
        "Microphones",
        "PA Systems",
        "Speakers",
      ],
      "Projection & Presentation": [
        "Data Projector Trolleys",
        "Data Projectors",
        "Data Projectors & Screens",
        "Laser Pointers",
        "Overhead Projectors & Trolleys",
        "Projector Screens",
        "Projectors and Interactive Solutions",
        "Visualizers",
        "Wireless Presentation",
      ],
      "Cables & Accessories": [
        "Adaptors",
        "Cables",
        "Cables & Adaptors",
        "Conduit",
        "Extension Cord Accessories",
        "Monitor Brackets",
      ],
      "Interactive Technology": [
        "Digital Graphics Drawing Tablets",
        "Interactive LED Solutions",
        "Interactive Whiteboard Systems and Accessories",
      ],
      "Boards & Writing Surfaces": [
        "Boards",
        "Bulletin Boards (Aluminium Frame, Carpet)",
        "Chalk Boards",
        "Combi-Boards",
        "Educational Boards",
        "Glass / Chalkboard",
        "Glassboards",
        "Magnetic Chalkboards",
        "Non-Magnetic Chalkboards",
        "Revolving Boards",
        "Standard Glass Whiteboards",
        "Standard Magnetic Whiteboards",
        "Standard Non-Magnetic Whiteboards",
        "Whiteboard Tiles",
        "Whiteboards",
      ],
      "Signage & Frames": [
        "50mm Wall Sign - Flush",
        "A Frame Poster Stands",
        "A-Frame Boards",
        "Alufine Frame Info Boards",
        "Certificate Holders",
        "Chrome Corner Poster Frames",
        "Desktop Signs",
        "Digital Signage",
        "Double Sided - Standing",
        "Double Sided Poster Stand",
        "Garage Floor Stands",
        "Info Boards",
        "Info Boards (Aluminium Frame, Felt)",
        "Magnetic Self Adhesive Poster Frames",
        "Mitred Corner Poster Frames",
        "Mitred Econo Poster Frames",
        "Photoluminescent Signs",
        "Poster Frame Supports",
        "Poster Frames",
        "Sign Frame Extrusions",
        "Sign Frames",
        "Symbolic Signs",
        "Table Top Poster Frame Support Feet",
        "Triangular-Sided - Standing",
        "Wall Signs - Double Sided",
        "Wall Signs - Flush",
      ],
      "Holders & Displays": [
        "Acrylic Menu Holders",
        "Brochure Holders",
        "Display Cases",
        "In / Out Slides",
        "Perspex Pockets",
        "Plexiglass Media Covers",
      ],
      "Mounting & Systems": [
        "Acoustic Panels",
        "Aluminium Composite Panels (ACP)",
        "Board Supports",
        "Designer Mounting Systems",
        "Desk Partitions",
        "Easy Rail System",
        "Easy Rail System Products",
        "Hanging Systems",
        "Mounting Brackets",
        "Partition Bracket & Hook",
        "Rail Systems",
        "Slatted Wall Panel",
        "Stands for LED Panels & eBoards",
        "Wall Rail + Brackets",
      ],
      "Stands & Easels": [
        "Acrylic Stands - (Mobile, Tablet or Laptop)",
        "Artist Easel",
        "Flipchart Stands",
        "Flipcharts",
        "Lap Trays",
        "Tripods",
        "Trolleys",
      ],
      Accessories: [
        "Accessories",
        "Accessory Holders",
        "Adhesive Pinning Boards",
        "Bubble Wrap",
        "Carpet Protectors",
        "Magnetic - Flexible Sheeting",
        "Magnetic - Flexible Strips",
        "Magnetic - Label Carriers",
        "Magnetic - Map Pins",
        "Magnetic - Photo Paper & Flexible Magnetic Tape",
        "Moulded Magnets",
        "Planners",
        "Printed Glassboards",
        "Steel Sheets",
        "Vinyl Lettering & Tape",
        "Wall Art Laser Cut",
        "Wall Maps",
      ],
      "Glass Products": [
        "Decorative Glass Wall Tiles",
        "Glass Clocks",
        "Glass Products",
      ],
      "Crowd Control": ["Crowd Control Barriers"],
      "Display Solutions": ["Display Solutions"],
    };

    // If it's a main organized category, check if product belongs to any of its subcategories
    if (categoryMappings[categoryName]) {
      const subcategories = categoryMappings[categoryName];
      return product.categories.some((productCat: any) => {
        const productCategoryName = productCat.name || "";
        return subcategories.some((subCat) =>
          productCategoryName.toLowerCase().includes(subCat.toLowerCase())
        );
      });
    }

    // If it's a direct subcategory, check normally
    return product.categories.some((productCat: any) => {
      const productCategoryName = productCat.name || "";
      return productCategoryName
        .toLowerCase()
        .includes(categoryName.toLowerCase());
    });
  }


  /**
   * Replicate frontend's productBelongsToCategory logic - UPDATED
   */
  private productBelongsToCategory(
    product: IAggregatedProduct,
    categoryName: string
  ): boolean {
    if (!product.categories || !product.categories.length) return false;

    // For Parrot products, use the new logic
    if (product.supplier === "parrot") {
      return this.parrotProductBelongsToCategory(product, categoryName);
    }

    // For Amrod and Tarsus, use the original logic
    return product.categories.some((productCat: any) => {
      const pathParts = productCat.path
        ? productCat.path
            .split("/")
            .filter((part: string) => part.trim() !== "")
        : [];
      const productCatName = productCat.name || "";

      return (
        productCatName.toLowerCase() === categoryName.toLowerCase() ||
        pathParts.some(
          (part: string) => part.toLowerCase() === categoryName.toLowerCase()
        )
      );
    });
  }

  /**
   * Apply all filters that were previously done on frontend
   */
  private applyAllFilters(
    products: IAggregatedProduct[],
    filters: ProductFilters
  ): IAggregatedProduct[] {
    let filtered = [...products];

    // 1. Search filtering
    if (filters.search && filters.search.trim()) {
      filtered = this.filterBySearch(filtered, filters.search);
    }
    // 2. Category filtering (only if no search query)
    else {
      if (filters.category && filters.category !== "All") {
        filtered = this.filterByCategory(
          filtered,
          filters.category,
          filters.subCategory
        );
      }
    }

    // 3. Sorting
    if (filters.sortBy) {
      filtered = this.sortProducts(filtered, filters.sortBy);
    }

    return filtered;
  }

  /**
   * Replicate frontend's search logic
   */
  private filterBySearch(
    products: IAggregatedProduct[],
    searchQuery: string
  ): IAggregatedProduct[] {
    const query = searchQuery.toLowerCase().trim();

    return products.filter(
      (product) =>
        product.productName?.toLowerCase().includes(query) ||
        product.brand?.name?.toLowerCase().includes(query) ||
        product.fullCode?.toLowerCase().includes(query) ||
        product.categories?.some((cat: any) =>
          (cat?.name || "").toLowerCase().includes(query)
        ) ||
        product.keywords?.toLowerCase().includes(query) ||
        product.tags?.toLowerCase().includes(query)
    );
  }

  /**
   * Replicate frontend's category filtering logic
   */
  private filterByCategory(
    products: IAggregatedProduct[],
    category: string,
    subCategory?: string
  ): IAggregatedProduct[] {
    return products.filter((product) => {
      const belongsToCategory = this.productBelongsToCategory(
        product,
        category
      );

      if (subCategory) {
        return (
          belongsToCategory &&
          this.productBelongsToSubCategory(product, subCategory)
        );
      }

      return belongsToCategory;
    });
  }

  /**
   * Replicate frontend's productBelongsToSubCategory logic
   */
  private productBelongsToSubCategory(
    product: IAggregatedProduct,
    subCategoryName: string
  ): boolean {
    if (!product.categories || !product.categories.length) return false;

    return product.categories.some((productCat: any) => {
      const pathParts = productCat.path
        ? productCat.path
            .split("/")
            .filter((part: string) => part.trim() !== "")
        : [];
      const productCatName = productCat.name || "";

      return (
        productCatName.toLowerCase() === subCategoryName.toLowerCase() ||
        pathParts.some(
          (part: string) => part.toLowerCase() === subCategoryName.toLowerCase()
        )
      );
    });
  }

  /**
   * Replicate frontend's sorting logic
   */
  private sortProducts(
    products: IAggregatedProduct[],
    sortBy: string
  ): IAggregatedProduct[] {
    const sorted = [...products];

    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) =>
          a.productName.localeCompare(b.productName)
        );
      case "name-desc":
        return sorted.sort((a, b) =>
          b.productName.localeCompare(a.productName)
        );
      case "brand":
        return sorted.sort((a, b) =>
          (a.brand?.name || "").localeCompare(b.brand?.name || "")
        );
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }

  /**
   * Get raw categories from Amrod
   */
  public async getRawAmrodCategories(): Promise<ICategory[]> {
    if (this.categoriesCache) {
      return this.categoriesCache;
    }

    try {
      console.log("🔄 Fetching categories from Amrod API...");
      const categories = await this.amrodClient.getCategories();
      this.categoriesCache = categories;
      console.log(
        `✅ Categories fetch complete: ${categories.length} categories loaded`
      );
      return categories;
    } catch (error) {
      console.error("Error fetching categories from Amrod:", error);
      throw new HttpException(
        500,
        `Failed to fetch categories: ${error.message}`
      );
    }
  }

  /**
   * Get categories for sidebar - USING THE ACTUAL CATEGORIES API
   */
  public async getAmrodCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }> {
    try {
      const rawCategories = await this.getRawAmrodCategories();

      if (!rawCategories || rawCategories.length === 0) {
        return { mainCategories: [], categoriesWithSubs: [] };
      }

      // Process categories to create the sidebar structure
      const { mainCategories, categoriesWithSubs } =
        this.processCategoriesForSidebar(rawCategories);

      return {
        mainCategories,
        categoriesWithSubs,
      };
    } catch (error) {
      console.error("Error processing categories:", error);
      // Fallback to product-based categories if API fails
      return this.getFallbackCategoriesFromProducts();
    }
  }

  /**
   * Process raw categories into sidebar format
   */
  private processCategoriesForSidebar(categories: ICategory[]): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  } {
    const allMainCategories = new Set<string>();
    const allSubcategories = new Map<string, Set<string>>();

    const processCategory = (category: ICategory, parentPath: string = "") => {
      const currentPath = parentPath
        ? `${parentPath}/${category.categoryName}`
        : category.categoryName;

      const normalizedPath = (
        category.categoryPath || currentPath
      ).toLowerCase();
      const pathParts = normalizedPath.split("/").filter((part) => part.trim());

      if (pathParts.length >= 1) {
        const mainCat = this.formatCategoryName(pathParts[0]);
        allMainCategories.add(mainCat);

        if (pathParts.length >= 2) {
          const subCat = this.formatCategoryName(pathParts[1]);
          if (!allSubcategories.has(mainCat)) {
            allSubcategories.set(mainCat, new Set());
          }
          allSubcategories.get(mainCat)?.add(subCat);
        }
      }

      // Process children recursively
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => {
          processCategory(child, currentPath);
        });
      }
    };

    // Process all top-level categories
    categories.forEach((category) => {
      processCategory(category);
    });

    // Convert to sidebar format
    const categoriesWithSubs: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    Array.from(allMainCategories)
      .sort()
      .forEach((mainCat) => {
        categoriesWithSubs.push({
          name: mainCat,
          subCategories: allSubcategories.has(mainCat)
            ? Array.from(allSubcategories.get(mainCat)!).sort()
            : null,
        });
      });

    return {
      mainCategories: Array.from(allMainCategories).sort(),
      categoriesWithSubs,
    };
  }

  /**
   * Fallback method to extract categories from products if categories API fails
   */
  private getFallbackCategoriesFromProducts(): {
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  } {
    if (!this.amrodCache) {
      return { mainCategories: [], categoriesWithSubs: [] };
    }

    const allMainCategories = new Set<string>();
    const allSubcategories = new Map<string, Set<string>>();

    this.amrodCache.forEach((product) => {
      product.categories?.forEach((cat: any) => {
        if (cat.path) {
          const pathParts = cat.path
            .split("/")
            .filter((part: string) => part.trim());

          if (pathParts.length >= 1) {
            const mainCat = this.formatCategoryName(pathParts[0]);
            allMainCategories.add(mainCat);

            if (pathParts.length >= 2) {
              const subCat = this.formatCategoryName(pathParts[1]);
              if (!allSubcategories.has(mainCat)) {
                allSubcategories.set(mainCat, new Set());
              }
              allSubcategories.get(mainCat)?.add(subCat);
            }
          }
        }
      });
    });

    const categoriesWithSubs: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];

    Array.from(allMainCategories)
      .sort()
      .forEach((mainCat) => {
        categoriesWithSubs.push({
          name: mainCat,
          subCategories: allSubcategories.has(mainCat)
            ? Array.from(allSubcategories.get(mainCat)!).sort()
            : null,
        });
      });

    return {
      mainCategories: Array.from(allMainCategories).sort(),
      categoriesWithSubs,
    };
  }

  private formatCategoryName(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  }

  public clearCache(): void {
    this.productsCache = null;
    this.amrodCache = null;
    this.parrotCache = null;
    this.tarsusCache = null;
    this.categoriesCache = null;
    this.cacheTimestamp = 0;

    // Clear all client caches
    this.amrodClient.clearTokenCache();
    if ((this.amrodClient as any).clearRequestCache) {
      (this.amrodClient as any).clearRequestCache();
    }

    if ((this.parrotClient as any).clearCache) {
      (this.parrotClient as any).clearCache();
    }

    if ((this.tarsusClient as any).clearCache) {
      (this.tarsusClient as any).clearCache();
    }

    console.log("🔄 All product and category caches cleared");
  }

  /**
   * Get Amrod product by code
   */
  public async getAmrodProductByCode(
    code: string
  ): Promise<IAggregatedProduct> {
    try {
      const amrodProducts = await this.fetchAmrodData();

      const product = amrodProducts.find(
        (p) =>
          p.simpleCode === code ||
          p.fullCode === code ||
          (p.variants &&
            p.variants.some(
              (v: any) => v.simpleCode === code || v.fullCode === code
            ))
      );

      if (!product) {
        throw new HttpException(
          404,
          `Amrod product with code '${code}' not found`
        );
      }

      return product;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Failed to fetch Amrod product: ${error.message}`
      );
    }
  }

  /**
   * Get Parrot product by code
   */
  public async getParrotProductByCode(
    code: string
  ): Promise<IAggregatedProduct> {
    try {
      const parrotProducts = await this.fetchParrotData();

      const product = parrotProducts.find(
        (p) => p.simpleCode === code || p.fullCode === code
      );

      if (!product) {
        throw new HttpException(
          404,
          `Parrot product with code '${code}' not found`
        );
      }

      return product;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Failed to fetch Parrot product: ${error.message}`
      );
    }
  }

  /**
   * Get Tarsus product by code
   */
  public async getTarsusProductByCode(
    code: string
  ): Promise<IAggregatedProduct> {
    try {
      const tarsusProducts = await this.fetchTarsusData();

      const product = tarsusProducts.find(
        (p) => p.simpleCode === code || p.fullCode === code
      );

      if (!product) {
        throw new HttpException(
          404,
          `Tarsus product with code '${code}' not found`
        );
      }

      return product;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Failed to fetch Tarsus product: ${error.message}`
      );
    }
  }

  /**
   * Search Amrod products by code
   */
  public async searchAmrodProductsByCode(
    query: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      const amrodProducts = await this.fetchAmrodData();

      // Case-insensitive search in simpleCode and fullCode
      const filteredProducts = amrodProducts.filter(
        (p) =>
          p.simpleCode?.toLowerCase().includes(query.toLowerCase()) ||
          p.fullCode?.toLowerCase().includes(query.toLowerCase()) ||
          (p.variants &&
            p.variants.some(
              (v: any) =>
                v.simpleCode?.toLowerCase().includes(query.toLowerCase()) ||
                v.fullCode?.toLowerCase().includes(query.toLowerCase())
            ))
      );

      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: totalProducts,
          parrot: 0,
          tarsus: 0,
        },
        searchQuery: query,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to search Amrod products: ${error.message}`
      );
    }
  }

  /**
   * Search Parrot products by code
   */
  public async searchParrotProductsByCode(
    query: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      const parrotProducts = await this.fetchParrotData();

      // Case-insensitive search in simpleCode and fullCode
      const filteredProducts = parrotProducts.filter(
        (p) =>
          p.simpleCode?.toLowerCase().includes(query.toLowerCase()) ||
          p.fullCode?.toLowerCase().includes(query.toLowerCase())
      );

      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: totalProducts,
          tarsus: 0,
        },
        searchQuery: query,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to search Parrot products: ${error.message}`
      );
    }
  }

  /**
   * Search Tarsus products by code
   */
  public async searchTarsusProductsByCode(
    query: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedResponse> {
    try {
      const tarsusProducts = await this.fetchTarsusData();

      // Case-insensitive search in simpleCode and fullCode
      const filteredProducts = tarsusProducts.filter(
        (p) =>
          p.simpleCode?.toLowerCase().includes(query.toLowerCase()) ||
          p.fullCode?.toLowerCase().includes(query.toLowerCase())
      );

      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / pageSize);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown: {
          amrod: 0,
          parrot: 0,
          tarsus: totalProducts,
        },
        searchQuery: query,
      };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to search Tarsus products: ${error.message}`
      );
    }
  }

  /**
   * FAST UNIVERSAL SEARCH - Combines all products with lightning-fast filtering
   */

  /**
   * Get related products for a given product
   */
  public async getRelatedProducts(
    product: IAggregatedProduct,
    limit: number = 5
  ): Promise<IAggregatedProduct[]> {
    if (!product) {
      return [];
    }

    try {
      const allProducts = await this.getAllProductsWithCache();
      const relatedProducts: Array<{
        product: IAggregatedProduct;
        score: number;
      }> = [];

      for (const candidate of allProducts) {
        // Skip the same product
        if (candidate.fullCode === product.fullCode) {
          continue;
        }

        const score = this.calculateRelatednessScore(product, candidate);

        if (score > 0) {
          relatedProducts.push({ product: candidate, score });
        }
      }

      // Sort by score (highest first) and take top N
      return relatedProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.product);
    } catch (error) {
      console.error("Error finding related products:", error);
      return [];
    }
  }

  /**
   * Calculate relatedness score between two products
   */
  private calculateRelatednessScore(
    productA: IAggregatedProduct,
    productB: IAggregatedProduct
  ): number {
    let score = 0;

    // 1. Category matching (highest weight)
    if (productA.categories && productB.categories) {
      const aCategories = new Set(
        productA.categories.map((cat) => cat.name?.toLowerCase())
      );
      const bCategories = new Set(
        productB.categories.map((cat) => cat.name?.toLowerCase())
      );

      let categoryMatches = 0;
      for (const cat of aCategories) {
        if (bCategories.has(cat)) {
          categoryMatches++;
        }
      }

      score += categoryMatches * 10; // High weight for category matches
    }

    // 2. Brand matching
    if (
      productA.brand?.name &&
      productB.brand?.name &&
      productA.brand.name.toLowerCase() === productB.brand.name.toLowerCase()
    ) {
      score += 8;
    }

    // 3. Price range similarity
    const priceA = productA.price || 0;
    const priceB = productB.price || 0;
    if (priceA > 0 && priceB > 0) {
      const priceRatio = Math.min(priceA, priceB) / Math.max(priceA, priceB);
      if (priceRatio > 0.7) {
        // Within 30% price range
        score += 6;
      }
    }

    // 4. Keyword matching in product name
    if (productA.productName && productB.productName) {
      const aWords = new Set(productA.productName.toLowerCase().split(/\s+/));
      const bWords = new Set(productB.productName.toLowerCase().split(/\s+/));

      let wordMatches = 0;
      for (const word of aWords) {
        if (word.length > 3 && bWords.has(word)) {
          // Only consider words longer than 3 chars
          wordMatches++;
        }
      }

      score += wordMatches * 3;
    }

    // 5. Same supplier bonus
    if (productA.supplier === productB.supplier) {
      score += 2;
    }

    return score;
  }

  /**
   * Refresh the product index (call this when cache is cleared)
   */
  public async refreshProductIndex(): Promise<void> {
    this.indexBuilt = false;
    await this.buildProductCodeIndex();
  }

  /**
   * Build or rebuild the product code index
   */
  private async buildProductCodeIndex(): Promise<void> {
    console.log("🏗️ Building product code index...");
    const startTime = Date.now();

    this.productCodeIndex.clear();

    try {
      const allProducts = await this.getAllProductsWithCache();

      let indexedCount = 0;
      for (const product of allProducts) {
        // Index by fullCode (primary key)
        if (product.fullCode) {
          const normalizedFullCode = product.fullCode.trim().toUpperCase();
          this.productCodeIndex.set(normalizedFullCode, product);
          indexedCount++;
        }

        // Also index by simpleCode for fallback lookup
        if (product.simpleCode && product.simpleCode !== product.fullCode) {
          const normalizedSimpleCode = product.simpleCode.trim().toUpperCase();
          // Only set if not already exists to avoid overwriting fullCode entries
          if (!this.productCodeIndex.has(normalizedSimpleCode)) {
            this.productCodeIndex.set(normalizedSimpleCode, product);
            indexedCount++;
          }
        }

        // Index variants as well
        if (product.variants) {
          for (const variant of product.variants) {
            if (variant.fullCode) {
              const normalizedVariantCode = variant.fullCode
                .trim()
                .toUpperCase();
              this.productCodeIndex.set(normalizedVariantCode, product);
              indexedCount++;
            }
          }
        }
      }

      this.indexBuilt = true;
      const endTime = Date.now();
      console.log(
        `✅ Product code index built: ${indexedCount} entries in ${
          endTime - startTime
        }ms`
      );
    } catch (error) {
      console.error("❌ Failed to build product code index:", error);
      this.indexBuilt = false;
    }
  }

  /**
   * Get product by fullCode with true lightning-fast lookup
   */
  public async getProductByFullCode(
    fullCode: string
  ): Promise<IAggregatedProduct | null> {
    if (!fullCode) return null;

    const normalizedCode = fullCode.trim().toUpperCase();

    // Ensure index is built
    if (!this.indexBuilt) {
      await this.buildComprehensiveIndex();
    }

    // 1. Primary index lookup
    const product = this.productCodeIndex.get(normalizedCode);
    if (product) {
      console.log(`🎯 Product found by code: ${normalizedCode}`);
      return product;
    }

    // 2. Variant index lookup
    const variantProduct = this.variantCodeIndex.get(normalizedCode);
    if (variantProduct) {
      console.log(`🔍 Product found via variant: ${normalizedCode}`);
      return variantProduct;
    }

    // 3. Simple code index lookup
    const simpleCodeProduct = this.simpleCodeIndex.get(normalizedCode);
    if (simpleCodeProduct) {
      console.log(`📝 Product found via simple code: ${normalizedCode}`);
      return simpleCodeProduct;
    }

    // 4. Clean code index lookup (special characters removed)
    const cleanCode = normalizedCode.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanCode !== normalizedCode) {
      const cleanCodeProduct = this.cleanCodeIndex.get(cleanCode);
      if (cleanCodeProduct) {
        console.log(`🧹 Product found via clean code: ${normalizedCode}`);
        return cleanCodeProduct;
      }
    }

    console.log(`❌ Product not found: ${normalizedCode}`);
    return null;
  }

  // === ADD THIS NEW METHOD ===
  /**
   * Build comprehensive indexes for all product codes
   */
  private async buildComprehensiveIndex(): Promise<void> {
    if (this.indexBuilt) return;

    console.time("Building comprehensive product indexes");

    const allProducts = await this.getAllProductsWithCache();

    // Clear existing indexes
    this.productCodeIndex.clear();
    this.variantCodeIndex.clear();
    this.simpleCodeIndex.clear();
    this.cleanCodeIndex.clear();

    for (const product of allProducts) {
      // Index main product codes
      if (product.fullCode) {
        const normalizedFullCode = product.fullCode.toUpperCase();
        this.productCodeIndex.set(normalizedFullCode, product);

        // Also index clean version
        const cleanFullCode = normalizedFullCode.replace(/[^a-zA-Z0-9]/g, "");
        if (cleanFullCode && cleanFullCode !== normalizedFullCode) {
          this.cleanCodeIndex.set(cleanFullCode, product);
        }
      }

      // Index simple codes
      if (product.simpleCode) {
        const normalizedSimpleCode = product.simpleCode.toUpperCase();
        this.simpleCodeIndex.set(normalizedSimpleCode, product);
      }

      // Index variants
      if (product.variants) {
        for (const variant of product.variants) {
          if (variant.fullCode) {
            const normalizedVariantCode = variant.fullCode.toUpperCase();
            this.variantCodeIndex.set(normalizedVariantCode, product);
          }
        }
      }
    }

    this.indexBuilt = true;
    console.timeEnd("Building comprehensive product indexes");
    console.log(
      `📊 Index stats - Main: ${this.productCodeIndex.size}, Variants: ${this.variantCodeIndex.size}, Simple: ${this.simpleCodeIndex.size}, Clean: ${this.cleanCodeIndex.size}`
    );
  }

  public async getUniversalSearch(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse> {
    const startTime = Date.now();

    try {
      console.log(`🚀 Starting universal search with filters:`, filters);

      // Use cached data for maximum speed
      const [amrodProducts, parrotProducts, tarsusProducts, furnitureProducts] = await Promise.all([
      this.fetchAmrodData(),
      this.fetchParrotData(), 
      this.fetchTarsusData(),
      this.fetchFurnitureData(), // Add furniture data
    ]);

      console.log(
        `📦 Data loaded: ${amrodProducts.length} Amrod, ${parrotProducts.length} Parrot, ${tarsusProducts.length} Tarsus`
      );

      // Combine all products (this is fast since we're just merging arrays)
      const allProducts = [
        ...amrodProducts,
        ...parrotProducts,
        ...tarsusProducts,
        ...furnitureProducts, 
      ];

      console.log(`🔄 Combined ${allProducts.length} total products`);

      // Apply filters in the most efficient order
      let filteredProducts = this.applyOptimizedFilters(allProducts, filters);

      // Handle pagination
      let page = filters.page || 1;
      const limit = filters.limit || 12;
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      // Calculate supplier breakdown from filtered results
      const supplierBreakdown =
        this.calculateSupplierBreakdown(filteredProducts);

      const endTime = Date.now();
      console.log(
        `✅ Universal search completed in ${endTime - startTime}ms: ${
          filteredProducts.length
        } results`
      );

      return {
        products: paginatedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        supplierBreakdown,
        filters,
        // searchPerformance: {
        //   executionTime: endTime - startTime,
        //   totalProductsBeforeFilter: allProducts.length,
        //   totalProductsAfterFilter: filteredProducts.length
        // }
      };
    } catch (error: any) {
      console.error("❌ Universal search error:", error);
      throw new HttpException(
        500,
        `Failed to perform universal search: ${error.message}`
      );
    }
  }

  /**
   * Optimized filter application for maximum performance
   */
  private applyOptimizedFilters(
    products: IAggregatedProduct[],
    filters: ProductFilters
  ): IAggregatedProduct[] {
    let filtered = [...products];

    // FAST PATH: If no filters, return shuffled results for variety
    if (!filters.search && !filters.category && !filters.sortBy) {
      return this.shuffleArray(filtered).slice(0, 100); // Limit to 100 for performance
    }

    // Apply filters in optimal order (most restrictive first)

    // 1. Search filter (most restrictive - reduces dataset quickly)
    if (filters.search && filters.search.trim()) {
      filtered = this.applyFastSearchFilter(filtered, filters.search);
    }

    // 2. Category filter (moderately restrictive)
    if (filters.category && filters.category !== "All") {
      filtered = this.applyFastCategoryFilter(
        filtered,
        filters.category,
        filters.subCategory
      );
    }

    // 3. Sorting (applied last on smaller dataset)
    if (filters.sortBy) {
      filtered = this.applyFastSorting(filtered, filters.sortBy);
    }

    return filtered;
  }

  /**
   * Ultra-fast search implementation - FIXED VERSION
   */
  private applyFastSearchFilter(
    products: IAggregatedProduct[],
    searchQuery: string
  ): IAggregatedProduct[] {
    const query = searchQuery.toLowerCase().trim();

    const results: IAggregatedProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // 1. FIRST check exact product name match (highest priority)
      if (product.productName?.toLowerCase() === query) {
        results.unshift(product); // Add to beginning for exact matches
        continue;
      }

      // 2. THEN check if product name contains the search term
      if (product.productName?.toLowerCase().includes(query)) {
        results.push(product);
        continue;
      }

      // 3. THEN check product code matches
      if (
        product.fullCode?.toLowerCase().includes(query) ||
        product.simpleCode?.toLowerCase().includes(query)
      ) {
        results.push(product);
        continue;
      }

      // 4. ONLY THEN check other fields if no match found yet
      if (product.brand?.name?.toLowerCase().includes(query)) {
        results.push(product);
      }
    }

    return results;
  }

  /**
   * Fast category filtering
   */
  private applyFastCategoryFilter(
    products: IAggregatedProduct[],
    category: string,
    subCategory?: string
  ): IAggregatedProduct[] {
    const results: IAggregatedProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      if (this.productBelongsToCategory(product, category)) {
        if (
          !subCategory ||
          this.productBelongsToSubCategory(product, subCategory)
        ) {
          results.push(product);
        }
      }
    }

    return results;
  }

  /**
   * Optimized sorting
   */
  private applyFastSorting(
    products: IAggregatedProduct[],
    sortBy: string
  ): IAggregatedProduct[] {
    // Create a copy to avoid mutating original
    const sorted = [...products];

    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) =>
          (a.productName || "").localeCompare(b.productName || "")
        );

      case "name-desc":
        return sorted.sort((a, b) =>
          (b.productName || "").localeCompare(a.productName || "")
        );

      case "price-asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

      case "price-desc":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

      case "brand":
        return sorted.sort((a, b) =>
          (a.brand?.name || "").localeCompare(b.brand?.name || "")
        );

      default:
        return sorted;
    }
  }

  /**
   * Calculate supplier breakdown from filtered results
   */
  private calculateSupplierBreakdown(products: IAggregatedProduct[]): {
    amrod: number;
    parrot: number;
    tarsus: number;
    internal?: number;
    branding?: number;
  } {
    const breakdown = {
      amrod: 0,
      parrot: 0,
      tarsus: 0,
      internal: 0,
      branding: 0,
    };

    for (const product of products) {
      switch (product.supplier) {
        case "amrod":
          breakdown.amrod++;
          if (product.isBrandingProduct) breakdown.branding++;
          break;
        case "parrot":
          breakdown.parrot++;
          if (product.isInternalProduct) breakdown.internal++;
          break;
        case "tarsus":
          breakdown.tarsus++;
          break;
      }
    }

    return breakdown;
  }

  /**
   * Shuffle array for random results (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get search suggestions for autocomplete (very fast)
   */
  public async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<{
    products: Array<{ name: string; code: string; supplier: string }>;
    categories: string[];
    brands: string[];
  }> {
    if (!query || query.length < 2) {
      return { products: [], categories: [], brands: [] };
    }

    try {
      const searchTerm = query.toLowerCase().trim();
      const allProducts = await this.getAllProductsWithCache();

      const productMatches: Array<{
        name: string;
        code: string;
        supplier: string;
      }> = [];
      const categoryMatches = new Set<string>();
      const brandMatches = new Set<string>();

      // Fast iteration with early exit when we hit limits
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];

        // Check product name matches
        if (product.productName?.toLowerCase().includes(searchTerm)) {
          if (productMatches.length < limit) {
            productMatches.push({
              name: product.productName,
              code: product.fullCode || product.simpleCode,
              supplier: product.supplier,
            });
          }
        }

        // Check category matches
        if (product.categories) {
          for (const cat of product.categories) {
            if (cat.name?.toLowerCase().includes(searchTerm)) {
              categoryMatches.add(cat.name);
              if (categoryMatches.size >= 5) break;
            }
          }
        }

        // Check brand matches
        if (product.brand?.name?.toLowerCase().includes(searchTerm)) {
          brandMatches.add(product.brand.name);
          if (brandMatches.size >= 5) break;
        }

        // Early exit if we have enough matches
        if (
          productMatches.length >= limit &&
          categoryMatches.size >= 5 &&
          brandMatches.size >= 5
        ) {
          break;
        }
      }

      return {
        products: productMatches,
        categories: Array.from(categoryMatches).slice(0, 5),
        brands: Array.from(brandMatches).slice(0, 5),
      };
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return { products: [], categories: [], brands: [] };
    }
  }
}
