"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { TopProduct } from '@/interfaces/order/order';
import { ORDER_API } from '@/endpoints/rest-api/order';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Import your cart interfaces and API (adjust paths as needed)
import { CART_API } from '@/endpoints/rest-api/cart';
import { useSmartAlert } from '@/components/common/SmartAlert'; // Adjust path to your alert hook
import { IAddCartItem, ICartItem } from '@/interfaces/cart/cart';

// Improved responsive breakpoints for better mobile experience
const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1600 },
    items: 5,
    partialVisibilityGutter: 30
  },
  desktop: {
    breakpoint: { max: 1600, min: 1200 },
    items: 4,
    partialVisibilityGutter: 30
  },
  laptop: {
    breakpoint: { max: 1200, min: 1024 },
    items: 3,
    partialVisibilityGutter: 20
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
    partialVisibilityGutter: 20
  },
  largeMobile: {
    breakpoint: { max: 768, min: 480 },
    items: 2,
    partialVisibilityGutter: 15
  },
  mobile: {
    breakpoint: { max: 480, min: 0 },
    items: 1,
    partialVisibilityGutter: 10
  },
};

interface BestsellingCarouselProps {
  userId?: number;
  productPrices?: any; // Adjust type based on your product prices structure
  getProductPrice?: (product: any, productPrices: any) => number;
}

const BestsellingCarousel: React.FC<BestsellingCarouselProps> = ({ 
  userId, 
  productPrices, 
  getProductPrice 
}) => {
  const [bestSellingProducts, setBestSellingProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // Use your smart alert hook
  const { success, error: showError, AlertComponent } = useSmartAlert();

  const getBestSellingProducts = async () => {  
    try {
      setLoading(true);
      const response = await ORDER_API.GET_BEST_SELLING();

      // Keep only the last 5 elements
      const lastFive = response.data.slice(-5);

      setBestSellingProducts(lastFive);
      setError(null);
    } catch (error) {
      console.error('Error fetching best selling products:', error);
      setError('Failed to load best selling products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBestSellingProducts();
  }, []);

  // Add to cart function specifically for the carousel
  const handleAddToCart = async (product: TopProduct) => {
    try {
      const productPrice = getProductPrice 
        ? getProductPrice(product.product, productPrices)
        : product.priceInfo.avgPricePerUnit || product.priceInfo.minPrice || 0;

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: product.product,
        quantity: 1,
        price: productPrice,
        addedAt: new Date().toISOString()
      };

      if (userId) {
        // User is logged in - use API
        const addCartData: IAddCartItem = {
          userId: userId ,
          item: cartItem
        };

        const response = await CART_API.ADD_CART_ITEM(addCartData);

        if (response?.data) {
          success(
            'Added to Cart!',
            `${product.product.productName} (ZAR ${productPrice.toFixed(2)}) has been added to your cart.`,
            [
              {
                label: 'View Cart',
                action: () => router.push('/client/cart'),
                variant: 'primary'
              },
              {
                label: 'Continue Shopping',
                action: () => { },
                variant: 'secondary'
              }
            ]
          );
        } else {
          throw new Error('Failed to add item to cart');
        }
      } else {
        // User not logged in - use localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = existingCart.findIndex(
          (item: any) => item.product.fullCode === product.product.fullCode
        );

        if (existingItemIndex > -1) {
          existingCart[existingItemIndex].quantity += 1;
          success(
            'Quantity Updated!',
            `${product.product.productName} quantity increased in your cart.`,
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
            `${product.product.productName} (ZAR ${productPrice.toFixed(2)}) has been added to your cart.`,
            [
              {
                label: 'View Cart',
                action: () => router.push('/client/cart'),
                variant: 'primary'
              },
              {
                label: 'Continue Shopping',
                action: () => { },
                variant: 'secondary'
              }
            ]
          );
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      showError(
        'Failed to Add Item',
        'Unable to add item to cart. Please check your connection and try again.',
        [
          {
            label: 'Retry',
            action: () => handleAddToCart(product),
            variant: 'primary'
          }
        ]
      );
    }
  };

  // Helper function to get the primary image URL
  const getProductImageUrl = (product: TopProduct): string => {
    const defaultImage = product.product.images.find(img => img.isDefault);
    const imageToUse = defaultImage || product.product.images[0];
    
    if (imageToUse && imageToUse.urls.length > 0) {
      // Get the largest available image
      const sortedUrls = imageToUse.urls.sort((a, b) => b.width - a.width);
      return sortedUrls[0].url;
    }
    
    // Fallback to a placeholder if no image is available
    return '/placeholder-product.png';
  };

  // Helper function to format price
  const formatPrice = (priceInfo: TopProduct['priceInfo']): string => {
    // Use average price per unit, or minimum price if average is not available
    const price = priceInfo.avgPricePerUnit || priceInfo.minPrice || 0;
    return `ZAR ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-black">
            Best selling
          </h2>
          <div className="flex justify-center items-center h-32 sm:h-48 lg:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-black">
            Best selling
          </h2>
          <div className="text-center text-red-500 px-4">
            <p className="text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
            <button 
              onClick={getBestSellingProducts}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bestSellingProducts.length === 0) {
    return (
      <div className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-black">
            Best selling
          </h2>
          <div className="text-center text-gray-500 px-4">
            <p className="text-sm sm:text-base">No best selling products available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Render the alert component */}
      <AlertComponent />
      
      <div className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-black">
            Best selling
          </h2>
          
          <div className="relative">
            <Carousel
              responsive={responsive}
              infinite={bestSellingProducts.length > 3}
              autoPlay={false}
              keyBoardControl={true}
              showDots={false}
              arrows={true}
              swipeable={true}
              draggable={true}
              partialVisible={true}
              containerClass="carousel-container"
              itemClass="px-2 sm:px-3"
              sliderClass="carousel-slider"
              dotListClass="custom-dot-list-style"
              removeArrowOnDeviceType={["mobile"]}
              customLeftArrow={
                <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 border border-gray-200 hover:bg-gray-50 transition-all hidden sm:block">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              }
              customRightArrow={
                <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 sm:p-3 border border-gray-200 hover:bg-gray-50 transition-all hidden sm:block">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }
            >
              {bestSellingProducts.map((topProduct) => (
                <div key={topProduct.product.simpleCode} className="pb-2 h-full">
                  {/* Equal height card container */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden relative group bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                    
                    {/* Product Image Container - Fixed height */}
                    <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center bg-white p-2 sm:p-4 flex-shrink-0">
                      <Image
                        src={getProductImageUrl(topProduct)}
                        alt={topProduct.product.productName}
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1200px) 25vw, 20vw"
                        
                        className="transition-transform duration-300 object-contain group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to placeholder on image error
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                      
                      {/* Add to Cart Button - Now functional */}
                      <button 
                        onClick={() => handleAddToCart(topProduct)}
                        className="absolute bottom-2 right-2 p-1.5 sm:p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 touch-manipulation z-10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Details - Flexible but consistent height */}
                    <div onClick={() => router.push("/client/shop/" + topProduct.product.fullCode)} className="p-3 sm:p-4 flex flex-col flex-grow">
                      {/* Brand Name */}
                      {topProduct.product.brand?.name && (
                        <p className="text-xs sm:text-sm text-gray-500 mb-1 uppercase tracking-wide line-clamp-1">
                          {topProduct.product.brand.name}
                        </p>
                      )}
                      
                      {/* Product Name - Fixed height with line clamp */}
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                        {topProduct.product.productName}
                      </h3>
                      
                      {/* Price and Button - Fixed at bottom */}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                          {formatPrice(topProduct.priceInfo)}
                        </p>
                        
                        {/* Quick view button */}
                        <button
                          onClick={() => router.push("/client/shop/" + topProduct.product.fullCode)}
                          className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Mobile-specific navigation dots (optional) */}
          <div className="flex justify-center mt-4 sm:hidden space-x-2">
            {Array.from({ length: Math.ceil(bestSellingProducts.length / 1) }).map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BestsellingCarousel;