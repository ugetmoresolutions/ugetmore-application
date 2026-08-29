import { ICartItemForCoupon } from "@/types/coupon/coupon.type";
import { Category } from "@/types/product/product.types";

// utils/category-detection.util.ts - UPDATE for your product structure
export class CategoryDetectionUtil {
  
  // Base categories for coupon system
  static readonly BASE_CATEGORIES = {
    ELECTRONICS: 'Electronics',
    STATIONERY: 'Stationery', 
    JANITORIAL: 'Janitorial'
  };

  /**
   * Check if cart item belongs to Electronics category (Tarsus)
   */
  static isElectronicsItem(cartItem: ICartItemForCoupon): boolean {
    if (cartItem.supplier === 'tarsus') {
      return true; // All Tarsus products are Electronics
    }
    return false;
  }

  /**
   * Check if cart item belongs to Stationery category (Parrot)
   */
  static isStationeryItem(cartItem: ICartItemForCoupon): boolean {
    if (cartItem.supplier !== 'parrot') return false;
    
    const stationeryCategories = [
      // Writing Instruments
      'Highlighters', 'Markers', 'Permanent Markers', 'Whiteboard Markers',
      // Office Supplies  
      'Calculators', 'Clipboards', 'Craft Knives & Refills', 'Drawing & Push Pins',
      'Erasers & Aqua Wipes', 'Glue', 'Guillotines', 'Paper Grippers', 'Paper Hole Punches',
      'Rulers', 'Scissors', 'Staplers', 'Staplers and Punches', 'Staples',
      // Binding & Laminating
      'Binding Machines and Binders', 'Comb Binding Machines', 'Laminating Machines', 
      'Laminator Consumables', 'Rotary Trimmers',
      // Paper Products
      'Flipchart Paper',
      // General Stationery
      'Office Equipment', 'Office Equipment & Whiteboard Cleaner'
    ];

    return this.checkItemCategories(cartItem, stationeryCategories);
  }

  /**
   * Check if cart item belongs to Janitorial category (Parrot)
   */
  static isJanitorialItem(cartItem: ICartItemForCoupon): boolean {
    if (cartItem.supplier !== 'parrot') return false;
    
    const janitorialCategories = [
      // Cleaning Chemicals
      '1.5 Litres Cleaning Chemicals', '25 Litres Cleaning Chemicals', '5 Litres Cleaning Chemicals',
      'Janitorial Cleaning Chemicals', 'Pine Gel',
      // Cleaning Tools & Equipment
      'Brooms', 'Brooms and Mops', 'Buckets', 'Cloths', 'Dustbins', 'Dusters - Wood Chalk Board',
      'Industrial Vacuum Cleaner', 'Mops', 'Refuse Bags', 'Telescopic Cleaning Brush',
      'Telescopic Squeegee', 'Telescopic Waterfed Poles',
      // Hygiene & Sanitation
      'Hand Sanitizers', 'Hand Soap', 'Dispensers', 'Toilet Roll & Paper Hand Towel Dispenser Holders',
      'PMAT Urine Mat',
      // General Janitorial
      'Janitorial', 'Personal Protective Equipment (PPE)'
    ];

    return this.checkItemCategories(cartItem, janitorialCategories);
  }

  /**
   * Generic method to check cart item categories using your Category interface
   */
  private static checkItemCategories(cartItem: ICartItemForCoupon, targetCategories: string[]): boolean {
    if (!cartItem.product?.categories || !cartItem.product.categories.length) {
      return false;
    }

    return cartItem.product.categories.some((cat: Category) => {
      const categoryName = cat.name?.trim();
      return targetCategories.some(targetCat => 
        categoryName?.includes(targetCat.trim())
      );
    });
  }

  /**
   * Get cart item base category
   */
  static getItemBaseCategory(cartItem: ICartItemForCoupon): string | null {
    if (this.isElectronicsItem(cartItem)) {
      return this.BASE_CATEGORIES.ELECTRONICS;
    }
    if (this.isStationeryItem(cartItem)) {
      return this.BASE_CATEGORIES.STATIONERY;
    }
    if (this.isJanitorialItem(cartItem)) {
      return this.BASE_CATEGORIES.JANITORIAL;
    }
    return null;
  }

  /**
   * Check if cart item matches coupon categories
   */
  static isItemApplicableForCoupon(cartItem: ICartItemForCoupon, couponCategories: string[]): boolean {
    const itemBaseCategory = this.getItemBaseCategory(cartItem);
    return itemBaseCategory ? couponCategories.includes(itemBaseCategory) : false;
  }

  /**
   * Get category breakdown for cart items
   */
  static getCategoryBreakdown(cartItems: ICartItemForCoupon[]): { category: string; itemCount: number; totalAmount: number }[] {
    const breakdown: { [key: string]: { itemCount: number; totalAmount: number } } = {};

    cartItems.forEach(item => {
      const category = this.getItemBaseCategory(item) || 'Other';
      
      if (!breakdown[category]) {
        breakdown[category] = { itemCount: 0, totalAmount: 0 };
      }
      
      breakdown[category].itemCount += item.quantity;
      breakdown[category].totalAmount += item.price * item.quantity;
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      itemCount: data.itemCount,
      totalAmount: data.totalAmount
    }));
  }
}