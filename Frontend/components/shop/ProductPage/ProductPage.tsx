// components/ProductDetailPage.tsx - COMPLETED
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { IProduct } from "@/interfaces/product/product";
import { ICartItem, IAddCartItem } from "@/interfaces/cart/cart";
import { CART_API } from "@/endpoints/rest-api/cart";
import {
  updateRecentlyViewed,
  clearOldProductData,
} from "@/utils/productStorage";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { useSmartAlert } from "@/components/common/SmartAlert";
import ProductBreadcrumb from "./ProductBreadcrumb";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import ProductInfo from "./ProductInfo";
import ProductImageGallery from "./ProductImageGallery";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";
import ProductBranding from "../branding/ProductBranding";
import { useCart } from "@/hooks/cart";

interface ProductDetailPageProps {
  serverProduct?: IProduct;
  serverRelatedProducts?: IProduct[];
  productId: string;
}

const ProductDetailPage = ({
  serverProduct,
  serverRelatedProducts = [],
  productId,
}: ProductDetailPageProps) => {
  // Use productId from props or params
  const params = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>(
    serverProduct || null
  );
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>(
    serverRelatedProducts
  );
  const [loading, setLoading] = useState(!serverProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [requireBranding, setRequireBranding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loggedInUser = decodeAccessToken();
  const { success, error: alertError, AlertComponent } = useSmartAlert();
  const router = useRouter();
  const userId = loggedInUser?.id;
  const { triggerCartUpdate } = useCart();

  // Then use it in your logic
  const actualProductId = productId || params.productId;

  // Client-side fallback if no server data
  useEffect(() => {
    if (!serverProduct && actualProductId) {
      const loadProductClientSide = async () => {
        try {
          setLoading(true);
          // You can keep your existing client-side loading logic here as fallback
          // This ensures backward compatibility
          setError("Product not available");
        } catch (err) {
          console.error("Error loading product client-side:", err);
          setError("Failed to load product data");
        } finally {
          setLoading(false);
        }
      };

      loadProductClientSide();
    }
  }, [serverProduct, actualProductId]);

  // Update recently viewed when product loads
  useEffect(() => {
    if (currentProduct) {
      updateRecentlyViewed(currentProduct);
    }
  }, [currentProduct]);

  // Check wishlist status
  useEffect(() => {
    if (currentProduct && !loading) {
      try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsWishlisted(
          wishlist.some(
            (item: any) =>
              item.fullCode === actualProductId ||
              item.simpleCode === actualProductId ||
              item.id === actualProductId
          )
        );
      } catch (storageError) {
        console.warn("Failed to check wishlist status:", storageError);
      }
    }
  }, [currentProduct, actualProductId, loading]);

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(prev + 1, currentProduct?.maximum || 999));
    } else if (
      type === "decrement" &&
      quantity > (currentProduct?.minimum || 1)
    ) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleColorChange = (colorCode: string) => {
    setSelectedColor(colorCode);
    if (currentProduct?.colourImages) {
      const colorImage = currentProduct.colourImages.find(
        (ci) => ci.code === colorCode
      );
      if (colorImage && colorImage.images && colorImage.images.length > 0) {
        setCurrentImageIndex(0);
      }
    }
  };

  const handleAddToCart = async () => {
  if (!currentProduct) return;

  // ADD VALIDATION: Check if a color is selected
  if (!selectedColor && currentProduct.colourImages && currentProduct.colourImages.length > 0) {
    alertError(
      "Color Selection Required",
      "Please select a color before adding to cart.",
      [
        {
          label: "Select Color",
          action: () => {}, // This will focus on color selection
          variant: "primary",
        },
      ]
    );
    return;
  }

  // Use price from backend response (already includes markup)
  const actualPrice = currentProduct.price || 0;

  // Get selected variant and color data
  const selectedVariantData = currentProduct.variants?.[selectedVariant];
  const selectedColorData = currentProduct.colourImages?.find(
    color => color.code === selectedColor
  );

  // Get image URL for the selected color
  const colorImageUrl = selectedColorData?.images?.find(img => img.isDefault)?.urls?.[0]?.url;

  const cartItem: ICartItem = {
    id: crypto.randomUUID(),
    product: {
      ...currentProduct,
      productName: currentProduct.productName,
      categories: currentProduct.categories,
      brand: currentProduct.brand,
      images: currentProduct.images,
      colourImages: currentProduct.colourImages,
      variants: currentProduct.variants,
      fullCode: currentProduct.fullCode,
      simpleCode: currentProduct.simpleCode,
    },
    quantity: quantity,
    price: actualPrice,
    addedAt: new Date().toISOString(),
    // ADD THIS: Selected variant information including color
    selectedVariant: {
      colorCode: selectedColor,
      colorName: selectedColorData?.name || selectedVariantData?.codeColourName || "Unknown Color",
      sizeCode: selectedVariantData?.codeSize,
      sizeName: selectedVariantData?.codeSizeName,
      variantIndex: selectedVariant,
      imageUrl: colorImageUrl
    }
  };

  console.log("CART DATA:", cartItem);

  if (userId) {
    // User is logged in - use API
    try {
      const addCartData: IAddCartItem = {
        userId: userId,
        item: cartItem,
      };
      setIsLoading(true);
      const response = await CART_API.ADD_CART_ITEM(addCartData);

      if (response?.data) {
        success(
          "Added to Cart!",
          `${currentProduct.productName} (${selectedColorData?.name || "Selected Color"}) - ZAR ${cartItem.price.toFixed(
            2
          )}) has been added to your cart.`,
          [
            {
              label: "View Cart",
              action: () => router.push("/client/cart"),
              variant: "primary",
            },
            {
              label: "Continue Shopping",
              action: () => {},
              variant: "secondary",
            },
          ]
        );
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (e) {
      console.error("Error adding to cart:", e);
      alertError(
        "Failed to Add Item",
        "Unable to add item to cart. Please check your connection and try again.",
        [
          {
            label: "Retry",
            action: () => handleAddToCart(),
            variant: "primary",
          },
        ]
      );
    } finally {
      setIsLoading(false);
      triggerCartUpdate()
    }
  } else {
    // User not logged in - use localStorage
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      // Update the existing item check to include color and variant
      const existingItemIndex = existingCart.findIndex(
        (item: ICartItem) =>
          item.product?.fullCode === currentProduct.fullCode &&
          item.selectedVariant?.colorCode === selectedColor &&
          item.selectedVariant?.variantIndex === selectedVariant
      );

      if (existingItemIndex > -1) {
        // Update quantity if same product, same color, same variant
        existingCart[existingItemIndex].quantity += quantity;
        success(
          "Quantity Updated!",
          `${currentProduct.productName} (${selectedColorData?.name || "Selected Color"}) quantity increased in your cart.`,
          [
            {
              label: "View Cart",
              action: () => router.push("/client/cart"),
              variant: "primary",
            },
          ]
        );
      } else {
        // Add new item if different color/variant
        existingCart.push(cartItem);
        success(
          "Added to Cart!",
          `${currentProduct.productName} (${selectedColorData?.name || "Selected Color"}) - ZAR ${cartItem.price.toFixed(
            2
          )}) has been added to your cart.`,
          [
            {
              label: "View Cart",
              action: () => router.push("/client/cart"),
              variant: "primary",
            },
            {
              label: "Continue Shopping",
              action: () => {},
              variant: "secondary",
            },
          ]
        );
      }
      
      localStorage.setItem("cart", JSON.stringify(existingCart));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }
      triggerCartUpdate()
    } catch (e) {
      console.error("Error saving to localStorage:", e);
      alertError(
        "Storage Error",
        "Unable to save item to cart. Please try again.",
        [
          {
            label: "Retry",
            action: () => handleAddToCart(),
            variant: "primary",
          },
        ]
      );
    }
  }
};

  const handleWishlist = () => {
    if (!currentProduct) return;

    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

      const isAlreadyWishlisted = wishlist.some(
        (item: any) =>
          item.fullCode === currentProduct.fullCode ||
          item.simpleCode === currentProduct.simpleCode
      );

      let updatedWishlist;

      if (isAlreadyWishlisted) {
        updatedWishlist = wishlist.filter(
          (item: any) =>
            item.fullCode !== currentProduct.fullCode &&
            item.simpleCode !== currentProduct.simpleCode
        );
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setIsWishlisted(false);

        success(
          "Removed from Wishlist",
          `${currentProduct.productName} has been removed from your wishlist.`,
          [
            {
              label: "View Wishlist",
              action: () => router.push("/client/wishlist"),
              variant: "primary",
            },
          ]
        );
      } else {
        updatedWishlist = [
          ...wishlist,
          {
            ...currentProduct,
            addedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setIsWishlisted(true);

        success(
          "Added to Wishlist",
          `${currentProduct.productName} has been added to your wishlist.`,
          [
            {
              label: "View Wishlist",
              action: () => router.push("/client/wishlist"),
              variant: "primary",
            },
            {
              label: "Continue Shopping",
              action: () => {},
              variant: "secondary",
            },
          ]
        );
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error managing wishlist:", error);
      alertError(
        "Wishlist Error",
        "Something went wrong while updating your wishlist.",
        [
          {
            label: "Retry",
            action: () => handleWishlist(),
            variant: "primary",
          },
        ]
      );
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!currentProduct) {
    return <ErrorState error="Product not found" />;
  }

  const showBrandingSection =
    requireBranding &&
    currentProduct.brandings &&
    currentProduct.brandings.length > 0;

  return (
    <>
      <motion.div
        className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 bg-white dark:bg-white"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <AlertComponent />

        <motion.div variants={itemVariants} className="mb-3 sm:mb-4 md:mb-6">
          <ProductBreadcrumb product={currentProduct} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 mb-8 sm:mb-10 md:mb-12">
          <motion.div variants={itemVariants} className="order-1 lg:order-1">
            <ProductImageGallery
              product={currentProduct}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="order-2 lg:order-2">
            <ProductInfo
              product={currentProduct}
              quantity={quantity}
              selectedVariant={selectedVariant}
              isWishlisted={isWishlisted}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              onVariantChange={setSelectedVariant}
              isLoading={isLoading}
              onBrandingRequiredChange={setRequireBranding}
              requiresBranding={requireBranding}
              // ADD THESE TWO PROPS:
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          </motion.div>
        </div>

        {showBrandingSection && (
          <motion.div
            variants={itemVariants}
            className="mb-8 sm:mb-10 md:mb-12"
          >
            <ProductBranding
              product={currentProduct}
              selectedVariant={selectedVariant}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-8 sm:mb-10 md:mb-12">
          <ProductTabs
            product={currentProduct}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedVariant={selectedVariant}
          />
        </motion.div>

        {relatedProducts.length > 0 && (
          <motion.div variants={itemVariants}>
            <RelatedProducts
              products={relatedProducts}
              allProducts={[]}
              productPrices={[]}
              userId={userId}
            />
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ProductDetailPage;
