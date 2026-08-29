import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  Truck,
  MapPin,
  Tag,
  Gift,
  Palette,
  Info,
} from "lucide-react";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { useRouter } from "next/navigation";
import { CartItemDisplay } from "@/interfaces/cart/cart";

interface OrderSummaryProps {
  cartItems: CartItemDisplay[];
  itemTotal: number;
  discount: number;
  shippingCost: number;
  grandTotal: number;
  savings: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string;
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
  isApplyingCoupon: boolean;
  isCheckingOut: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onCheckout: () => void;
  vatAmount: number;
  onGenerateReceipt?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  itemTotal,
  discount,
  shippingCost,
  grandTotal,
  savings,
  couponCode,
  setCouponCode,
  vatAmount,
  appliedCoupon,
  shippingMethod,
  setShippingMethod,
  isApplyingCoupon,
  isCheckingOut,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  onGenerateReceipt,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const router = useRouter();
  const loggedInUser = decodeAccessToken();

  const brandedItems = cartItems.filter((item) => item.isBranded);
  const regularItems = cartItems.filter((item) => !item.isBranded);
  const totalBrandingPositions = brandedItems.reduce(
    (sum, item) => sum + item.brandingPositions,
    0
  );

  const safeCouponCode = couponCode || "";
  const safeAppliedCoupon = appliedCoupon || "";

  // Check if free shipping applies and minimum order requirements
  const isFreeShippingEligible = itemTotal >= 2000;
  const minimumOrderAmount = 500;
  const isMinimumOrderMet = grandTotal >= minimumOrderAmount;
  const amountNeededForMinimum = minimumOrderAmount - grandTotal;
  const amountNeededForFreeShipping = 2000 - itemTotal;

  // ✅ SAFE NUMBER FORMATTING THROUGHOUT THE COMPONENT
  const safeToFixed = (value: number | undefined, decimals: number = 2) => {
    return (value || 0).toFixed(decimals);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 p-3 xs:p-4 sm:p-5 lg:p-6 sticky top-20 sm:top-24"
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-5 lg:mb-6">
        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Order Summary
        </h2>
      </div>

      {/* Minimum order warning */}
      {!isMinimumOrderMet && (
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg sm:rounded-xl mb-4 sm:mb-5 lg:mb-6 border border-red-200">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="text-red-800 font-medium">
              Minimum order amount is R 500.00
            </span>
            <p className="text-red-700 text-xs">
              Add R {safeToFixed(amountNeededForMinimum)} more to continue
            </p>
          </div>
        </div>
      )}

      {/* Items breakdown */}
      {brandedItems.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl mb-3 sm:mb-4 border border-blue-200">
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="text-blue-800 font-medium">
              {brandedItems.length} custom branded item
              {brandedItems.length > 1 ? "s" : ""}
            </span>
            {totalBrandingPositions > 0 && (
              <p className="text-blue-700 text-xs">
                {totalBrandingPositions} branding position
                {totalBrandingPositions > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Free shipping notification */}
      {isFreeShippingEligible ? (
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl mb-4 sm:mb-5 lg:mb-6 border border-green-200">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-green-800 font-medium">
            Free shipping on this order!
          </span>
        </div>
      ) : (
        isMinimumOrderMet && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl mb-4 sm:mb-5 lg:mb-6 border border-blue-200">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="text-blue-800 font-medium">
                Add R {amountNeededForFreeShipping.toFixed(2)} more for free
                shipping!
              </span>
              <p className="text-blue-700 text-xs">
                Free shipping on orders over R 2000
              </p>
            </div>
          </div>
        )
      )}

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-700">
            Subtotal ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
          </span>
          <span className="font-semibold text-sm sm:text-base text-gray-900">
            R {safeToFixed(itemTotal)}
          </span>
        </div>

        {brandedItems.length > 0 && regularItems.length > 0 && (
          <div className="pl-3 sm:pl-4 space-y-2 text-xs sm:text-sm text-gray-600">
            {regularItems.length > 0 && (
              <div className="flex justify-between">
                <span>Regular items ({regularItems.length})</span>
                <span>
                  R{" "}
                  {regularItems
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            )}
            {brandedItems.length > 0 && (
              <div className="flex justify-between">
                <span>Branded items ({brandedItems.length})</span>
                <span>
                  R{" "}
                  {brandedItems
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {discount > 0 && (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-gray-700">
                  Discount
                </span>
                {safeAppliedCoupon && (
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <Gift className="w-3 h-3" />
                    <span className="hidden xs:inline">
                      {safeAppliedCoupon}
                    </span>
                  </span>
                )}
              </div>
              <span className="font-semibold text-sm sm:text-base text-green-600">
                -R {safeToFixed(discount)}
              </span>
            </div>

            {/* Show subtotal after discount */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Subtotal after discount
              </span>
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                R {safeToFixed(itemTotal - discount)}
              </span>
            </div>
          </>
        )}

        {/* Shipping Options */}
        <div className="space-y-2 sm:space-y-3 pt-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="radio"
              id="shipping"
              name="shipping"
              value="shipping"
              checked={shippingMethod === "shipping"}
              onChange={(e) => setShippingMethod(e.target.value)}
              className="w-3 h-3 sm:w-4 sm:h-4 text-[#155670] focus:ring-[#155670] border-gray-300"
            />
            <label
              htmlFor="shipping"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 flex-1"
            >
              <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-[#155670]" />
              <span className="hidden xs:inline">Standard </span>Shipping
            </label>
            <span className="text-xs sm:text-sm font-semibold text-green-600">
              {isFreeShippingEligible ? "FREE" : `R ${safeToFixed(shippingCost)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
          Have a coupon code?
        </label>
        <div className="flex gap-1 sm:gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={safeCouponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent text-xs sm:text-sm"
              disabled={!!safeAppliedCoupon}
            />
            <Tag className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          {!safeAppliedCoupon ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onApplyCoupon}
              disabled={isApplyingCoupon || !safeCouponCode.trim()}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] disabled:bg-gray-300 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 shadow-md"
            >
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </motion.button>
          ) : (
            <button
              onClick={onRemoveCoupon}
              className="px-2 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-colors duration-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Special handling notice for branded items */}
      {brandedItems.length > 0 && (
        <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-yellow-50 rounded-lg mb-4 sm:mb-5 lg:mb-6 border border-yellow-200">
          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium">
              Custom branded items require additional processing time.
            </p>
            <p className="hidden sm:block">
              We'll contact you within few days to confirm artwork and
              production details.
            </p>
            <p className="sm:hidden">
              We'll contact you within 24h for artwork confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="border-t border-gray-200 pt-4 sm:pt-5 lg:pt-6 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex justify-between items-center mb-1 sm:mb-2">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            Total
          </span>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            R {safeToFixed(grandTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
          <span className="text-gray-600">VAT (15%)</span>
          <span className="text-gray-900">R {safeToFixed(vatAmount)}</span>
        </div>
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-gray-600">(Inclusive of all taxes)</span>
          {savings > 0 && (
            <span className="text-green-600 font-medium">
              You saved R {safeToFixed(savings)}
            </span>
          )}
        </div>
        {/* View Receipt Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onGenerateReceipt}
            className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#104758] hover:bg-[#155670] text-white rounded-lg font-semibold text-sm shadow transition-colors duration-200"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
            View Receipt
          </button>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!loggedInUser?.id) {
            router.push("/client/auth/login");
            return;
          }
          // Only call onCheckout to open the address modal
          if (onCheckout) {
            onCheckout();
          }
        }}
        disabled={isCheckingOut || cartItems.length === 0 || !isMinimumOrderMet}
        className="w-full bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCheckingOut ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
            <span className="text-sm sm:text-base">Processing...</span>
          </div>
        ) : !isMinimumOrderMet ? (
          <div className="flex items-center justify-center gap-2">
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base lg:text-lg">
              Minimum Order R 500.00
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base lg:text-lg">
              Proceed to Checkout
            </span>
          </div>
        )}
      </motion.button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 mt-3 sm:mt-4 space-y-1">
        <p>🔒 Secure SSL encrypted checkout</p>
        <p>💳 We accept all major credit cards</p>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
