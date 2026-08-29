// utils/tarsus-transform.ts
/**
 * Transform Tarsus product to match Amrod structure for production
 */
export function transformTarsusProductToAmrodStructure(tarsusProduct: any): any {
  if (!tarsusProduct?.Product_Number) {
    console.log(`❌ Tarsus product missing Product_Number:`, tarsusProduct);
    return null;
  }

  // Create category structure from available data
  const categoryName = tarsusProduct.Category || tarsusProduct.Product_Type || 'Electronics';
  const categories = [{
    name: categoryName,
    path: categoryName,
    code: categoryName.toLowerCase().replace(/\s+/g, '-'),
    image: ""
  }];

  // Create brand structure
  const brandName = tarsusProduct.Manufacturer || 'Tarsus';
  const brand = {
    name: brandName,
    brandWebsiteLogo: "",
    code: brandName.toLowerCase().replace(/\s+/g, '-')
  };

  // Create product images only if URL exists
  const images = tarsusProduct.Image_URL ? [{
    name: 'Main Image',
    isDefault: true,
    urls: [{
      url: tarsusProduct.Image_URL,
      width: 400,
      height: 400
    }],
    hasLogo: false,
    angle: null,
    type: 'main'
  }] : [];

  const availableStock = Number(tarsusProduct.Available_Stock) || 0;
  const originalPrice = Number(tarsusProduct.Price_ex_Vat) || 0;
  const productName = tarsusProduct.Short_Advertising_Description || tarsusProduct.Product_Description || 'Tarsus Product';
  
  // Create keywords from available data
  const keywordParts = [tarsusProduct.Product_Type, tarsusProduct.Manufacturer, tarsusProduct.Category].filter(Boolean);
  const keywords = keywordParts.join(' ');

  return {
    // Core Amrod structure
    actionType: 0,
    simpleCode: tarsusProduct.Product_Number,
    fullCode: tarsusProduct.Product_Number,
    productName: productName,
    description: tarsusProduct.Product_Description || productName,
    categories: categories,
    brand: brand,
    images: images,
    colourImages: [],
    material: '',
    fit: '',
    feature: tarsusProduct.Product_Type || '',
    minimum: 1,
    maximum: availableStock ,
    incrementedBy: 1,
    keywords: keywords,
    tags: tarsusProduct.Product_Type || '',
    inventoryType: 'standard',
    behaviour: 'standard',
    madeToOrder: 'Yes',
    madeToOrderMessage: '',
    displayCountryOfOrigin: '',
    promotion: '',
    brandings: [],
    isLogo24: false,
    logo24Branding: null,
    inclusiveBranding: [],
    variants: [{
      simpleCode: tarsusProduct.Product_Number,
      fullCode: tarsusProduct.Product_Number,
      codeColour: 'default',
      codeColourName: 'Default',
      codeSize: 'default',
      codeSizeName: 'Default',
      categorisedAttribute: null,
      packagingAndDimension: {
        cartonSizeDimensionL: Number(tarsusProduct.Each_Length) || 0,
        cartonSizeDimensionW: Number(tarsusProduct.Each_Width) || 0,
        cartonSizeDimensionH: Number(tarsusProduct.Each_Height) || 0,
        piecesPerCarton: 1,
        cartonWeight: Number(tarsusProduct.Each_Weight) || 0
      },
      productDimension: {
        length: Number(tarsusProduct.Each_Length) || 0,
        width: Number(tarsusProduct.Each_Width) || 0,
        weight: Number(tarsusProduct.Each_Weight) || 0
      },
      isLogo24: false,
      components: null
    }],
    
    requiredBrandingPositions: [],
    noCoBrandingPositions: [],
    brandingTemplates: [],
    decoupled: false,
    type: 'physical',
    
    companionCodes: [],
    relatedCodes: [],
    matchingCodes: [],
    groupingCodes: [],
    groupingCodeGiftsets: [],
    
    // Custom fields for pricing and stock
    originalPrice: originalPrice,
    price: originalPrice, // Will be marked up in service
    
    stockInfo: {
      colourCode: null,
      fullCode: tarsusProduct.Product_Number,
      incomingStock: null,
      modifiedDate: tarsusProduct.Export_Date || new Date().toISOString(),
      reservedStock: 0,
      simpleCode: tarsusProduct.Product_Number,
      stock: availableStock,
      stockType: 0
    },
    
    isAvailable: availableStock > 0,
    supplier: 'tarsus'
  };
}