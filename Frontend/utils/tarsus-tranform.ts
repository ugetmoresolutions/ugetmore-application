// utils/tarsus-transform.ts
import { IProduct, Category, Brand } from "@/interfaces/product/product";

// Transform Tarsus product to match your IProduct interface
export function transformTarsusProduct(tarsusProduct: any): IProduct {
  // Create basic category structure
  const categories: Category[] = tarsusProduct.Category ? [{
    name: tarsusProduct.Category,
    path: tarsusProduct.Category.toLowerCase().replace(/\s+/g, '-'),
    code: tarsusProduct.Category.toLowerCase().replace(/\s+/g, '-'),
    image: ""
  }] : [];

  // Create brand structure
  const brand: Brand = {
    name: tarsusProduct.Manufacturer || "Unknown",
    brandWebsiteLogo: "",
    code: (tarsusProduct.Manufacturer || "unknown").toLowerCase().replace(/\s+/g, '-')
  };

  // Create product images
  const productImages = tarsusProduct.Image_URL ? [{
    name: "default",
    isDefault: true,
    urls: [{
      url: tarsusProduct.Image_URL,
      width: 300,
      height: 300
    }],
    hasLogo: false,
    angle: null,
    type: "product"
  }] : [];

  // Store the original Tarsus stock data
  const availableStock = tarsusProduct.Available_Stock || 0;
  
  // Create variants
  const variants = [{
    simpleCode: tarsusProduct.Product_Number,
    fullCode: tarsusProduct.Product_Number,
    codeColour: "default",
    codeColourName: "Default",
    codeSize: "default", 
    codeSizeName: "Default",
    categorisedAttribute: null,
    packagingAndDimension: {
      cartonSizeDimensionL: tarsusProduct.Each_Length || 0,
      cartonSizeDimensionW: tarsusProduct.Each_Width || 0,
      cartonSizeDimensionH: tarsusProduct.Each_Height || 0,
      piecesPerCarton: 1,
      cartonWeight: tarsusProduct.Each_Weight || 0
    },
    productDimension: {
      length: tarsusProduct.Each_Length || 0,
      width: tarsusProduct.Each_Width || 0,
      weight: tarsusProduct.Each_Weight || 0
    },
    isLogo24: false,
    components: null
  }];

  return {
    actionType: 1,
    simpleCode: tarsusProduct.Product_Number,
    fullCode: tarsusProduct.Product_Number,
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
    productName: tarsusProduct.Short_Advertising_Description || tarsusProduct.Product_Description,
    description: tarsusProduct.Product_Description || "",
    minimum: 1,
    maximum: availableStock > 0 ? availableStock : 100,
    incrementedBy: 1,
    keywords: `${tarsusProduct.Product_Type} ${tarsusProduct.Manufacturer} ${tarsusProduct.Category}`,
    tags: tarsusProduct.Product_Type,
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
    price: tarsusProduct.Price_ex_Vat * 1.15,
    // Simple stock property - just store the number
    stock: availableStock
  };
}

// Transform the entire Tarsus response
export function transformTarsusResponse(tarsusResponse: any): IProduct[] {
  if (!tarsusResponse?.Products) {
    return [];
  }

  return tarsusResponse.Products.map(transformTarsusProduct);
}