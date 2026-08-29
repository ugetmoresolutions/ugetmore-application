"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import CartSkeleton from "../skeleton/CartSkeleton";
import { useCart } from "@/hooks/cart";
import { useReceipt } from "@/hooks/useReceipt";
import ErrorState from "./ErrorState";
import EmptyCart from "./EmptyCart";
import CartHeader from "./CartHeader";
import CartItemsList from "./CartItemsList";
import OrderSummary from "./OrderSummary";
import Receipt from "./Receipt";
import AddressModal from "./AddressModal";
import AddressSuccessModal from "./AddressSuccessModal";
import PaymentProcessingModal from "./PaymentProcessingModal";
import { PAYMENT_API } from "@/endpoints/rest-api/payfast";
import { AUTH_API } from "@/endpoints/rest-api/auth";

const CartPage = () => {
  const router = useRouter();
  const loggedInUser = decodeAccessToken();
  const userId = loggedInUser?.id;

  const {
    items: cartItems,
    couponCode,
    appliedCoupon,
    shippingMethod,
    isApplyingCoupon,
    isCheckingOut,
    isLoading,
    error,
    loadCartData,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    checkout,
    updateCartState,
    calculateItemTotal,
    getCompleteBreakdown
  } = useCart(userId);

  const { showReceipt, receiptData, generateReceipt, closeReceipt } =
    useReceipt();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [addressModalMode, setAddressModalMode] = useState<"add" | "confirm">(
    "add"
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);

  // ✅ ADD THIS: Force refresh when cart items change
  useEffect(() => {
    if (!isLoading && cartItems.length > 0) {
      console.log('🔄 Cart items changed, ensuring calculations are fresh');
      // This will trigger a re-render with updated calculations
    }
  }, [cartItems, isLoading]);

  // ✅ USE THE COMPLETE BREAKDOWN INSTEAD OF MANUAL CALCULATIONS
  const breakdown = getCompleteBreakdown();
  
  // ✅ SAFE DESTRUCTURING WITH DEFAULTS
  const itemTotal = breakdown?.subtotal || 0;
  const actualDiscount = breakdown?.discountAmount || 0;
  const shippingCost = breakdown?.shippingAmount || 0;
  const vatAmount = breakdown?.vatAmount || 0;
  const grandTotal = breakdown?.finalTotal || 0;
  const savings = actualDiscount;

  // ✅ FIX: Use actualDiscount instead of cartState.discount
  const discount = actualDiscount;

  useEffect(() => {
    const loadUserAddress = async () => {
      if (userId) {
        try {
          const response = await AUTH_API.GET_USER_ADDRESSES(userId);

          if (!response.error && response.data) {
            // Handle both string and array responses from backend
            if (Array.isArray(response.data)) {
              setUserAddress(response.data[0] || "");
            } else {
              setUserAddress(response.data);
            }
          } else {
            setUserAddress("");
          }
        } catch (error) {
          console.error("Failed to load user address:", error);
          setUserAddress("");
        }
      }
    };

    loadUserAddress();
  }, [userId]);

  const handleCheckout = () => {
    if (userAddress && userAddress.trim().length > 0) {
      setAddressModalMode("confirm");
      setShowAddressModal(true);
    } else {
      setAddressModalMode("add");
      setShowAddressModal(true);
    }
  };

  const handleSaveAddress = async (address: string) => {
    try {
      // Update the address in the user profile using UPDATE endpoint
      if (userId) {
        const response = await AUTH_API.UPDATE_USER_ADDRESSES(userId, address);
        if (response.error) {
          console.error("Failed to update user address:", response.error);
          return;
        }
      }

      setUserAddress(address);
      setShowAddressModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleProceedFromSuccess = () => {
    setShowSuccessModal(false);
    setAddressModalMode("confirm");
    setShowAddressModal(true);
  };

  const handleConfirmAddress = async (address: string) => {
    try {
      // Update the address in the user profile using UPDATE endpoint
      if (userId) {
        const response = await AUTH_API.UPDATE_USER_ADDRESSES(userId, address);
        if (response.error) {
          console.error("Failed to update user address:", response.error);
          // Continue anyway - don't block payment
        }
      }

      setUserAddress(address);
      setShowAddressModal(false);

      // Store in localStorage for checkout
      localStorage.setItem("checkoutAddress", address);

      // Process checkout and payment - proceed even if address save failed
      await processCheckoutAndPayment();
    } catch (error) {
      console.error("Error confirming address:", error);
      // Continue with payment despite address errors
      setShowAddressModal(false);
      await processCheckoutAndPayment();
    }
  };

  const processCheckoutAndPayment = async () => {
  try {
    setShowPaymentProcessing(true);

    // ✅ USE THE UPDATED checkout FUNCTION WITH COUPON
    if (checkout) {
      await checkout(appliedCoupon); // ✅ PASS THE COUPON CODE
    }
  } catch (error) {
    console.error("Error during checkout process:", error);
    setShowPaymentProcessing(false);
  }
};


  const handleGenerateReceipt = () => {
    const customerInfo = {
      name: loggedInUser?.fullName || "Guest User",
      email: loggedInUser?.email || "guest@example.com",
      phone: loggedInUser?.phone,
      businessName: loggedInUser?.businessName,
      role: loggedInUser?.role,
      address: userAddress,
      vatNumber: loggedInUser?.vatNumber,
    };

    generateReceipt(
      cartItems,
      itemTotal,
      actualDiscount, // USE ACTUAL DISCOUNT
      shippingMethod === "pickup" ? 0 : shippingCost,
      vatAmount,
      grandTotal,
      appliedCoupon,
      shippingMethod,
      customerInfo
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  if (isLoading) {
    return <CartSkeleton />;
  }


  if (!cartItems || cartItems.length === 0) {
    return (
      <EmptyCart
        onContinueShopping={() => router.push("/client/shop/branding")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <CartHeader itemCount={cartItems.length} onGoBack={() => router.back()} />

      <motion.div
        className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6  py-4 sm:py-6 md:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
            <CartItemsList
              items={cartItems}
              rawItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>

          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              itemTotal={itemTotal}
              discount={discount}
              shippingCost={shippingCost}
              vatAmount={vatAmount}
              grandTotal={grandTotal}
              savings={savings}
              couponCode={couponCode}
              setCouponCode={(code) => updateCartState({ couponCode: code })}
              appliedCoupon={appliedCoupon}
              shippingMethod={shippingMethod}
              setShippingMethod={(method) =>
                updateCartState({
                  shippingMethod: method as "shipping" | "pickup",
                })
              }
              isApplyingCoupon={isApplyingCoupon}
              isCheckingOut={isCheckingOut || isProcessingPayment}
              onGenerateReceipt={handleGenerateReceipt}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </motion.div>

      {showReceipt && receiptData && (
        <Receipt
          orderId={receiptData.orderId}
          orderDate={receiptData.orderDate}
          cartItems={receiptData.cartItems}
          itemTotal={receiptData.itemTotal}
          discount={receiptData.discount}
          shippingCost={receiptData.shippingCost}
          vatAmount={receiptData.vatAmount}
          grandTotal={receiptData.grandTotal}
          appliedCoupon={receiptData.appliedCoupon}
          shippingMethod={receiptData.shippingMethod}
          customerInfo={receiptData.customerInfo}
          companyInfo={receiptData.companyInfo}
          onClose={closeReceipt}
        />
      )}

      <AddressModal
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleSaveAddress}
        onConfirm={handleConfirmAddress}
        existingAddress={userAddress}
        mode={addressModalMode}
        userId={userId}
      />

      <AddressSuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onProceed={handleProceedFromSuccess}
      />

      <PaymentProcessingModal show={showPaymentProcessing} />
    </div>
  );
};

export default CartPage;
