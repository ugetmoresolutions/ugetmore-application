import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Palette, Package, Trash2, School, BookOpen } from "lucide-react";
import BrandingPreviewModal from "../shop/branding/BrandingPreviewModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CartItemDisplay {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  quantity: number;
  sku: string;
  deliveryDate: string;
  image: any;
  isBranded: boolean;
  brandingPositions: number;
  totalBrandingCost: number;

  isBulk?: boolean; // NEW: Stationery bulk indicator
  schoolInfo?: any; // NEW: School information for bulk items
  bulkProducts?: any[];

  // ADD THIS: Selected variant information
  selectedVariant?: {
    colorCode: string;
    colorName: string;
    sizeCode?: string;
    sizeName?: string;
    variantIndex: number;
    imageUrl?: string;
  };
}

interface CartItemsListProps {
  items: CartItemDisplay[];
  rawItems: any[]; // Original cart items with full branding configs
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

interface CustomCartItemProps {
  item: CartItemDisplay;
  onRemoveItem: (id: string) => void;
  onViewBranding: (brandingSetup: any) => void;
}

// NEW: Stationery Bulk Cart Item Component
const StationeryBulkCartItem: React.FC<{
  item: CartItemDisplay;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 xs:p-4 sm:p-5 md:p-6 hover:bg-gray-50 transition-colors relative"
    >
      {/* Stationery Bulk Indicator Badge */}
      <div className="absolute -top-2 -right-0 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-lg">
        <BookOpen className="w-3 h-3" />
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4 items-center">
        {/* Product Info - 6 columns */}
        <div className="col-span-6 flex items-center gap-2 md:gap-3 lg:gap-4">
          <div className="relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 object-cover rounded-lg border-2 border-purple-300 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-500" />
              </div>
            )}
            {/* Purple overlay for stationery bulk items */}
            <div className="absolute inset-0 bg-purple-500/10 rounded-lg border-2 border-purple-300"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium sm:font-semibold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {item.category} • {item.brand}
            </p>

            {/* School Information for Stationery Bulk */}
            {item.schoolInfo && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-purple-600 font-medium">
                  {item.schoolInfo.schoolName}
                </span>
              </div>
            )}

            {/* Bulk Products Count */}
            {item.bulkProducts && (
              <p className="text-xs text-gray-500 mt-1">
                {item.bulkProducts.length} items in pack
              </p>
            )}
          </div>
        </div>

        {/* Quantity - 2 columns */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center border border-purple-300 rounded-lg bg-purple-50">
            <button
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-1.5 sm:p-2 hover:bg-purple-100 text-purple-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-center min-w-[2.5rem] sm:min-w-[3rem] font-medium text-sm sm:text-base text-purple-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 sm:p-2 hover:bg-purple-100 text-purple-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Price - 3 columns */}
        <div className="col-span-3 text-center">
          <p className="font-bold text-base sm:text-lg text-purple-900">
            R {(item.price * item.quantity).toFixed(2)}
          </p>
          <p className="text-xs sm:text-sm text-purple-600">
            R {item.price.toFixed(2)} per pack
          </p>
        </div>

        {/* Remove - 1 column */}
        <div className="col-span-1 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveItem(item.id)}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Layout for Stationery Bulk */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-purple-300 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-purple-500/10 rounded-lg border-2 border-purple-300"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium xs:font-semibold text-sm xs:text-base sm:text-base text-gray-900 truncate">
              {item.name}
            </h3>

            {/* School Info Mobile */}
            {item.schoolInfo && (
              <div className="flex items-center gap-1 mt-1">
                <School className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">
                  {item.schoolInfo.schoolName}
                </span>
              </div>
            )}

            <p className="text-sm xs:text-base sm:text-lg font-bold text-purple-900">
              R {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-purple-300 rounded-lg bg-purple-50">
            <button
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-1.5 xs:p-2 hover:bg-purple-100 text-purple-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-center min-w-[2.5rem] xs:min-w-[3rem] font-medium text-sm xs:text-base text-purple-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 xs:p-2 hover:bg-purple-100 text-purple-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveItem(item.id)}
            className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// SIMPLIFIED CustomCartItem - Now identical to RegularCartItem
const CustomCartItem: React.FC<{
  item: CartItemDisplay;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onViewBranding: (brandingSetup: any) => void;
}> = ({ item, onUpdateQuantity, onRemoveItem, onViewBranding }) => {
  const router = useRouter();

  // ✅ Use the SAME calculation as RegularCartItem
  const unitPrice = item.price; // This should be unit price
  const totalPrice = item.price * item.quantity;

  const handleQuantityUpdate = (newQuantity: number) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 xs:p-4 sm:p-5 md:p-6 hover:bg-gray-50 transition-colors"
    >
      {/* Desktop Layout - SAME AS REGULAR ITEM */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4 items-center">
        {/* Product Info - 6 columns (SAME AS REGULAR) */}
        <div className="col-span-6 flex items-center gap-2 md:gap-3 lg:gap-4">
          <div className="relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 object-cover rounded-lg border-2 border-blue-200 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
            )}
            {/* Custom item indicator */}
            {item.brandingPositions > 0 && (
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                {item.brandingPositions}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-medium sm:font-semibold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {item.category} • {item.brand}
            </p>
            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
            {item.brandingPositions > 0 && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {item.brandingPositions} branding position
                {item.brandingPositions > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Quantity - 2 columns (SAME AS REGULAR) */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center border border-blue-300 rounded-lg bg-blue-50">
            <button
              onClick={() => handleQuantityUpdate(item.quantity - 1)}
              className="p-1.5 sm:p-2 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-center min-w-[2.5rem] sm:min-w-[3rem] font-medium text-sm sm:text-base text-blue-800">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityUpdate(item.quantity + 1)}
              className="p-1.5 sm:p-2 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Price - 3 columns (SAME AS REGULAR) */}
        <div className="col-span-3 text-center">
          <p className="font-bold text-base sm:text-lg text-gray-900">
            R {totalPrice.toFixed(2)}
          </p>
          <p className="text-xs sm:text-sm text-blue-600">
            R {unitPrice.toFixed(2)} each
          </p>
        </div>

        {/* Actions - 1 column (Only difference - has View Branding button) */}
        <div className="col-span-1 flex justify-center gap-1">
          {/* View Branding Button - ONLY DIFFERENCE */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewBranding(item)}
            className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            title="View Branding Details"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          {/* Remove Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onRemoveItem(item.id);
              const date = new Date();
              router.replace(`/client/cart?refreshId=${date.getTime()}`);
            }}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Layout - SAME AS REGULAR ITEM */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-blue-200 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium xs:font-semibold text-sm xs:text-base sm:text-base text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-xs xs:text-sm text-gray-600">{item.brand}</p>
            <p className="text-sm xs:text-base sm:text-lg font-bold text-gray-900">
              R {totalPrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {item.quantity} × R {unitPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-blue-300 rounded-lg bg-blue-50">
            <button
              onClick={() => handleQuantityUpdate(item.quantity - 1)}
              className="p-1.5 xs:p-2 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-center min-w-[2.5rem] xs:min-w-[3rem] font-medium text-sm xs:text-base text-blue-800">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityUpdate(item.quantity + 1)}
              className="p-1.5 xs:p-2 hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* View Branding Button - ONLY DIFFERENCE */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewBranding(item)}
              className="p-1.5 xs:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title="View Branding Details"
            >
              <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onRemoveItem(item.id);
                const date = new Date();
                router.replace(`/client/cart?refreshId=${date.getTime()}`);
              }}
              className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Item"
            >
              <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface RegularCartItemProps {
  item: CartItemDisplay;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const RegularCartItem: React.FC<RegularCartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  // Get the selected color name from the selectedVariant
  const selectedColorName = item.selectedVariant?.colorName || 
                           item.selectedVariant?.colorCode || 
                           '';

  // Get the selected size if available
  const selectedSize = item.selectedVariant?.sizeName || 
                      item.selectedVariant?.sizeCode || 
                      '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 xs:p-4 sm:p-5 md:p-6 hover:bg-gray-50 transition-colors"
    >
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4 items-center">
        
        {/* Product Info - 6 columns */}
        <Link
          href={`/client/shop/${item.sku}`}
          className="col-span-6 flex items-center gap-2 md:gap-3 lg:gap-4"
        >
          {/* Use the color-specific image if available */}
          {item.selectedVariant?.imageUrl ? (
            <img
              src={item.selectedVariant.imageUrl}
              alt={item.name}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium sm:font-semibold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {item.category} • {item.brand}
            </p>
            {/* Display selected color and size */}
            {(selectedColorName || selectedSize) && (
              <div className="flex items-center gap-2 mt-1">
                {selectedColorName && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Color:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedColorName}
                    </span>
                  </div>
                )}
                {selectedSize && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Size:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedSize}
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
          </div>
        </Link>

        {/* Quantity - 2 columns */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-1.5 sm:p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-center min-w-[2.5rem] sm:min-w-[3rem] font-medium text-sm sm:text-base">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Price - 3 columns */}
        <div className="col-span-3 text-center">
          <p className="font-bold text-base sm:text-lg text-gray-900">
            R {(item.price * item.quantity).toFixed(2)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            R {item.price.toFixed(2)} each
          </p>
        </div>

        {/* Remove - 1 column */}
        <div className="col-span-1 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveItem(item.id)}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block lg:hidden">
        <div className="flex items-center gap-3 mb-3">
          {/* Use the color-specific image if available */}
          {item.selectedVariant?.imageUrl ? (
            <img
              src={item.selectedVariant.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-600">
              {item.category} • {item.brand}
            </p>
            {/* Display selected color and size */}
            {(selectedColorName || selectedSize) && (
              <div className="flex items-center gap-2 mt-1">
                {selectedColorName && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Color:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedColorName}
                    </span>
                  </div>
                )}
                {selectedSize && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Size:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedSize}
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">
              R {(item.price * item.quantity).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              R {item.price.toFixed(2)} each
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >

              
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveItem(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Use the color-specific image if available */}
          {item.selectedVariant?.imageUrl ? (
            <img
              src={item.selectedVariant.imageUrl}
              alt={item.name}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium xs:font-semibold text-sm xs:text-base sm:text-base text-gray-900 truncate">
              {item.name}
            </h3>

            
            <p className="text-xs xs:text-sm text-gray-600">{item.brand}</p>
            {/* Display selected color and size */}
            {(selectedColorName || selectedSize) && (
              <div className="flex items-center gap-2 mt-1">
                {selectedColorName && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Color:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedColorName}
                    </span>
                  </div>
                )}
                {selectedSize && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Size:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedSize}
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm xs:text-base sm:text-lg font-bold text-gray-900">
              R {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-1.5 xs:p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-center min-w-[2.5rem] xs:min-w-[3rem] font-medium text-sm xs:text-base">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 xs:p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveItem(item.id)}
            className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  rawItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [showBrandingPreview, setShowBrandingPreview] = useState(false);
  const [selectedBrandingSetup, setSelectedBrandingSetup] = useState<any>(null);

  const handleViewBranding = (item: CartItemDisplay) => {
    console.log("Selected item for branding:", item);
    const originalItem = rawItems.find((rawItem) => rawItem.id === item.id);
    console.log("Original item for branding:", originalItem);
    if (originalItem && originalItem.brandingConfigs) {
      setSelectedBrandingSetup(originalItem.brandingConfigs);
      setShowBrandingPreview(true);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  // FIXED: Separate items properly to avoid duplicates
  const customItems = items.filter((item) => item.isBranded);
  const stationeryBulkItems = items.filter((item) => item.isBulk);
  // FIXED: Regular items should exclude both branded AND bulk items
  const regularItems = items.filter((item) => !item.isBranded && !item.isBulk);

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Stationery Bulk Section */}
        {stationeryBulkItems.length > 0 && (
          <div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 xs:px-4 sm:px-5 md:px-6 py-3 xs:py-3.5 sm:py-4 border-b border-purple-100">
              <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
                <BookOpen className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-purple-600" />
                <h3 className="font-medium xs:font-semibold text-sm xs:text-base sm:text-lg text-purple-900">
                  Stationery Packs
                </h3>
                <span className="bg-purple-200 text-purple-800 text-xs xs:text-xs sm:text-sm px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
                  {stationeryBulkItems.length} pack
                  {stationeryBulkItems.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="divide-y divide-purple-50">
              <AnimatePresence>
                {stationeryBulkItems.map((item) => (
                  // FIX: Use StationeryBulkCartItem directly instead of RegularCartItem
                  <StationeryBulkCartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Custom Products Section */}
        {customItems.length > 0 && (
          <div>
            {stationeryBulkItems.length > 0 && (
              <div className="border-t-2 xs:border-t-3 sm:border-t-4 border-gray-200"></div>
            )}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 xs:px-4 sm:px-5 md:px-6 py-3 xs:py-3.5 sm:py-4 border-b border-blue-100">
              <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
                <Palette className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-blue-600" />
                <h3 className="font-medium xs:font-semibold text-sm xs:text-base sm:text-lg text-blue-900">
                  Custom Branded Products
                </h3>
                <span className="bg-blue-200 text-blue-800 text-xs xs:text-xs sm:text-sm px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
                  {customItems.length} item{customItems.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {customItems.map((item) => (
                  <CustomCartItem
                    key={item.id}
                    item={item}
                    onRemoveItem={onRemoveItem}
                    onViewBranding={handleViewBranding}
                    // ADD THIS LINE:
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Regular Products Section */}
        {regularItems.length > 0 && (
          <div>
            {(stationeryBulkItems.length > 0 || customItems.length > 0) && (
              <div className="border-t-2 xs:border-t-3 sm:border-t-4 border-gray-200"></div>
            )}

            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {regularItems.map((item) => (
                  <RegularCartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      {/* Branding Preview Modal */}
      {selectedBrandingSetup && (
        <BrandingPreviewModal
          showPreview={showBrandingPreview}
          setShowPreview={setShowBrandingPreview}
          brandingSetup={selectedBrandingSetup}
          onConfirm={() => {
            setShowBrandingPreview(false);
            setSelectedBrandingSetup(null);
          }}
        />
      )}
    </>
  );
};

export default CartItemsList;
