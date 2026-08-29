import React from 'react';
import Image from 'next/image';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { IStockItem } from "@/interfaces/product/stock";
import { enhanceProductCardClick } from '@/utils/productStorage';

interface ProductCardProps {
  imageSrc: string;
  productName: string;
  price: number;
  productId: any;
  onAddToCart?: (productId: any) => void;
  allProducts?: IProduct[];
  productPrices?: IProductPrice[];
  stockItems?: IStockItem[];
  sourceCategory?: string;
  sourcePage?: string;
  stockQuantity?: number;
  isInStock?: boolean;
  isCustomBranding?: boolean; // ADD THIS LINE
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  imageSrc, 
  productName, 
  price, 
  productId,
  onAddToCart,
  allProducts = [],
  productPrices = [],
  stockItems = [],
  sourceCategory,
  sourcePage = 'branding',
  stockQuantity = 0,
  isInStock = true,
  isCustomBranding = false // ADD THIS LINE
}) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine if product is actually in stock
  const inStock = isInStock && stockQuantity > 0;
  const lowStock = inStock && stockQuantity <= 5; // Consider low stock if 5 or fewer items

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) {
      return; // Don't allow adding out of stock items
    }
    
    if (onAddToCart) {
      onAddToCart(productId);
    } else {
      console.log('Adding to cart:', productId);
      
    }
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (allProducts.length > 0) {
      const currentProduct = allProducts.find(p => p.fullCode === productId);
      
      if (currentProduct) {
        enhanceProductCardClick(
          productId, 
          currentProduct, 
          allProducts, 
          router, 
          pathname,
          { category: sourceCategory, page: sourcePage },
          productPrices
        );
      } else {
        router.push(`${pathname}/${productId}`);
      }
    } else {
      router.push(`/client/shop/${productId}`);
    }
  };

  return (
    <div 
      onClick={handleProductClick}
      className={`relative group overflow-hidden rounded-sm border border-gray-200 z-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
        !inStock ? 'opacity-75' : ''
      }`}
    >
      <div className="relative w-full h-48 xs:h-52 sm:h-56 md:h-60 lg:h-62 bg-white flex items-center justify-center">
        <Image 
          src={imageSrc} 
          alt={productName} 
          layout="fill"
          objectFit="contain"
          className={`p-2 xs:p-3 sm:p-4 md:p-5 lg:p-2 ${!inStock ? 'grayscale' : ''}`}
        />
        
        {/* Custom Branding Badge */}
        {/* {isCustomBranding && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
            Custom
          </div>
        )} */}
        
        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              Out of Stock
            </div>
          </div>
        )}
        
        {/* Low Stock Badge */}
        {inStock && lowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
            Only {stockQuantity} left
          </div>
        )}
        
        {/* Add to Cart Button */}
        {inStock && (
          <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-4 sm:right-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <button 
              onClick={handleAddToCart}
              className="p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-3 bg-[#155874] rounded-full shadow-lg hover:bg-[#155874] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#155874] focus:ring-offset-2"
              aria-label={`Add ${productName} to cart`}
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
            </button>
          </div>
        )}
        
        {/* Out of Stock Button (disabled) */}
        {!inStock && (
          <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-4 sm:right-4">
            <button 
              disabled
              className="p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-3 bg-gray-400 rounded-full shadow-lg cursor-not-allowed"
              aria-label="Out of stock"
              title="Out of stock"
            >
              <ShoppingCart className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        <h3 className={`text-xs xs:text-sm sm:text-sm md:text-base lg:text-lg font- line-clamp-2 ${
          !inStock ? 'text-gray-500' : 'text-gray-700'
        }`} title={productName}>
          {productName}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className={`text-sm xs:text-base sm:text-base md:text-lg lg:text-xl font-semibold ${
            !inStock ? 'text-gray-500' : 'text-gray-900'
          }`}>
            R {price.toFixed(2)}
          </p>
          
        </div>
        
      </div>
    </div>
  );
};

export default ProductCard;