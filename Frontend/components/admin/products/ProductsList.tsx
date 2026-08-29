"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Tag,
  Image as ImageIcon,
  Grid3X3,
  List,
  Download,
  Upload,
} from "lucide-react";
import { ORDER_API } from "@/endpoints/rest-api/order";
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import ProductDetailsModal from "./ProductDetailsModal";
import { TopProduct } from "@/interfaces/order/order";
import AddProductModal from "./StationeryProductModal";

// Types
interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  brandedProducts: number;
  categories: number;
}

interface ProductDisplayData {
  product: IProduct;
  price?: number;
  orderCount: number;
  totalQuantity: number;
  category?: string;
}

// Mock Data for Stats (replace with real API calls)
const productStats: ProductStats = {
  totalProducts: 1247,
  activeProducts: 1189,
  lowStockProducts: 23,
  brandedProducts: 456,
  categories: 24,
};

// Utility Components
export const ActionButton: React.FC<{
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({
  onClick,
  variant = "primary",
  children,
  className = "",
  disabled = false,
}) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary:
      "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm",
    ghost: "bg-slate-50 text-slate-600 hover:bg-slate-100",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}> = ({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
  trend,
  color = "slate",
}) => {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend && change && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </p>
        <p className="text-sm text-slate-600">{title}</p>
      </div>
    </motion.div>
  );
};

export const ProductCard: React.FC<{
  productData: ProductDisplayData;
  onViewDetails: (topProduct: TopProduct) => void;
  onEdit: (topProduct: TopProduct) => void;
}> = ({ productData, onViewDetails, onEdit }) => {
  const { product, price, orderCount, totalQuantity, category } = productData;

  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      const defaultImage = product.images.find((img) => img.isDefault);
      const imageToUse = defaultImage || product.images[0];
      if (imageToUse && imageToUse.urls.length > 0) {
        return imageToUse.urls[0].url;
      }
    }
    return null;
  };

  const getPerformanceColor = (orders: number) => {
    if (orders >= 10) return "text-emerald-600 bg-emerald-50";
    if (orders >= 5) return "text-amber-600 bg-amber-50";
    return "text-slate-600 bg-slate-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {getProductImage() ? (
          <img
            src={getProductImage()!}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {product.isLogo24 && (
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur">
              <Star className="w-3 h-3 inline mr-1" />
              Logo24
            </div>
          )}
          {product.brandings && product.brandings.length > 0 && (
            <div className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur">
              <Tag className="w-3 h-3 inline mr-1" />
              Branded
            </div>
          )}
        </div>

        {/* Performance Indicator */}
        <div className="absolute top-4 left-4">
          <div
            className={`${getPerformanceColor(
              orderCount
            )} px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur border border-white/20`}
          >
            {orderCount} Orders
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.productName}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {product.brand?.name || "No Brand"}
            </p>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {product.simpleCode}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Revenue
              </span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {price
                ? `R ${price.toLocaleString("en-ZA", {
                    minimumFractionDigits: 2,
                  })}`
                : "N/A"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Qty Sold
              </span>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {totalQuantity || 0}
            </p>
          </div>
        </div>

        {/* Category & Details */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-semibold text-slate-600">
              Category
            </span>
          </div>
          <p className="text-sm text-slate-800 font-medium pl-3">
            {category || "Uncategorized"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <ActionButton
            onClick={() =>
              onViewDetails({
                product,
                orderCount,
                totalQuantity,
                priceInfo: {
                  totalRevenue: price || 0,
                  avgPricePerUnit: price || 0,
                  minPrice: price || 0,
                  maxPrice: price || 0,
                },
                brandingInfo: {
                  isBranded: !!(
                    product.brandings && product.brandings.length > 0
                  ),
                },
              } as TopProduct)
            }
            variant="secondary"
            className="flex-1 text-sm font-semibold border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          >
            <Eye className="w-4 h-4" />
            View Details
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const ProductsList: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandingFilter, setBrandingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "orders" | "category"
  >("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<TopProduct | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Fetch ordered products data
  const fetchOrderedProductsData = async () => {
    try {
      setLoading(true);
      const response = await ORDER_API.GET_BEST_SELLING();
      setTopProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching ordered products data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderedProductsData();
  }, []);

  const handleRefresh = () => {
    fetchOrderedProductsData();
  };

  const handleViewDetails = (topProduct: TopProduct) => {
    setSelectedProduct(topProduct);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEdit = (topProduct: TopProduct) => {
    // TODO: Implement product edit functionality
    console.log("Edit product:", topProduct);
  };

  // Process ordered products data for display
  const getProductDisplayData = (
    topProduct: TopProduct
  ): ProductDisplayData => {
    const price =
      topProduct.priceInfo?.totalRevenue ||
      topProduct.priceInfo?.avgPricePerUnit ||
      0;
    const category = topProduct.product.categories?.[0]?.name;

    return {
      product: topProduct.product,
      price,
      orderCount: topProduct.orderCount,
      totalQuantity: topProduct.totalQuantity,
      category,
    };
  };

  // Filter and sort ordered products
  const filteredProducts = topProducts.filter((topProduct) => {
    const productData = getProductDisplayData(topProduct);

    const matchesSearch =
      topProduct.product.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      topProduct.product.simpleCode
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      topProduct.product.brand?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || productData.category === categoryFilter;

    const matchesBranding =
      brandingFilter === "all" ||
      (brandingFilter === "branded" &&
        topProduct.product.brandings &&
        topProduct.product.brandings.length > 0) ||
      (brandingFilter === "unbranded" &&
        (!topProduct.product.brandings ||
          topProduct.product.brandings.length === 0));

    return matchesSearch && matchesCategory && matchesBranding;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aData = getProductDisplayData(a);
    const bData = getProductDisplayData(b);

    switch (sortBy) {
      case "name":
        return a.product.productName.localeCompare(b.product.productName);
      case "price":
        return (aData.price || 0) - (bData.price || 0);
      case "orders":
        return bData.orderCount - aData.orderCount;
      case "category":
        return (aData.category || "").localeCompare(bData.category || "");
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ordered Products
          </h1>
          <p className="text-slate-600 mt-1">
            View and manage products that have been purchased by customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            onClick={handleRefresh}
            variant="secondary"
            disabled={loading}
            className="text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ordered Products"
          value={topProducts.length}
          icon={Package}
          color="slate"
        />
        <StatCard
          title="Total Orders"
          value={topProducts.reduce((sum, tp) => sum + tp.orderCount, 0)}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Total Quantity Sold"
          value={topProducts.reduce((sum, tp) => sum + tp.totalQuantity, 0)}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={topProducts
            .reduce((sum, tp) => sum + (tp.priceInfo?.totalRevenue || 0), 0)
            .toFixed(2)}
          prefix="R "
          icon={Star}
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, code, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {/* Categories will be populated from the products data */}
            </select>
            <select
              value={brandingFilter}
              onChange={(e) => setBrandingFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="branded">Branded Only</option>
              <option value="unbranded">Unbranded Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        {/* <div className="flex items-center gap-2">
          <ActionButton variant="ghost" className="text-sm">
            <Download className="w-4 h-4" />
            Export
          </ActionButton>
          <ActionButton variant="ghost" className="text-sm">
            <Upload className="w-4 h-4" />
            Import
          </ActionButton>
        </div> */}
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedProducts.map((topProduct, index) => (
              <ProductCard
                key={topProduct.product.simpleCode}
                productData={getProductDisplayData(topProduct)}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedProducts.map((topProduct) => {
                  const productData = getProductDisplayData(topProduct);
                  const product = topProduct.product;

                  return (
                    <tr key={product.simpleCode} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                            {(() => {
                              const imageUrl = (() => {
                                if (
                                  product.images &&
                                  product.images.length > 0
                                ) {
                                  const defaultImage = product.images.find(
                                    (img: any) => img.isDefault
                                  );
                                  const imageToUse =
                                    defaultImage || product.images[0];
                                  if (
                                    imageToUse &&
                                    imageToUse.urls.length > 0
                                  ) {
                                    return imageToUse.urls[0].url;
                                  }
                                }
                                return null;
                              })();

                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-full h-full p-2 text-slate-400" />
                              );
                            })()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {product.brand?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {product.simpleCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {productData.category || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {productData.price
                          ? `ZAR ${productData.price.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {productData.orderCount || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
                          {productData.orderCount} Orders
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(topProduct)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(topProduct)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedProducts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No products found
          </h3>
          <p className="text-slate-600">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      )}

      {/* Results Summary */}
      {sortedProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 text-center">
            Showing {sortedProducts.length} of {topProducts.length} ordered
            products
          </p>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct?.product || null}
        productPrice={
          selectedProduct
            ? {
                simplecode: selectedProduct.product.simpleCode,
                fullCode: selectedProduct.product.fullCode,
                price:
                  selectedProduct.priceInfo?.totalRevenue ||
                  selectedProduct.priceInfo?.avgPricePerUnit ||
                  0,
              }
            : undefined
        }
        stockItem={undefined}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductsList;
