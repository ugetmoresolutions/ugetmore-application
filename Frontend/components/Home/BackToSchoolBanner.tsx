"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/interfaces/product/product';
import { Randombrandings } from "./data";

interface BrandingItem {
  id?: number;
  product: IProduct;
}

const BrandingShowcase: React.FC = () => {
  const [brandings, setBrandings] = useState<BrandingItem[]>(Randombrandings as any);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Try to get products from localStorage only on client side
    if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem("randomProducts");
      
      if (storedProducts) {
        try {
          const parsedProducts: IProduct[] = JSON.parse(storedProducts);
          
          // Map the products to match the expected BrandingItem format
          const localStorageBrandings: BrandingItem[] = parsedProducts.map((product, index) => ({
            // Use index as a temporary id, but fullCode is the true unique identifier
            id: index + 1000, // Offset to avoid conflicts with data.ts ids
            product
          }));
          
          // Use localStorage products if available, otherwise fall back to default data
          setBrandings(localStorageBrandings);
        } catch (error) {
          console.error("Error parsing localStorage products:", error);
          // Keep the default brandings if parsing fails
        }
      }
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % brandings.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + brandings.length) % brandings.length);
  };

  // Clean HTML description - fixed to work with SSR
  const cleanDescription = (html: string) => {
    if (typeof window === 'undefined') {
      // Server-side: use a simple regex approach
      return html.replace(/<[^>]*>/g, '');
    } else {
      // Client-side: use DOM parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
  };

  // Handle case where brandings might be empty
  if (brandings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <p className="text-gray-600">No products available</p>
      </div>
    );
  }

  const currentProduct = brandings[currentIndex].product;
  const defaultImage = currentProduct.images.find(img => img.isDefault)?.urls[0]?.url || 
                      currentProduct.images[0]?.urls[0]?.url;

  // Get promotion status
  const isOnPromotion = currentProduct.promotion !== "0";
  const isSpecial = currentProduct.promotion === "3";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-28 py-8 sm:py-12 lg:py-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          Premium Corporate Branding
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
          Elevate your brand with our curated collection of premium corporate gifts and promotional products
        </p>
      </div>

      {/* Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
        {/* Left Side - Product Image */}
        <div className="relative group order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gray-50 shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-lg">
            <div className="aspect-square relative">
              <Image
                src={defaultImage || '/image.png'}
                alt={currentProduct.productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                className="object-contain p-6 sm:p-8 lg:p-12 transition-transform duration-700"
                priority
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = '/image.png';
                }}
              />
            </div>
            
            {/* Promotion badges */}
            <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 flex flex-col gap-1 sm:gap-2">
              {isSpecial && (
                <div className="flex items-center space-x-1 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Special</span>
                </div>
              )}
              {isOnPromotion && !isSpecial && (
                <div className="flex items-center space-x-1 bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span>Promotion</span>
                </div>
              )}
            </div>

            {/* Brand logo */}
            {currentProduct.brand?.brandWebsiteLogo && (
              <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 bg-white/90 p-1.5 sm:p-2 rounded-lg">
                <Image
                  src={currentProduct.brand.brandWebsiteLogo}
                  alt={currentProduct.brand.name}
                  width={50}
                  height={25}
                  className="object-contain sm:w-[60px] sm:h-[30px]"
                />
              </div>
            )}
          </div>
          
          {/* Navigation Arrows - Hidden on mobile for touch swipe */}
          {brandings.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 hover:border-gray-300 shadow-sm rounded-full p-2 sm:p-3 transition-all duration-300 hover:shadow-md hidden sm:block touch-manipulation"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 hover:border-gray-300 shadow-sm rounded-full p-2 sm:p-3 transition-all duration-300 hover:shadow-md hidden sm:block touch-manipulation"
                aria-label="Next product"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Mobile Navigation Buttons */}
          {brandings.length > 1 && (
            <div className="flex sm:hidden justify-between mt-4">
              <button 
                onClick={prevSlide}
                className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
              >
                ← Previous
              </button>
              <button 
                onClick={nextSlide}
                className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Product Info */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {currentProduct.categories?.slice(0, 2).map((category, index) => (
              <div key={index} className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                {category.name}
              </div>
            ))}
          </div>
          
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                {currentProduct.simpleCode}
              </span>
              <span className="hidden sm:inline text-sm text-gray-400">|</span>
              <span className="text-xs sm:text-sm font-medium text-blue-600">
                {currentProduct.brand?.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {currentProduct.productName}
            </h2>
          </div>
          
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
            {cleanDescription(currentProduct.description || '').substring(0, 150)}
            {cleanDescription(currentProduct.description || '').length > 150 ? '...' : ''}
          </p>

          {/* Branding info */}
          {currentProduct.brandings && currentProduct.brandings.length > 0 && (
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Branding Available</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentProduct.brandings[0].positionName} - {currentProduct.brandings[0].method[0].brandingName}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => router.push("/client/shop/" + currentProduct.fullCode)}
              className="inline-flex cursor-pointer items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-300 touch-manipulation w-full sm:w-auto"
            >
              Customize Product
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>
            
            {/* Additional mobile button */}
            {/* <button
   
              className="sm:hidden inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 transition-all duration-300 touch-manipulation"
            >
              Add to Wishlist
            </button> */}
          </div>
        </div>
      </div>

      {/* Bottom Indicators */}
      {brandings.length > 1 && (
        <div className="flex justify-center space-x-2 mb-8 sm:mb-12 lg:mb-16">
          {brandings.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12 lg:pt-16 border-t border-gray-100">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">500+</div>
          <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Premium Products</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">10,000+</div>
          <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Satisfied Clients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">24 Hours</div>
          <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Quick Turnaround</div>
        </div>
      </div>
    </div>
  );
};

export default BrandingShowcase;