'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FURNITURE_API } from "@/endpoints/rest-api/furniture";
import { CATEGORY_API } from "@/endpoints/rest-api/categories";
import { IProduct } from "@/interfaces/product/product";
import brandingBanner from "@/public/yougetmore assets/pictures/branding.png";
import { Filter, X, Search, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CART_API } from "@/endpoints/rest-api/cart";
import { IAddCartItem, ICartItem } from "@/interfaces/cart/cart";
import { useSmartAlert } from "@/components/common/SmartAlert";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { v4 as uuidv4 } from "uuid";
import ProductCard from "../ProductCard";
import { Sidebar } from "../Sidebar";
import { useCart } from "@/hooks/cart";
import { FurnitureTransformationService } from '@/services/furniture-tranformation.service';
import { FurnitureCategoriesService } from '@/services/furniture-categories.service';
import { ProductGridSkeleton } from '../stationary/Skeletons';

// Sidebar Component interface - same as Stationery
interface Category {
  name: string;
  subCategories: string[] | null;
}

// Skeleton Components - same as Stationery
const SidebarSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
    ))}
  </div>
);

// Main Furniture Component - UPDATED TO MATCH STATIONERY
export default function Furniture() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name-asc");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const loggedInUser = decodeAccessToken()!;
  const userId = loggedInUser?.id;
  const {
    success: showSuccess,
    error: showError,
    AlertComponent,
  } = useSmartAlert();

  const { triggerCartUpdate } = useCart(userId);

  // Display name mapping
  const getCategoryDisplayName = (categoryName: string): string => {
    const displayNameMap: { [key: string]: string } = {
      // Add display name mappings here if needed
    };
    return displayNameMap[categoryName] || categoryName;
  };

  // Fetch filtered furniture products
  const fetchFilteredProducts = async (search: string = searchTerm) => {
    try {
      setSearchLoading(true);

      // Get all furniture products
      const response = await FURNITURE_API.GET_ALL_FURNITURE_PRODUCTS();
      
      if (response.data?.products) {
        // Transform furniture products to IProduct format
        let transformedProducts = FurnitureTransformationService.transformFurnitureProducts(response.data.products);

        // Apply search filter
        if (search) {
          transformedProducts = transformedProducts.filter(product =>
            product.productName?.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase()) ||
            product.simpleCode?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Apply category filter
        if (selectedCategory !== "All") {
          transformedProducts = transformedProducts.filter(product =>
            product.categories?.some(cat => cat.name === selectedCategory)
          );
        }

        // Apply subcategory filter (use tags for subcategories)
        if (selectedSubCategory) {
          transformedProducts = transformedProducts.filter(product =>
            product.tags?.includes(selectedSubCategory)
          );
        }

        // Apply sorting
        switch (sortBy) {
          case 'name-asc':
            transformedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
            break;
          case 'name-desc':
            transformedProducts.sort((a, b) => b.productName.localeCompare(a.productName));
            break;
          case 'price-asc':
            transformedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price-desc':
            transformedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        }

        // Calculate pagination
        const total = transformedProducts.length;
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginated = transformedProducts.slice(startIndex, endIndex);

        setProducts(paginated);
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / productsPerPage));
        
        console.log("✅ Filtered furniture products fetched:", paginated.length);
      } else {
        throw new Error("No data in response");
      }
    } catch (err: any) {
      console.error("❌ Error in fetchFilteredProducts:", err);
      setErrorState(`Failed to fetch furniture products: ${err.message}`);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  // Fetch furniture categories
  const fetchFurnitureCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // Check cache first
      const cachedCategories = FurnitureCategoriesService.getCachedCategories();
      if (cachedCategories) {
        console.log("📦 Using cached furniture categories from localStorage");
        setCategories(cachedCategories);
        setCategoriesLoading(false);
        return;
      }
      
      // Fetch from API
      console.log("🔧 Fetching fresh furniture categories from API...");
      const response = await CATEGORY_API.GET_CATEGORIES_BY_MAIN_CATEGORY("FURNITURE");
      
      if (response.data) {
        // Transform the categories
        const transformedCategories = FurnitureCategoriesService.transformCategories(response.data);
        setCategories(transformedCategories.categoriesWithSubs);
        
        // Cache the categories
        FurnitureCategoriesService.cacheCategories(transformedCategories);
        console.log("✅ Furniture categories fetched and cached:", transformedCategories.categoriesWithSubs.length);
      } else {
        console.warn("⚠️ No categories data in response");
        // Fallback to cached data even if expired
        const cached = localStorage.getItem('furniture_categories');
        if (cached) {
          console.log("🔄 Using expired cached data as fallback");
          setCategories(JSON.parse(cached));
        }
      }
    } catch (error) {
      console.error("❌ Error fetching furniture categories:", error);
      // Fallback: try to use cached data
      const cached = localStorage.getItem('furniture_categories');
      if (cached) {
        console.log("🔄 Using cached categories as fallback due to error");
        setCategories(JSON.parse(cached));
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  // Clear search and reset products
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchFilteredProducts();
      await fetchFurnitureCategories();
    };
    loadInitialData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (!loading) {
      fetchFilteredProducts();
    }
  }, [selectedCategory, selectedSubCategory, currentPage, sortBy, searchTerm]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSearchQuery("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle subcategory selection
  const handleSubCategorySelect = (subCategory: string | null) => {
    setSelectedSubCategory(subCategory);
    setSearchQuery("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle add to cart function - same as Stationery but with IProduct
  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.fullCode === productId);

    if (product) {
      const productPrice = product.price || 0;

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: product,
        quantity: 1,
        price: productPrice,
        addedAt: new Date().toISOString(),
      };

      if (userId) {
        // User is logged in - use API
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
        // User not logged in - use localStorage
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
  const getProductImage = (product: IProduct) => {
    const defaultImage = product.images?.find(img => img.isDefault) || product.images?.[0];
    const imageUrl = defaultImage?.urls?.[0]?.url || "/placeholder-image.jpg";
    return imageUrl;
  };

  // Combined loading state for better UX
  const showLoading = loading || searchLoading;

  return (
    <>
          <AlertComponent />
    
          <div className="mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white w-full max-w-7xl">
            {/* Mobile Filter Button */}
            <div className="xl:hidden mb-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search Bar - Mobile */}
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search stationery supplies..."
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
                    placeholder="Search stationery supplies..."
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
                              }}
                              selectedSubCategory={selectedSubCategory}
                              onSubCategorySelect={(subCategory) => {
                                handleSubCategorySelect(subCategory);
                                setTimeout(
                                  () => setIsMobileSidebarOpen(false),
                                  300
                                );
                              }}
                              getCategoryDisplayName={getCategoryDisplayName}
                            />
                          )}
                        </div>
    
                        <div className="p-4 bg-white border-t border-gray-200 mt-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedCategory !== "All" ? (
                                <span>
                                  Viewing:{" "}
                                  <span className="font-medium text-[#155874]">
                                    {getCategoryDisplayName(selectedCategory)}
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
                        Showing {products.length} of {totalProducts} stationery products
                        {searchTerm ? (
                          <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                            for "{searchTerm}"
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
                          No stationery products found
                        </div>
                        <div className="text-gray-400 text-sm sm:text-base">
                          {searchTerm
                            ? `No products found for "${searchTerm}"`
                            : selectedCategory !== "All"
                            ? `No products found in "${getCategoryDisplayName(
                                selectedCategory
                              )}"${
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
                                onClick={() =>
                                  setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#155874] text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Previous
                              </button>
    
                              <span className="text-sm text-gray-600 font-medium">
                                {currentPage} / {totalPages}
                              </span>
    
                              <button
                                onClick={() =>
                                  setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
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
                                  onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                  }
                                  disabled={currentPage === 1}
                                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Previous page"
                                >
                                  <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
    
                                {/* Dynamic page numbers */}
                                {(() => {
                                  const pages = [];
                                  const showPages = 5;
                                  let startPage = Math.max(
                                    1,
                                    currentPage - Math.floor(showPages / 2)
                                  );
                                  const endPage = Math.min(
                                    totalPages,
                                    startPage + showPages - 1
                                  );
    
                                  // Adjust start page if we're near the end
                                  if (endPage - startPage + 1 < showPages) {
                                    startPage = Math.max(
                                      1,
                                      endPage - showPages + 1
                                    );
                                  }
    
                                  // First page and ellipsis
                                  if (startPage > 1) {
                                    pages.push(
                                      <button
                                        key={1}
                                        onClick={() => setCurrentPage(1)}
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
    
                                  // Page numbers
                                  for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                      <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                                          currentPage === i
                                            ? "bg-[#155874] border-[#155874] text-white shadow-sm"
                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        {i}
                                      </button>
                                    );
                                  }
    
                                  // Last page and ellipsis
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
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        {totalPages}
                                      </button>
                                    );
                                  }
    
                                  return pages;
                                })()}
    
                                <button
                                  onClick={() =>
                                    setCurrentPage(
                                      Math.min(totalPages, currentPage + 1)
                                    )
                                  }
                                  disabled={currentPage === totalPages}
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