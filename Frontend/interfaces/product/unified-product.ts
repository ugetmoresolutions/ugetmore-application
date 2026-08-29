// interfaces/product/unified-product.ts
import { IProduct as ICustomProduct } from './newProduct';
import { IProduct as IAmrodProduct, Category, Brand, ProductImage, ColourImage, ProductVariant, Branding } from './product';
import { IImageUrl, IColorImage } from './newProduct';

export type IUnifiedProduct = IAmrodProduct & {
  isCustomProduct?: boolean;
  stockQuantity?: number;
  supplierAccount?: string;
  price?: number;
  // Add the actual SKU field from custom products
  sku?: string;
};

// Convert IImageUrl to ProductImage
const convertToProductImage = (imageUrl: IImageUrl, index: number): ProductImage => ({
  name: `Image ${index + 1}`,
  isDefault: index === 0,
  urls: [{
    url: imageUrl.url,
    width: 800,
    height: 600,
  }],
  hasLogo: false,
  angle: null,
  type: 'product'
});

// Convert IColorImage to ColourImage
const convertToColourImage = (colorImage: IColorImage): ColourImage => ({
  name: colorImage.name,
  code: colorImage.code,
  images: colorImage.images.map((img, idx) => convertToProductImage(img, idx))
});

// Convert custom product to Amrod-compatible format
export const convertCustomToAmrodFormat = (product: ICustomProduct): IUnifiedProduct => {
  // Generate variants from colorImages - use SKU directly
  const variants: ProductVariant[] = product.colorImages?.map((colorImage, index) => ({
    simpleCode: `${product.sku}-${colorImage.code}`,
    fullCode: `${product.sku}-${colorImage.code}`, // No CUSTOM- prefix
    codeColour: colorImage.code,
    codeColourName: colorImage.name,
    codeSize: 'OS',
    codeSizeName: 'One Size',
    categorisedAttribute: null,
    packagingAndDimension: {
      cartonSizeDimensionL: 0,
      cartonSizeDimensionW: 0,
      cartonSizeDimensionH: 0,
      piecesPerCarton: 1,
      cartonWeight: 0
    },
    productDimension: {
      length: 0,
      width: 0,
      weight: 0
    },
    isLogo24: false,
    components: null
  })) || [];

  // Convert categories to Amrod format
  const amrodCategories: Category[] = product.categories.map((category, index) => ({
    name: category,
    path: `/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
    code: `custom-${index}-${category.toLowerCase().replace(/\s+/g, '-')}`,
    image: ''
  }));

  // Convert main images to ProductImage format
  const productImages: ProductImage[] = product.mainImages.map((img, index) => 
    convertToProductImage(img, index)
  );

  // Convert color images to ColourImage format
  const colourImages: ColourImage[] = product.colorImages?.map(convertToColourImage) || [];

  return {
    // Amrod-compatible fields
    actionType: 1,
    simpleCode: product.sku,
    fullCode: product.sku, // No CUSTOM- prefix, just use SKU directly
    categorisedAttribute: [],
    gender: null,
    material: '',
    fit: '',
    feature: '',
    categories: amrodCategories,
    brand: {
      name: product.supplierName,
      brandWebsiteLogo: '',
      code: `custom-${product.supplierName.toLowerCase().replace(/\s+/g, '-')}`
    },
    companionCodes: [],
    relatedCodes: [],
    matchingCodes: [],
    groupingCodes: [],
    groupingCodeGiftsets: [],
    productName: product.title,
    description: product.description,
    minimum: product.minQuantity,
    maximum: product.maxQuantity,
    incrementedBy: 1,
    keywords: '',
    tags: '',
    inventoryType: 'stock',
    behaviour: 'standard',
    madeToOrder: 'yes',
    madeToOrderMessage: '',
    displayCountryOfOrigin: '',
    promotion: '',
    fullBrandingGuide: '',
    logo24BrandingGuide: null,
    images: productImages,
    colourImages: colourImages,
    brandings: [],
    isLogo24: false,
    logo24Branding: null,
    inclusiveBranding: [],
    variants: variants,
    requiredBrandingPositions: [],
    noCoBrandingPositions: [],
    brandingTemplates: [],
    decoupled: false,
    type: 'product',
    price: product.price,
    
    // Custom product fields
    isCustomProduct: true,
    stockQuantity: product.stockQuantity,
    supplierAccount: product.supplierAccount,
    sku: product.sku // Add the actual SKU field
  };
};

// Helper functions
export const getProductDisplayName = (product: IUnifiedProduct): string => {
  return product.productName;
};

export const getProductImages = (product: IUnifiedProduct): ProductImage[] => {
  return product.images;
};

export const getProductColorImages = (product: IUnifiedProduct): ColourImage[] => {
  return product.colourImages;
};

export const getProductMinQuantity = (product: IUnifiedProduct): number => {
  return product.minimum;
};

export const getProductMaxQuantity = (product: IUnifiedProduct): number => {
  return product.maximum;
};

// Type guards
export const isAmrodProduct = (product: IUnifiedProduct): boolean => {
  return !product.isCustomProduct;
};

export const isCustomProduct = (product: IUnifiedProduct): boolean => {
  return !!product.isCustomProduct;
};