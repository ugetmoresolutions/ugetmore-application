// types/product.ts
import { IProduct } from "@/interfaces/product/product";

export interface EnhancedProduct extends IProduct {
  price?: number;
  calculatedPrice?: number;
}

export const addToWishlist = (product: EnhancedProduct): boolean => {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.some((item: any) => 
      item.fullCode === product.fullCode || item.simpleCode === product.simpleCode
    );
    
    if (!exists) {
      wishlist.push({
        ...product,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to wishlist:', error);
    return false;
  }
};

export const removeFromWishlist = (product: EnhancedProduct): boolean => {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const filtered = wishlist.filter((item: any) => 
      item.fullCode !== product.fullCode && item.simpleCode !== product.simpleCode
    );
    localStorage.setItem('wishlist', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

export const isInWishlist = (productId: string): boolean => {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some((item: any) => 
      item.fullCode === productId || item.simpleCode === productId
    );
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};