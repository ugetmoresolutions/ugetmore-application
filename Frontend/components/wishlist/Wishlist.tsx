'use client'

import React, { useState, useEffect } from 'react';
import { Star, Trash2, ShoppingCart } from 'lucide-react';
import { useSmartAlert } from '../common/SmartAlert';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// Define the actual wishlist item structure based on your product data
interface WishlistItem {
  id: string;
  fullCode: string;
  simpleCode: string;
  productName: string;
  images?: Array<{
    name: string;
    isDefault: boolean;
    urls: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    type: string;
    hasLogo: boolean;
    angle: string | null;
  }>;
  colourImages?: Array<{ code: string; images: string[] }>;
  brand?: { name: string; code: string };
  price?: number;
  calculatedPrice?: number;
  minimum?: number;
  maximum?: number;
  categories?: Array<{ name: string; code: string }>;
  addedAt: string;
  isCustomProduct?: boolean;
}

const WishlistCard: React.FC<{ 
  item: WishlistItem; 
  onRemove: (id: string) => void; 
  onAddToCart: (item: WishlistItem) => void 
}> = ({ 
  item, 
  onRemove, 
  onAddToCart 
}) => {
  // Get the correct product image URL from the images array
  const getProductImage = () => {
    // First, try to get the default image
    if (item.images && item.images.length > 0) {
      // Look for the default image first
      const defaultImage = item.images.find(img => img.isDefault === true);
      if (defaultImage && defaultImage.urls && defaultImage.urls.length > 0) {
        return defaultImage.urls[0].url;
      }
      
      // If no default image, take the first available image
      const firstImage = item.images[0];
      if (firstImage.urls && firstImage.urls.length > 0) {
        return firstImage.urls[0].url;
      }
    }
    
    // Fallback to colourImages if available
    if (item.colourImages && item.colourImages.length > 0) {
      const firstColor = item.colourImages[0];
      if (firstColor.images && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    
    // Final fallback placeholder image with product name
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="80" viewBox="0 0 96 80"%3E%3Crect width="96" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="10"%3E${encodeURIComponent(item.productName.substring(0, 20))}%3C/text%3E%3C/svg%3E`;
  };

  // Get a smaller thumbnail image if available (for better performance)
  const getThumbnailImage = () => {
    if (item.images && item.images.length > 0) {
      const imageToUse = item.images.find(img => img.isDefault === true) || item.images[0];
      
      if (imageToUse.urls && imageToUse.urls.length > 0) {
        // Prefer smaller images for thumbnails, but fallback to any available
        const thumbnail = imageToUse.urls.find(url => url.width <= 300) || imageToUse.urls[0];
        return thumbnail.url;
      }
    }
    
    return getProductImage(); // Fallback to main image function
  };

  const getDisplayPrice = () => {
    return item.calculatedPrice || item.price || 0;
  };

  const getProductId = () => {
    return item.fullCode || item.simpleCode || item.id;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative flex-shrink-0">
        <img 
          src={getThumbnailImage()} 
          alt={item.productName}
          className="w-24 h-20 object-cover rounded-md"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="80" viewBox="0 0 96 80"%3E%3Crect width="96" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="10"%3E${encodeURIComponent(item.productName.substring(0, 20))}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-gray-900 font-semibold text-xl leading-tight mb-1">
              {item.productName}
            </h3>
            <p className="text-sm text-blue-600 mb-2">{item.brand?.name || 'No Brand'}</p>
            
            {/* Product Code */}
            <div className="text-xs text-gray-500 mb-2">
              Code: {item.fullCode || item.simpleCode}
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-green-600 font-medium">In stock</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-gray-900 mb-1">
              R {getDisplayPrice().toFixed(2)}
            </div>
            {item.minimum && item.minimum > 1 && (
              <div className="text-xs text-gray-500">Min: {item.minimum}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={() => onAddToCart(item)}
            className="flex items-center gap-2 bg-[#155670] text-white px-4 py-2 rounded-md hover:bg-[#0f3f4d] transition-colors text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
          
          <button
            onClick={() => onRemove(getProductId())}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const WishlistCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4 animate-pulse">
      {/* Image Skeleton */}
      <div className="flex-shrink-0">
        <div className="w-24 h-20 bg-gray-200 rounded-md"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          </div>
          <div className="text-right ml-4">
            <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="h-8 bg-gray-200 rounded w-28"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
};

const Wishlist: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

   const { success, error: alertError, AlertComponent } = useSmartAlert();

    const router = useRouter(); 

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    loadWishlistItems();
  }, []);

  const loadWishlistItems = () => {
    try {
      setLoading(true);
      const wishlistData = localStorage.getItem('wishlist');
      
      if (wishlistData) {
        const items = JSON.parse(wishlistData);
        console.log('Loaded wishlist items:', items); // Debug log
        setWishlistItems(items);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => 
        item.fullCode !== productId && item.simpleCode !== productId
      );
      
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      
      // Dispatch event to update other components (like product details page)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    try {
      const cartItem = {
        id: crypto.randomUUID(),
        product: {
          ...item,
          productName: item.productName,
          categories: item.categories,
          brand: item.brand,
          images: item.images,
          colourImages: item.colourImages,
          fullCode: item.fullCode,
          simpleCode: item.simpleCode,
        },
        quantity: item.minimum || 1,
        price: item.calculatedPrice || item.price || 0,
        addedAt: new Date().toISOString()
      };

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex(
        (cartItem: any) => cartItem.product?.fullCode === item.fullCode ||
                          cartItem.product?.simpleCode === item.simpleCode
      );
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += item.minimum || 1;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch cart update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }

      // Replace the alert with useSmartAlert success message
      success(
        "Added to Cart!",
        `${item.productName} has been added to your cart.`,
        [
          {
            label: "View Cart",
            action: () => router.push("/client/cart"),
            variant: "primary",
          },
        ]
      );
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Use alertError for error cases as well
      alertError(
        "Failed to Add Item",
        "Unable to add item to cart. Please try again.",
        [
          {
            label: "Retry",
            action: () => handleAddToCart(item),
            variant: "primary",
          },
        ]
      );
    }
  };

  const refreshWishlist = () => {
    loadWishlistItems();
  };

  return (
    <div className='bg-white'>
        <AlertComponent/>
      <div className="max-w-4xl mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            My Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
          </h1>
          
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          <AnimatePresence>
  {loading ? (
    <>
      <WishlistCardSkeleton />
      <WishlistCardSkeleton />
      <WishlistCardSkeleton />
    </>
  ) : (
    wishlistItems.map((item, index) => (
      <motion.div
        key={item.fullCode || item.simpleCode || item.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <WishlistCard
          item={item}
          onRemove={handleRemoveItem}
          onAddToCart={handleAddToCart}
        />
      </motion.div>
    ))
  )}
</AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && wishlistItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500">Start adding items you love to keep track of them!</p>
            <button
              onClick={() => window.location.href = '/client/shop/branding'}
              className="mt-4 px-6 py-2 bg-[#155670] text-white rounded-md hover:bg-[#0f3f4d] transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;