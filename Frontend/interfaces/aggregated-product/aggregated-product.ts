import { Brand } from "../product/product";

export interface IAggregatedProduct {
  simpleCode: string;
  fullCode: string;
  categorisedAttribute: any[];
  gender: string | null;
  material: string;
  fit: string;
  feature: string;
  categories: Array<{
    id: number;
    name: string;
    path: string;
    code: string;
    image: string;
  }>;
  brand?: Brand;
  companionCodes: any;
  relatedCodes: any[];
  matchingCodes: any[];
  groupingCodes: any[];
  groupingCodeGiftsets: any;
  productName: string;
  description: string;
  minimum: number;
  maximum: number;
  incrementedBy: number;
  keywords: string;
  tags: string;
  inventoryType: string;
  behaviour: string;
  madeToOrder: string;
  madeToOrderMessage: string;
  displayCountryOfOrigin: string;
  promotion: string;
  fullBrandingGuide: string;
  logo24BrandingGuide: string | null;
  images: Array<{
    name: string;
    isDefault: boolean;
    urls: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    hasLogo: boolean;
    angle: string | null;
    type: string;
  }>;
  videos: any[];
  colourImages: any;
  brandings: any[];
  isLogo24: boolean;
  logo24Branding: any;
  inclusiveBranding: any;
  variants: Array<{
    simpleCode: string;
    fullCode: string;
    codeColour: string | null;
    codeColourName: string | null;
    codeSize: string | null;
    codeSizeName: string | null;
    categorisedAttribute: any;
    packagingAndDimension: {
      cartonSizeDimensionL: number;
      cartonSizeDimensionW: number;
      cartonSizeDimensionH: number;
      piecesPerCarton: number;
      cartonWeight: number;
    };
    productDimension: {
      length: number;
      width: number;
      weight: number;
    };
    isLogo24: boolean;
    components: any;
  }>;
  requiredBrandingPositions: string[];
  noCoBrandingPositions: any;
  brandingTemplates: Array<{
    position: string;
    name: string;
    url: string;
  }>;
  decoupled: boolean;
  type: string;
  originalPrice: number;
  price: number;
  stockInfo: {
    colourCode: string | null;
    fullCode: string;
    incomingStock: any;
    modifiedDate: string;
    reservedStock: number;
    simpleCode: string;
    stock: number;
    stockType: number;
  };
  isAvailable: boolean;
  minQuantity?: number
  supplier: string;
  confidence?: number
}

// Fix the response interfaces to match the actual API response structure
export interface IAggregatedProductsData {
  products: IAggregatedProduct[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  supplierBreakdown: {
    amrod: number;
    parrot: number;
    tarsus: number;
  };
  filters?: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  };
  searchQuery?: string;
}

export interface IAggregatedProductsResponse {
  data: IAggregatedProductsData;
  message: string;
  error: boolean;
}

export interface IAggregatedProductResponse {
  data: IAggregatedProduct;
  message: string;
  error: boolean;
}

export interface IAggregatedCategoriesData {
  mainCategories: string[];
  categoriesWithSubs: Array<{
    name: string;
    subCategories: string[] | null;
  }>;
}

export interface IAggregatedCategoriesResponse {
  data: IAggregatedCategoriesData;
  message: string;
  error: boolean;
}


// FIXED: Remove the nested data structure
export interface IAggregatedProductsResponse {
  products: IAggregatedProduct[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  supplierBreakdown: {
    amrod: number;
    parrot: number;
    tarsus: number;
  };
  filters?: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  };
  searchQuery?: string;
}

export interface IAggregatedCategoriesResponse {
  mainCategories: string[];
  categoriesWithSubs: Array<{
    name: string;
    subCategories: string[] | null;
  }>;
}