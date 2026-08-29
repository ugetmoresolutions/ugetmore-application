// components/ProductInfo.tsx - UPDATED
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Info,
  Package,
  Award,
  Clock,
  Truck,
  Shield,
  RotateCcw,
  Palette,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  MousePointer,
  ChevronDown,
} from "lucide-react";
import { IProduct } from "@/interfaces/product/product";
import { sanitizeHtmlContent } from "@/utils/productStorage";
import LoaderComponent from "@/components/Loader";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
  FacebookShareCount,
  TelegramShareButton,
  TelegramIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";
import { Copy, Check } from "lucide-react";
import Image from "next/image";

interface ProductInfoProps {
  product: IProduct;
  quantity: number;
  selectedVariant: number;
  isWishlisted: boolean;
  onQuantityChange: (type: "increment" | "decrement") => void;
  onAddToCart: () => void;
  onWishlist: () => void;
  onVariantChange: (index: number) => void;
  isLoading: boolean;
  requiresBranding?: boolean;
  onBrandingRequiredChange?: (required: boolean) => void;
  isCustomProduct?: boolean;

  // ADD THIS: New prop for selected color
  selectedColor: string;
  onColorChange: (colorCode: string) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  selectedVariant,
  isWishlisted,
  onQuantityChange,
  onAddToCart,
  onWishlist,
  onVariantChange,
  isLoading,
  requiresBranding = false,
  onBrandingRequiredChange,
  isCustomProduct = false,
  // ADD THIS:
  selectedColor,
  onColorChange,
}) => {
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(quantity.toString());
  // ✅ ADD THIS: Manage expanded colors at top level
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());

  // Get minimum quantity - ensure it's at least 1
  const minQuantity = product.minimum || 1;

  // Initialize quantity to minimum when component mounts or product changes
  useEffect(() => {
    if (quantity < minQuantity) {
      // Reset to minimum quantity
      const currentQty = quantity;
      const diff = minQuantity - currentQty;
      for (let i = 0; i < diff; i++) {
        onQuantityChange("increment");
      }
      setInputValue(minQuantity.toString());
    }
  }, [minQuantity, quantity, onQuantityChange]);

  // Get display price - using backend price directly (no frontend markup)
  const getDisplayPrice = () => {
    return product.price || product.originalPrice || minQuantity;
  };

  const hasBrandingOptions = product.brandings && product.brandings.length > 0;

  // Calculate total available stock - USING BACKEND stockInfo
  const getTotalAvailableStock = () => {
    // Use stockInfo from backend response
    if (product.stockInfo) {
      return product.stockInfo.stock - product.stockInfo.reservedStock;
    }

    // Fallback for products without stockInfo
    return product.maximum || 999;
  };

  // Get stock status - USING BACKEND stockInfo
  const getStockStatus = () => {
    const availableStock = getTotalAvailableStock();

    if (availableStock <= 0 || product.isAvailable === false) {
      return {
        status: "out-of-stock",
        message: "Out of Stock",
        color: "red",
        icon: XCircle,
      };
    } else if (availableStock <= 10) {
      return {
        status: "low-stock",
        message: `Only ${availableStock} left in stock`,
        color: "orange",
        icon: AlertTriangle,
      };
    } else {
      return {
        status: "in-stock",
        message: `${availableStock} units available`,
        color: "green",
        icon: CheckCircle,
      };
    }
  };

  // Get incoming stock information - FROM BACKEND stockInfo
  const getIncomingStock = () => {
    if (
      !product.stockInfo?.incomingStock ||
      product.stockInfo.incomingStock.length === 0
    ) {
      return null;
    }

    const incomingStock = product.stockInfo.incomingStock.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return incomingStock.length > 0 ? incomingStock[0] : null;
  };

  const stockStatus = getStockStatus();
  const incomingStock = getIncomingStock();
  const availableStock = getTotalAvailableStock();

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.productName,
          text: `Check out this product: ${product.productName}`,
          url: window.location.href,
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setShowShareOptions(!showShareOptions);
          }
        });
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareOptions(false);
      }, 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareOptions(false);
      }, 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const title = product.productName;

  // Handle quantity validation and updates
  const handleQuantityInput = (value: string) => {
    setInputValue(value);
    setQuantityError(null);

    if (value === "") {
      return;
    }

    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    // Validate against minimum quantity
    if (numValue < minQuantity) {
      setQuantityError(`Minimum quantity is ${minQuantity}`);
      return;
    }

    // Validate against maximum available stock
    if (numValue > availableStock) {
      setQuantityError(`Maximum available quantity is ${availableStock}`);
      return;
    }

    // Update the actual quantity
    const currentQty = quantity;
    if (numValue > currentQty) {
      const diff = numValue - currentQty;
      for (let i = 0; i < diff; i++) {
        onQuantityChange("increment");
      }
    } else if (numValue < currentQty) {
      const diff = currentQty - numValue;
      for (let i = 0; i < diff; i++) {
        onQuantityChange("decrement");
      }
    }
  };

  const handleQuantityBlur = (value: string) => {
    setQuantityError(null);

    if (value === "") {
      setInputValue(minQuantity.toString());
      // Reset to minimum
      const currentMin = minQuantity;
      while (quantity > currentMin) {
        onQuantityChange("decrement");
      }
      while (quantity < currentMin) {
        onQuantityChange("increment");
      }
      return;
    }

    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < minQuantity) {
      setQuantityError(`Minimum order quantity is ${minQuantity}`);
      setInputValue(minQuantity.toString());
      // Reset to minimum
      const currentMin = minQuantity;
      while (quantity > currentMin) {
        onQuantityChange("decrement");
      }
      while (quantity < currentMin) {
        onQuantityChange("increment");
      }
    } else if (numValue > availableStock) {
      setQuantityError(`Maximum available quantity is ${availableStock}`);
      setInputValue(availableStock.toString());
      // Reset to maximum
      while (quantity < availableStock) {
        onQuantityChange("increment");
      }
    } else {
      // Valid input, sync with actual quantity
      setInputValue(quantity.toString());
    }
  };

  // ✅ ADD THIS FUNCTION - Toggle color expansion
  const toggleColorExpanded = (colorCode: string) => {
    const newExpanded = new Set(expandedColors);
    if (newExpanded.has(colorCode)) {
      newExpanded.delete(colorCode);
    } else {
      newExpanded.add(colorCode);
    }
    setExpandedColors(newExpanded);
  };

  // Handle increment/decrement with minimum validation
  const handleIncrement = () => {
    if (quantity < availableStock) {
      onQuantityChange("increment");
      setQuantityError(null);
      setInputValue((quantity + 1).toString());
    }
  };

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange("decrement");
      setQuantityError(null);
      setInputValue((quantity - 1).toString());
    }
  };

  // In the color sections, update the color selection logic:
  const handleColorSelect = (colorCode: string) => {
    onColorChange(colorCode);

    // Also find and select the first variant for this color
    const colorVariants =
      product.variants?.filter((variant) => variant.codeColour === colorCode) ||
      [];

    if (colorVariants.length > 0) {
      const firstVariantIndex =
        product.variants?.findIndex(
          (v) => v.fullCode === colorVariants[0].fullCode
        ) ?? -1;

      if (firstVariantIndex !== -1) {
        onVariantChange(firstVariantIndex);
      }
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:pl-4 xl:pl-8">
      <div>
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-3 sm:mb-4 gap-3 xs:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
            <span className="font-medium">SKU:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
              {product.fullCode || product.simpleCode}
            </span>
            {/* Show supplier badge */}
            {product.supplier && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  product.supplier === "amrod"
                    ? "bg-blue-100 text-blue-800"
                    : product.supplier === "parrot"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.supplier.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 self-end xs:self-auto">
            <button
              onClick={onWishlist}
              className={`p-2 rounded-full transition-colors touch-manipulation ${
                isWishlisted
                  ? "text-red-500 bg-red-50 hover:bg-red-100 active:bg-red-200"
                  : "text-gray-400 hover:text-red-500 hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isWishlisted ? "fill-current" : ""
                }`}
              />
            </button>
            <div className="relative">
              <button
                onClick={handleShareClick}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Share options dropdown */}
              {showShareOptions && (
                <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200 min-w-[250px]">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Share this product
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {/* Facebook */}
                    <div className="flex flex-col items-center">
                      <FacebookShareButton
                        url={shareUrl}
                        title={title}
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <FacebookIcon size={40} round />
                      </FacebookShareButton>
                      <div className="mt-1 text-xs text-gray-500">
                        <FacebookShareCount url={shareUrl}>
                          {(shareCount) => shareCount || "0"}
                        </FacebookShareCount>
                      </div>
                    </div>

                    {/* Twitter */}
                    <div className="flex flex-col items-center">
                      <TwitterShareButton
                        url={shareUrl}
                        title={title}
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <TwitterIcon size={40} round />
                      </TwitterShareButton>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex flex-col items-center">
                      <WhatsappShareButton
                        url={shareUrl}
                        title={title}
                        separator=": "
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <WhatsappIcon size={40} round />
                      </WhatsappShareButton>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col items-center">
                      <EmailShareButton
                        url={shareUrl}
                        subject={title}
                        body={`Check out this product: ${title}`}
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <EmailIcon size={40} round />
                      </EmailShareButton>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex flex-col items-center">
                      <LinkedinShareButton
                        url={shareUrl}
                        title={title}
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <LinkedinIcon size={40} round />
                      </LinkedinShareButton>
                    </div>

                    {/* Telegram */}
                    <div className="flex flex-col items-center">
                      <TelegramShareButton
                        url={shareUrl}
                        title={title}
                        className="rounded-full transition-transform hover:scale-110"
                      >
                        <TelegramIcon size={40} round />
                      </TelegramShareButton>
                    </div>
                  </div>

                  {/* Copy link section */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 text-xs p-2 border border-gray-300 rounded-md bg-gray-50 truncate"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-2 text-gray-600 hover:text-[#155874] hover:bg-gray-100 rounded-md transition-colors"
                        title="Copy link"
                      >
                        {copySuccess ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {copySuccess && (
                      <div className="text-xs text-green-600 mt-1 text-center">
                        Link copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {product.productName}
        </h1>

        <div className="text-gray-600 mb-4 max-w-md sm:mb-6 leading-relaxed space-y-2 sm:space-y-3 text-sm sm:text-base">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtmlContent(product.description || ""),
            }}
            className="prose prose-sm sm:prose max-w-none [&>div]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 sm:[&>ul]:ml-6 [&>li]:mb-1 [&>ul>li>div]:inline"
          />
        </div>

        {/* Stock Availability Section - UPDATED TO USE stockInfo */}
        <div className="mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
              stockStatus.color === "green"
                ? "border-green-200 bg-green-50"
                : stockStatus.color === "orange"
                ? "border-orange-200 bg-orange-50"
                : stockStatus.color === "red"
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  stockStatus.color === "green"
                    ? "bg-green-500"
                    : stockStatus.color === "orange"
                    ? "bg-orange-500"
                    : stockStatus.color === "red"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              >
                <stockStatus.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm sm:text-base ${
                    stockStatus.color === "green"
                      ? "text-green-800"
                      : stockStatus.color === "orange"
                      ? "text-orange-800"
                      : stockStatus.color === "red"
                      ? "text-red-800"
                      : "text-gray-800"
                  } truncate`}
                >
                  {stockStatus.message}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Stock Availability
                </div>
              </div>
            </div>

            {/* Stock Details - Show stockInfo details */}
            {product.stockInfo && (
              <div className="space-y-1 sm:space-y-2">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs sm:text-sm gap-1 xs:gap-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 truncate">
                      {product.stockInfo.colourCode
                        ? `Color: ${product.stockInfo.colourCode}`
                        : "Standard"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="text-gray-600">
                      Available:{" "}
                      <span className="font-medium">
                        {product.stockInfo.stock -
                          product.stockInfo.reservedStock}
                      </span>
                    </span>
                    {product.stockInfo.reservedStock > 0 && (
                      <span className="text-orange-600">
                        Reserved: {product.stockInfo.reservedStock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Product Stock Note */}
            {isCustomProduct && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                <div className="flex items-start xs:items-center gap-2 text-xs sm:text-sm">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5 xs:mt-0" />
                  <span className="text-gray-600">
                    This is a custom branding product with real-time stock
                    tracking.
                  </span>
                </div>
              </div>
            )}

            {/* Incoming Stock Information */}
            {incomingStock && stockStatus.status === "out-of-stock" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200"
              >
                <div className="flex items-start xs:items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5 xs:mt-0" />
                  <span className="text-gray-600">
                    <span className="font-medium text-blue-600">
                      {incomingStock.total} units
                    </span>{" "}
                    expected on{" "}
                    <span className="font-medium">
                      {new Date(incomingStock.date).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm text-gray-500">Brand</div>
            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {product.brand?.name || "Unknown Brand"}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
          <div className="flex flex-col xs:flex-row xs:items-baseline gap-2 xs:gap-4 mb-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              R {getDisplayPrice().toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">per unit</span>
            {product.price && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full self-start xs:self-auto">
                Live Price
              </span>
            )}
          </div>
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Min: {minQuantity} units</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Ships in 2-3 days</span>
            </div>
          </div>
        </div>
      </div>

      {!requiresBranding && (product?.colourImages?.length || 0) > 0 && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
              Colors & Sizes
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.colourImages.length} color
              {product.colourImages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Color Sections with Dropdown */}
          <div className="space-y-2">
            {product.colourImages.map((color, colorIndex) => {
              const colorVariants =
                product.variants?.filter(
                  (variant) => variant.codeColour === color.code
                ) || [];

              const defaultImage = color.images.find((img) => img.isDefault);
              const imageUrl = defaultImage?.urls?.[0]?.url;
              // ✅ REPLACE WITH:
              const isExpanded = expandedColors.has(color.code);

              return (
                <div
                  key={color.code}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Color Header - Clickable */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      handleColorSelect(color.code); // Use the new color selection handler
                      toggleColorExpanded(color.code); // Keep the existing expand functionality
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      selectedColor === color.code
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    {/* Color Image */}
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-gray-300 overflow-hidden flex-shrink-0 bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={color.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-200">
                            {color.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Size Count Badge */}
                      {colorVariants.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {colorVariants.length}
                        </div>
                      )}
                    </div>

                    {/* Color Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {color.name}
                        </div>
                        {selectedColor === color.code && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {colorVariants.length} size
                        {colorVariants.length !== 1 ? "s" : ""} available
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Size Dropdown Content */}
                  {isExpanded && colorVariants.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Select Size:
                          </span>
                          <span className="text-xs text-gray-500">
                            {colorVariants.length} option
                            {colorVariants.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                          {colorVariants.map((variant) => {
                            const globalVariantIndex =
                              product.variants?.findIndex(
                                (v) => v.fullCode === variant.fullCode
                              ) ?? -1;

                            const isSelected =
                              selectedVariant === globalVariantIndex;

                            return (
                              <button
                                key={variant.fullCode}
                                onClick={() =>
                                  onVariantChange(globalVariantIndex)
                                }
                                className={`
                            p-3 rounded-lg border-2 text-center transition-all duration-200
                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105"
                                : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                            }
                          `}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span
                                      className={`text-sm font-semibold ${
                                        isSelected
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {variant.codeSizeName || "One Size"}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {isExpanded && colorVariants.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-gray-50 border-t border-gray-100 text-center"
                    >
                      <div className="text-gray-400 text-sm py-2">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No sizes available for this color
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Variant Card */}
          {selectedVariant !== -1 &&
            product.variants?.[selectedVariant] &&
            selectedColor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {/* Color Preview */}
                  <div className="w-12 h-12 rounded-lg border-2 border-white/30 overflow-hidden flex-shrink-0 bg-white">
                    {(() => {
                      const selectedVariantData =
                        product.variants[selectedVariant];
                      const selectedColorData = product.colourImages.find(
                        (color) => color.code === selectedColor // Use selectedColor instead of selectedVariantData.codeColour
                      );
                      const defaultImage = selectedColorData?.images.find(
                        (img) => img.isDefault
                      );
                      const imageUrl = defaultImage?.urls?.[0]?.url;

                      return imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={selectedColorData?.name || "Selected color"}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600 bg-gray-200">
                          {selectedColorData?.name
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {(() => {
                          const selectedColorData = product.colourImages.find(
                            (color) => color.code === selectedColor
                          );
                          return (
                            selectedColorData?.name ||
                            product.variants[selectedVariant].codeColourName
                          );
                        })()}
                      </span>
                      {product.variants[selectedVariant].codeSizeName && (
                        <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium border border-white/30">
                          {product.variants[selectedVariant].codeSizeName}
                        </span>
                      )}
                      <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    </div>
                    <div className="text-blue-100 text-xs space-y-1">
                      <div className="font-mono bg-white/10 px-2 py-1 rounded border border-white/20 inline-block">
                        {product.variants[selectedVariant].fullCode}
                      </div>
                      <div className="text-blue-200">
                        Color: {selectedColor}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Selection Prompt */}
          {(selectedVariant === -1 || !selectedColor) &&
            product.variants &&
            product.variants.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MousePointer className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {!selectedColor
                    ? "Select a color to begin"
                    : "Click on a color to view available sizes"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {!selectedColor
                    ? "Choose your preferred color first"
                    : "Then select your preferred size"}
                </p>
              </motion.div>
            )}
        </div>
      )}

      {/* Branding Checkbox Section */}
      {hasBrandingOptions && (
        <div className="space-y-3 sm:space-y-4">
          <motion.label
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 touch-manipulation ${
              requiresBranding
                ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={requiresBranding}
                onChange={(e) => onBrandingRequiredChange?.(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  requiresBranding
                    ? "bg-cyan-500 border-cyan-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {requiresBranding && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  requiresBranding ? "bg-cyan-500" : "bg-gray-300"
                }`}
              >
                <Palette
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                    requiresBranding ? "text-white" : "text-gray-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm sm:text-base transition-all duration-200 truncate ${
                    requiresBranding ? "text-cyan-900" : "text-gray-700"
                  }`}
                >
                  I require additional branding on this product
                </div>
                <div
                  className={`text-xs sm:text-sm transition-all duration-200 ${
                    requiresBranding ? "text-cyan-700" : "text-gray-500"
                  }`}
                >
                  {isCustomProduct
                    ? "Add your logo, artwork, or custom design to this custom product"
                    : "Add your logo, artwork, or custom design"}
                </div>
              </div>
            </div>

            <div
              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                requiresBranding
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {requiresBranding ? "Selected" : "Optional"}
            </div>
          </motion.label>

          {requiresBranding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm text-cyan-800 flex-1 min-w-0">
                  <p className="font-medium mb-1">
                    Branding options available:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-cyan-700">
                    {product.brandings.slice(0, 3).map((branding, index) => (
                      <li key={index} className="break-words">
                        {branding.positionName} -{" "}
                        {branding.method?.[0]?.brandingName ||
                          "Multiple methods"}
                      </li>
                    ))}
                    {product.brandings.length > 3 && (
                      <li>+ {product.brandings.length - 3} more options</li>
                    )}
                  </ul>
                  {isCustomProduct && (
                    <p className="text-xs text-cyan-600 mt-2 italic">
                      Note: This custom product already includes base branding
                      features.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {!requiresBranding && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-900">
                Quantity
              </label>
              <div className="flex flex-col gap-1">
                <div className="flex items-center border-2 border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    className="p-2 sm:p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 disabled:opacity-50 touch-manipulation"
                    disabled={quantity <= minQuantity}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    onBlur={(e) => handleQuantityBlur(e.target.value)}
                    onKeyDown={(e) => {
                      if (["-", "e", "E", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="px-3 sm:px-6 py-2 sm:py-3 text-center min-w-[60px] sm:min-w-[80px] border-x-2 border-gray-300 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={minQuantity}
                    max={availableStock}
                  />

                  <button
                    onClick={handleIncrement}
                    className="p-2 sm:p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation"
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Error message */}
                {quantityError && (
                  <p className="text-xs text-red-500 text-center animate-pulse">
                    {quantityError}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-500">
              Min: {minQuantity} units
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddToCart}
              disabled={
                stockStatus.status === "out-of-stock" ||
                isLoading ||
                quantity < minQuantity
              }
              className={`flex-1 py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation ${
                stockStatus.status === "out-of-stock" || quantity < minQuantity
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#155874] to-[#155874] hover:from-[#155874] hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <LoaderComponent />
                  <span className="hidden xs:inline">Adding...</span>
                </>
              ) : stockStatus.status === "out-of-stock" ? (
                <>
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Out of Stock</span>
                </>
              ) : quantity < minQuantity ? (
                <>
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">
                    Minimum {minQuantity} units
                  </span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Add to Cart</span>
                  <span className="xs:hidden">Add</span>
                </>
              )}
            </motion.button>

            {/* <button className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:border-gray-400 active:border-gray-500 transition-colors touch-manipulation">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
