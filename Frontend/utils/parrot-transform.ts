import { IProduct, Category, Brand, ProductImage, ImageUrl, ProductVariant, PackagingAndDimension, ProductDimension } from "@/interfaces/product/product";

// Transform Parrot product to match your IProduct interface
export function transformParrotProduct(parrotProduct: any): IProduct {
  // Extract category from PublishingCategory
  const categoryName = parrotProduct.PublishingCategory?.CategoryName || "Uncategorized";
  const categoryPath = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/>/g, '').trim();
  
  const categories: Category[] = [{
    name: categoryName,
    path: categoryPath,
    code: categoryPath,
    image: ""
  }];

  // Create brand structure
  const brand: Brand = {
    name: parrotProduct.Brand || "PARROT PRODUCTS",
    brandWebsiteLogo: "",
    code: (parrotProduct.Brand || "parrot-products").toLowerCase().replace(/\s+/g, '-')
  };

  // Create product images from ProductImageLinks
  const productImages: ProductImage[] = parrotProduct.ProductImageLinks && parrotProduct.ProductImageLinks.length > 0 
    ? [{
        name: "default",
        isDefault: true,
        urls: [{
          url: parrotProduct.ProductImageLinks[0],
          width: 300,
          height: 300
        }],
        hasLogo: false,
        angle: null,
        type: "product"
      }]
    : [];

  // Extract total stock
  const availableStock = parrotProduct.TotalWarehouseStock || 0;
  
  // Create variants with proper dimensions
  const variants: ProductVariant[] = [{
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
      cartonWeight: parrotProduct.ProductDimensions?.Mass || 0
    } as PackagingAndDimension,
    productDimension: {
      length: parrotProduct.ProductDimensions?.Length || 0,
      width: parrotProduct.ProductDimensions?.Width || 0,
      weight: parrotProduct.ProductDimensions?.Mass || 0
    } as ProductDimension,
    isLogo24: false,
    components: null
  }];

  // Clean HTML from description
  const cleanDescription = parrotProduct.DetailedDescription 
    ? parrotProduct.DetailedDescription.replace(/<[^>]*>/g, '').trim()
    : parrotProduct.Description || "";

  return {
    actionType: 1,
    simpleCode: parrotProduct.StockCode,
    fullCode: parrotProduct.StockCode,
    categorisedAttribute: [],
    gender: null,
    material: "",
    fit: "",
    feature: "",
    categories: categories,
    brand: brand,
    companionCodes: [],
    relatedCodes: [],
    matchingCodes: [],
    groupingCodes: [],
    groupingCodeGiftsets: [],
    productName: parrotProduct.FriendlyTitle || parrotProduct.Description,
    description: cleanDescription,
    minimum: 1,
    maximum: availableStock > 0 ? availableStock : 100,
    incrementedBy: 1,
    keywords: parrotProduct.MetaKeywords || `${parrotProduct.Brand} ${parrotProduct.Description}`,
    tags: categoryName,
    inventoryType: "standard",
    behaviour: "normal",
    madeToOrder: "No",
    madeToOrderMessage: "",
    displayCountryOfOrigin: "",
    promotion: "",
    fullBrandingGuide: "",
    logo24BrandingGuide: null,
    images: productImages,
    colourImages: [],
    brandings: [],
    isLogo24: false,
    logo24Branding: null,
    inclusiveBranding: [],
    variants: variants,
    requiredBrandingPositions: [],
    noCoBrandingPositions: [],
    brandingTemplates: [],
    decoupled: false,
    type: "product",
    price: parrotProduct.CustomerPriceWithTax || parrotProduct.RetailPriceIncTax || 0,
    stock: availableStock
  } as IProduct;
}

// Transform the entire Parrot response
export function transformParrotResponse(parrotResponse: any): IProduct[] {
  if (!parrotResponse?.Products || !Array.isArray(parrotResponse.Products)) {
    return [];
  }

  return parrotResponse.Products.map(transformParrotProduct);
}

// Additional transformer for specific use cases
export function transformParrotProductForList(parrotProduct: any): Partial<IProduct> {
  const transformed = transformParrotProduct(parrotProduct);
  
  return {
    simpleCode: transformed.simpleCode,
    fullCode: transformed.fullCode,
    productName: transformed.productName,
    description: transformed.description.substring(0, 100) + '...', // Truncate for lists
    price: transformed.price,
    stock: transformed.stock,
    brand: transformed.brand,
    categories: transformed.categories,
    images: transformed.images
  };
}