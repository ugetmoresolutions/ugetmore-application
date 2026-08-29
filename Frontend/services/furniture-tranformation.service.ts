import { IFurnitureProduct } from "@/interfaces/furniture/furniture";
import { IProduct, Category, Brand, Code, ProductImage, ImageUrl, ColourImage, Branding, BrandingMethod, ProductVariant } from "@/interfaces/product/product";

export class FurnitureTransformationService {
  
  // Transform single furniture product to IProduct using actual data
  static transformFurnitureToProduct(furniture: IFurnitureProduct): IProduct {
    // Transform main images - use actual furniture image data
    const images: ProductImage[] = furniture.mainImages.map((img, index) => ({
      name: furniture.title,
      isDefault: index === 0,
      urls: [{
        url: img.url,
        width: 0, // These would come from actual image metadata
        height: 0
      }],
      hasLogo: false,
      angle: null,
      type: 'main'
    }));

    // Transform color images - use actual furniture color data
    const colourImages: ColourImage[] = furniture.colorImages.map(color => ({
      name: color.name,
      code: color.code,
      images: color.images.map(img => ({
        name: color.name,
        isDefault: false,
        urls: [{
          url: img.url,
          width: 0,
          height: 0
        }],
        hasLogo: false,
        angle: null,
        type: 'color'
      }))
    }));

    // Transform categories - use actual furniture categories
    const categories: Category[] = furniture.categories.map(cat => ({
      name: cat,
      path: `/category/${cat}`,
      code: cat, // Use actual category name as code
      image: '' // Would be actual category image if available
    }));

    // Transform brand - use actual furniture brand
    const brand: Brand = {
      name: furniture.brand,
      brandWebsiteLogo: '', // Would be actual brand logo if available
      code: furniture.brand // Use brand name as code
    };

    // Use actual SKU from furniture
    const simpleCode = furniture.sku;
    const fullCode = furniture.sku; // Use same SKU for full code

    // Transform variants - use actual furniture sizes
    const variants: any[] = furniture.sizes.map(size => ({
      simpleCode: `${furniture.sku}-${size}`,
      fullCode: `${furniture.sku}-${size}`,
      codeColour: furniture.colorImages[0]?.code || '',
      codeColourName: furniture.colorImages[0]?.name || '',
      codeSize: size,
      codeSizeName: size,
      categorisedAttribute: null,
      packagingAndDimension: {
        cartonSizeDimensionL: furniture.dimensions?.length || 0,
        cartonSizeDimensionW: furniture.dimensions?.width || 0,
        cartonSizeDimensionH: furniture.dimensions?.height || 0,
        piecesPerCarton: 1,
        cartonWeight: furniture.weight || 0
      },
      productDimension: {
        length: furniture.dimensions?.length || 0,
        width: furniture.dimensions?.width || 0,
        weight: furniture.weight || 0
      },
      isLogo24: false,
      components: null
    }));

    // Transform to IProduct using actual furniture data
    const transformedProduct: IProduct = {
      actionType: 1,
      simpleCode,
      fullCode,
      categorisedAttribute: [],
      gender: null,
      material: furniture.material || '',
      fit: '',
      feature: '',
      categories,
      brand,
      companionCodes: [],
      relatedCodes: [],
      matchingCodes: [],
      groupingCodes: [],
      groupingCodeGiftsets: [],
      productName: furniture.title,
      description: furniture.description,
      minimum: furniture.minQuantity,
      maximum: furniture.maxQuantity,
      incrementedBy: 1,
      keywords: furniture.title,
      tags: furniture.categories.join(','),
      inventoryType: 'standard',
      behaviour: 'normal',
      madeToOrder: 'false',
      madeToOrderMessage: '',
      displayCountryOfOrigin: '',
      promotion: 'false',
      fullBrandingGuide: '',
      logo24BrandingGuide: null,
      images,
      colourImages,
      brandings: [],
      isLogo24: false,
      logo24Branding: null,
      inclusiveBranding: [],
      variants,
      requiredBrandingPositions: [],
      noCoBrandingPositions: [],
      brandingTemplates: [],
      decoupled: false,
      type: 'furniture',
      stock: furniture.stockQuantity,
      confidence: 100,
      originalPrice: furniture.price,
      price: furniture.price,
      stockInfo: {
        colourCode: null,
        fullCode: furniture.sku,
        incomingStock: null,
        modifiedDate: new Date().toISOString(),
        reservedStock: 0,
        simpleCode: furniture.sku,
        stock: furniture.stockQuantity,
        stockType: 1
      },
      isAvailable: furniture.stockQuantity > 0 && furniture.status === 'Active',
      supplier: furniture.supplierName
    };

    return transformedProduct;
  }

  // Transform multiple furniture products
  static transformFurnitureProducts(furnitureProducts: IFurnitureProduct[]): IProduct[] {
    return furnitureProducts.map(product => this.transformFurnitureToProduct(product));
  }
}