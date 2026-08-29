// utils/productStorage.ts
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface EnhancedProduct extends IProduct {
  price?: number ;
  calculatedPrice?: number;
}

interface ProductStorageData {
  product: EnhancedProduct;
  relatedProducts: EnhancedProduct[];
  sourceContext?: {
    category?: string;
    page?: string;
    pathname?: string;
  };
  viewedAt: string;
}

interface NavigationData {
  currentProductId: string;
  relatedProducts: Array<{
    simpleCode: string;
    fullCode: string;
    productName: string;
    brand?: { name: string; code: string };
    minimum?: number;
    image?: string;
    price?: number;
  }>;
  timestamp: string;
}

/**
 * Safely strips HTML tags from a string while preserving text content
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text content and clean up whitespace
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Safely renders HTML content with basic formatting
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return 'No description available';
  
  // Replace common HTML entities
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Enhanced price calculation function that matches the logic from BrandingPage
 */
export function getProductPrice(product: IProduct, productPrices: IProductPrice[]): number {
  // Strategy 1: Try to find price by exact fullCode match
  let priceData = productPrices.find(p => p.fullCode === product.fullCode);
  
  // Strategy 2: Try to find by simpleCode match
  if (!priceData) {
    priceData = productPrices.find(p => p.simplecode === product.simpleCode);
  }
  
  // Strategy 3: Try partial matching for variants (fullCode might have additional suffixes)
  if (!priceData) {
    priceData = productPrices.find(p => 
      product.fullCode.startsWith(p.simplecode) ||
      p.fullCode.startsWith(product.simpleCode)
    );
  }
  
  // Strategy 4: Try matching just the base part (before any variant suffixes)
  if (!priceData) {
    const baseProductCode = product.simpleCode.split('-').slice(0, 3).join('-'); // Get first 3 parts
    priceData = productPrices.find(p => 
      p.simplecode.startsWith(baseProductCode) ||
      p.fullCode.startsWith(baseProductCode)
    );
  }
  
  // Return price if found, otherwise use fallback pricing
  if (priceData) {
    return priceData.price;
  }
  
  // Fallback pricing for products without specific prices
  const fallbackPrice = product.minimum ? (product.minimum * 2.5) : 15.00;
  return fallbackPrice;
}

/**
 * Enhances products with their calculated prices
 */
export function enhanceProductsWithPrices(
  products: IProduct[], 
  productPrices: IProductPrice[]
): EnhancedProduct[] {
  return products.map(product => ({
    ...product,
    calculatedPrice: getProductPrice(product, productPrices),
    price: getProductPrice(product, productPrices)
  }));
}

/**
 * Finds related products based on category and brand similarity
 */
export function findRelatedProducts(
  currentProduct: IProduct, 
  allProducts: IProduct[], 
  productPrices: IProductPrice[] = [],
  maxResults: number = 4
): EnhancedProduct[] {
  // Filter products that are not the current product
  const candidates = allProducts.filter(p => 
    p.fullCode !== currentProduct.fullCode && 
    p.simpleCode !== currentProduct.simpleCode &&
    p.actionType !== 2 // Exclude removed products
  );
  
  // Score products based on similarity
  const scoredProducts = candidates.map(product => {
    let score = 0;
    
    // Category similarity (highest priority)
    const currentCategories = currentProduct.categories?.map(cat => cat.code) || [];
    const productCategories = product.categories?.map(cat => cat.code) || [];
    
    const categoryOverlap = currentCategories.filter(code => 
      productCategories.includes(code)
    ).length;
    
    if (categoryOverlap > 0) {
      score += categoryOverlap * 10; // High weight for category matches
    }
    
    // Brand similarity (medium priority)
    if (product.brand?.code === currentProduct.brand?.code) {
      score += 5;
    }
    
    // Material similarity (low priority)
    if (product.material && currentProduct.material && 
        product.material.toLowerCase() === currentProduct.material.toLowerCase()) {
      score += 2;
    }
    
    // Keywords similarity (low priority)
    if (product.keywords && currentProduct.keywords) {
      const currentKeywords = currentProduct.keywords.toLowerCase().split(',');
      const productKeywords = product.keywords.toLowerCase().split(',');
      const keywordOverlap = currentKeywords.filter(keyword => 
        productKeywords.some(pk => pk.trim().includes(keyword.trim()))
      ).length;
      score += keywordOverlap;
    }
    
    return {
      product,
      score
    };
  });
  
  // Sort by score (highest first) and take the top results
  const topProducts = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.product);
  
  // Enhance with prices
  return enhanceProductsWithPrices(topProducts, productPrices);
}

/**
 * Stores the current product and related products to localStorage with prices
 */
export function storeProductData(
  currentProduct: IProduct,
  allProducts: IProduct[],
  productPrices: IProductPrice[] = [],
  sourceContext?: {
    category?: string;
    page?: string;
    pathname?: string;
  }
): void {
  try {
    // Enhance current product with price
    const enhancedCurrentProduct: EnhancedProduct = {
      ...currentProduct,
      calculatedPrice: getProductPrice(currentProduct, productPrices),
      price: getProductPrice(currentProduct, productPrices)
    };
    
    // Find and enhance related products
    const relatedProducts = findRelatedProducts(
      currentProduct, 
      allProducts, 
      productPrices, 
      4
    );
    
    // Prepare storage data
    const storageData: ProductStorageData = {
      product: enhancedCurrentProduct,
      relatedProducts,
      sourceContext,
      viewedAt: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('currentProductView', JSON.stringify(storageData));
    
    // Also store simplified navigation data for faster access
    const navigationData: NavigationData = {
      currentProductId: currentProduct.fullCode,
      relatedProducts: relatedProducts.map(rp => ({
        simpleCode: rp.simpleCode,
        fullCode: rp.fullCode,
        productName: rp.productName,
        brand: rp.brand,
        minimum: rp.minimum,
        image: rp.images?.find(img => img.isDefault)?.urls?.[0]?.url || 
               rp.images?.[0]?.urls?.[0]?.url,
        price: rp.calculatedPrice || rp.price
      })),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('productNavigation', JSON.stringify(navigationData));
    
    // Update recently viewed products
    updateRecentlyViewed(enhancedCurrentProduct);
    
    console.log('Product data stored successfully:', {
      currentProduct: enhancedCurrentProduct.productName,
      relatedProductsCount: relatedProducts.length,
      pricesAttached: true
    });
    
  } catch (error) {
    console.error('Failed to store product data:', error);
  }
}

/**
 * Updates the recently viewed products list
 */
export function updateRecentlyViewed(product: EnhancedProduct): void {
  try {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove the product if it already exists
    const filteredRecent = recentlyViewed.filter((p: any) => 
      p.fullCode !== product.fullCode && p.simpleCode !== product.simpleCode
    );
    
    // Add the product to the beginning and limit to 5 items
    const updatedRecent = [product, ...filteredRecent].slice(0, 5);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
  } catch (error) {
    console.error('Failed to update recently viewed:', error);
  }
}

/**
 * Enhanced product card click handler that stores data and navigates
 */
export function enhanceProductCardClick(
  productId: string,
  currentProduct: IProduct,
  allProducts: IProduct[],
  router: AppRouterInstance,
  pathname: string,
  sourceContext?: { category?: string; page?: string },
  productPrices: IProductPrice[] = []
): void {
  try {
    // Store the product data with prices
    storeProductData(
      currentProduct,
      allProducts,
      productPrices,
      {
        ...sourceContext,
        pathname
      }
    );
    
    // Navigate to the product page
    router.push(`/client/shop/${productId}`);
    
  } catch (error) {
    console.error('Error in enhanced product card click:', error);
    // Fallback to simple navigation
    router.push(`/client/shop/${productId}`);
  }
}

/**
 * Retrieves stored product data from localStorage
 */
export function getStoredProductData(productId: string): ProductStorageData | null {
  try {
    const stored = localStorage.getItem('currentProductView');
    if (!stored) return null;
    
    const data: ProductStorageData = JSON.parse(stored);
    
    // Check if the stored data is for the requested product
    if (data.product?.fullCode === productId || data.product?.simpleCode === productId) {
      // Check if data is not too old (30 minutes)
      const dataAge = Date.now() - new Date(data.viewedAt).getTime();
      if (dataAge < 30 * 60 * 1000) {
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to retrieve stored product data:', error);
    return null;
  }
}

/**
 * Clears old product data from localStorage
 */
export function clearOldProductData(): void {
  try {
    const keys = ['currentProductView', 'productNavigation'];
    
    keys.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const dataAge = Date.now() - new Date(data.viewedAt || data.timestamp).getTime();
          
          // Clear if older than 1 hour
          if (dataAge > 60 * 60 * 1000) {
            localStorage.removeItem(key);
            console.log(`Cleared old ${key} data`);
          }
        } catch (parseError) {
          // If we can't parse it, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Failed to clear old product data:', error);
  }
}