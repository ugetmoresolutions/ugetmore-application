"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  AlertCircle,
  Filter,
  X,
  ChevronRight,
} from "lucide-react";
import { useSmartAlert } from "@/components/common/SmartAlert";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { v4 as uuidv4 } from "uuid";
import { CART_API } from "@/endpoints/rest-api/cart";
import { IAddCartItem, ICartItem } from "@/interfaces/cart/cart";
import { useCart } from "@/hooks/cart";

import ProductCard from "../ProductCard";
import { Sidebar } from "../Sidebar";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";

// Import the APIs
import { SUPPLIER_PRODUCTS_API, ProductFilters } from "@/endpoints/rest-api/supplierProduct";
import { AGGREGATED_PRODUCTS_API, UniversalSearchFilters } from "@/endpoints/rest-api/aggregated-product";
import { ProductGridSkeleton } from "../electronics/components/ProductSkeleton";
import { ProductCouponBanner } from "../ProductCouponBanner";

// Sidebar Component
interface Category {
  name: string;
  subCategories: string[] | null;
}

// Skeleton Components
const SidebarSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
    ))}
  </div>
);

// Main UniversalShopPage Component - OPTIMIZED
export default function UniversalShopPage() {
  const [products, setProducts] = useState<IBrandingProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name-asc");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const productsPerPage = 12;
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   // Add a state to toggle between old and new search
  const [useUniversalSearch, setUseUniversalSearch] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const loggedInUser = decodeAccessToken()!;
  const userId = loggedInUser?.id;
  const {
    success: showSuccess,
    error: showError,
    AlertComponent,
  } = useSmartAlert();

  const { triggerCartUpdate } = useCart(userId);

  // Get current filters from URL - SINGLE SOURCE OF TRUTH
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSubCategory = searchParams.get('subCategory') || null;
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam) : 1;

  // Display name mapping
  const getCategoryDisplayName = (categoryName: string): string => {
    const displayNameMap: { [key: string]: string } = {
      Consumables: "Printing & Toners",
    };
    return displayNameMap[categoryName] || categoryName;
  };

  // Helper function to convert frontend sort to API sort
  const getSortByForAPI = (frontendSort: string): string => {
    switch (frontendSort) {
      case "name-asc":
        return "productName:ASC";
      case "name-desc":
        return "productName:DESC";
      case "price-asc":
        return "price:ASC";
      case "price-desc":
        return "price:DESC";
      default:
        return "createdAt:DESC";
    }
  };

  // Update URL parameters
  const updateURL = useCallback((updates: {
    search?: string;
    category?: string;
    subCategory?: string | null;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    
    // Always include current params and apply updates
    if (updates.search !== undefined ? updates.search : searchTerm) {
      params.set('search', updates.search !== undefined ? updates.search : searchTerm);
    }
    
    if (updates.category !== undefined ? updates.category !== 'All' : selectedCategory !== 'All') {
      params.set('category', updates.category !== undefined ? updates.category : selectedCategory);
    }
    
    if (updates.subCategory !== undefined ? updates.subCategory : selectedSubCategory) {
      params.set('subCategory', updates.subCategory !== undefined ? updates.subCategory! : selectedSubCategory!);
    }
    
    if (updates.page !== undefined ? updates.page > 1 : initialPage > 1) {
      params.set('page', (updates.page !== undefined ? updates.page : initialPage).toString());
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, selectedCategory, selectedSubCategory, initialPage]);

  // UPDATED: Fetch filtered products from backend with cancellation
  const fetchFilteredProducts = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setSearchLoading(true);
      setErrorState(null);

      if (useUniversalSearch) {
        // NEW: Use universal search endpoint
        const filters: UniversalSearchFilters = {
          search: searchTerm || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          subCategory: selectedSubCategory || undefined,
          page: initialPage,
          limit: productsPerPage,
          sortBy: sortBy, // Use the same format as your frontend
        };

        console.log("🚀 Using UNIVERSAL search with filters:", filters);

        const response = await AGGREGATED_PRODUCTS_API.GET_UNIVERSAL_SEARCH(filters);

        console.log("🚀 UNIVERSAL SEARCH RESPONSE:", {
          data: response.data,
          productsCount: response.data?.products?.length,
          pagination: {
            totalProducts: response.data?.totalProducts,
            totalPages: response.data?.totalPages,
            currentPage: response.data?.currentPage
          }
        });

        if (response.data) {
          setProducts(response.data.products || []);
          setTotalProducts(response.data.totalProducts || 0);
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(response.data.currentPage || 1);
          
          console.log("✅ Universal search completed:", {
            products: response.data.products.length,
            total: response.data.totalProducts,
            supplierBreakdown: response.data.supplierBreakdown
          });
        } else {
          throw new Error("No data in universal search response");
        }
      } else {
        // EXISTING: Use old supplier products endpoint (keep as fallback)
        const filters: ProductFilters = {
          search: searchTerm || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          subCategory: selectedSubCategory || undefined,
          page: initialPage,
          limit: productsPerPage,
          sortBy: getSortByForAPI(sortBy),
        };

        console.log("🔧 Using LEGACY supplier products with filters:", filters);

        const response = await SUPPLIER_PRODUCTS_API.GET_ALL_PRODUCTS_WITH_FILTERS(filters);

        console.log("🔧 LEGACY API RESPONSE:", {
          data: response.data,
          productsCount: response.data?.products?.length,
          pagination: response.data?.pagination
        });

        if (response.data) {
          setProducts(response.data.products || []);
          
          if (response.data.pagination) {
            setTotalProducts(response.data.pagination.totalItems || 0);
            setTotalPages(response.data.pagination.totalPages || 0);
          } else {
            setTotalProducts(response.data.products?.length || 0);
            setTotalPages(1);
          }
          
          console.log("✅ Legacy filtered products fetched:", response.data.products.length);
        } else {
          throw new Error("No data in response");
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🔄 Request cancelled');
        return;
      }
      console.error("❌ Error in fetchFilteredProducts:", err);
      
      // Fallback to legacy search if universal search fails
      if (useUniversalSearch) {
        console.log("🔄 Universal search failed, falling back to legacy search");
        setUseUniversalSearch(false);
        // Retry with legacy search
        await fetchFilteredProducts();
        return;
      }
      
      setErrorState(`Failed to fetch products: ${err.message}`);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSubCategory, initialPage, sortBy, productsPerPage, useUniversalSearch]);

  // Fetch merged categories from the aggregated products API
  const fetchMergedCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      const cachedCategories = localStorage.getItem('supplier_categories');
      const cachedTimestamp = localStorage.getItem('supplier_categories_timestamp');
      
      if (cachedCategories && cachedTimestamp) {
        const now = Date.now();
        const cacheAge = now - parseInt(cachedTimestamp);
        
        if (cacheAge < 1000 * 60 * 60 * 24) {
          console.log("📦 Using cached categories from localStorage");
          const parsedCategories = JSON.parse(cachedCategories);
          setCategories(parsedCategories);
          setCategoriesLoading(false);
          return;
        }
      }

      console.log("🔧 Fetching fresh merged categories from API...");
      const response = await AGGREGATED_PRODUCTS_API.GET_MERGED_CATEGORIES();

      if (response?.data) {
        const transformedCategories = response.data.categoriesWithSubs.map(
          (cat: any) => ({
            name: cat.name,
            subCategories: cat.subCategories,
          })
        );

        localStorage.setItem('supplier_categories', JSON.stringify(transformedCategories));
        localStorage.setItem('supplier_categories_timestamp', Date.now().toString());
        
        setCategories(transformedCategories);
        console.log("✅ Categories set and cached successfully:", transformedCategories.length);
      } else {
        console.warn("⚠️ No categories data in response");
        if (cachedCategories) {
          const parsedCategories = JSON.parse(cachedCategories);
          setCategories(parsedCategories);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      const cachedCategories = localStorage.getItem('supplier_categories');
      if (cachedCategories) {
        const parsedCategories = JSON.parse(cachedCategories);
        setCategories(parsedCategories);
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchMergedCategories();
    };
    loadInitialData();
  }, []);

  // Fetch data when filters change - with debouncing for search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search requests, immediate for category changes
    const isSearchChange = searchParams.get('search') !== searchTerm;
    const delay = isSearchChange ? 300 : 0;

    searchTimeoutRef.current = setTimeout(() => {
      console.log("🔄 Fetching products with:", {
        searchTerm,
        selectedCategory,
        selectedSubCategory,
        initialPage,
        sortBy
      });

      fetchFilteredProducts();
    }, delay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, selectedSubCategory, initialPage, sortBy, fetchFilteredProducts]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    // Reset to page 1 and clear search when category changes
    updateURL({
      category,
      subCategory: null,
      search: '',
      page: 1
    });
  };

  // Handle subcategory selection
  const handleSubCategorySelect = (subCategory: string | null) => {
    updateURL({
      subCategory,
      search: '',
      page: 1
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURL({ page });
    setCurrentPage(page);
  };

  // Clear all filters
  const handleClearSearch = () => {
    updateURL({
      search: '',
      category: 'All',
      subCategory: null,
      page: 1
    });
  };

  // Clear specific filter
  const handleClearFilter = (type: 'search' | 'category' | 'subCategory') => {
    switch (type) {
      case 'search':
        updateURL({ search: '', page: 1 });
        break;
      case 'category':
        updateURL({ category: 'All', subCategory: null, page: 1 });
        break;
      case 'subCategory':
        updateURL({ subCategory: null, page: 1 });
        break;
    }
  };

  // UPDATED: handleAddToCart function
  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.fullCode === productId);

    if (product) {
      const productPrice = product.price || 0;

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: product as any,
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
            showSuccess(
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
            triggerCartUpdate();
          } else {
            throw new Error("Failed to add item to cart");
          }
        } catch (e) {
          console.error("Error adding to cart:", e);
          showError(
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
            showSuccess(
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
            showSuccess(
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
          showError(
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
      showError(
        "Product Not Found",
        "The selected product could not be found. Please refresh the page and try again."
      );
    }
  };

  // Get product image
  const getProductImage = (product: IBrandingProduct) => {
    const defaultImage =
      product.images?.find((img: any) => img.isDefault) || product.images?.[0];
    const imageUrl =
      defaultImage?.urls?.find((url: any) => url.width >= 300)?.url ||
      defaultImage?.urls?.[0]?.url ||
      "/placeholder-image.jpg";

    return imageUrl;
  };

  // Combined loading state for better UX
  const showLoading = loading || searchLoading;

  // Active filters count for badge
  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'All',
    selectedSubCategory
  ].filter(Boolean).length;

  return (
    <>
      <AlertComponent />

      {/* <ProductCouponBanner/> */}

      <div className="mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white w-full max-w-7xl">
        {/* Mobile Filter Button */}
        <div className="xl:hidden mb-4">
          <div className="flex justify-center">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#155874] text-white px-6 py-3 rounded-lg hover:bg-[#155874]/90 transition-colors shadow-md"
              disabled={showLoading}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Categories & Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden xl:block w-1/4">
            {categoriesLoading ? (
              <SidebarSkeleton />
            ) : (
              <Sidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                selectedSubCategory={selectedSubCategory}
                onSubCategorySelect={handleSubCategorySelect}
                getCategoryDisplayName={getCategoryDisplayName}
              />
            )}
          </div>

          {/* Mobile Sidebar Drawer */}
          {isMobileSidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />

              <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
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

                  <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4">
                      {categoriesLoading ? (
                        <SidebarSkeleton />
                      ) : (
                        <Sidebar
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onCategorySelect={(category) => {
                            handleCategorySelect(category);
                            setIsMobileSidebarOpen(false);
                          }}
                          selectedSubCategory={selectedSubCategory}
                          onSubCategorySelect={(subCategory) => {
                            handleSubCategorySelect(subCategory);
                            setIsMobileSidebarOpen(false);
                          }}
                          getCategoryDisplayName={getCategoryDisplayName}
                        />
                      )}
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="text-center">
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
            {/* Active Filters Display */}
            {(searchTerm || selectedCategory !== 'All' || selectedSubCategory) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => handleClearFilter('search')}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Category: "{getCategoryDisplayName(selectedCategory)}"
                    <button
                      onClick={() => handleClearFilter('category')}
                      className="ml-2 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Subcategory: "{selectedSubCategory}"
                    <button
                      onClick={() => handleClearFilter('subCategory')}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {showLoading ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                <ProductGridSkeleton />

                <div className="mt-8 flex justify-center">
                  <div className="h-10 w-80 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                {/* Sort and Filter Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                    Showing {products.length} of {totalProducts} products
                    {searchTerm ? (
                      <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                        for "{searchTerm}"
                        <button
                          onClick={() => handleClearFilter('search')}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          (Clear)
                        </button>
                      </span>
                    ) : selectedCategory !== "All" ? (
                      <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                        in "{getCategoryDisplayName(selectedCategory)}"
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
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Products or Empty State */}
                {products.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <div className="text-gray-500 text-base sm:text-lg mb-2">
                      No products found
                    </div>
                    <div className="text-gray-400 text-sm sm:text-base">
                      {searchTerm
                        ? `No products found for "${searchTerm}"`
                        : selectedCategory !== "All"
                        ? `No products found in "${getCategoryDisplayName(selectedCategory)}"${
                            selectedSubCategory
                              ? ` > "${selectedSubCategory}"`
                              : ""
                          }`
                        : `Try adjusting your search or filters`}
                    </div>
                    {(searchTerm || selectedCategory !== 'All' || selectedSubCategory) && (
                      <button
                        onClick={handleClearSearch}
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                      {products.map((product) => (
                        <ProductCard
                          key={product.fullCode}
                          imageSrc={getProductImage(product)}
                          productName={product.productName}
                          price={product.price || 0}
                          productId={product.fullCode}
                          onAddToCart={handleAddToCart}
                          stockQuantity={product.stockInfo?.stock || 0}
                          isInStock={product.isAvailable || false}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 sm:mt-8">
                        {/* Mobile - Simple Previous/Next */}
                        <div className="flex justify-between items-center sm:hidden">
                          <button
                            onClick={() => handlePageChange(Math.max(1, initialPage - 1))}
                            disabled={initialPage === 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#155874] text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Previous
                          </button>

                          <span className="text-sm text-gray-600 font-medium">
                            {initialPage} / {totalPages}
                          </span>

                          <button
                            onClick={() => handlePageChange(Math.min(totalPages, initialPage + 1))}
                            disabled={initialPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#155874] text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Desktop - Full Pagination */}
                        <div className="hidden sm:flex justify-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePageChange(Math.max(1, initialPage - 1))}
                              disabled={initialPage === 1}
                              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Previous page"
                            >
                              <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>

                            {/* Dynamic page numbers */}
                            {(() => {
                              const pages = [];
                              const showPages = 5;
                              let startPage = Math.max(1, initialPage - Math.floor(showPages / 2));
                              const endPage = Math.min(totalPages, startPage + showPages - 1);

                              if (endPage - startPage + 1 < showPages) {
                                startPage = Math.max(1, endPage - showPages + 1);
                              }

                              if (startPage > 1) {
                                pages.push(
                                  <button
                                    key={1}
                                    onClick={() => handlePageChange(1)}
                                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    1
                                  </button>
                                );
                                if (startPage > 2) {
                                  pages.push(
                                    <span
                                      key="ellipsis1"
                                      className="flex items-center justify-center w-10 h-10 text-gray-500"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                              }

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                                      initialPage === i
                                        ? "bg-[#155874] border-[#155874] text-white shadow-sm"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }

                              if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                  pages.push(
                                    <span
                                      key="ellipsis2"
                                      className="flex items-center justify-center w-10 h-10 text-gray-500"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                pages.push(
                                  <button
                                    key={totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    {totalPages}
                                  </button>
                                );
                              }

                              return pages;
                            })()}

                            <button
                              onClick={() => handlePageChange(Math.min(totalPages, initialPage + 1))}
                              disabled={initialPage === totalPages}
                              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Next page"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}