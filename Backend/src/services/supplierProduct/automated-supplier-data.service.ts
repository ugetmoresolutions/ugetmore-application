import { Service, Inject } from "typedi";
import { ISupplierProductService, SUPPLIER_PRODUCT_SERVICE_TOKEN } from "@/interfaces/supplierProduct/supplierProduct.service.interface";
import { IParrotClientService, PARROT_CLIENT_SERVICE_TOKEN } from "@/interfaces/aggregated-product/parrot/parrot-client.service.interface";
import { ITarsusClientService, TARSUS_CLIENT_SERVICE_TOKEN } from "@/interfaces/aggregated-product/tarsus/tarsus-client.service.interface";
import { IAmrodClientService, AMROD_CLIENT_SERVICE_TOKEN } from "@/interfaces/aggregated-product/amrod/amrod-client.service.interface";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import { transformTarsusProductToAmrodStructure } from "@/utils/tarsus-transform";
import SupplierProduct from "@/models/supplierProduct/supplierProduct.model";

@Service()
export class AutomatedSupplierDataService {
  
  // === MARKUP PERCENTAGES (SAME AS ProductAggregationService) ===
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
    @Inject(SUPPLIER_PRODUCT_SERVICE_TOKEN)
    private supplierProductService: ISupplierProductService,
    
    @Inject(PARROT_CLIENT_SERVICE_TOKEN)
    private parrotClient: IParrotClientService,
    
    @Inject(TARSUS_CLIENT_SERVICE_TOKEN)
    private tarsusClient: ITarsusClientService,

    @Inject(AMROD_CLIENT_SERVICE_TOKEN)
    private amrodClient: IAmrodClientService
  ) {}

  // ========== AMROD METHODS ==========

  /**
   * Get Amrod products using EXACT SAME logic as ProductAggregationService
   */
  private async getAmrodProducts(): Promise<any[]> {
    try {
      console.log('🎨 Starting Amrod data synchronization with ProductAggregationService logic...');
      
      // Step 1: Ensure we're authenticated first
      if (!this.amrodClient.isAuthenticated()) {
        console.log('🔐 Ensuring Amrod authentication before data fetch...');
        await this.amrodClient.getPrices();
      }

      // Step 2: Fetch ALL products from both endpoints
      const [productsWithBranding, productsFromEndpoint] = await Promise.all([
        this.amrodClient.getProducts(),
        this.amrodClient.getProductsFromProductsEndpoint(),
      ]);

      console.log(
        `📦 Amrod products fetched: ${productsWithBranding.length} with branding, ${productsFromEndpoint.length} from products endpoint`
      );

      // Step 3: Merge products first
      const mergedProducts = this.mergeAmrodProducts(
        productsWithBranding,
        productsFromEndpoint
      );

      console.log(`✅ Merged Amrod products: ${mergedProducts.length} unique products`);

      // Step 4: Wait a brief moment to ensure API readiness
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 5: Fetch prices and stock SEQUENTIALLY
      console.log("💰 Fetching Amrod prices...");
      const prices = await this.amrodClient.getPrices();
      console.log(`✅ Prices fetched: ${prices.length} price entries`);

      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("📊 Fetching Amrod stock...");
      const stock = await this.amrodClient.getStock();
      console.log(`✅ Stock fetched: ${stock.length} stock entries`);

      // Step 6: Process Amrod products with VARIANT-AWARE matching
      const processedAmrodProducts = this.processAmrodProductsWithVariantAwareMatching(
        mergedProducts,
        prices,
        stock
      );

      console.log(`🔧 Processed Amrod products: ${processedAmrodProducts.length} with prices and stock`);

      // Step 7: Apply markups to all products
      const productsWithMarkup = processedAmrodProducts.map(product => {
        const originalPrice = product.price || 0;
        const markedUpPrice = this.calculateMarkupPrice(originalPrice, "amrod");
        
        return {
          ...product,
          originalPrice: originalPrice,
          price: markedUpPrice,
          hasMarkup: true,
          markupPercentage: this.MARKUP_PERCENTAGES.amrod
        };
      });

      return productsWithMarkup;

    } catch (error) {
      console.error('❌ Amrod data synchronization failed:', error);
      
      if (error.message?.includes("prices")) {
        console.warn("⚠️ Prices fetch failed, returning products with zero prices as fallback");
        return await this.getAmrodProductsWithFallbackPrices();
      }

      throw error;
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

    const getProductFullCode = (product: any) =>
      product.fullCode || product.productCode;

    productsWithBranding.forEach((product) => {
      const fullCode = getProductFullCode(product);
      if (fullCode) {
        productMap.set(fullCode, product);
      }
    });

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
   * Create variant-aware price map with base product mappings
   */
  private createVariantAwarePriceMap(prices: any[], stock: any[]) {
    const priceMap = new Map();
    const stockMap = new Map();

    console.log(`📊 BUILDING VARIANT-AWARE PRICE MAP...`);

    prices.forEach((price) => {
      const priceFullCode = price.fullCode
        ? price.fullCode.trim().toUpperCase()
        : null;
      const priceSimpleCode = price.simplecode
        ? price.simplecode.trim().toUpperCase()
        : null;

      if (priceFullCode) {
        priceMap.set(priceFullCode, price);
      }
      
      if (priceSimpleCode && priceSimpleCode !== priceFullCode) {
        priceMap.set(priceSimpleCode, price);
      }

      if (priceFullCode) {
        const baseCode = this.extractBaseProductCode(priceFullCode);
        if (baseCode && baseCode !== priceFullCode) {
          if (!priceMap.has(baseCode)) {
            priceMap.set(baseCode, price);
          }
        }
      }
    });

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

    console.log(`📊 VARIANT-AWARE PRICE MAP: ${priceMap.size} price entries, ${stockMap.size} stock entries`);

    return { priceMap, stockMap };
  }

  /**
   * Process Amrod products with VARIANT-AWARE matching
   */
  private processAmrodProductsWithVariantAwareMatching(
    products: any[],
    prices: any[],
    stock: any[]
  ): any[] {
    const { priceMap, stockMap } = this.createVariantAwarePriceMap(prices, stock);

    let matchedWithPrice = 0;
    let matchedWithStock = 0;

    const processedProducts = products.map((product) => {
      const productFullCode = (product.fullCode || product.productCode || '')
        .trim()
        .toUpperCase();
      const productSimpleCode = (product.simpleCode || '').trim().toUpperCase();

      let productPrice = this.findPriceWithVariantAwareMatching(
        productFullCode,
        productSimpleCode,
        priceMap
      );
      
      let productStock = stockMap.get(productFullCode) || stockMap.get(productSimpleCode);

      if (productPrice) matchedWithPrice++;
      if (productStock) matchedWithStock++;

      const originalPrice = productPrice?.price || 0;

      const normalizedProduct = this.normalizeAmrodProduct(product);

      return {
        ...normalizedProduct,
        price: originalPrice,
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
              fullCode: normalizedProduct.fullCode,
              incomingStock: null,
              modifiedDate: new Date().toISOString(),
              reservedStock: 0,
              simpleCode: normalizedProduct.simpleCode,
              stock: 0,
              stockType: 0,
            },
        isAvailable: (productStock?.stock || 0) > 0,
        supplier: "amrod",
      };
    });

    console.log(`🎯 FINAL MATCHING RESULTS:`);
    console.log(`   - Prices: ${matchedWithPrice}/${products.length} (${((matchedWithPrice / products.length) * 100).toFixed(2)}%)`);
    console.log(`   - Stock: ${matchedWithStock}/${products.length} (${((matchedWithStock / products.length) * 100).toFixed(2)}%)`);

    return processedProducts;
  }

  /**
   * Find price with VARIANT-AWARE matching
   */
  private findPriceWithVariantAwareMatching(
    fullCode: string, 
    simpleCode: string, 
    priceMap: Map<string, any>
  ): any {
    if (!fullCode && !simpleCode) return null;
    
    const searchCode = fullCode || simpleCode;
    
    const strategies = [
      { name: 'Exact Match', key: searchCode },
      { name: 'Cleaned Match', key: searchCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() },
      { name: 'Base Product Match', key: this.extractBaseProductCode(searchCode) },
      { name: 'Variant Match', key: this.findAnyVariantPrice(searchCode, priceMap) },
    ];

    for (const strategy of strategies) {
      if (strategy.key && priceMap.has(strategy.key)) {
        return priceMap.get(strategy.key);
      }
    }

    return null;
  }

  /**
   * Extract base product code by removing size indicators
   */
  private extractBaseProductCode(productCode: string): string {
    if (!productCode) return productCode;
    
    const sizeIndicators = [
      '-S$', '-M$', '-L$', '-XL$', '-XXL$', '-XXXL$',
      '-32$', '-34$', '-36$', '-38$', '-40$', '-42$', '-44$', '-46$'
    ];
    
    let baseCode = productCode;
    
    for (const size of sizeIndicators) {
      const regex = new RegExp(size.replace('$', '') + '$');
      if (regex.test(baseCode)) {
        baseCode = baseCode.replace(regex, '');
        break;
      }
    }
    
    return baseCode !== productCode ? baseCode : productCode;
  }

  /**
   * Find any variant price for a base product
   */
  private findAnyVariantPrice(baseCode: string, priceMap: Map<string, any>): string | null {
    for (const [priceCode, price] of priceMap.entries()) {
      if (priceCode.startsWith(baseCode + '-') || priceCode === baseCode) {
        return priceCode;
      }
    }
    
    return null;
  }

  /**
   * Fallback method to return Amrod products with zero prices when price fetch fails
   */
  private async getAmrodProductsWithFallbackPrices(): Promise<any[]> {
    try {
      const [productsWithBranding, productsFromEndpoint] = await Promise.all([
        this.amrodClient.getProducts(),
        this.amrodClient.getProductsFromProductsEndpoint(),
      ]);

      const mergedProducts = this.mergeAmrodProducts(
        productsWithBranding,
        productsFromEndpoint
      );

      const processedProducts = mergedProducts.map((product) => {
        const normalizedProduct = this.normalizeAmrodProduct(product);

        return {
          ...normalizedProduct,
          price: 0,
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
        };
      });

      return processedProducts;
    } catch (error) {
      console.error("Error in fallback Amrod products:", error);
      return [];
    }
  }

  /**
   * Normalize Amrod product structure to ensure consistency between endpoints
   */
  private normalizeAmrodProduct(product: any): any {
    const normalized: any = {
      simpleCode: product.simpleCode || product.productCode,
      fullCode: product.fullCode || product.productCode,
      productName: product.productName || product.name || "Unknown Product",
      description: product.description || "",
      categories: product.categories || [],
      brand: product.brand || { name: "Unknown Brand", code: "" },
      images: product.images || [],
      variants: product.variants || [],
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

  // ========== PARROT METHODS ==========

  /**
   * Get Parrot products using EXACT SAME category filtering as ProductAggregationService
   */
  private async getParrotProducts(): Promise<any[]> {
    try {
      console.log('🦜 Starting Parrot data synchronization with exact category filtering...');
      
      const rawParrotProducts = await this.parrotClient.getProducts();
      console.log(`🦜 Fetched ${rawParrotProducts.length} products from Parrot API`);

      const transformedProducts = rawParrotProducts.map(product => 
        this.transformParrotProductWithExactCategories(product)
      ).filter((product): product is any => product !== null);

      console.log(`🦜 Successfully transformed ${transformedProducts.length}/${rawParrotProducts.length} Parrot products`);

      const productsWithMarkup = transformedProducts.map(product => {
        const originalPrice = product.price || 0;
        const markedUpPrice = this.calculateMarkupPrice(originalPrice, "parrot", product);
        
        return {
          ...product,
          originalPrice: originalPrice,
          price: markedUpPrice,
          hasMarkup: true,
          markupPercentage: this.getParrotMarkupPercentage(product)
        };
      });

      return productsWithMarkup;

    } catch (error) {
      console.error('❌ Parrot data synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Transform Parrot product with EXACT SAME category detection as ProductAggregationService
   */
  private transformParrotProductWithExactCategories(parrotProduct: any): any {
    try {
      if (!parrotProduct?.StockCode) {
        console.log(`❌ Parrot product missing StockCode:`, parrotProduct);
        return null;
      }

      const categoryPath = parrotProduct.PublishingCategory?.CategoryName || 'Uncategorized';
      const categories = categoryPath.split(' > ').map((cat: string, index: number) => ({
        name: cat,
        path: categoryPath,
        code: `parrot_${index}`,
        image: ''
      }));

      const primaryImage = parrotProduct.ProductImageLinks && parrotProduct.ProductImageLinks.length > 0 
        ? parrotProduct.ProductImageLinks[0] 
        : '';

      const images = primaryImage ? [{
        name: 'Main Image',
        isDefault: true,
        urls: [{
          url: primaryImage,
          width: 400,
          height: 400
        }],
        hasLogo: false,
        angle: null,
        type: 'main'
      }] : [];

      const stockInfo = this.createStockInfo(parrotProduct, 'parrot');
      const isAvailable = (parrotProduct.TotalWarehouseStock || 0) > 0;
      
      const mainCategory = this.determineMainCategoryWithExactLogic('parrot', { categories });

      const originalPrice = parrotProduct.CustomerPrice || 0;

      return {
        actionType: 0,
        simpleCode: parrotProduct.StockCode,
        price: originalPrice,
        fullCode: parrotProduct.StockCode,
        categorisedAttribute: [],
        gender: null,
        material: parrotProduct.Material || '',
        fit: '',
        feature: parrotProduct.MetaKeywords || '',
        categories: categories,
        brand: {
          name: parrotProduct.Brand || 'PARROT PRODUCTS',
          brandWebsiteLogo: '',
          code: 'parrot'
        },
        companionCodes: [],
        relatedCodes: [],
        matchingCodes: [],
        groupingCodes: [],
        groupingCodeGiftsets: [],
        productName: parrotProduct.FriendlyTitle || parrotProduct.Description,
        description: parrotProduct.DetailedDescription || parrotProduct.Description,
        minimum: 1,
        maximum: null,
        incrementedBy: 1,
        keywords: parrotProduct.MetaKeywords || '',
        tags: parrotProduct.MetaKeywords || '',
        inventoryType: 'standard',
        behaviour: 'standard',
        madeToOrder: 'No',
        madeToOrderMessage: '',
        displayCountryOfOrigin: parrotProduct.CountryOfOrigin || '',
        promotion: '',
        fullBrandingGuide: '',
        logo24BrandingGuide: null,
        images: images,
        colourImages: [],
        brandings: [],
        isLogo24: false,
        logo24Branding: null,
        inclusiveBranding: [],
        variants: [{
          simpleCode: parrotProduct.StockCode,
          fullCode: parrotProduct.StockCode,
          codeColour: 'default',
          codeColourName: 'Default',
          codeSize: 'default',
          codeSizeName: 'Default',
          categorisedAttribute: null,
          packagingAndDimension: {
            cartonSizeDimensionL: parrotProduct.ProductDimensions?.Length || 0,
            cartonSizeDimensionW: parrotProduct.ProductDimensions?.Width || 0,
            cartonSizeDimensionH: parrotProduct.ProductDimensions?.Height || 0,
            piecesPerCarton: 1,
            cartonWeight: parrotProduct.ProductDimensions?.Mass || 0
          },
          productDimension: {
            length: parrotProduct.ProductDimensions?.Length || 0,
            width: parrotProduct.ProductDimensions?.Width || 0,
            weight: parrotProduct.ProductDimensions?.Mass || 0
          },
          isLogo24: false,
          components: null
        }],
        requiredBrandingPositions: [],
        noCoBrandingPositions: [],
        brandingTemplates: [],
        decoupled: false,
        type: 'physical',
        supplier: 'parrot',
        mainCategory: mainCategory,
        stockInfo: stockInfo,
        isAvailable: isAvailable,
        isJanitorial: this.isParrotJanitorialProduct({ categories }),
        isStationery: this.isParrotStationeryProduct({ categories })
      };
    } catch (error) {
      console.error(`❌ Error transforming Parrot product:`, error);
      return null;
    }
  }

  // ========== TARSUS METHODS ==========

  /**
   * Get Tarsus products
   */
  private async getTarsusProducts(): Promise<any[]> {
    try {
      console.log('🏢 Starting Tarsus data synchronization...');
      
      const rawTarsusProducts = await this.tarsusClient.getProducts();
      console.log(`🏢 Fetched ${rawTarsusProducts.length} products from Tarsus API`);

      const transformedProducts = rawTarsusProducts.map(product => 
        this.transformTarsusProduct(product)
      ).filter((product): product is any => product !== null);

      console.log(`🏢 Successfully transformed ${transformedProducts.length}/${rawTarsusProducts.length} Tarsus products`);

      return transformedProducts;

    } catch (error) {
      console.error('❌ Tarsus data synchronization failed:', error);
      throw error;
    }
  }

  // ========== CATEGORY & MARKUP METHODS ==========

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
        markupPercentage = this.getParrotMarkupPercentage(product);
        break;
      default:
        markupPercentage = 25;
    }

    const markupMultiplier = 1 + markupPercentage / 100;
    const markedUpPrice = originalPrice * markupMultiplier;
    return Math.round(markedUpPrice * 100) / 100;
  }

  /**
   * Get Parrot-specific markup percentage based on category
   */
  private getParrotMarkupPercentage(product?: any): number {
    if (!product) {
      return this.MARKUP_PERCENTAGES.parrot.default;
    }

    if (this.isParrotJanitorialProduct(product)) {
      return this.MARKUP_PERCENTAGES.parrot.janitorial;
    }

    if (this.isParrotStationeryProduct(product)) {
      return this.MARKUP_PERCENTAGES.parrot.stationery;
    }

    return this.MARKUP_PERCENTAGES.parrot.default;
  }

  /**
   * Determine main category with EXACT SAME logic as ProductAggregationService
   */
  private determineMainCategoryWithExactLogic(supplier: string, product?: any): string {
    switch (supplier.toLowerCase()) {
      case 'amrod':
        return 'Branding';
      case 'parrot':
        if (product && this.isParrotJanitorialProduct(product)) {
          return 'Janitorial';
        } else if (product && this.isParrotStationeryProduct(product)) {
          return 'Stationery';
        } else if (product && this.isParrotElectronicsProduct(product)) {
          return 'Electronics';
        } else if (product && this.isParrotDisplaySolutionsProduct(product)) {
          return 'Display Solutions';
        }
        return 'Stationery';
      case 'tarsus':
        return 'Electronics';
      default:
        return 'Uncategorized';
    }
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
   * Check if Parrot product belongs to electronics category
   */
  private isParrotElectronicsProduct(product: any): boolean {
    return this.checkParrotProductCategory(product, "electronics");
  }

  /**
   * Check if Parrot product belongs to display solutions category
   */
  private isParrotDisplaySolutionsProduct(product: any): boolean {
    return this.checkParrotProductCategory(product, "display-solutions");
  }

  /**
   * Generic method to check Parrot product category
   */
  private checkParrotProductCategory(
    product: any,
    categoryType: "janitorial" | "stationery" | "electronics" | "display-solutions"
  ): boolean {
    if (!product.categories || !product.categories.length) {
      return false;
    }

    const categoryMappings = {
      janitorial: [
        "1.5 Litres Cleaning Chemicals", "25 Litres Cleaning Chemicals", "5 Litres Cleaning Chemicals",
        "Janitorial Cleaning Chemicals", "Pine Gel", "Brooms", "Brooms and Mops", "Buckets", "Cloths",
        "Dustbins", "Dusters - Wood Chalk Board", "Industrial Vacuum Cleaner", "Mops", "Refuse Bags",
        "Telescopic Cleaning Brush", "Telescopic Squeegee", "Telescopic Waterfed Poles", "Hand Sanitizers",
        "Hand Soap", "Dispensers", "Toilet Roll & Paper Hand Towel Dispenser Holders", "PMAT Urine Mat",
        "Janitorial", "Personal Protective Equipment (PPE)",
      ],
      stationery: [
        "Highlighters", "Markers", "Permanent Markers", "Whiteboard Markers", "Calculators", "Clipboards",
        "Craft Knives & Refills", "Drawing & Push Pins", "Erasers & Aqua Wipes", "Glue", "Guillotines",
        "Paper Grippers", "Paper Hole Punches", "Rulers", "Scissors", "Staplers", "Staplers and Punches",
        "Staples", "Binding Machines and Binders", "Comb Binding Machines", "Laminating Machines",
        "Laminator Consumables", "Rotary Trimmers", "Flipchart Paper", "Office Equipment",
        "Office Equipment & Whiteboard Cleaner",
      ],
      electronics: [
        "Computer Products & Accessories", "External Storage", "Handheld Portable Label Printer",
        "Security Cables", "Shredders", "USB Port Hubs", "Audio Solutions", "Conference Speakers",
        "Headphones and Earphones", "Megaphones", "Microphones", "PA Systems", "Speakers",
        "Data Projector Trolleys", "Data Projectors", "Data Projectors & Screens", "Laser Pointers",
        "Overhead Projectors & Trolleys", "Projector Screens", "Projectors and Interactive Solutions",
        "Visualizers", "Wireless Presentation", "Adaptors", "Cables", "Cables & Adaptors", "Conduit",
        "Extension Cord Accessories", "Monitor Brackets", "Digital Graphics Drawing Tablets",
        "Interactive LED Solutions", "Interactive Whiteboard Systems and Accessories",
      ],
      "display-solutions": [
        "Display Solutions", "Boards", "Bulletin Boards (Aluminium Frame, Carpet)", "Chalk Boards",
        "Combi-Boards", "Educational Boards", "Glass / Chalkboard", "Glassboards", "Magnetic Chalkboards",
        "Non-Magnetic Chalkboards", "Revolving Boards", "Standard Glass Whiteboards", "Standard Magnetic Whiteboards",
        "Standard Non-Magnetic Whiteboards", "Whiteboard Tiles", "Whiteboards", "50mm Wall Sign - Flush",
        "A Frame Poster Stands", "A-Frame Boards", "Alufine Frame Info Boards", "Certificate Holders",
        "Chrome Corner Poster Frames", "Crowd Control Barriers", "Desktop Signs", "Digital Signage",
        "Double Sided - Standing", "Double Sided Poster Stand", "Garage Floor Stands", "Info Boards",
        "Info Boards (Aluminium Frame, Felt)", "Magnetic Self Adhesive Poster Frames", "Mitred Corner Poster Frames",
        "Mitred Econo Poster Frames", "Photoluminescent Signs", "Poster Frame Supports", "Poster Frames",
        "Sign Frame Extrusions", "Sign Frames", "Symbolic Signs", "Table Top Poster Frame Support Feet",
        "Triangular-Sided - Standing", "Wall Signs - Double Sided", "Wall Signs - Flush", "Acrylic Menu Holders",
        "Brochure Holders", "Display Cases", "In / Out Slides", "Perspex Pockets", "Plexiglass Media Covers",
        "Acoustic Panels", "Aluminium Composite Panels (ACP)", "Board Supports", "Designer Mounting Systems",
        "Desk Partitions", "Easy Rail System", "Easy Rail System Products", "Hanging Systems", "Mounting Brackets",
        "Partition Bracket & Hook", "Rail Systems", "Slatted Wall Panel", "Stands for LED Panels & eBoards",
        "Wall Rail + Brackets", "Acrylic Stands - (Mobile, Tablet or Laptop)", "Artist Easel", "Flipchart Stands",
        "Flipcharts", "Lap Trays", "Tripods", "Trolleys", "Accessories", "Accessory Holders", "Adhesive Pinning Boards",
        "Bubble Wrap", "Carpet Protectors", "Magnetic - Flexible Sheeting", "Magnetic - Flexible Strips",
        "Magnetic - Label Carriers", "Magnetic - Map Pins", "Magnetic - Photo Paper & Flexible Magnetic Tape",
        "Moulded Magnets", "Planners", "Printed Glassboards", "Steel Sheets", "Vinyl Lettering & Tape",
        "Wall Art Laser Cut", "Wall Maps", "Decorative Glass Wall Tiles", "Glass Clocks", "Glass Products",
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

  // ========== STOCK INFO METHODS ==========

  /**
   * Create proper stock info from product data
   */
  private createStockInfo(product: any, supplier: string): any {
    const baseStockInfo = {
      colourCode: null,
      fullCode: product.fullCode || product.simpleCode,
      incomingStock: null,
      modifiedDate: new Date().toISOString(),
      reservedStock: 0,
      simpleCode: product.simpleCode,
      stockType: 0,
    };

    switch (supplier.toLowerCase()) {
      case 'parrot':
        return {
          ...baseStockInfo,
          stock: product.TotalWarehouseStock || 0
        };
      case 'tarsus':
        return {
          ...baseStockInfo,
          stock: product.stockQuantity || product.availableStock || 0
        };
      case 'amrod':
        if (product.stockInfo) {
          return product.stockInfo;
        }
        return {
          ...baseStockInfo,
          stock: product.stock || 0
        };
      default:
        return {
          ...baseStockInfo,
          stock: 0
        };
    }
  }

  // ========== PRODUCT TRANSFORMATION METHODS ==========

  /**
   * Transform Amrod product to IBrandingProduct structure
   */
  private transformAmrodProduct(amrodProduct: any): Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> | null {
    try {
      if (!amrodProduct?.simpleCode) {
        console.log(`❌ Amrod product missing simpleCode:`, amrodProduct);
        return null;
      }

      const stockInfo = this.createStockInfo(amrodProduct, 'amrod');
      const isAvailable = (amrodProduct.stock || 0) > 0;
      const mainCategory = this.determineMainCategoryWithExactLogic('amrod');

      return {
        actionType: amrodProduct.actionType || 0,
        simpleCode: amrodProduct.simpleCode,
        price: amrodProduct.price || 0,
        fullCode: amrodProduct.fullCode,
        categorisedAttribute: amrodProduct.categorisedAttribute || [],
        gender: amrodProduct.gender || null,
        material: amrodProduct.material || '',
        fit: amrodProduct.fit || '',
        feature: amrodProduct.feature || '',
        categories: amrodProduct.categories || [],
        brand: amrodProduct.brand || {
          name: 'Amrod',
          brandWebsiteLogo: '',
          code: 'amrod'
        },
        companionCodes: amrodProduct.companionCodes || [],
        relatedCodes: amrodProduct.relatedCodes || [],
        matchingCodes: amrodProduct.matchingCodes || [],
        groupingCodes: amrodProduct.groupingCodes || [],
        groupingCodeGiftsets: amrodProduct.groupingCodeGiftsets || [],
        productName: amrodProduct.productName || 'Amrod Product',
        description: amrodProduct.description || '',
        minimum: amrodProduct.minimum || 1,
        maximum: amrodProduct.maximum || null,
        incrementedBy: amrodProduct.incrementedBy || 1,
        keywords: amrodProduct.keywords || '',
        tags: amrodProduct.tags || '',
        inventoryType: amrodProduct.inventoryType || 'standard',
        behaviour: amrodProduct.behaviour || 'standard',
        madeToOrder: amrodProduct.madeToOrder || 'No',
        madeToOrderMessage: amrodProduct.madeToOrderMessage || '',
        displayCountryOfOrigin: amrodProduct.displayCountryOfOrigin || '',
        promotion: amrodProduct.promotion || '',
        fullBrandingGuide: amrodProduct.fullBrandingGuide || '',
        logo24BrandingGuide: amrodProduct.logo24BrandingGuide || null,
        images: amrodProduct.images || [],
        colourImages: amrodProduct.colourImages || [],
        brandings: amrodProduct.brandings || [],
        isLogo24: amrodProduct.isLogo24 || false,
        logo24Branding: amrodProduct.logo24Branding || null,
        inclusiveBranding: amrodProduct.inclusiveBranding || [],
        variants: amrodProduct.variants || [],
        requiredBrandingPositions: amrodProduct.requiredBrandingPositions || [],
        noCoBrandingPositions: amrodProduct.noCoBrandingPositions || [],
        brandingTemplates: amrodProduct.brandingTemplates || [],
        decoupled: amrodProduct.decoupled || false,
        type: amrodProduct.type || 'physical',
        supplier: 'amrod',
        mainCategory: mainCategory,
        stockInfo: stockInfo,
        isAvailable: isAvailable,
        
      };
    } catch (error) {
      console.error(`❌ Error transforming Amrod product:`, error);
      return null;
    }
  }

  /**
   * Transform Tarsus product to IBrandingProduct structure with new fields
   */
  private transformTarsusProduct(tarsusProduct: any): Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> | null {
    try {
      const transformed = transformTarsusProductToAmrodStructure(tarsusProduct);
      
      if (!transformed?.simpleCode) {
        console.log(`❌ Tarsus product transformation failed:`, tarsusProduct);
        return null;
      }
      
      const stockInfo = this.createStockInfo(transformed, 'tarsus');
      const isAvailable = (transformed.stock || 0) > 0;
      const mainCategory = this.determineMainCategoryWithExactLogic('tarsus');

      const originalPrice = transformed.price || 0;
      const markedUpPrice = this.calculateMarkupPrice(originalPrice, "tarsus");

      return {
        ...transformed,
        price: markedUpPrice,
        originalPrice: originalPrice,
        supplier: 'tarsus',
        mainCategory: mainCategory,
        stockInfo: stockInfo,
        isAvailable: isAvailable,
        maximum: null,
        hasMarkup: true,
        markupPercentage: this.MARKUP_PERCENTAGES.tarsus
      } as Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>;
    } catch (error) {
      console.error(`❌ Error transforming Tarsus product:`, error);
      return null;
    }
  }

  // ========== DATABASE UPLOAD METHODS ==========

  /**
   * Upload Amrod data to database
   */
  public async uploadAmrodData(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🎨 Starting Amrod data upload...');
      
      const rawAmrodProducts = await this.getAmrodProducts();
      console.log(`🎨 Fetched ${rawAmrodProducts.length} products from Amrod API`);
      
      const transformedProducts = rawAmrodProducts.map(product => 
        this.transformAmrodProduct(product)
      ).filter((product): product is Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> => 
        product !== null
      );
      
      console.log(`🎨 Successfully transformed ${transformedProducts.length}/${rawAmrodProducts.length} Amrod products`);
      
      if (transformedProducts.length === 0) {
        console.log('❌ No valid Amrod products to upload');
        return {
          success: false,
          count: 0,
          message: 'Amrod: No valid products to upload'
        };
      }
      
      const uploadResults = await this.bulkUpsertProducts(transformedProducts);
      
      console.log(`✅ Amrod data upload completed: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`);
      
      return {
        success: uploadResults.errorCount === 0,
        count: uploadResults.successCount,
        message: `Amrod: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`
      };
      
    } catch (error: any) {
      console.error('❌ Amrod data upload failed:', error);
      return {
        success: false,
        count: 0,
        message: `Amrod data upload failed: ${error.message}`
      };
    }
  }

  /**
   * Upload Parrot data to database
   */
  public async uploadParrotData(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🦜 Starting Parrot data upload...');
      
      const rawParrotProducts = await this.getParrotProducts();
      console.log(`🦜 Fetched ${rawParrotProducts.length} products from Parrot API`);
      
      const transformedProducts = rawParrotProducts.map(product => 
        this.transformParrotProductWithExactCategories(product)
      ).filter((product): product is Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> => 
        product !== null
      );
      
      console.log(`🦜 Successfully transformed ${transformedProducts.length}/${rawParrotProducts.length} Parrot products`);
      
      if (transformedProducts.length === 0) {
        console.log('❌ No valid Parrot products to upload');
        return {
          success: false,
          count: 0,
          message: 'Parrot: No valid products to upload'
        };
      }
      
      const uploadResults = await this.bulkUpsertProducts(transformedProducts);
      
      console.log(`✅ Parrot data upload completed: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`);
      
      return {
        success: uploadResults.errorCount === 0,
        count: uploadResults.successCount,
        message: `Parrot: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`
      };
      
    } catch (error: any) {
      console.error('❌ Parrot data upload failed:', error);
      return {
        success: false,
        count: 0,
        message: `Parrot data upload failed: ${error.message}`
      };
    }
  }

  /**
   * Upload Tarsus data to database
   */
  public async uploadTarsusData(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🏢 Starting Tarsus data upload...');
      
      const rawTarsusProducts = await this.getTarsusProducts();
      console.log(`🏢 Fetched ${rawTarsusProducts.length} products from Tarsus API`);
      
      const transformedProducts = rawTarsusProducts.map(product => 
        this.transformTarsusProduct(product)
      ).filter((product): product is Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> => 
        product !== null
      );
      
      console.log(`🏢 Successfully transformed ${transformedProducts.length}/${rawTarsusProducts.length} Tarsus products`);
      
      if (transformedProducts.length === 0) {
        console.log('❌ No valid Tarsus products to upload');
        return {
          success: false,
          count: 0,
          message: 'Tarsus: No valid products to upload'
        };
      }
      
      const uploadResults = await this.bulkUpsertProducts(transformedProducts);
      
      console.log(`✅ Tarsus data upload completed: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`);
      
      return {
        success: uploadResults.errorCount === 0,
        count: uploadResults.successCount,
        message: `Tarsus: ${uploadResults.successCount} products processed, ${uploadResults.errorCount} errors`
      };
      
    } catch (error: any) {
      console.error('❌ Tarsus data upload failed:', error);
      return {
        success: false,
        count: 0,
        message: `Tarsus data upload failed: ${error.message}`
      };
    }
  }

  /**
   * Bulk upsert using Sequelize bulkCreate for maximum performance
   */
  private async bulkUpsertProducts(products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ successCount: number; errorCount: number }> {
    try {
      console.log(`🔄 Attempting to bulk upsert ${products.length} products...`);
      
      const validProducts = products.filter(product => {
        if (!product) {
          console.log('❌ Found null product in batch, skipping');
          return false;
        }
        if (!product.simpleCode || !product.supplier) {
          console.log(`❌ Invalid product: missing simpleCode or supplier`, { 
            simpleCode: product.simpleCode,
            supplier: product.supplier 
          });
          return false;
        }
        return true;
      });

      console.log(`✅ Valid products for bulk upsert: ${validProducts.length}/${products.length}`);

      if (validProducts.length === 0) {
        console.log('❌ No valid products to upsert');
        return { successCount: 0, errorCount: products.length };
      }

      const result = await SupplierProduct.bulkCreate(validProducts, {
        updateOnDuplicate: [
          'price', 'fullCode', 'categorisedAttribute', 'material', 'fit', 'feature',
          'categories', 'brand', 'companionCodes', 'relatedCodes', 'matchingCodes',
          'groupingCodes', 'groupingCodeGiftsets', 'productName', 'description',
          'minimum', 'maximum', 'incrementedBy', 'keywords', 'tags', 'inventoryType',
          'behaviour', 'madeToOrder', 'madeToOrderMessage', 'displayCountryOfOrigin',
          'promotion', 'fullBrandingGuide', 'logo24BrandingGuide', 'images',
          'colourImages', 'brandings', 'isLogo24', 'logo24Branding', 'inclusiveBranding',
          'variants', 'requiredBrandingPositions', 'noCoBrandingPositions',
          'brandingTemplates', 'decoupled', 'type', 'stock', 'supplier', 
          'mainCategory', 'stockInfo', 'isAvailable', 'updatedAt'
        ],
        validate: false,
        ignoreDuplicates: false
      });

      console.log(`✅ Bulk upsert completed: ${result.length} products processed from ${validProducts.length} valid products`);
      
      const errorCount = products.length - result.length;
      return { successCount: result.length, errorCount };

    } catch (error: any) {
      console.error('❌ Bulk upsert failed:', error.message);
      
      console.log('🔄 Falling back to individual upsert...');
      return await this.individualUpsertProducts(products);
    }
  }

  /**
   * Fallback individual upsert if bulk operation fails
   */
  private async individualUpsertProducts(products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ successCount: number; errorCount: number }> {
    let successCount = 0;
    let errorCount = 0;

    const batchSize = 50;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (product) => {
        try {
          const existingProduct = await this.supplierProductService.getSupplierProductBySimpleCode(product.simpleCode);
          
          if (existingProduct) {
            await this.supplierProductService.updateSupplierProduct(existingProduct.id, product);
          } else {
            await this.supplierProductService.createSupplierProduct(product);
          }
          successCount++;
        } catch (error) {
          console.error(`Error processing product ${product.simpleCode}:`, error);
          errorCount++;
        }
      });

      await Promise.all(batchPromises);
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
    }

    return { successCount, errorCount };
  }

  /**
   * Upload all data (Amrod + Parrot + Tarsus)
   */
  public async uploadAllData(): Promise<{ 
    success: boolean; 
    amrod: { count: number; message: string };
    parrot: { count: number; message: string };
    tarsus: { count: number; message: string };
    total: number;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    console.log(`🕛 Starting automated data update at ${timestamp}`);
    
    const [amrodResult, parrotResult, tarsusResult] = await Promise.allSettled([
      this.uploadAmrodData(),
      this.uploadParrotData(),
      this.uploadTarsusData()
    ]);

    const amrod = amrodResult.status === 'fulfilled' ? amrodResult.value : { success: false, count: 0, message: `Amrod failed: ${amrodResult.reason}` };
    const parrot = parrotResult.status === 'fulfilled' ? parrotResult.value : { success: false, count: 0, message: `Parrot failed: ${parrotResult.reason}` };
    const tarsus = tarsusResult.status === 'fulfilled' ? tarsusResult.value : { success: false, count: 0, message: `Tarsus failed: ${tarsusResult.reason}` };

    const overallSuccess = parrot.success && tarsus.success && amrod.success;

    console.log(`🕛 Automated data update completed: ${overallSuccess ? 'SUCCESS' : 'PARTIAL FAILURE'}`);
    console.log(`   - Amrod: ${amrod.count} products - ${amrod.success ? '✅' : '❌'}`);
    console.log(`   - Parrot: ${parrot.count} products - ${parrot.success ? '✅' : '❌'}`);
    console.log(`   - Tarsus: ${tarsus.count} products - ${tarsus.success ? '✅' : '❌'}`);

    return {
      success: overallSuccess,
      amrod: { count: amrod.count, message: amrod.message },
      parrot: { count: parrot.count, message: parrot.message },
      tarsus: { count: tarsus.count, message: tarsus.message },
      total: amrod.count + parrot.count + tarsus.count,
      timestamp
    };
  }
}