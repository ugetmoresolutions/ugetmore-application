'use client'


import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
} from "lucide-react";
import {
  ColorQuantity,
  BrandingPosition,
  IBrandingOption,
} from "@/interfaces/branding/branding";
import {
  calculateBrandingCostForColor,
  calculateTotalOrderCost,
} from "./brandingPricing";
import { IStockItem } from "@/interfaces/product/stock";
import { indexedDBStorage } from "@/utils/indexedDbStorage";
import { PRODUCT_API } from "@/endpoints/rest-api/branding";

interface ColorSelectionProps {
  colorQuantities: ColorQuantity[];
  product: any;
  selectedPositions: BrandingPosition[];
  onColorToggle: (colorCode: string) => void;
  onQuantityChange: (colorCode: string, quantity: number) => void;
}

export const ColorSelection: React.FC<ColorSelectionProps> = ({
  colorQuantities,
  product,
  selectedPositions,
  onColorToggle,
  onQuantityChange,
}) => {
  const [stockData, setStockData] = useState<IStockItem[]>([]);
  const [brandingPrices, setBrandingPrices] = useState<IBrandingOption[]>([]);
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());
  const [stockLoading, setStockLoading] = useState(true);
  const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);

  const selectedColors = colorQuantities.filter((cq) => cq.selected);
  const totalQuantity = selectedColors.reduce(
    (sum, cq) => sum + cq.quantity,
    0
  );

  // ADD THESE NEW STATE VARIABLES:
  const [quantityErrors, setQuantityErrors] = useState<{
    [key: string]: string;
  }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  // ADD THIS: Get minimum quantity
  const minQuantity = product?.minimum || 1;
  const maxQuantity =
    product?.stockInfo?.totalStock || product?.stockInfo?.stock || 0;

  // ADD THIS: Initialize input values
  useEffect(() => {
    const initialInputValues: { [key: string]: string } = {};
    colorQuantities.forEach((cq) => {
      initialInputValues[cq.colorCode] = cq.quantity.toString();
    });
    setInputValues(initialInputValues);
  }, [colorQuantities]);

  // Add this state variable
const [brandingPricesLoading, setBrandingPricesLoading] = useState(false);

// Add this function to refresh branding prices
const refreshBrandingPrices = async () => {
  try {
    setBrandingPricesLoading(true);
    console.log("Refreshing branding prices from API...");
    
    const apiBrandingPrices = await PRODUCT_API.GET_BRANDNG_PRICES();
    
    if (apiBrandingPrices && apiBrandingPrices.length > 0) {
      setBrandingPrices(apiBrandingPrices);
      // Save to IndexedDB
      await indexedDBStorage.setBrandingPrices(apiBrandingPrices);
      console.log("Branding prices refreshed and saved to IndexedDB");
    } else {
      console.warn("No branding prices available from API during refresh");
    }
  } catch (error) {
    console.error("Error refreshing branding prices:", error);
  } finally {
    setBrandingPricesLoading(false);
  }
};

// Update the useEffect to include refresh capability
useEffect(() => {
  const loadBrandingPrices = async () => {
    try {
      setStockLoading(true);
      
      // First try to get from IndexedDB
      const cachedBrandingPrices = await indexedDBStorage.getBrandingPrices();
      
      if (cachedBrandingPrices && cachedBrandingPrices.length > 0) {
        console.log("Using cached branding prices from IndexedDB");
        setBrandingPrices(cachedBrandingPrices);
        
        // Optional: Refresh in background to ensure we have latest data
        setTimeout(() => {
          refreshBrandingPrices();
        }, 1000);
      } else {
        // If not in IndexedDB, fetch from API
        await refreshBrandingPrices();
      }
    } catch (error) {
      console.error("Error loading branding prices:", error);
      
      // If IndexedDB fails, try API directly
      try {
        await refreshBrandingPrices();
      } catch (apiError) {
        console.error("Failed to fetch branding prices from API:", apiError);
      }
    } finally {
      setStockLoading(false);
    }
  };

  loadBrandingPrices();
}, []);

  // Calculate total branding cost for a color using shared utility
  const calculateBrandingCostForColorLocal = (colorQuantity: ColorQuantity) => {
    // Only calculate if we have selected positions with methods
    const hasValidBrandingPositions = selectedPositions.some(
      (pos) =>
        pos.selected &&
        pos.selectedMethod &&
        pos.appliedToColors.includes(colorQuantity.colorCode)
    );

    if (!hasValidBrandingPositions) {
      return {
        perItemCost: 0,
        setupFees: 0,
        totalItemCost: 0,
      };
    }

    return calculateBrandingCostForColor(
      colorQuantity,
      selectedPositions,
      product,
      brandingPrices
    );
  };

  // Calculate total order cost including branding using shared utility
  const calculateTotalOrderCostLocal = () => {
    // For products without colors, check if we have selected positions with methods
    const hasColors = colorQuantities.length > 0;
    const hasValidBrandingSetup = hasColors
      ? selectedPositions.some(
          (pos) =>
            pos.selected && pos.selectedMethod && pos.appliedToColors.length > 0
        )
      : selectedPositions.some((pos) => pos.selected && pos.selectedMethod);

    if (!hasValidBrandingSetup) {
      // For products without colors, still calculate base price
      const baseTotal = hasColors
        ? selectedColors.reduce(
            (sum, cq) => sum + cq.unitPrice * cq.quantity,
            0
          )
        : (product?.price ||
            product?.calculatedPrice ||
            (product?.minimum || 1) * 1.5) * (product?.minimum || 1);
      return {
        basePrice: baseTotal,
        brandingCost: 0,
        setupFees: 0,
        designFees: 0,
        grandTotal: baseTotal,
      };
    }

    // Debug logging for setup fee calculation
    console.log(
      "Selected Positions:",
      selectedPositions.filter((pos) => pos.selected)
    );
    console.log("Branding Prices:", brandingPrices);

    const result = calculateTotalOrderCost(
      selectedColors,
      selectedPositions,
      [],
      product,
      brandingPrices
    );
    console.log("Calculated Order Cost:", result);

    return result;
  };

  // Toggle expanded view for color details
  const toggleColorExpanded = (colorCode: string) => {
    const newExpanded = new Set(expandedColors);
    if (newExpanded.has(colorCode)) {
      newExpanded.delete(colorCode);
    } else {
      newExpanded.add(colorCode);
    }
    setExpandedColors(newExpanded);
  };

  // UPDATE the getStockStatus function in ColorSelection.tsx:
const getStockStatus = (colorCode: string) => {
  // ALWAYS use the main product stock for ALL products (colored and no-color)
  const totalStock = product?.stockInfo?.totalStock || product?.stockInfo?.stock || 0;
  const reservedStock = product?.stockInfo?.reservedStock || 0;
  const available = Math.max(0, totalStock - reservedStock);

  return {
    status: available <= 0 ? "out-of-stock" : available <= 10 ? "low-stock" : "in-stock",
    available,
    reserved: reservedStock,
    total: totalStock,
    incoming: product?.stockInfo?.incomingStock || [],
  };
};

  // ADD THESE NEW FUNCTIONS:
  // Handle quantity input changes
  const handleQuantityInput = (colorCode: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [colorCode]: value }));
    setQuantityErrors((prev) => ({ ...prev, [colorCode]: "" }));

    if (value === "") {
      return;
    }

    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    const stockStatus = getStockStatus(colorCode);
    const availableStock = stockStatus.available;

    if (numValue < minQuantity) {
      setQuantityErrors((prev) => ({
        ...prev,
        [colorCode]: `Minimum quantity is ${minQuantity}`,
      }));
      return;
    }

    if (numValue > availableStock) {
      setQuantityErrors((prev) => ({
        ...prev,
        [colorCode]: `Maximum available quantity is ${availableStock}`,
      }));
      return;
    }

    // Update the actual quantity
    onQuantityChange(colorCode, numValue);
  };

  const handleQuantityBlur = (colorCode: string, value: string) => {
    setQuantityErrors((prev) => ({ ...prev, [colorCode]: "" }));

    if (value === "") {
      setInputValues((prev) => ({
        ...prev,
        [colorCode]: minQuantity.toString(),
      }));
      onQuantityChange(colorCode, minQuantity);
      return;
    }

    const numValue = parseInt(value);
    const stockStatus = getStockStatus(colorCode);
    const availableStock = stockStatus.available;

    if (isNaN(numValue) || numValue < minQuantity) {
      setQuantityErrors((prev) => ({
        ...prev,
        [colorCode]: `Minimum order quantity is ${minQuantity}`,
      }));
      setInputValues((prev) => ({
        ...prev,
        [colorCode]: minQuantity.toString(),
      }));
      onQuantityChange(colorCode, minQuantity);
    } else if (numValue > availableStock) {
      setQuantityErrors((prev) => ({
        ...prev,
        [colorCode]: `Maximum available quantity is ${availableStock}`,
      }));
      setInputValues((prev) => ({
        ...prev,
        [colorCode]: availableStock.toString(),
      }));
      onQuantityChange(colorCode, availableStock);
    } else {
      // Valid input, sync with actual quantity
      setInputValues((prev) => ({ ...prev, [colorCode]: value }));
    }
  };

  // Handle increment/decrement
  const handleIncrement = (colorCode: string) => {
    const currentColor = colorQuantities.find(
      (cq) => cq.colorCode === colorCode
    );
    if (!currentColor) return;

    const stockStatus = getStockStatus(colorCode);
    const availableStock = stockStatus.available;

    if (currentColor.quantity < availableStock) {
      const newQuantity = currentColor.quantity + 1;
      setInputValues((prev) => ({
        ...prev,
        [colorCode]: newQuantity.toString(),
      }));
      setQuantityErrors((prev) => ({ ...prev, [colorCode]: "" }));
      onQuantityChange(colorCode, newQuantity);
    } else {
      setQuantityErrors((prev) => ({
        ...prev,
        [colorCode]: `Maximum available quantity is ${availableStock}`,
      }));
    }
  };

  const handleDecrement = (colorCode: string) => {
    const currentColor = colorQuantities.find(
      (cq) => cq.colorCode === colorCode
    );
    if (!currentColor) return;

    if (currentColor.quantity > minQuantity) {
      const newQuantity = currentColor.quantity - 1;
      setInputValues((prev) => ({
        ...prev,
        [colorCode]: newQuantity.toString(),
      }));
      setQuantityErrors((prev) => ({ ...prev, [colorCode]: "" }));
      onQuantityChange(colorCode, newQuantity);
    }
  };

  const orderCost = calculateTotalOrderCostLocal();

  // In the "No Color" section, REPLACE the entire section with this:

  if (colorQuantities.length === 0) {
    const minQuantity = product?.minimum || 1;
    const maxQuantity =
      product?.stockInfo?.totalStock || product?.stockInfo?.stock || 0;

    // Use state to track quantity for no-color products
    const [noColorQuantity, setNoColorQuantity] = useState(minQuantity);
    const [noColorInputValue, setNoColorInputValue] = useState(
      minQuantity.toString()
    );
    const [noColorError, setNoColorError] = useState<string | null>(null);

    // Sync with parent component when quantity changes - THIS IS CRITICAL
    useEffect(() => {
      // Call the parent's onQuantityChange with a special color code
      onQuantityChange("no-color", noColorQuantity);
    }, [noColorQuantity, onQuantityChange]);

    const handleNoColorQuantityInput = (value: string) => {
      setNoColorInputValue(value);
      setNoColorError(null);

      if (value === "") return;

      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) return;

      if (numValue < minQuantity) {
        setNoColorError(`Minimum quantity is ${minQuantity}`);
        return;
      }

      if (numValue > maxQuantity) {
        setNoColorError(`Maximum available quantity is ${maxQuantity}`);
        return;
      }

      setNoColorQuantity(numValue);
    };

    const handleNoColorQuantityBlur = (value: string) => {
      setNoColorError(null);

      if (value === "") {
        setNoColorInputValue(minQuantity.toString());
        setNoColorQuantity(minQuantity);
        return;
      }

      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < minQuantity) {
        setNoColorError(`Minimum order quantity is ${minQuantity}`);
        setNoColorInputValue(minQuantity.toString());
        setNoColorQuantity(minQuantity);
      } else if (numValue > maxQuantity) {
        setNoColorError(`Maximum available quantity is ${maxQuantity}`);
        setNoColorInputValue(maxQuantity.toString());
        setNoColorQuantity(maxQuantity);
      } else {
        setNoColorInputValue(numValue.toString());
      }
    };

    const handleNoColorIncrement = () => {
      if (noColorQuantity < maxQuantity) {
        const newQuantity = noColorQuantity + 1;
        setNoColorQuantity(newQuantity);
        setNoColorInputValue(newQuantity.toString());
        setNoColorError(null);
      }
    };

    const handleNoColorDecrement = () => {
      if (noColorQuantity > minQuantity) {
        const newQuantity = noColorQuantity - 1;
        setNoColorQuantity(newQuantity);
        setNoColorInputValue(newQuantity.toString());
        setNoColorError(null);
      }
    };

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 md:w-10 md:h-10 text-amber-600" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg md:text-xl font-semibold text-amber-800 mb-2">
                No Color Options Available
              </h4>
              <p className="text-sm md:text-base text-amber-700 mb-4">
                This product doesn't have different color variations. Set your
                quantity below.
              </p>

              {/* Quantity Controls for products without colors */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <label className="text-sm font-medium text-amber-800">
                  Quantity:
                </label>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center border-2 border-amber-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={handleNoColorDecrement}
                      className="p-2 hover:bg-amber-100 active:bg-amber-200 transition-colors duration-200 disabled:opacity-50 touch-manipulation"
                      disabled={noColorQuantity <= minQuantity}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      value={noColorInputValue}
                      onChange={(e) =>
                        handleNoColorQuantityInput(e.target.value)
                      }
                      onBlur={(e) => handleNoColorQuantityBlur(e.target.value)}
                      onKeyDown={(e) => {
                        if (["-", "e", "E", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="px-2 sm:px-3 py-1 sm:py-2 text-center min-w-[50px] border-x-2 border-amber-300 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      min={minQuantity}
                      max={maxQuantity}
                    />

                    <button
                      onClick={handleNoColorIncrement}
                      className="p-2 hover:bg-amber-100 active:bg-amber-200 transition-colors duration-200 touch-manipulation"
                      disabled={noColorQuantity >= maxQuantity}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Error message */}
                  {noColorError && (
                    <p className="text-xs text-red-500 text-center animate-pulse">
                      {noColorError}
                    </p>
                  )}
                </div>
                <div className="text-xs text-amber-600">
                  Min: {minQuantity} | Max: {maxQuantity}
                </div>
              </div>

              {/* Stock information */}
              <div className="mt-2 text-xs text-amber-600">
                Available Stock: {maxQuantity} units
              </div>
            </div>

            <div className="flex-shrink-0">
              {product?.images && product.images.length > 0 ? (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden relative bg-white border border-amber-200">
                  <Image
                    src={
                      product.images[0]?.urls?.[0]?.url ||
                      "/yougetmore assets/pictures/product1.png"
                    }
                    alt={product.productName || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100 border border-amber-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs sm:text-sm font-bold">
            1
          </span>
          Choose your colour/s
        </h4>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
          {colorQuantities.map((colorQty) => {
            const stockStatus = getStockStatus(colorQty.colorCode);

            return (
              <button
                key={colorQty.colorCode}
                onClick={() => onColorToggle(colorQty.colorCode)}
                disabled={stockStatus.status === "out-of-stock"}
                className={`relative group ${
                  colorQty.selected
                    ? "ring-1 sm:ring-2 ring-cyan-500 ring-offset-1 sm:ring-offset-2"
                    : stockStatus.status === "out-of-stock"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:ring-1 sm:hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                } rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200`}
              >
                <div className="aspect-square w-full">
                  {colorQty.images && colorQty.images.length > 0 ? (
                    <Image
                      src={
                        colorQty.images[0]?.urls?.[0]?.url ||
                        "/yougetmore assets/pictures/product1.png"
                      }
                      alt={colorQty.colorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
                      <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-1 leading-tight">
                        No Image
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock indicator */}
                <div
                  className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    stockStatus.status === "in-stock"
                      ? "bg-green-500"
                      : stockStatus.status === "low-stock"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                />

                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-0.5 sm:p-1 text-center">
                  <span className="hidden sm:inline">{colorQty.colorName}</span>
                  <span className="sm:hidden text-xs truncate block px-1">
                    {colorQty.colorName.length > 8
                      ? colorQty.colorName.substring(0, 8) + "..."
                      : colorQty.colorName}
                  </span>
                </div>

                {colorQty.selected && (
                  <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                )}

                {stockStatus.status === "out-of-stock" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">
                      <span className="hidden sm:inline">Out of Stock</span>
                      <span className="sm:hidden">Out</span>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedColors.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-cyan-800">
              Selected {selectedColors.length} color
              {selectedColors.length > 1 ? "s" : ""}. Review stock availability
              and set quantities for each selected color.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs sm:text-sm font-bold">
                  2
                </span>
                Add your quantities
              </h4>

              {selectedPositions.length > 0 && (
                <button
                  onClick={() => setShowPricingBreakdown(!showPricingBreakdown)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-cyan-600 hover:text-cyan-700 transition-colors self-start sm:self-auto"
                >
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  {showPricingBreakdown ? "Hide" : "Show"} Pricing Breakdown
                </button>
              )}
            </div>

            <div className="space-y-3 md:space-y-4">
              {selectedColors.map((colorQty) => {
                const stockStatus = getStockStatus(colorQty.colorCode);
                const isExpanded = expandedColors.has(colorQty.colorCode);
                const brandingCost =
                  calculateBrandingCostForColorLocal(colorQty);
                const totalPricePerItem =
                  colorQty.unitPrice + brandingCost.perItemCost;

                return (
                  <div
                    key={colorQty.colorCode}
                    className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden"
                  >
                    {/* Color Header */}
                    <div
                      className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 sm:p-4 cursor-pointer hover:from-cyan-100 hover:to-blue-100 transition-colors"
                      onClick={() => toggleColorExpanded(colorQty.colorCode)}
                    >
                      <div className="flex flex-wrap items-center lg:justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                            {colorQty.images && colorQty.images.length > 0 ? (
                              <Image
                                src={
                                  colorQty.images[0]?.urls?.[0]?.url ||
                                  "/yougetmore assets/pictures/product1.png"
                                }
                                alt={colorQty.colorName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 text-center">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 text-sm sm:text-lg truncate sm:whitespace-normal">
                              <span className="hidden sm:inline">
                                {product.productName} - {colorQty.colorName}
                              </span>
                              <span className="sm:hidden">
                                {colorQty.colorName}
                              </span>
                            </h5>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                              <span className="hidden sm:inline">
                                Color Code:{" "}
                              </span>
                              {colorQty.colorCode}
                            </div>

                            {/* Pricing Information */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                              <div className="text-xs sm:text-sm">
                                <span className="text-gray-600">Base: </span>
                                <span className="font-medium">
                                  R {colorQty.unitPrice.toFixed(2)}
                                </span>
                              </div>
                              {brandingCost.perItemCost > 0 && (
                                <div className="text-xs sm:text-sm">
                                  <span className="text-gray-600">
                                    + Branding:{" "}
                                  </span>
                                  <span className="font-medium text-cyan-600">
                                    R {brandingCost.perItemCost.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="text-xs sm:text-sm">
                                <span className="text-gray-600">
                                  Total per item:{" "}
                                </span>
                                <span className="font-bold text-green-600">
                                  R {totalPricePerItem.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Stock Status Badge */}
                            <div className="flex items-center gap-2 mt-2">
                              {stockStatus.status === "in-stock" && (
                                <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 sm:py-1 rounded-full text-xs">
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">
                                    {stockStatus.available} Available
                                  </span>
                                  <span className="sm:hidden">
                                    {stockStatus.available}
                                  </span>
                                </div>
                              )}
                              {stockStatus.status === "low-stock" && (
                                <div className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-0.5 sm:py-1 rounded-full text-xs">
                                  <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">
                                    Low Stock ({stockStatus.available} left)
                                  </span>
                                  <span className="sm:hidden">
                                    Low ({stockStatus.available})
                                  </span>
                                </div>
                              )}
                              {stockStatus.status === "out-of-stock" && (
                                <div className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-0.5 sm:py-1 rounded-full text-xs">
                                  <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">
                                    Out of Stock
                                  </span>
                                  <span className="sm:hidden">Out</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="text-right">
                            <div className="text-xs sm:text-sm text-gray-600">
                              Qty:
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDecrement(colorQty.colorCode);
                                  }}
                                  className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 disabled:opacity-50 touch-manipulation"
                                  disabled={colorQty.quantity <= minQuantity}
                                >
                                  <Minus className="w-3 h-3 sm:w-3 sm:h-3" />
                                </button>

                                <input
                                  type="number"
                                  value={
                                    inputValues[colorQty.colorCode] ||
                                    colorQty.quantity.toString()
                                  }
                                  onChange={(e) =>
                                    handleQuantityInput(
                                      colorQty.colorCode,
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handleQuantityBlur(
                                      colorQty.colorCode,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (["-", "e", "E", "."].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className="px-2 sm:px-3 py-1 sm:py-2 text-center min-w-[40px] sm:min-w-[50px] border-x-2 border-gray-300 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  min={minQuantity}
                                  // Remove max attribute to allow typing up to available stock
                                />

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIncrement(colorQty.colorCode);
                                  }}
                                  className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation"
                                  disabled={
                                    colorQty.quantity >=
                                    getStockStatus(colorQty.colorCode).available
                                  }
                                >
                                  <Plus className="w-3 h-3 sm:w-3 sm:h-3" />
                                </button>
                              </div>

                              {/* Error message */}
                              {quantityErrors[colorQty.colorCode] && (
                                <p className="text-xs text-red-500 text-center animate-pulse">
                                  {quantityErrors[colorQty.colorCode]}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="hidden sm:inline">
                                Subtotal:{" "}
                              </span>
                              R{" "}
                              {(totalPricePerItem * colorQty.quantity).toFixed(
                                2
                              )}
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stock Information Table */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-cyan-500 text-white">
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                                  Qty
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                                  Base Price
                                  <br className="hidden sm:block" />
                                  <span className="text-cyan-100 font-normal text-xs">
                                    (Ex VAT)
                                  </span>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                                  Branding
                                  <br className="hidden sm:block" />
                                  <span className="text-cyan-100 font-normal text-xs">
                                    (Per Item)
                                  </span>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                                  Total
                                  <br className="hidden sm:block" />
                                  <span className="text-cyan-100 font-normal text-xs">
                                    (Per Item)
                                  </span>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                                  Stock
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">
                                  Reserved
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">
                                  Incoming
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden xl:table-cell">
                                  ETA
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white border-b border-gray-100">
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center font-medium text-sm">
                                  {colorQty.quantity}
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">
                                  R {colorQty.unitPrice.toFixed(2)}
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 font-medium text-cyan-600 text-xs sm:text-sm">
                                  R {brandingCost.perItemCost.toFixed(2)}
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-green-600 text-xs sm:text-sm">
                                  R {totalPricePerItem.toFixed(2)}
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">
                                  <span
                                    className={`font-medium text-xs sm:text-sm ${
                                      stockStatus.available > 10
                                        ? "text-green-600"
                                        : stockStatus.available > 0
                                        ? "text-orange-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {stockStatus.available || 0}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center hidden md:table-cell">
                                  <span className="text-gray-600 text-xs sm:text-sm">
                                    {stockStatus.reserved || 0}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center hidden lg:table-cell">
                                  <span className="text-blue-600 font-medium text-xs sm:text-sm">
                                    {stockStatus.incoming &&
                                    stockStatus.incoming.length > 0
                                      ? stockStatus.incoming[0].total.toLocaleString()
                                      : "0"}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center hidden xl:table-cell">
                                  <span className="text-gray-600 text-xs sm:text-sm">
                                    {stockStatus.incoming &&
                                    stockStatus.incoming.length > 0
                                      ? new Date(
                                          stockStatus.incoming[0].date
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "-"}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pricing Breakdown */}
            {showPricingBreakdown && selectedPositions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h5 className="font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  Detailed Pricing Breakdown
                </h5>

                <div className="space-y-3 sm:space-y-4">
                  {selectedColors.map((colorQty) => {
                    const brandingCost =
                      calculateBrandingCostForColorLocal(colorQty);

                    return (
                      <div
                        key={colorQty.colorCode}
                        className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200"
                      >
                        <div className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                          {colorQty.colorName} ({colorQty.quantity} units)
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-600">Base Cost:</span>
                            <div className="font-medium">
                              R{" "}
                              {(colorQty.unitPrice * colorQty.quantity).toFixed(
                                2
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Branding Cost:
                            </span>
                            <div className="font-medium text-cyan-600">
                              R {brandingCost.totalItemCost.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Color Subtotal:
                            </span>
                            <div className="font-bold text-green-600">
                              R{" "}
                              {(
                                colorQty.unitPrice * colorQty.quantity +
                                brandingCost.totalItemCost
                              ).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Per Item:</span>
                            <div className="font-medium">
                              R{" "}
                              {(
                                colorQty.unitPrice + brandingCost.perItemCost
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Summary with Branding Costs */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedColors.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Colors Selected
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalQuantity}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total Units
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-600">
                    R {orderCost.brandingCost.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Branding Cost
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    R {orderCost.setupFees.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Setup Fees
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 sm:pt-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-base sm:text-lg">
                  <span className="font-semibold text-gray-900">
                    Grand Total:
                  </span>
                  <span className="font-bold text-xl sm:text-2xl text-green-600">
                    R {orderCost.grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">
                  Base: R {orderCost.basePrice.toFixed(2)} + Branding: R{" "}
                  {orderCost.brandingCost.toFixed(2)} + Setup: R{" "}
                  {orderCost.setupFees.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
