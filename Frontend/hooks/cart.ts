// hooks/useCart.ts - COMPLETE IMPLEMENTATION
import { useState, useEffect, useCallback } from "react";
import { CART_API } from "@/endpoints/rest-api/cart";
import { PAYMENT_API } from "@/endpoints/rest-api/payfast";
import { CartItemDisplay, CartState, ICartItem } from "@/interfaces/cart/cart";
import { COUPON_API } from "@/endpoints/rest-api/coupon";
import {
  IProductCouponValidation,
  IApplyProductCouponRequest,
} from "@/interfaces/coupon/coupon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCart = (userId?: number) => {
  const router = useRouter();

  const [cartState, setCartState] = useState<CartState>({
    items: [],
    couponCode: "",
    appliedCoupon: "",
    shippingMethod: "shipping",
    isApplyingCoupon: false,
    isCheckingOut: false,
    isLoading: true,
    discount: 0,
    error: "",
    applicableProducts: [],
    couponType: null,
    couponData: null,
    // ✅ ADD THESE MISSING PROPERTIES
    applicableItems: [],
    categoryBreakdown: [],
    backendCalculation: null,
  });

  const getProductImage = useCallback((product: any): string | null => {
    if (!product.images || product.images.length === 0) return null;

    const defaultImage =
      product.images.find((img: any) => img.isDefault) || product.images[0];
    if (!defaultImage?.urls || defaultImage.urls.length === 0) return null;

    const sortedUrls = [...defaultImage.urls].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    return sortedUrls[0]?.url || null;
  }, []);

  const transformCartItems = useCallback(
    (items: ICartItem[]): CartItemDisplay[] => {
      return items.map((item: ICartItem) => {
        // Check if item is branded - FIXED LOGIC
        const isBranded = !!item.brandingConfigs;

        const selectedVariant = item.selectedVariant;

        if (item.isBulk) {
          return {
            id: item.id,
            name: item.collectionName || "Stationery Pack",
            category: "Stationery Pack",
            brand: "School Stationery",
            price: item.bulkTotalPrice || item.price || 0,
            originalPrice: item.bulkTotalPrice || item.price || 0,
            quantity: item.quantity || 1,
            sku: item.collectionId || item.id,
            deliveryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
            image: item.product?.images?.[0]?.urls?.[0]?.url || null,
            isBranded: false, // Bulk items are not branded
            isBulk: true,
            schoolInfo: item.schoolInfo,
            bulkProducts: item.bulkProducts,
            brandingPositions: 0,
            totalBrandingCost: 0,
            minimum: 1,
            productId: undefined,
            supplier: "parrot",
          };
        }

        // Handle branded items - FIXED: Check only for brandingConfigs
        if (isBranded) {
          const brandingSetup = item.brandingConfigs;
          const firstColor = brandingSetup?.selectedColors?.[0];

          let brandingImage = null;
          if (firstColor?.images?.[0]?.urls?.[0]?.url) {
            brandingImage = firstColor.images[0].urls[0].url;
          } else if (item.product) {
            // Fallback to product image if available
            brandingImage = getProductImage(item.product);
          }

          // ✅ FIX: Get the ACTUAL unit price from branding config
          const actualUnitPrice =
            brandingSetup?.selectedColors?.[0]?.unitPrice || item.price;

          return {
            id: item.id,
            name: firstColor?.colorName
              ? `Custom Branded ${item.product?.productName || "Product"} - ${
                  firstColor.colorName
                }`
              : `Custom Branded ${item.product?.productName || "Product"}`,
            category: item.product?.categories?.[0]?.name || "Branded Products",
            brand: item.product?.brand?.name || "Custom",
            price: item.price || 0,
            originalPrice: item.price || 0,
            quantity: item.quantity || 1,
            sku: item.product?.fullCode || item.product?.simpleCode || item.id,
            brandingConfigs: brandingSetup,
            deliveryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
            image: brandingImage,
            isBranded: true, // ✅ CORRECTLY SET
            brandingPositions: brandingSetup?.selectedPositions?.length || 0,
            totalBrandingCost: brandingSetup?.totalCost?.grandTotal || 0,
            minimum: item.product?.minimum || 1,
            productId: item.product?.fullCode
              ? item.product.fullCode.toString()
              : undefined,
            supplier: item.product?.supplier || "amrod",
          };
        }

        // Handle regular products
        if (item.product) {
          const productImage = getProductImage(item.product);

          return {
            id: item.id,
            name: item.product.productName || "Unknown Product",
            category: item.product.categories?.[0]?.name || "General",
            brand: item.product.brand?.name || "Unknown Brand",
            price: item.price || 0,
            originalPrice: item.price || 0,
            quantity: item.quantity || 1,
            sku: item.product.fullCode || item.product.simpleCode || item.id,
            deliveryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
            image: productImage,
            isBranded: false, // Regular products without branding
            brandingPositions: 0,
            totalBrandingCost: 0,
            minimum: item.product.minimum || 1,
            productId: item.product.fullCode
              ? item.product.fullCode.toString()
              : undefined,
            supplier: item.product.supplier || "unknown",
            // ✅ CRITICAL: PASS THE SELECTED VARIANT DATA
          selectedVariant: selectedVariant,
          };
        }

        // Fallback for unknown items
        return {
          id: item.id,
          name: "Unknown Item",
          category: "Unknown",
          brand: "Unknown",
          price: item.price || 0,
          originalPrice: item.price || 0,
          quantity: item.quantity || 1,
          sku: item.id,
          deliveryDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          image: null,
          isBranded: false,
          brandingPositions: 0,
          totalBrandingCost: 0,
          minimum: 1,
          productId: undefined,
          supplier: "unknown",
        };
      });
    },
    [getProductImage]
  );

  // UPDATE your loadCartData function to only load valid coupons:
  const loadCartData = useCallback(async () => {
    setCartState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      if (userId) {
        const response = await CART_API.GET_USER_CART(userId);
        console.log("Cart data items:", response.data.items.length);
        if (response?.data) {
          const transformedItems = transformCartItems(response.data.items);

          // ✅ Restore applied coupon from localStorage ONLY if it's valid
          const userCoupons = JSON.parse(
            localStorage.getItem(`user_${userId}_coupons`) || "{}"
          );
          const appliedCouponCode = Object.keys(userCoupons)[0];

          // ✅ ONLY LOAD COUPON IF IT HAS VALID DISCOUNT DATA
          if (
            appliedCouponCode &&
            userCoupons[appliedCouponCode]?.discountAmount > 0
          ) {
            const couponData = userCoupons[appliedCouponCode];

            setCartState((prev) => ({
              ...prev,
              items: transformedItems,
              couponCode: appliedCouponCode, // ✅ CRITICAL: SET couponCode TOO
              appliedCoupon: appliedCouponCode,
              discount: couponData.discountAmount || 0,
              backendCalculation: couponData.backendCalculation || null,
              applicableProducts: couponData.applicableProducts || [],
              couponType: couponData.couponType || null,
              couponData: couponData.couponData || null,
            }));

            console.log(
              "✅ Loaded valid coupon from localStorage:",
              appliedCouponCode
            );
          } else {
            // ✅ CLEAR INVALID COUPONS FROM LOCALSTORAGE
            if (appliedCouponCode) {
              delete userCoupons[appliedCouponCode];
              localStorage.setItem(
                `user_${userId}_coupons`,
                JSON.stringify(userCoupons)
              );
              console.log(
                "🧹 Removed invalid coupon from localStorage:",
                appliedCouponCode
              );
            }

            setCartState((prev) => ({
              ...prev,
              items: transformedItems,
              couponCode: "", // ✅ CLEAR BOTH FIELDS
              appliedCoupon: "",
              discount: 0,
              backendCalculation: null,
              applicableProducts: [],
              couponType: null,
              couponData: null,
            }));
          }
        }
      } else {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          const cartData: ICartItem[] = JSON.parse(localCart);
          const transformedItems = transformCartItems(cartData);
          setCartState((prev) => ({
            ...prev,
            items: transformedItems,
            couponCode: "", // ✅ ENSURE CLEAR FOR GUEST USERS
            applicableProducts: [],
            couponType: null,
            couponData: null,
          }));
        }
      }

      triggerCartUpdate();
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartState((prev) => ({
        ...prev,
        error: "Failed to load cart. Please try again.",
      }));
    } finally {
      setCartState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId, transformCartItems]);

  // Helper function to save coupon to localStorage
  const saveCouponToLocalStorage = useCallback(
    (couponCode: string, couponData: any) => {
      if (userId) {
        const userCoupons = JSON.parse(
          localStorage.getItem(`user_${userId}_coupons`) || "{}"
        );
        userCoupons[couponCode] = couponData;
        localStorage.setItem(
          `user_${userId}_coupons`,
          JSON.stringify(userCoupons)
        );
      }
    },
    [userId]
  );

  
  const applyCoupon = useCallback(async () => {
  if (!cartState.couponCode.trim()) {
    toast.error("Please enter a coupon code");
    return;
  }

  if (!userId) {
    toast.error("Please login to redeem coupons");
    return;
  }

  if (cartState.appliedCoupon) {
    toast.error("A coupon is already applied");
    return;
  }

  setCartState((prev) => ({ ...prev, isApplyingCoupon: true, error: "" }));

  try {
    // Get school ID if available from bulk items
    const schoolId =
      cartState.items.find((item) => item.isBulk && item.schoolInfo)
        ?.schoolInfo?.schoolId || null;

    console.log("🔄 Applying coupon via backend:", {
      couponCode: cartState.couponCode.trim(),
      userId,
      schoolId,
    });

    // Call the REAL backend endpoint
    const response = await CART_API.APPLY_COUPON_TO_CART({
      userId,
      couponCode: cartState.couponCode.trim(),
      schoolId,
    });

    console.log("✅ Backend coupon response:", response);

    // ✅ FIXED: Check for successful response with discount
    if (response.data && response.data.discountAmount !== undefined && response.data.discountAmount >= 0) {
      const cartTotal = response.data;

      // ✅ USE ACTUAL COUPON DATA FROM BACKEND
      const actualCouponType = cartTotal.couponData?.couponType || "general";
      const actualDiscountType = cartTotal.couponData?.discountType || "percentage";
      const actualDiscountValue = cartTotal.couponData?.discountValue || 0;

      // ✅ ONLY UPDATE STATE IF COUPON IS VALID AND HAS DISCOUNT
      setCartState((prev) => ({
        ...prev,
        couponCode: cartState.couponCode, // ✅ KEEP THE CODE VISIBLE
        appliedCoupon: cartState.couponCode,
        discount: cartTotal.discountAmount,
        couponType: actualCouponType,
        couponData: {
          ...cartTotal.couponData,
          code: cartState.couponCode.trim(),
          discountType: actualDiscountType,
          discountValue: actualDiscountValue,
        },
        backendCalculation: cartTotal,
        // ✅ ADD THESE TO ENSURE PROPER STATE
        applicableProducts: cartTotal.applicableProducts || [],
        applicableItems: cartTotal.applicableItems || [],
      }));

      // ✅ ONLY SAVE TO LOCALSTORAGE IF COUPON IS VALID
      saveCouponToLocalStorage(cartState.couponCode.trim(), {
        appliedAt: new Date().toISOString(),
        discountAmount: cartTotal.discountAmount,
        couponCode: cartState.couponCode.trim(),
        couponType: actualCouponType,
        couponData: cartTotal.couponData,
        backendCalculation: cartTotal,
        applicableProducts: cartTotal.applicableProducts || [],
        applicableItems: cartTotal.applicableItems || [],
      });

      // Show success message with ACTUAL savings
      toast.success(
        `Coupon applied successfully! You saved R${cartTotal.discountAmount.toFixed(2)}`
      );
    } else {
      // ✅ IMPROVED ERROR HANDLING: Use the exact backend message
      const errorMessage = response.message || response.data?.message || "Invalid coupon code";

      console.log("❌ Coupon application failed:", {
        backendMessage: response.message,
        responseData: response.data
      });

      // Show the exact backend message
      toast.error(errorMessage);

      // ✅ DON'T CLEAR THE COUPON CODE - let user see what they entered
      setCartState((prev) => ({
        ...prev,
        // couponCode: "", // ❌ REMOVE THIS LINE - keep the code visible
        error: errorMessage,
      }));

      return;
    }
  } catch (error: any) {
    console.error("❌ Coupon application error:", error);

    // ✅ ENHANCED ERROR HANDLING
    let userFriendlyMessage = "Failed to apply coupon";

    if (error.response) {
      // Backend returned an error response
      const backendError = error.response.data;
      
      console.log("🔍 Backend error details:", {
        status: error.response.status,
        data: backendError,
        message: backendError?.message
      });

      if (backendError?.message) {
        // Use the exact backend message (this should catch "Minimum cart amount of R500 required for this coupon")
        userFriendlyMessage = backendError.message;
      } else if (error.response.status === 404) {
        userFriendlyMessage = "Coupon not found";
      } else if (error.response.status === 400) {
        userFriendlyMessage = backendError?.message || "Invalid coupon code";
      } else {
        userFriendlyMessage = "Coupon validation failed";
      }
    } else if (error.request) {
      userFriendlyMessage = "Network error. Please check your connection.";
    }

    // ✅ DON'T CLEAR COUPON CODE ON ERROR
    setCartState((prev) => ({
      ...prev,
      // couponCode: "", // ❌ REMOVE THIS LINE
      error: userFriendlyMessage,
    }));

    toast.error(userFriendlyMessage);
  } finally {
    setCartState((prev) => ({ ...prev, isApplyingCoupon: false }));
  }
}, [
  cartState.couponCode,
  userId,
  cartState.appliedCoupon,
  cartState.items,
  saveCouponToLocalStorage,
]);
  // REPLACE your checkAndRemoveInvalidCoupon function with this:
  const checkAndRemoveInvalidCoupon = useCallback(
    (currentItems: CartItemDisplay[], isQuantityUpdate: boolean = false) => {
      if (!cartState.appliedCoupon || !cartState.couponType) return;

      let shouldRemoveCoupon = false;
      let removalReason = "";

      if (cartState.couponType === "product") {
        // ✅ FIX: For product coupons, check if the PRODUCTS still exist (not quantities)
        const remainingApplicableProducts = currentItems.filter((item) =>
          cartState.applicableProducts.some(
            (applicableProduct) =>
              item.productId === applicableProduct.productId
          )
        );

        if (remainingApplicableProducts.length === 0) {
          shouldRemoveCoupon = true;
          removalReason =
            "The products eligible for this coupon have been removed from your cart";
        } else if (!isQuantityUpdate) {
          // ✅ Only check minimum amount for non-quantity updates (like actual removals)
          const totalApplicableAmount = remainingApplicableProducts.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          if (
            cartState.couponData?.minimumCartAmount &&
            totalApplicableAmount < cartState.couponData.minimumCartAmount
          ) {
            shouldRemoveCoupon = true;
            removalReason = `Cart no longer meets minimum amount requirement of R${cartState.couponData.minimumCartAmount}`;
          }
        }
        // ✅ FOR QUANTITY UPDATES: Don't check minimum amount - let backend handle it via recalculateAppliedCoupon
      } else if (cartState.couponType === "category") {
        // For category coupons: Remove if no applicable category items remain
        const remainingApplicableItems = currentItems.filter((item) =>
          cartState.applicableItems?.some(
            (applicableItem) => item.id === applicableItem.id
          )
        );

        if (remainingApplicableItems.length === 0) {
          shouldRemoveCoupon = true;
          removalReason =
            "The items eligible for this coupon have been removed from your cart";
        }
      } else if (cartState.couponType === "school") {
        // For school coupons: Remove if no bulk items remain
        const hasBulkItems = currentItems.some((item) => item.isBulk);
        if (!hasBulkItems) {
          shouldRemoveCoupon = true;
          removalReason = "No stationery bulk items in cart";
        }
      } else if (
        cartState.couponType === "general" ||
        cartState.couponType === "user"
      ) {
        // ✅ FIX: Change to:
        const cartTotal = currentItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        if (
          cartState.couponData?.minimumCartAmount &&
          cartTotal < cartState.couponData.minimumCartAmount
        ) {
          shouldRemoveCoupon = true;
          removalReason = `Cart total is below minimum requirement of R${cartState.couponData.minimumCartAmount}`;
        } else if (currentItems.length === 0) {
          shouldRemoveCoupon = true;
          removalReason = "Your cart is empty";
        }
      }

      if (shouldRemoveCoupon) {
        // Remove coupon from localStorage
        if (userId && cartState.appliedCoupon) {
          const userCoupons = JSON.parse(
            localStorage.getItem(`user_${userId}_coupons`) || "{}"
          );
          delete userCoupons[cartState.appliedCoupon];
          localStorage.setItem(
            `user_${userId}_coupons`,
            JSON.stringify(userCoupons)
          );
        }

        // Clear coupon state
        setCartState((prev) => ({
          ...prev,
          appliedCoupon: "",
          discount: 0,
          applicableProducts: [],
          applicableItems: [],
          couponType: null,
          couponData: null,
          categoryBreakdown: [],
          backendCalculation: null,
        }));

        toast.warning(`Coupon removed: ${removalReason}`);
      }
    },
    [
      cartState.appliedCoupon,
      cartState.couponType,
      cartState.applicableProducts,
      cartState.applicableItems,
      cartState.couponData,
      userId,
    ]
  );

  // Enhanced removeCoupon to clear all coupon data
  const removeCoupon = useCallback(() => {
    if (userId && cartState.appliedCoupon) {
      const userCoupons = JSON.parse(
        localStorage.getItem(`user_${userId}_coupons`) || "{}"
      );
      delete userCoupons[cartState.appliedCoupon];
      localStorage.setItem(
        `user_${userId}_coupons`,
        JSON.stringify(userCoupons)
      );
    }

    setCartState((prev) => ({
      ...prev,
      couponCode: "", // ✅ CLEAR THE INPUT FIELD TOO
      appliedCoupon: "",
      discount: 0,
      applicableProducts: [],
      applicableItems: [], // Clear category items
      couponType: null,
      couponData: null,
      categoryBreakdown: [], // Clear category breakdown
      backendCalculation: null, // ✅ CLEAR BACKEND CALCULATION
    }));
    // ✅ ADD THIS LINE
    triggerCartUpdate();
    toast.success("Coupon removed");
  }, [userId, cartState.appliedCoupon]);

  // FIX the calculateItemTotal function:
  const calculateItemTotal = useCallback(() => {
    // If we have backend calculation, use it as source of truth
    if (cartState.backendCalculation) {
      return cartState.backendCalculation.subtotal;
    }

    // For frontend-only calculation (when no backend data available)
    // Use ACTUAL coupon data if available
    if (cartState.couponData && cartState.couponType) {
      const baseTotal = cartState.items.reduce((sum, item) => {
        // ✅ FIX: Use the same calculation for both regular and branded
        return sum + item.price * item.quantity;
      }, 0);

      // Apply discount based on ACTUAL coupon data
      if (cartState.couponData.discountType === "percentage") {
        const discountAmount =
          (baseTotal * cartState.couponData.discountValue) / 100;

        // Apply maximum discount if set
        const finalDiscount = cartState.couponData.maximumDiscount
          ? Math.min(discountAmount, cartState.couponData.maximumDiscount)
          : discountAmount;

        return baseTotal - finalDiscount;
      } else {
        // Fixed amount discount
        return Math.max(0, baseTotal - cartState.couponData.discountValue);
      }
    }

    // No coupon applied
    // ✅ FIX: Use the same calculation for both regular and branded
    return cartState.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [
    cartState.backendCalculation,
    cartState.items,
    cartState.couponData,
    cartState.couponType,
  ]);

  // REPLACE your getCompleteBreakdown function with this:
  const getCompleteBreakdown = useCallback(() => {
    // ✅ SAFE FALLBACK FOR EMPTY CART
    if (!cartState.items || cartState.items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        shippingAmount: 0,
        vatAmount: 0,
        finalTotal: 0,
        appliedCoupons: [],
      };
    }

    // ✅ ONLY USE BACKEND CALCULATION IF COUPON IS VALID AND APPLIED
    if (
      cartState.backendCalculation &&
      cartState.appliedCoupon &&
      cartState.discount > 0
    ) {
      console.log(
        "📊 Using valid backend calculation with coupon:",
        cartState.appliedCoupon
      );
      return cartState.backendCalculation;
    }

    // ✅ FIX: Use the SAME calculation for both regular and branded items
    const subtotal = cartState.items.reduce((sum, item) => {
      // ✅ CORRECT: For BOTH regular AND branded items, use unitPrice × quantity
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);

    // ✅ ONLY APPLY DISCOUNT IF COUPON IS VALID AND APPLIED
    let discountAmount = 0;
    if (
      cartState.appliedCoupon &&
      cartState.couponData &&
      cartState.discount > 0
    ) {
      if (cartState.couponData.discountType === "percentage") {
        discountAmount =
          (subtotal * (cartState.couponData.discountValue || 0)) / 100;

        if (
          cartState.couponData.maximumDiscount &&
          discountAmount > cartState.couponData.maximumDiscount
        ) {
          discountAmount = cartState.couponData.maximumDiscount;
        }
      } else {
        discountAmount = cartState.couponData.discountValue || 0;
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
      }
    }

    const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
    const shippingCost = amountAfterDiscount >= 2000 ? 0 : 180;
    const vatAmount = amountAfterDiscount * 0.15;
    const finalTotal = amountAfterDiscount + shippingCost + vatAmount;

    const breakdown = {
      subtotal,
      discountAmount,
      shippingAmount: shippingCost,
      vatAmount,
      finalTotal,
      appliedCoupons:
        cartState.appliedCoupon && discountAmount > 0
          ? [
              {
                code: cartState.appliedCoupon,
                couponType: cartState.couponType || "general",
                discountAmount: discountAmount,
                couponData: cartState.couponData,
              },
            ]
          : [],
    };

    console.log("📊 Frontend breakdown (no coupon/invalid coupon):", breakdown);
    return breakdown;
  }, [
    cartState.backendCalculation,
    cartState.items,
    cartState.appliedCoupon,
    cartState.couponType,
    cartState.couponData,
    cartState.discount,
  ]);
  // Add this helper function to dispatch cart update events
  const triggerCartUpdate = useCallback(() => {
    // Dispatch custom event for NavigationHeader to listen to
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cartUpdated"));

      // Also update localStorage for guest users to trigger storage event
      if (!userId) {
        const event = new StorageEvent("storage", {
          key: "cart",
          newValue: localStorage.getItem("cart"),
          oldValue: localStorage.getItem("cart"),
          url: window.location.href,
          storageArea: localStorage,
        });
        window.dispatchEvent(event);
      }
    }
  }, [userId]);

  // Add this helper function for better API error handling
  const handleApiError = (error: any, operation: string) => {
    console.error(`API Error during ${operation}:`, error);

    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || `Server error during ${operation}`;
    } else if (error.request) {
      // Request made but no response received
      return `Network error: Unable to reach server during ${operation}`;
    } else {
      // Something else happened
      return `Error during ${operation}: ${error.message}`;
    }
  };

  const removeItem = useCallback(
    async (id: string) => {
      const itemToRemove = cartState.items.find((item) => item.id === id);
      if (!itemToRemove) {
        console.warn(`Item with id ${id} not found in cart`);
        return;
      }

      const previousItems = [...cartState.items];

      // ✅ IMMEDIATE OPTIMISTIC UPDATE
      setCartState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));

      try {
        if (userId) {
          // ✅ USE ENHANCED ERROR HANDLING
          try {
            await CART_API.REMOVE_CART_ITEM({ userId, itemId: id });
            console.log(`Successfully removed item ${id} from server`);
          } catch (apiError) {
            const errorMessage = handleApiError(apiError, "item removal");
            throw new Error(errorMessage);
          }
        } else {
          // ✅ LOCAL STORAGE: More robust handling
          try {
            const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
            const initialLength = localCart.length;
            const updatedCart = localCart.filter(
              (cartItem: ICartItem) => cartItem.id !== id
            );

            if (updatedCart.length === initialLength) {
              console.warn(`Item ${id} not found in localStorage`);
            }

            localStorage.setItem("cart", JSON.stringify(updatedCart));
            console.log(`Successfully removed item ${id} from localStorage`);
          } catch (storageError) {
            throw new Error("Failed to update local storage");
          }
        }

        // ✅ CHECK COUPON VALIDITY AFTER SUCCESSFUL REMOVAL
        const updatedItems = previousItems.filter((item) => item.id !== id);
        checkAndRemoveInvalidCoupon(updatedItems, false);

        // ✅ TRIGGER CART UPDATE
        triggerCartUpdate();
      } catch (error) {
        console.error("Error removing item:", error);

        // ✅ ROLLBACK ON ERROR
        setCartState((prev) => ({
          ...prev,
          items: previousItems,
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove item. Please try again.",
        }));

        toast.error("Failed to remove item. Please try again.");
      }
    },
    [userId, cartState.items, checkAndRemoveInvalidCoupon, triggerCartUpdate]
  );

  // ENHANCE your recalculateAppliedCoupon function:
  const recalculateAppliedCoupon = useCallback(
    async (updatedItems?: CartItemDisplay[]) => {
      if (!cartState.appliedCoupon || !userId) return;

      try {
        console.log(
          "🔄 Recalculating applied coupon after quantity change...",
          cartState.appliedCoupon
        );

        const itemsToUse = updatedItems || cartState.items;

        // Get school ID if available from bulk items
        const schoolId =
          itemsToUse.find((item) => item.isBulk && item.schoolInfo)?.schoolInfo
            ?.schoolId || null;

        // Call backend to recalculate coupon with current items
        const response = await CART_API.APPLY_COUPON_TO_CART({
          userId,
          couponCode: cartState.appliedCoupon,
          schoolId,
        });

        if (response.data && response.data.discountAmount > 0) {
          const cartTotal = response.data;

          // ✅ UPDATE STATE WITH FRESH BACKEND CALCULATION
          setCartState((prev) => ({
            ...prev,
            discount: cartTotal.discountAmount,
            backendCalculation: cartTotal,
            couponData: cartTotal.couponData || prev.couponData,
            // ✅ UPDATE APPLICABLE PRODUCTS TOO
            applicableProducts:
              cartTotal.applicableProducts || prev.applicableProducts,
            applicableItems: cartTotal.applicableItems || prev.applicableItems,
          }));

          // ✅ UPDATE LOCALSTORAGE WITH FRESH DATA
          if (userId) {
            const userCoupons = JSON.parse(
              localStorage.getItem(`user_${userId}_coupons`) || "{}"
            );
            if (userCoupons[cartState.appliedCoupon]) {
              userCoupons[cartState.appliedCoupon] = {
                ...userCoupons[cartState.appliedCoupon],
                discountAmount: cartTotal.discountAmount,
                backendCalculation: cartTotal,
                applicableProducts:
                  cartTotal.applicableProducts ||
                  userCoupons[cartState.appliedCoupon].applicableProducts,
                applicableItems:
                  cartTotal.applicableItems ||
                  userCoupons[cartState.appliedCoupon].applicableItems,
                recalculatedAt: new Date().toISOString(),
              };
              localStorage.setItem(
                `user_${userId}_coupons`,
                JSON.stringify(userCoupons)
              );
            }
          }

          console.log(
            "✅ Coupon recalculated successfully after quantity change:",
            cartTotal.discountAmount
          );
        } else {
          // Coupon is no longer valid with current cart
          throw new Error(
            response.message ||
              "Coupon is no longer valid with current cart items"
          );
        }
      } catch (error: any) {
        console.error(
          "❌ Failed to recalculate coupon after quantity change:",
          error
        );

        // Get specific error message
        let removalMessage =
          "Coupon is no longer valid with current cart items";

        if (error.response?.data?.message) {
          removalMessage = error.response.data.message;
        }

        // Remove the coupon with appropriate message
        toast.warning(`Coupon removed: ${removalMessage}`);
        removeCoupon();
      }
    },
    [
      cartState.appliedCoupon,
      cartState.items,
      userId,
      removeCoupon,
      cartState.applicableProducts,
    ]
  ); // ✅ ADD cartState.applicableProducts DEPENDENCY

  const updateQuantity = useCallback(
    async (id: string, newQuantity: number) => {
      const item = cartState.items.find((item) => item.id === id);
      const minimumQuantity = item?.minimum || 1;

      if (newQuantity < minimumQuantity) return;

      const previousItems = [...cartState.items];
      const hadAppliedCoupon = !!cartState.appliedCoupon;

      // If quantity becomes 0, remove the item instead
      if (newQuantity === 0) {
        await removeItem(id);
        return;
      }

      // ✅ FIX: Remove the custom branded item calculation
      // Update items locally - SAME FOR BOTH REGULAR AND BRANDED ITEMS
      const updatedItems = cartState.items.map((item) => {
        if (item.id === id) {
          // ✅ SIMPLIFY: Just update quantity, keep price as unit price
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCartState((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      try {
        if (userId) {
          await CART_API.UPDATE_ITEM_QUANTITY({
            userId,
            itemId: id,
            quantity: newQuantity,
          });

          if (hadAppliedCoupon && cartState.appliedCoupon) {
            console.log("🔄 Recalculating coupon after quantity update...");
            await recalculateAppliedCoupon(updatedItems);
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const updatedCart = localCart.map((cartItem: ICartItem) =>
            cartItem.id === id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          );
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        }

        checkAndRemoveInvalidCoupon(updatedItems, true);
        triggerCartUpdate();
      } catch (error) {
        console.error("Error updating quantity:", error);
        setCartState((prev) => ({
          ...prev,
          items: previousItems,
          error: "Failed to update quantity. Please try again.",
        }));
      }
    },
    [
      userId,
      cartState.items,
      cartState.appliedCoupon,
      removeItem,
      checkAndRemoveInvalidCoupon,
      triggerCartUpdate,
      recalculateAppliedCoupon,
    ]
  );
  // Monitor cart changes and remove coupons when cart becomes empty
  useEffect(() => {
    if (cartState.items.length === 0 && cartState.appliedCoupon) {
      // Cart is empty but coupon is still applied - remove it
      if (userId && cartState.appliedCoupon) {
        const userCoupons = JSON.parse(
          localStorage.getItem(`user_${userId}_coupons`) || "{}"
        );
        delete userCoupons[cartState.appliedCoupon];
        localStorage.setItem(
          `user_${userId}_coupons`,
          JSON.stringify(userCoupons)
        );
      }

      setCartState((prev) => ({
        ...prev,
        appliedCoupon: "",
        discount: 0,
        applicableProducts: [],
        applicableItems: [],
        couponType: null,
        couponData: null,
        categoryBreakdown: [],
      }));

      toast.warning("Coupon removed: Your cart is empty");
    }
  }, [cartState.items.length, cartState.appliedCoupon, userId]);

  // ADD this useEffect to your useCart hook to handle page refreshes:
  useEffect(() => {
    // ✅ SYNC COUPON CODE WITH APPLIED COUPON ON PAGE LOAD/REFRESH
    if (cartState.appliedCoupon && !cartState.couponCode) {
      console.log(
        "🔄 Syncing coupon code from applied coupon:",
        cartState.appliedCoupon
      );
      setCartState((prev) => ({
        ...prev,
        couponCode: cartState.appliedCoupon,
      }));
    }
  }, [cartState.appliedCoupon, cartState.couponCode]);

  const checkout = useCallback(
    async (couponCode?: string) => {
      setCartState((prev) => ({ ...prev, isCheckingOut: true }));

      try {
        if (!userId) {
          router.push("/client/auth/login");
          return;
        }

        const response = await PAYMENT_API.GENERATE_PAYMENT(userId, couponCode);
        router.push(response.data.paymentUrl);
        localStorage.removeItem("userOrders");
      } catch (error) {
        console.error("Payment generation error:", error);
        setCartState((prev) => ({
          ...prev,
          error: "Checkout failed. Please try again.",
        }));
      } finally {
        setCartState((prev) => ({ ...prev, isCheckingOut: false }));
      }
    },
    [userId, router]
  );

  const updateCartState = useCallback((updates: Partial<CartState>) => {
    setCartState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  return {
    ...cartState,
    getCompleteBreakdown,
    loadCartData,
    discount: cartState.discount || 0,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    checkout,
    updateCartState,
    calculateItemTotal,
    triggerCartUpdate,
  };
};
