"use client";
import brandingBanner from "@/public/yougetmore assets/pictures/branding.png";
import { useEffect, useState, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import ProductGrid from "@/components/shop/ProductGrid";
import { Sidebar } from "@/components/shop/Sidebar";
import Pagination from "@/components/common/Pagination";
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { ICategory } from "@/interfaces/product/category";
import { IStockItem } from "@/interfaces/product/stock";
import { v4 as uuidv4 } from "uuid";
import { AGGREGATED_PRODUCTS_API} from "@/endpoints/rest-api/aggregated-product";
import {
  ProductGridSkeleton,
  SidebarSkeleton,
  Skeleton,
} from "@/components/skeleton/ProductSkeleton";
import { getProductPrice, clearOldProductData } from "@/utils/productStorage";
import { IAddCartItem, ICartItem } from "@/interfaces/cart/cart";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { CART_API } from "@/endpoints/rest-api/cart";
import { useSmartAlert } from "../common/SmartAlert";
import { indexedDBStorage } from "@/utils/indexedDbStorage";
import { SHOP_CONFIGS } from "./shop-config";
import { IBrandingOption } from "@/interfaces/branding/branding";
import { BRANDING_PRODUCT_API } from "@/endpoints/rest-api/branding-product";
import Image from "next/image";
import { IAggregatedProduct } from "@/interfaces/aggregated-product/aggregated-product";
import { useCart } from '@/hooks/cart';

const PRODUCTS_PER_PAGE = 12;

interface SidebarCategory {
  name: string;
  subCategories: string[] | null;
}

const BrandingShopPage: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
 
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Separate state for actual search term
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productPrices, setProductPrices] = useState<IProductPrice[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [cacheStatus, setCacheStatus] = useState<string>("");
  const [stockItems, setStockItems] = useState<IStockItem[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [backendFilteredProducts, setBackendFilteredProducts] = useState<IAggregatedProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const loggedInUser = decodeAccessToken()!;
  const userId = loggedInUser?.id;
  const { success, error, AlertComponent } = useSmartAlert();

  // ✅ THEN call useCart with the userId
  const { triggerCartUpdate } = useCart(userId);

  const shopType = useMemo(() => {
    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment === "stationery") return "stationery";

    return Object.keys(SHOP_CONFIGS).includes(lastSegment)
      ? lastSegment
      : "shop";
  }, [pathname]);

  const config = SHOP_CONFIGS[shopType];

  // Helper function to add 25% to prices
  const add25Percent = (price: number): number => {
    return price * 1.25;
  };

  // Helper to identify if a product is from custom branding API
  const isCustomBrandingProduct = (product: IProduct): boolean => {
    return !!(product.price && product.price > 0);
  };

  // Helper to get stock for custom branding products
  const getCustomBrandingProductStock = (
    product: IProduct
  ): { stockQuantity: number; isInStock: boolean } => {
    const stockQuantity =
      (product as any).stockQuantity ||
      (product as any).stock ||
      (product as any).quantity ||
      (product as any).inventory ||
      0;

    return {
      stockQuantity,
      isInStock: stockQuantity > 0,
    };
  };

  // Unified stock getter that works for all product types
  const getUnifiedProductStock = (
    product: IAggregatedProduct
  ): { stockQuantity: number; isInStock: boolean } => {
    if (product.stockInfo) {
      const stockQuantity = product.stockInfo.stock || 0;
      return {
        stockQuantity,
        isInStock: stockQuantity > 0 && product.isAvailable
      };
    }

    if (isCustomBrandingProduct(product as IProduct)) {
      return getCustomBrandingProductStock(product as IProduct);
    }

    return { stockQuantity: 999, isInStock: true };
  };

  // Helper function to get product price
  const getProductPriceWithBranding = (
    product: IAggregatedProduct
  ): number => {
    if (product.price && product.price > 0) {
      return product.price;
    }

    return getProductPrice(product as IProduct, productPrices);
  };

  // SIMPLE: Fetch filtered products from backend
  const fetchFilteredProducts = async (search: string = searchTerm) => {
    try {
      setSearchLoading(true);
      
      const filters = {
        search: search || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        subCategory: selectedSubCategory || undefined,
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        sortBy: sortBy
      };

      console.log("Fetching filtered products with filters:", filters);

      const response = await AGGREGATED_PRODUCTS_API.GET_AMROD_PRODUCTS_WITH_FILTERS(filters);
      
      if (response.data) {
        setBackendFilteredProducts(response.data.products || []);
        setTotalProducts(response.data.totalProducts || 0);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setBackendFilteredProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await AGGREGATED_PRODUCTS_API.GET_AMROD_CATEGORIES();
      if (response.data) {
        const transformedCategories = response.data.categoriesWithSubs.map(cat => ({
          name: cat.name,
          subCategories: cat.subCategories
        }));
        setCategories(transformedCategories as any);
      }
    } catch (error) {
      console.error("Error fetching categories from backend:", error);
    }
  };

  // NEW: Handle search input change (no API calls)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // NEW: Handle search submission (when user presses Enter or clicks search)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set the actual search term and reset to page 1
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  // NEW: Clear search and reset products
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Initialize IndexedDB and clear cache on component mount
  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDBStorage.initDB();
        console.log("IndexedDB initialized successfully");
      } catch (error) {
        console.error("Failed to initialize IndexedDB or clear cache:", error);
      }
    };
    initDB();
  }, []);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchFilteredProducts(); // This will use the empty searchTerm initially
      await fetchCategories();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // Fetch data when filters change (including search term)
  useEffect(() => {
    if (!loading) { // Don't run on initial load
      fetchFilteredProducts();
    }
  }, [selectedCategory, selectedSubCategory, currentPage, sortBy, searchTerm]); // Added searchTerm dependency

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSearchQuery("");
    setSearchTerm(""); // Clear search when selecting category
    setCurrentPage(1);
  };

  // Handle subcategory selection
  const handleSubCategorySelect = (subCategory: string | null) => {
    setSelectedSubCategory(subCategory);
    setSearchQuery("");
    setSearchTerm(""); // Clear search when selecting subcategory
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Use backend filtered products
  const displayProducts = backendFilteredProducts;

  const paginatedProducts = useMemo(() => {
    return displayProducts;
  }, [displayProducts]);

  const sidebarCategories = useMemo((): SidebarCategory[] => {
    if (!categories.length) {
      return [{ name: "All", subCategories: null }];
    }

    return categories.map(cat => ({
      name: cat.name,
      subCategories: (cat as any).subCategories || null
    }));
  }, [categories]);

  const transformedProducts = paginatedProducts.map((product) => {
    const defaultImage =
      product.images.find((img :any) => img.isDefault) || product.images[0];
    const imageUrl =
      defaultImage?.urls.find((url:any) => url.width >= 300)?.url ||
      defaultImage?.urls[0]?.url ||
      "/placeholder-product.png";

    const actualPrice = getProductPriceWithBranding(product);

    const stockInfo = getUnifiedProductStock(product);

    return {
      id: product.fullCode,
      imageSrc: imageUrl,
      productName: product.productName,
      price: actualPrice,
      stockQuantity: stockInfo.stockQuantity,
      isInStock: stockInfo.isInStock,
      isCustomBranding: isCustomBrandingProduct(product as IProduct),
    };
  });

  // Keep the existing add to cart functionality
  const handleAddToCart = async (productId: string) => {
    const product = displayProducts.find((p) => p.fullCode === productId);

    if (product) {
      const productPrice = getProductPriceWithBranding(product);

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: product as IProduct,
        quantity: 1,
        price: productPrice,
        addedAt: new Date().toISOString(),
      };

      if (userId) {
        try {
          const addCartData: IAddCartItem = {
            userId: userId,
            item: cartItem,
          };

          const response = await CART_API.ADD_CART_ITEM(addCartData);

          if (response?.data) {
            success(
              "Added to Cart!",
              `${product.productName} (ZAR ${productPrice.toFixed(2)}) has been added to your cart.`,
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
            triggerCartUpdate()
          } else {
            throw new Error("Failed to add item to cart");
          }
        } catch (e) {
          console.error("Error adding to cart:", e);
          error(
            "Failed to Add Item",
            "Unable to add item to cart. Please check your connection and try again.",
            [
              {
                label: "Retry",
                action: () => handleAddToCart(productId),
                variant: "primary",
              },
            ]
          );
        }
      } else {
        try {
          const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const existingItemIndex = existingCart.findIndex(
            (item: any) => item.product.fullCode === product.fullCode
          );

          if (existingItemIndex > -1) {
            existingCart[existingItemIndex].quantity += 1;
            success(
              "Quantity Updated!",
              `${product.productName} quantity increased in your cart.`,
              [
                {
                  label: "View Cart",
                  action: () => router.push("/client/cart"),
                  variant: "primary",
                },
              ]
            );
          } else {
            existingCart.push(cartItem);
            success(
              "Added to Cart!",
              `${product.productName} (ZAR ${productPrice.toFixed(2)}) has been added to your cart.`,
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
          
        triggerCartUpdate();
        } catch (e) {
          console.error("Error saving to localStorage:", e);
          error(
            "Storage Error",
            "Unable to save item to cart. Please try again.",
            [
              {
                label: "Retry",
                action: () => handleAddToCart(productId),
                variant: "primary",
              },
            ]
          );
        }
      }
    } else {
      error(
        "Product Not Found",
        "The selected product could not be found. Please refresh the page and try again."
      );
    }
  };

  // Combined loading state for better UX
  const showLoading = loading || searchLoading;

  return (
    <>
      <div className="mx-auto px-4 py-6 sm:py-8 bg-white w-full max-w-7xl">
        {/* Mobile Filter Button */}
        <div className="xl:hidden mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${config.title.toLowerCase()} products...`}
                className="w-full p-3 pl-10 text-sm text-black placeholder:text-gray-400 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={showLoading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </form>

            {/* Filter Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#155874] text-white px-4 py-3 rounded-lg hover:bg-[#155874]/90 transition-colors whitespace-nowrap shadow-md"
              disabled={showLoading}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Categories</span>
              {(selectedCategory !== "All" || selectedSubCategory) && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {selectedSubCategory ? "2" : "1"}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden xl:block w-1/4">
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearchSubmit} className="mb-6 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${config.title.toLowerCase()} products...`}
                className="w-full p-3.5 pl-12 text-base text-black placeholder:text-gray-400 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={showLoading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </form>

            {/* Desktop Sidebar Content */}
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <Sidebar
                categories={sidebarCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                selectedSubCategory={selectedSubCategory}
                onSubCategorySelect={handleSubCategorySelect}
              />
            )}
          </div>

          {/* Mobile Sidebar Drawer */}
          {isMobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />

              {/* Professional Mobile Drawer */}
              <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                  {/* Professional Header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#155874] to-[#1a1a6b] text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5" />
                      <div>
                        <h2 className="text-lg font-semibold">Categories</h2>
                        <p className="text-xs text-white/70">
                          {categories.length} categories available
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content with Professional Styling */}
                  <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4">
                      {loading ? (
                        <SidebarSkeleton />
                      ) : (
                        <Sidebar
                          categories={sidebarCategories}
                          selectedCategory={selectedCategory}
                          onCategorySelect={(category) => {
                            handleCategorySelect(category);
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }}
                          selectedSubCategory={selectedSubCategory}
                          onSubCategorySelect={(subCategory) => {
                            handleSubCategorySelect(subCategory);
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }}
                        />
                      )}
                    </div>

                    {/* Professional Footer */}
                    <div className="p-4 bg-white border-t border-gray-200 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                          {selectedCategory !== "All" ? (
                            <span>
                              Viewing:{" "}
                              <span className="font-medium text-[#155874]">
                                {selectedCategory}
                              </span>
                              {selectedSubCategory && (
                                <span>
                                  {" "}
                                  →{" "}
                                  <span className="font-medium">
                                    {selectedSubCategory}
                                  </span>
                                </span>
                              )}
                            </span>
                          ) : (
                            "Viewing all categories"
                          )}
                        </p>
                        <button
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className="w-full bg-[#155874] text-white py-2.5 rounded-lg font-medium hover:bg-[#155874]/90 transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <main className="w-full xl:w-3/4">
            {showLoading ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Skeleton className="h-4 w-12 sm:w-16" />
                    <Skeleton className="h-8 sm:h-9 w-full sm:w-32" />
                  </div>
                </div>

                <ProductGridSkeleton />

                <div className="mt-8 flex justify-center">
                  <Skeleton className="h-10 w-full sm:w-80 max-w-sm" />
                </div>
              </>
            ) : (
              <>
                {/* Sort and Filter Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                    Showing {paginatedProducts.length} of{" "}
                    {totalProducts} products
                    {searchTerm ? (
                      <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                        for "{searchTerm}"
                      </span>
                    ) : selectedCategory !== "All" ? (
                      <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                        in "{selectedCategory}"
                        {selectedSubCategory && ` > "${selectedSubCategory}"`}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center w-full sm:w-auto order-1 sm:order-2">
                    <label
                      htmlFor="sort"
                      className="text-xs sm:text-sm font-medium text-gray-700 mr-2 whitespace-nowrap"
                    >
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 sm:flex-none rounded-lg border border-gray-300 py-2 sm:py-1.5 pl-3 pr-8 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-0"
                      disabled={showLoading}
                    >
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="brand">Brand</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Products or Empty State */}
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <div className="text-gray-500 text-base sm:text-lg mb-2">
                      No {config.title.toLowerCase()} products found
                    </div>
                    <div className="text-gray-400 text-sm sm:text-base">
                      {searchTerm
                        ? `No products found for "${searchTerm}"`
                        : selectedCategory !== "All"
                        ? `No products found in "${selectedCategory}"${
                            selectedSubCategory
                              ? ` > "${selectedSubCategory}"`
                              : ""
                          }`
                        : `Try adjusting your search or filters`}
                    </div>
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <ProductGrid
                      products={transformedProducts}
                      onAddToCart={handleAddToCart}
                      allProducts={displayProducts as IProduct[]}
                      productPrices={productPrices}
                      stockItems={stockItems}
                      sourceCategory={selectedCategory}
                      sourcePage={shopType}
                    />
                    {totalPages > 1 && (
                      <div className="mt-6 sm:mt-8">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <AlertComponent />
          </main>
        </div>
      </div>

      <div className="relative w-full h-48 sm:h-64 lg:h-80 xl:h-[500px] overflow-hidden">
        <Image
          src={brandingBanner}
          alt="Branding Collection"
          fill
          className="object-cover"
          quality={100}
          priority
          sizes="100vw"
        />
      </div>
    </>
  );
};

export default BrandingShopPage;