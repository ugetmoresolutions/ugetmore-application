// components/ProductImageGallery.tsx - Updated with color support
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import Image from 'next/image';
import { IProduct, ProductImage, ColourImage } from "@/interfaces/product/product";

interface ProductImageGalleryProps {
  product: IProduct;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  selectedColor?: string;
  onColorChange?: (colorCode: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  product,
  currentImageIndex,
  setCurrentImageIndex,
  selectedColor,
  onColorChange
}) => {
  const [activeColorTab, setActiveColorTab] = useState<string>('');

  // Initialize active color tab
  useEffect(() => {
    if (product.colourImages && product.colourImages.length > 0 && !activeColorTab) {
      setActiveColorTab(product.colourImages[0].code);
    }
  }, [product.colourImages, activeColorTab]);

  // Update active color when selectedColor changes from branding component
  useEffect(() => {
    if (selectedColor && selectedColor !== activeColorTab) {
      setActiveColorTab(selectedColor);
    }
  }, [selectedColor, activeColorTab]);

  // Get images based on active color or fall back to default images
  const displayImages = useMemo(() => {
    if (activeColorTab && product.colourImages) {
      const colorImage = product.colourImages.find(ci => ci.code === activeColorTab);
      if (colorImage && colorImage.images && colorImage.images.length > 0) {
        return colorImage.images;
      }
    }
    return product.images || [];
  }, [activeColorTab, product.colourImages, product.images]);

  // Reset image index when color changes
  useEffect(() => {
    if (displayImages.length > 0 && currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [displayImages, currentImageIndex, setCurrentImageIndex]);

  const nextImage = () => {
    if (displayImages.length > 0) {
      setCurrentImageIndex(
        currentImageIndex === displayImages.length - 1 ? 0 : currentImageIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (displayImages.length > 0) {
      setCurrentImageIndex(
        currentImageIndex === 0 ? displayImages.length - 1 : currentImageIndex - 1
      );
    }
  };

  const handleColorSelect = (colorCode: string) => {
    setActiveColorTab(colorCode);
    setCurrentImageIndex(0); // Reset to first image when changing colors
    onColorChange?.(colorCode);
  };

  const getCurrentImageUrl = () => {
    if (displayImages.length > 0 && displayImages[currentImageIndex]) {
      return displayImages[currentImageIndex]?.urls?.[0]?.url || '/placeholder-product.png';
    }
    return '/placeholder-product.png';
  };

  console.log("Current Image", getCurrentImageUrl());

  const getCurrentColorName = () => {
    if (activeColorTab && product.colourImages) {
      const colorImage = product.colourImages.find(ci => ci.code === activeColorTab);
      return colorImage?.name || '';
    }
    return '';
  };

  return (
<div className="space-y-4 sm:space-y-6">
      {/* Color Selection Tabs */}
      {product.colourImages && product.colourImages.length > 1 && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
            <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Available Colors</span>
          </div>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {product.colourImages.map((colorImg) => (
              <button
                key={colorImg.code}
                onClick={() => handleColorSelect(colorImg.code)}
                className={`flex-shrink-0 px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeColorTab === colorImg.code
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                {colorImg.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Image Display */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden aspect-square w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeColorTab}-${currentImageIndex}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              src={getCurrentImageUrl()}
              alt={`${product.productName}${getCurrentColorName() ? ` - ${getCurrentColorName()}` : ''}`}
              fill
              className="object-contain p-4 sm:p-8 md:p-12"
            />
          </motion.div>
        </AnimatePresence>
        
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-gray-100 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-gray-100 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm touch-manipulation"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Product Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
          {product.promotion && (
            <span className="bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium">
              On Sale
            </span>
          )}
          {product.isLogo24 && (
            <span className="bg-blue-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium">
              24hr Logo
            </span>
          )}
        </div>

        {/* Current Color & Image Counter */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-end gap-2">
          {getCurrentColorName() && (
            <div className="bg-black/60 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium truncate max-w-[60%]">
              {getCurrentColorName()}
            </div>
          )}
          {displayImages.length > 1 && (
            <div className="bg-black/60 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs flex-shrink-0">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {displayImages.length > 1 && (
        <div className="space-y-1 sm:space-y-2">
          <div className="text-center">
            <span className="text-xs sm:text-sm text-gray-600">
              {getCurrentColorName()} - Multiple Views
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 justify-center max-w-full overflow-x-auto pb-2 px-2 scrollbar-hide">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 touch-manipulation ${
                  currentImageIndex === index 
                    ? 'border-blue-500 ring-1 sm:ring-2 ring-blue-200 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <Image
                  src={image?.urls?.[0]?.url || '/placeholder-product.png'}
                  alt={`${product.productName} ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-contain p-1 sm:p-2 w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Grid Preview */}
      {product.colourImages && product.colourImages.length > 1 && (
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900">All Color Options</h4>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {product.colourImages.map((colorImg) => (
              <button
                key={`grid-${colorImg.code}`}
                onClick={() => handleColorSelect(colorImg.code)}
                className={`relative group touch-manipulation ${
                  activeColorTab === colorImg.code
                    ? 'ring-1 sm:ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2'
                    : 'hover:ring-1 sm:hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 active:ring-gray-400'
                } rounded-md sm:rounded-lg overflow-hidden transition-all duration-200`}
              >
                <div className="aspect-square w-full">
                  {colorImg.images && colorImg.images.length > 0 ? (
                    <Image
                      src={colorImg.images[0]?.urls?.[0]?.url || '/placeholder-product.png'}
                      alt={colorImg.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-0.5 sm:p-1 text-center truncate">
                  {colorImg.name}
                </div>
                {activeColorTab === colorImg.code && (
                  <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Information */}
      {getCurrentColorName() && product.colourImages && product.colourImages.length > 1 && (
        <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-blue-800">
            Currently viewing: <span className="font-semibold">{getCurrentColorName()}</span>
            {displayImages.length > 1 && (
              <span className="ml-1 sm:ml-2">({displayImages.length} images)</span>
            )}
          </p>
          <p className="text-xs text-blue-600 mt-0.5 sm:mt-1">
            <span className="hidden sm:inline">Click on other colors above to see different variations</span>
            <span className="sm:hidden">Tap colors above for variations</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;