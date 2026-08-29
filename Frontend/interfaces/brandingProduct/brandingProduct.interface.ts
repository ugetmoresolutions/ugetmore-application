export interface IBrandingProduct {
    id: number
  actionType: number;
  price: number;
  simpleCode: string;
  fullCode: string;
  categorisedAttribute: any[];
  gender: string | null;
  material: string;
  fit: string;
  feature: string;
  categories: Category[];
  brand: Brand ;
  companionCodes: Code[];
  relatedCodes: Code[];
  matchingCodes: Code[];
  groupingCodes: Code[];
  groupingCodeGiftsets: Code[];
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
  images: ProductImage[];
  colourImages: ColourImage[];
  brandings: Branding[];
  isLogo24: boolean;
  logo24Branding: any | null;
  inclusiveBranding: any[];
  variants: ProductVariant[];
  requiredBrandingPositions: any[];
  noCoBrandingPositions: any[];
  brandingTemplates: any[];
  decoupled: boolean;
  type: string;
  mainCategory?: string; // NEW
  stockInfo?: { // NEW
    colourCode: string | null;
    fullCode: string;
    incomingStock: any;
    modifiedDate: string;
    reservedStock: number;
    simpleCode: string;
    stock: number;
    stockType: number;
  };
  isAvailable?: boolean; // NEW
  updatedAt?: string | Date
  supplier?: string
  createdAt?: string | Date
}

export interface Category {
  name: string;
  path: string;
  code: string;
  image: string;
}

export interface Brand {
  name: string;
  brandWebsiteLogo: string;
  code: string;
}

export interface Code {
  simpleCode: string;
  fullCode: string;
}

export interface ProductImage {
  name: string;
  isDefault: boolean;
  urls: ImageUrl[];
  hasLogo: boolean;
  angle: string | null;
  type: string;
}

export interface ImageUrl {
  url: string;
  width: number;
  height: number;
}

export interface ColourImage {
  name: string;
  code: string;
  images: ProductImage[];
}

export interface Branding {
  positionName: string;
  positionCode: string;
  positionComment: string | null;
  positionMultiplier: number;
  method: BrandingMethod[];
}

export interface BrandingMethod {
  brandingName: string;
  brandingDepartment: string;
  brandingCode: string;
  brandingInclusiveMethod: boolean;
  displayIndex: string;
  maxPrintingSizeWidth: string;
  maxPrintingSizeHeight: string;
  numberOfColours: string;
  brandingMultiplier: number;
  exclusions: any[];
}

export interface ProductVariant {
  simpleCode: string;
  fullCode: string;
  codeColour: string;
  codeColourName: string;
  codeSize: string;
  codeSizeName: string;
  categorisedAttribute: any | null;
  packagingAndDimension: PackagingAndDimension;
  productDimension: ProductDimension;
  isLogo24: boolean;
  components: any | null;
}

export interface PackagingAndDimension {
  cartonSizeDimensionL: number;
  cartonSizeDimensionW: number;
  cartonSizeDimensionH: number;
  piecesPerCarton: number;
  cartonWeight: number;
}

export interface ProductDimension {
  length: number;
  width: number;
  weight: number;
}

export interface IProductPrice {
  simplecode: string;
  fullCode: string;
  price: number;
}

