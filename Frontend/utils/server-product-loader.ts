// utils/server-product-loader-simple.ts
import { AGGREGATED_PRODUCTS_API } from "@/endpoints/rest-api/aggregated-product"
import { IAggregatedProduct } from "@/interfaces/aggregated-product/aggregated-product"
import { IProduct } from "@/interfaces/product/product"

// Use the backend's aggregated product interface directly
type EnhancedProduct = IProduct & {
  calculatedPrice?: number
  isCustomProduct?: boolean
  isTarsusProduct?: boolean
  isParrotProduct?: boolean
  stockQuantity?: number
  isInStock?: boolean
}

// UNIVERSAL FAST PRODUCT LOADER - Uses the new lightning-fast endpoint
export const loadProductFromAnySource = async (productId: string): Promise<EnhancedProduct | null> => {
  console.log('🚀 [loadProductFromAnySource] FAST lookup for product:', productId)
  
  try {
    // Use the new lightning-fast universal product lookup
    const response = await AGGREGATED_PRODUCTS_API.GET_PRODUCT_BY_CODE(productId)
    
    if (response.data) {
      const productData = response.data
      console.log('✅ [loadProductFromAnySource] Product found via fast lookup:', {
        name: productData.productName,
        supplier: productData.supplier,
        price: productData.price,
        inStock: productData.isAvailable
      })
      
      // Just add the minimal enhanced fields to the backend response
      return {
        ...productData,
        calculatedPrice: productData.price, // Same as price since backend already applies markup
        stockQuantity: productData.stockInfo?.stock || 0,
        isInStock: productData.isAvailable || false,
        isCustomProduct: productData.supplier === 'custom',
        isTarsusProduct: productData.supplier === 'tarsus',
        isParrotProduct: productData.supplier === 'parrot',
      } as EnhancedProduct
    }
    
    console.log('❌ [loadProductFromAnySource] Product not found via fast lookup')
    return null
    
  } catch (error) {
    console.error('❌ [loadProductFromAnySource] Error in fast lookup:', error)
    return null
  }
}

// SMART RELATED PRODUCTS LOADER - Uses the new optimized endpoint
export const getRelatedProducts = async (currentProduct: EnhancedProduct, productId: string): Promise<EnhancedProduct[]> => {
  console.log('🔗 [getRelatedProducts] Getting smart related products for:', currentProduct.productName)
  
  try {
    // Use the new optimized related products endpoint
    const response = await AGGREGATED_PRODUCTS_API.GET_RELATED_PRODUCTS(productId, 5)
    
    if (response.data && response.data.relatedProducts) {
      const relatedProducts = response.data.relatedProducts
      console.log(`✅ [getRelatedProducts] Found ${relatedProducts.length} smart related products`)
      
      // Just add the minimal enhanced fields to the backend response
      return relatedProducts.map(productData => ({
        ...productData,
        calculatedPrice: productData.price,
        stockQuantity: productData.stockInfo?.stock || 0,
        isInStock: productData.isAvailable || false,
        isCustomProduct: productData.supplier === 'custom',
        isTarsusProduct: productData.supplier === 'tarsus',
        isParrotProduct: productData.supplier === 'parrot',
      }as EnhancedProduct)) 
    }
    
    console.log('⚠️ [getRelatedProducts] No related products found')
    return []
    
  } catch (error) {
    console.error('❌ [getRelatedProducts] Error getting related products:', error)
    return []
  }
}