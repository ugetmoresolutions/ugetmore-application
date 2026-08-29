// components/RelatedProducts.tsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { ICartItem, IAddCartItem } from "@/interfaces/cart/cart";
import { enhanceProductCardClick, getProductPrice } from '@/utils/productStorage';
import { CART_API } from '@/endpoints/rest-api/cart';
import { useSmartAlert } from '@/components/common/SmartAlert';
import { PRODUCT_API } from '@/endpoints/rest-api/branding';
import { indexedDBStorage } from '@/utils/indexedDbStorage';

interface EnhancedProduct extends IProduct {
  price?: number;
  calculatedPrice?: number;
}

interface RelatedProductsProps {
  products: EnhancedProduct[];
  allProducts?: IProduct[];
  productPrices?: IProductPrice[];
  userId?: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  products, 
  allProducts = [], 
  productPrices = [],
  userId 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { success, error: alertError, AlertComponent } = useSmartAlert();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleQuickAddToCart = async (product: EnhancedProduct, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Add to cart clicked for product:', product.productName, 'User ID:', userId);
    
    const displayPrice = productPrices?.length > 0 
      ? getProductPrice(product, productPrices)
      : product.price || product.calculatedPrice || ((product.minimum || 1) * 1.5);
    
    const cartItem: ICartItem = {
      id: crypto.randomUUID(),
      product: product,
      quantity: 1,
      price: displayPrice,
      addedAt: new Date().toISOString()
    };
    
    if (userId) {
      try {
        const addCartData: IAddCartItem = {
          userId: userId,
          item: cartItem
        };

        const response = await CART_API.ADD_CART_ITEM(addCartData);

        if (response?.data) {
          success(
            'Added to Cart!',
            `${product.productName} (ZAR ${cartItem.price.toFixed(2)}) has been added to your cart.`,
            [
              {
                label: 'View Cart',
                action: () => router.push('/client/cart'),
                variant: 'primary'
              },
              {
                label: 'Continue Shopping',
                action: () => {},
                variant: 'secondary'
              }
            ]
          );
        } else {
          throw new Error('Failed to add item to cart');
        }
      } catch (e) {
        console.error('Error adding to cart:', e);
        alertError(
          'Failed to Add Item',
          'Unable to add item to cart. Please check your connection and try again.',
          [
            {
              label: 'Retry',
              action: () => handleQuickAddToCart(product, event),
              variant: 'primary'
            }
          ]
        );
      }
    } else {
      try {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = existingCart.findIndex(
          (item: ICartItem) => item.product?.fullCode === product.fullCode ||
                              item.product?.simpleCode === product.simpleCode
        );
        
        if (existingItemIndex > -1) {
          existingCart[existingItemIndex].quantity += 1;
          success(
            'Quantity Updated!',
            `${product.productName} quantity increased in your cart.`,
            [
              {
                label: 'View Cart',
                action: () => router.push('/client/cart'),
                variant: 'primary'
              }
            ]
          );
        } else {
          existingCart.push(cartItem);
          success(
            'Added to Cart!',
            `${product.productName} (ZAR ${cartItem.price.toFixed(2)}) has been added to your cart.`,
            [
              {
                label: 'View Cart',
                action: () => router.push('/client/cart'),
                variant: 'primary'
              },
              {
                label: 'Continue Shopping',
                action: () => {},
                variant: 'secondary'
              }
            ]
          );
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        alertError(
          'Storage Error',
          'Unable to save item to cart. Please try again.',
          [
            {
              label: 'Retry',
              action: () => handleQuickAddToCart(product, event),
              variant: 'primary'
            }
          ]
        );
      }
    }
  };

  const navigateToProduct = async (product: EnhancedProduct) => {
    const productId = product.fullCode || product.simpleCode;
    
    try {
      let finalAllProducts = allProducts || [];
      let finalProductPrices = productPrices || [];
      
      if (finalAllProducts.length === 0) {
        console.log('No allProducts data available, fetching from IndexedDB/API...');
        
        try {
          const cachedProducts = await indexedDBStorage.getProducts('branding');
          const cachedPrices = await indexedDBStorage.getPrices();
          
          if (cachedProducts && cachedProducts.length > 0) {
            console.log('Found products in IndexedDB cache');
            finalAllProducts = cachedProducts;
          } else {
            console.log('No cached products, fetching from API...');
            finalAllProducts = await PRODUCT_API.GET_PRODUCTS_WITHBRANDING();
            await indexedDBStorage.setProducts(finalAllProducts, 'branding');
          }
          
          if (cachedPrices && cachedPrices.length > 0) {
            console.log('Found prices in IndexedDB cache');
            finalProductPrices = cachedPrices;
          } else {
            console.log('No cached prices, fetching from API...');
            finalProductPrices = await PRODUCT_API.GET_PRODUCTS_PRICES();
            await indexedDBStorage.setPrices(finalProductPrices);
          }
          
        } catch (fetchError) {
          console.error('Error fetching products/prices:', fetchError);
        }
      }
      
      if (finalAllProducts.length > 0) {
        const currentProduct = finalAllProducts.find(p => 
          p.fullCode === productId || p.simpleCode === productId
        );
        
        if (currentProduct) {
          console.log('Using enhanced navigation with full product data');
          enhanceProductCardClick(
            productId,
            currentProduct,
            finalAllProducts,
            router,
            pathname,
            { 
              category: product.categories?.[0]?.name || 'related', 
              page: 'related-products' 
            },
            finalProductPrices
          );
          return;
        }
      }
      
      console.log('Using fallback navigation');
      const currentPath = pathname;
      let targetPath = '';
      
      if (currentPath.includes('/branding/')) {
        targetPath = `/client/branding/${productId}`;
      } else if (currentPath.includes('/shop/')) {
        targetPath = `/client/shop/${productId}`;
      } else {
        targetPath = `/client/shop/${productId}`;
      }
      
      router.push(targetPath);
      
    } catch (error) {
      console.error('Error in navigateToProduct:', error);
      router.push(`/client/shop/${productId}`);
    }
  };

  if (products.length === 0) return null;

  return (
    <>
      <AlertComponent />
      <section className="mt-12 sm:mt-16 md:mt-20 relative">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Related Products</h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">You might also like these products</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Navigation Arrows - Positioned closer to carousel */}
          {products.length > 1 && (
            <>
              <button
                className="hidden lg:block absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                onClick={scrollLeft}
                aria-label="Previous products"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                onClick={scrollRight}
                aria-label="Next products"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-2 sm:px-4 md:px-6"
            >
              {products.map((product: EnhancedProduct, index) => {
                const productImage = product.images?.find(img => img.isDefault) || product.images?.[0];
                const imageUrl = productImage?.urls?.[0]?.url || '/placeholder-product.png';
                
                const displayPrice = productPrices?.length > 0 
                  ? getProductPrice(product, productPrices)
                  : product.price || product.calculatedPrice || ((product.minimum || 1) * 1.5);
                
                return (
                  <motion.div
                    key={product.simpleCode || product.fullCode}
                    whileHover={{ y: -4 }}
                    className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] snap-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer touch-manipulation w-full">
                      {/* Product Image */}
                      <div 
                        className="relative aspect-[3/4] bg-gray-50 p-3 cursor-pointer"
                        onClick={() => navigateToProduct(product)}
                      >
                        <Image
                          src={imageUrl}
                          alt={product.productName}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 200px, (max-width: 768px) 220px, 240px"
                        />
                        <button 
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
                          onClick={(e) => handleQuickAddToCart(product, e)}
                          aria-label={`Add ${product.productName} to cart`}
                        >
                          <ShoppingCart className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Product Info */}
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => navigateToProduct(product)}
                      >
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm leading-tight min-h-[40px]">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 truncate">
                          {product.brand?.name || 'Unknown Brand'}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-bold text-gray-900 truncate">
                              ZAR {displayPrice.toFixed(2)}
                            </span>
                            {product.price && (
                              <span className="text-xs text-green-600">Live Price</span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 touch-manipulation"
                            onClick={(e) => handleQuickAddToCart(product, e)}
                            aria-label={`Add ${product.productName} to cart`}
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scroll Indicators */}
          {products.length > 1 && (
            <div className="flex justify-center mt-4 sm:mt-5 md:mt-6 space-x-1.5">
              {products.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-all duration-300"
                />
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
};

export default RelatedProducts;