"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { CART_API } from "@/endpoints/rest-api/cart";
import { UserRole } from "@/interfaces/user/user";
import logo from "@/public/yougetmore assets/logo.png";
import Cookies from "universal-cookie";
import { Heart, Loader, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import the same API used in universal page
import { SUPPLIER_PRODUCTS_API } from "@/endpoints/rest-api/supplierProduct";
import { AGGREGATED_PRODUCTS_API } from "@/endpoints/rest-api/aggregated-product";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";

interface NavigationHeaderProps {
  cartTotal?: number;
}

interface Division {
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType;
  color: string;
  features: string[];
}

interface SearchResult {
  id: string | number;
  name: string;
  type: "product" | "category" | "division";
  path: string;
  imageUrl?: string;
  productName?: string;
  originalName?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const cookies = new Cookies();
  const loggedInUser = decodeAccessToken();

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (loggedInUser?.role === UserRole.Admin) {
      cookies.remove("userToken", {
        path: "/",
        secure: true,
        sameSite: "lax",
      });
    }
  }, []);

  // Define the divisions
  const divisions: Division[] = [
    {
      name: "Branding",
      description:
        "Transform your brand with custom promotional products and marketing materials",
      path: "/client/shop/branding",
      icon: BrandingIcon,
      color: "from-blue-500 to-blue-600",
      features: [
        "Custom Logos",
        "Promotional Items",
        "Marketing Materials",
        "Brand Identity",
      ],
    },
    {
      name: "Electronics",
      description:
        "Cutting-edge technology solutions for your business and personal needs",
      path: "/client/shop/electronics",
      icon: ElectronicsIcon,
      color: "from-purple-500 to-purple-600",
      features: [
        "Latest Tech",
        "Business Solutions",
        "Consumer Electronics",
        "Smart Devices",
      ],
    },
    {
      name: "Furniture",
      description:
        "Premium office and home furniture designed for comfort and productivity",
      path: "/client/shop/furniture",
      icon: FurnitureIcon,
      color: "from-green-500 to-green-600",
      features: [
        "Office Furniture",
        "Home Decor",
        "Ergonomic Design",
        "Modern Styles",
      ],
    },
    {
      name: "Office Stationery",
      description:
        "Essential supplies and materials to keep your office running smoothly",
      path: "/client/shop/stationery",
      icon: StationaryIcon,
      color: "from-orange-500 to-orange-600",
      features: [
        "Writing Materials",
        "Paper Products",
        "Office Supplies",
        "Organization Tools",
      ],
    },
    {
      name: "Janitorial",
      description:
        "Professional cleaning supplies and equipment for maintaining pristine environments",
      path: "/client/shop/janitorial",
      icon: JanitorialIcon,
      color: "from-teal-500 to-teal-600",
      features: [
        "Cleaning Supplies",
        "Sanitation Products",
        "Maintenance Equipment",
        "Hygiene Solutions",
      ],
    },
    {
      name: "Software Development",
      description:
        "Custom software solutions tailored to your business requirements",
      path: "/client/services/software-development",
      icon: SoftwareIcon,
      color: "from-red-500 to-red-600",
      features: [
        "Custom Applications",
        "Web Development",
        "Mobile Apps",
        "System Integration",
      ],
    },
  ];

  const isActive = (path: string) => pathname === path;
  const isShopActive =
    pathname.startsWith("/client/shop") ||
    pathname.startsWith("/client/services");

  // Handle sign out
  const handleSignOut = () => {
    cookies.remove("userToken", {
      path: "/",
      secure: true,
      sameSite: "lax",
    });
    window.location.href = "/client/auth/login";
  };

  const updateWishlistCount = () => {
    const wishlistData = localStorage.getItem("wishlist");
    try {
      const wishlist = JSON.parse(wishlistData || "[]");
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    } catch (error) {
      console.error("Error parsing wishlist:", error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateWishlistCount();
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () =>
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
  }, []);

  // Handle shop dropdown toggle
  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShopDropdownOpen(!isShopDropdownOpen);
  };

  const getCartCount = async () => {
    try {
      if (loggedInUser?.id) {
        const countTotal = await CART_API.GET_CART_COUNT(loggedInUser.id);
        setCartCount(countTotal.count);
        setCartTotal(countTotal.total);
      } else {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          const cartData = JSON.parse(localCart);
          const totalCount = cartData.reduce(
            (sum: number, item: any) => sum + (item.quantity || 1),
            0
          );
          const totalAmount = cartData.reduce(
            (sum: number, item: any) =>
              sum + (item.price || 0) * (item.quantity || 1),
            0
          );
          setCartCount(totalCount);
          setCartTotal(totalAmount);
        } else {
          setCartCount(0);
          setCartTotal(0);
        }
      }
    } catch (error) {
      console.error("Error getting cart count:", error);
      setCartCount(0);
      setCartTotal(0);
    }
  };

  // Fetch categories for search
  const fetchCategories = async () => {
    try {
      const response = await AGGREGATED_PRODUCTS_API.GET_MERGED_CATEGORIES();
      if (response?.data) {
        setCategories(response.data.categoriesWithSubs || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Create a robust image utility function
  const getProductImageUrl = (product: any): string => {
    // Case 1: Product has images array with URLs (from universal search)
    if (product.images && Array.isArray(product.images)) {
      const defaultImage =
        product.images.find((img: any) => img.isDefault) || product.images[0];
      if (defaultImage?.urls && Array.isArray(defaultImage.urls)) {
        // Prefer medium-sized images (200-400px) for optimal performance
        const mediumImage = defaultImage.urls.find(
          (url: any) => url.width >= 200 && url.width <= 400 && url.url
        );
        if (mediumImage?.url) return mediumImage.url;

        // Fallback to any available image URL
        const anyImage = defaultImage.urls.find((url: any) => url.url);
        if (anyImage?.url) return anyImage.url;
      }
    }

    // Case 2: Product has direct imageUrl property (from suggestions)
    if (product.imageUrl && typeof product.imageUrl === "string") {
      return product.imageUrl;
    }

    // Case 3: Product has mainImage or thumbnail
    if (product.mainImage) return product.mainImage;
    if (product.thumbnail) return product.thumbnail;

    // Case 4: No image available - return null to use icon fallback
    return "";
  };

  // Helper function to determine if we should show image or icon
  const shouldShowProductImage = (product: any): boolean => {
    const imageUrl = getProductImageUrl(product);
    return !!imageUrl && imageUrl !== "/placeholder-product.png";
  };

  // Search function using AGGREGATED_PRODUCTS_API for faster results
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const lowercaseQuery = query.toLowerCase();
        const allResults: SearchResult[] = [];

        // 1. Search divisions (local - instant)
        const divisionResults = divisions
          .filter(
            (division) =>
              division.name.toLowerCase().includes(lowercaseQuery) ||
              division.description.toLowerCase().includes(lowercaseQuery) ||
              division.features.some((feature) =>
                feature.toLowerCase().includes(lowercaseQuery)
              )
          )
          .slice(0, 2)
          .map((division) => ({
            id: `division-${division.name}`,
            name: division.name,
            type: "division" as const,
            path: division.path,
            imageUrl: "/placeholder-category.png",
            originalName: division.name,
          }));

        allResults.push(...divisionResults);

        // 2. Search categories (local - instant)
        const categoryResults = categories
          .flatMap((category) => {
            const results = [];
            if (category.name.toLowerCase().includes(lowercaseQuery)) {
              results.push({
                id: `category-${category.name}`,
                name: category.name,
                type: "category" as const,
                path: `/client/shop/all?category=${encodeURIComponent(
                  category.name
                )}`,
                imageUrl: "/placeholder-category.png",
                originalName: category.name,
              });
            }

            // Search subcategories
            if (category.subCategories) {
              category.subCategories.forEach((subCat: string) => {
                if (subCat.toLowerCase().includes(lowercaseQuery)) {
                  results.push({
                    id: `subcategory-${subCat}`,
                    name: subCat,
                    type: "category" as const,
                    path: `/client/shop/all?category=${encodeURIComponent(
                      category.name
                    )}&subCategory=${encodeURIComponent(subCat)}`,
                    imageUrl: "/placeholder-category.png",
                    originalName: subCat,
                  });
                }
              });
            }
            return results;
          })
          .slice(0, 3);

        allResults.push(...categoryResults);

        // 3. Search products using GET_SEARCH_SUGGESTIONS (fast endpoint)
        try {
          const response = await AGGREGATED_PRODUCTS_API.GET_SEARCH_SUGGESTIONS(
            query,
            5
          );

          if (response.data?.products) {
            const productResults = response.data.products
              .slice(0, 5)
              .map((product: any) => ({
                id: product.code || product.name,
                name: product.name,
                type: "product" as const,
                path: `/client/shop/all?search=${encodeURIComponent(
                  product.name
                )}`,
                imageUrl: getProductImageUrl(product), // You can enhance this with actual images if available
                productName: product.name,
                originalName: product.name,
              }));
            allResults.push(...productResults);
          }
        } catch (productError) {
          console.error("Error searching products:", productError);
          // Fallback: Use universal search if suggestions fail
          try {
            const fallbackResponse =
              await AGGREGATED_PRODUCTS_API.GET_UNIVERSAL_SEARCH({
                search: query,
                limit: 3,
                page: 1,
              });

            if (fallbackResponse.data?.products) {
              const fallbackResults = fallbackResponse.data.products
                .slice(0, 3)
                .map((product: any) => ({
                  id: product.fullCode || product.id,
                  name: product.productName || product.name,
                  type: "product" as const,
                  path: `/client/shop/all?search=${encodeURIComponent(
                    product.productName || product.name
                  )}`,
                  imageUrl: getProductImageUrl(product),
                  productName: product.productName || product.name,
                  originalName: product.productName || product.name,
                }));
              allResults.push(...fallbackResults);
            }
          } catch (fallbackError) {
            console.error("Fallback search also failed:", fallbackError);
          }
        }

        setSearchResults(allResults);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [divisions, categories]
  );

  // Update the search handler with better debouncing
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Use a longer delay for better performance (reduced from 300ms to 500ms)
      const timeout = setTimeout(() => {
        performSearch(query);
      }, 500); // Increased delay to reduce API calls

      setSearchTimeout(timeout);
    },
    [searchTimeout, performSearch]
  );

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // In both desktop and mobile search forms, update the form submission:
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/client/shop/all?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    router.push(result.path);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      await fetchCategories();
    };

    initializeData();
    getCartCount();

    // Event listeners
    const handleStorageChange = () => {
      if (!loggedInUser?.id) {
        getCartCount();
      }
    };

    const handleCartUpdate = () => {
      getCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown-container")) {
        setIsUserDropdownOpen(false);
      }
      if (
        !target.closest(".shop-dropdown-container") &&
        !target.closest(".mobile-shop-dropdown")
      ) {
        setIsShopDropdownOpen(false);
      }
      if (!target.closest(".search-container")) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [loggedInUser?.id]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Single compact navigation bar */}
      <div className="bg-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo/Brand section */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
            <div className="text-xl sm:text-2xl font-bold text-[#155874]">
              <Image
                src={logo}
                width={100}
                height={45}
                alt="YouGetMore Logo"
                className="inline-block mr-1 sm:mr-2"
                priority
              />
            </div>

            {/* Main Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <Link
                href="/"
                className={`text-xs xl:text-sm font-medium transition-colors py-1 ${
                  isActive("/")
                    ? "text-[#155874] border-b-2 border-[#155874]"
                    : "text-gray-600 hover:text-[#155874]"
                }`}
              >
                Home
              </Link>

              <div
                className="relative shop-dropdown-container"
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <button
                  onClick={handleShopClick}
                  className={`flex items-center space-x-1 text-xs xl:text-sm font-medium transition-colors px-1 xl:px-2 py-1 ${
                    isShopActive
                      ? "text-[#155874] border-b-2 border-[#155874]"
                      : "text-gray-600 hover:text-[#155874]"
                  }`}
                >
                  <span>Shop</span>
                  <ChevronDownIcon />
                </button>

                {isShopDropdownOpen && (
                  <div className="absolute top-full left-0 w-[600px] xl:w-[700px] h-2 -ml-[40px] xl:-ml-[50px]" />
                )}

                {isShopDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg border border-gray-200 
                         w-[500px] lg:w-[600px] xl:w-[700px] -ml-[30px] lg:-ml-[40px] xl:-ml-[50px] z-50"
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                  >
                    <div className="p-3 xl:p-4">
                      <div className="mb-3 xl:mb-4">
                        <h3 className="text-base xl:text-lg font-semibold text-gray-900">
                          Our Divisions
                        </h3>
                        <p className="text-xs xl:text-sm text-gray-500">
                          Solutions for every business need
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 xl:gap-3 mb-3 xl:mb-4">
                        {divisions.map((division) => {
                          const IconComponent = division.icon;
                          return (
                            <Link
                              key={division.name}
                              href={division.path}
                              className="group flex items-center space-x-2 xl:space-x-3 p-2.5 xl:p-3 border border-gray-100 
                                   rounded-lg hover:border-[#155874]/20 hover:bg-gray-50 transition-all"
                              onClick={() => setIsShopDropdownOpen(false)}
                            >
                              <div
                                className={`p-1.5 rounded-md bg-gradient-to-br ${division.color} text-white`}
                              >
                                <IconComponent />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm xl:font-medium text-gray-900 group-hover:text-[#155874] transition-colors">
                                  {division.name}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {division.description
                                    .split(" ")
                                    .slice(0, 6)
                                    .join(" ")}
                                  ...
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/client/contact"
                className={`text-xs xl:text-sm font-medium transition-colors py-1 ${
                  isActive("/client/contact")
                    ? "text-[#155874] border-b-2 border-[#155874]"
                    : "text-gray-600 hover:text-[#155874]"
                }`}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Search Bar - Centered and Responsive */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8 search-container">
            {/* Desktop Search - Always visible on lg+ */}
            <div className="hidden lg:block relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products and categories..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-[#155874] transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(e);
                      }
                    }}
                    onFocus={() => setSearchOpen(true)}
                  />
                </div>
              </form>

              {/* Desktop Search Results Dropdown */}
              <AnimatePresence>
                {searchOpen && searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-gray-200 rounded-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#155874] mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {/* Divisions Section */}
                        {searchResults.filter((r) => r.type === "division")
                          .length > 0 && (
                          <div className="mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                              Divisions
                            </h3>
                            {searchResults
                              .filter((r) => r.type === "division")
                              .map((result) => (
                                <button
                                  key={`${result.type}-${result.id}`}
                                  onClick={() =>
                                    handleSearchResultClick(result)
                                  }
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left"
                                >
                                  <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {result.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      Division - Browse all {result.name}{" "}
                                      products
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Categories Section */}
                        {searchResults.filter((r) => r.type === "category")
                          .length > 0 && (
                          <div className="mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                              Categories
                            </h3>
                            {searchResults
                              .filter((r) => r.type === "category")
                              .map((result) => (
                                <button
                                  key={`${result.type}-${result.id}`}
                                  onClick={() =>
                                    handleSearchResultClick(result)
                                  }
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left"
                                >
                                  <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {result.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      Category - View all {result.name} products
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Products Section */}
                        {searchResults
                          .filter((r) => r.type === "product")
                          .map((result) => (
                            <button
                              key={`product-${result.id}`}
                              onClick={() => handleSearchResultClick(result)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left"
                            >
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {shouldShowProductImage(result) ? (
                                  <Image
                                    src={getProductImageUrl(result)}
                                    alt={result.name}
                                    fill
                                    className="rounded-md object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      // The parent will show the icon fallback due to conditional rendering
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {result.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  Product
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">
                          No results found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Search Overlay */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-white z-50 p-4"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center space-x-2 mb-4"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search products and categories..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-[#155874] outline-none text-base"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchSubmit(e);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="p-2 text-gray-600 hover:text-[#155874] transition-colors"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </form>

                {/* Mobile Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="border border-gray-200 rounded-lg max-h-[70vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#155874] mx-auto"></div>
                        <p className="mt-3 text-base">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {/* Divisions Section */}
                        {searchResults.filter((r) => r.type === "division")
                          .length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-3 py-3 border-b">
                              Divisions
                            </h3>
                            {searchResults
                              .filter((r) => r.type === "division")
                              .map((result) => (
                                <button
                                  key={`${result.type}-${result.id}`}
                                  onClick={() =>
                                    handleSearchResultClick(result)
                                  }
                                  className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-base font-medium text-gray-900 truncate">
                                      {result.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Division - Browse all {result.name}{" "}
                                      products
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Categories Section */}
                        {searchResults.filter((r) => r.type === "category")
                          .length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-3 py-3 border-b">
                              Categories
                            </h3>
                            {searchResults
                              .filter((r) => r.type === "category")
                              .map((result) => (
                                <button
                                  key={`${result.type}-${result.id}`}
                                  onClick={() =>
                                    handleSearchResultClick(result)
                                  }
                                  className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-base font-medium text-gray-900 truncate">
                                      {result.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Category - View all {result.name} products
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Products Section */}
                        {searchResults
                          .filter((r) => r.type === "product")
                          .map((result) => (
                            <button
                              key={`product-${result.id}`}
                              onClick={() => handleSearchResultClick(result)}
                              className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="relative w-12 h-12 flex-shrink-0">
                                {shouldShowProductImage(result) ? (
                                  <Image
                                    src={getProductImageUrl(result)}
                                    alt={result.name}
                                    fill
                                    className="rounded-md object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                                    <Search className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-gray-900 truncate">
                                  {result.name}
                                </p>
                                <p className="text-sm text-gray-500">Product</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-base">
                          No results found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Icon - Visible on mobile */}
            <div className="lg:hidden flex justify-center">
              <button
                className="text-gray-600 hover:text-[#155874] hover:bg-gray-100 rounded-md transition-colors p-2"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {loggedInUser?.id && loggedInUser.role !== UserRole.Admin ? (
                /* Logged In User with Dropdown */
                <div className="relative user-dropdown-container">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 text-[#155874] bg-[#155874]/10 
                         hover:bg-[#155874]/20 rounded-md transition-colors border border-[#155874]/20"
                    title={`Welcome, ${
                      loggedInUser.fullName || loggedInUser.email
                    }`}
                  >
                    <div className="relative">
                      <UserIconSVG />
                      <div className="absolute -top-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium hidden md:block">
                      {loggedInUser.fullName || "Profile"}
                    </span>
                    <ChevronDownIcon />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg border border-gray-200 
                             w-44 sm:w-48 z-50"
                    >
                      <div className="p-1.5">
                        {/* User info header */}
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {loggedInUser.fullName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {loggedInUser.email}
                          </p>
                        </div>

                        {/* Menu items */}
                        <div className="mt-1.5">
                          <Link
                            href="/client/profile"
                            className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 text-xs sm:text-sm text-gray-700 
                                 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <ProfileIcon />
                            <span>Profile</span>
                          </Link>

                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleSignOut();
                            }}
                            className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 text-xs sm:text-sm text-red-600 
                                 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                          >
                            <SignOutIcon />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Logged In */
                <Link
                  href="/client/auth/login"
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 text-gray-600 hover:text-[#155874] 
                       hover:bg-gray-100 rounded-md transition-colors"
                  title="Login"
                >
                  <UserIconSVG />
                  <span className="text-xs sm:text-sm font-medium hidden md:block">
                    Login
                  </span>
                </Link>
              )}

              <Link
                href="/client/wishlist"
                className="relative p-1.5 text-gray-600 hover:text-[#155874] hover:bg-gray-100 rounded-md transition-colors"
                title="wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-[#155874] text-white text-xs rounded-full 
                             h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium"
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/client/cart"
                className="relative p-1.5 text-gray-600 hover:text-[#155874] hover:bg-gray-100 rounded-md transition-colors"
                title="Cart"
              >
                <CartIconSVG />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-[#155874] text-white text-xs rounded-full 
                             h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Cart Total - Hidden on small screens */}
            <div className="hidden sm:flex items-center bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md">
              <span className="text-xs font-medium text-gray-600 mr-1">
                Total:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#155874]">
                ZAR {cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-[#155874] px-3 sm:px-4 py-1.5">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 sm:space-x-6">
            <Link
              href="/"
              className="text-white text-xs sm:text-sm font-medium"
            >
              Home
            </Link>
            <button
              onClick={handleShopClick}
              className="text-white text-xs sm:text-sm font-medium"
            >
              Shop
            </button>
            <Link
              href="/client/contact"
              className="text-white text-xs sm:text-sm font-medium"
            >
              Contact
            </Link>
          </div>
          <div className="sm:hidden flex items-center bg-white/10 px-2 py-1 rounded text-white">
            <span className="text-xs font-bold">
              ZAR {cartTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Shop Dropdown */}
      {isShopDropdownOpen && (
        <div className="mobile-shop-dropdown bg-white block lg:hidden border-t border-gray-200 shadow-lg">
          <div className="p-3">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Our Divisions
              </h3>
              <p className="text-xs text-gray-500">
                Solutions for every business need
              </p>
            </div>

            <div className="space-y-2.5 mb-3">
              {divisions.map((division) => {
                const IconComponent = division.icon;
                return (
                  <Link
                    key={division.name}
                    href={division.path}
                    className="flex items-center space-x-3 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsShopDropdownOpen(false)}
                  >
                    <div
                      className={`p-1.5 rounded-md bg-gradient-to-br ${division.color} text-white`}
                    >
                      <IconComponent />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {division.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {division.description.split(" ").slice(0, 4).join(" ")}
                        ...
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavigationHeader;

const ChevronDownIcon = () => (
  <svg
    className=""
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const SearchIconSVG = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="21 21l-4.35-4.35"></path>
  </svg>
);

const UserIconSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CartIconSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

// New icons for user dropdown
const ProfileIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SignOutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// Add this icon component for Janitorial (you can customize this)
const JanitorialIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
    <path d="M6,9 L18,9"></path>
  </svg>
);

// Division Icons
const BrandingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
  </svg>
);

const ElectronicsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const FurnitureIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
    <path d="M9 9h6v7H9z"></path>
  </svg>
);

const StationaryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10,9 9,9 8,9"></polyline>
  </svg>
);

const SoftwareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16,18 22,12 16,6"></polyline>
    <polyline points="8,6 2,12 8,18"></polyline>
  </svg>
);
