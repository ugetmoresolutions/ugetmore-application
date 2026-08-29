"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { ORDER_API } from "@/endpoints/rest-api/order";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { Order, OrderItem, OrderStatus } from "@/interfaces/order/order";

// Cache configuration
const CACHE_CONFIG = {
  KEY: "userOrders",
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  VERSION: "v1", // Increment when data structure changes
};

export const OrdersList: React.FC<{
  onViewOrder: (order: Order) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ onViewOrder, currentPage, totalPages, onPageChange }) => {
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const loggedInUser = decodeAccessToken();

  const transformOrder = (apiOrder: any): Order => {
    const items: OrderItem[] = apiOrder.items.map((item: any) => {
      // CASE 1: Branded product (brandingConfigs exists)
      if (item.brandingConfigs && item.product) {
        const product = item.product;

        return {
          id: item.id,
          name: product.productName || "Branded Product",
          price: item.price,
          quantity: item.quantity,
          category: product.categories?.[0]?.name || "Branded Category",
          brand: product.brand?.name || "Custom Branding",
          image:
            product.images?.[0]?.urls?.[0]?.url ||
            "/placeholder-image.jpg",
          isBranded: true,
          brandingConfig: item.brandingConfigs,
        };
      }

      // CASE 2: Unbranded product
      if (item.product) {
        return {
          id: item.id,
          name: item.product.productName,
          price: item.price,
          quantity: item.quantity,
          category: item.product.categories?.[0]?.name || "Uncategorized",
          brand: item.product.brand?.name || "No Brand",
          image:
            item.product.images?.[0]?.urls?.[0]?.url ||
            "/placeholder-image.jpg",
          isBranded: false,
          brandingConfig: null,
        };
      }

      // CASE 3: Fallback
      return {
        id: item.id,
        name: "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        category: "Unknown",
        brand: "Unknown",
        image: "/placeholder-image.jpg",
        isBranded: false,
        brandingConfig: null,
      };
    });

    const status: OrderStatus = apiOrder.status || "pending";

    return {
      id: apiOrder.id.toString(),
      date: apiOrder.createdAt
        ? new Date(apiOrder.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
      status: status,
      shipTo: loggedInUser?.fullName || "User",
      address: apiOrder.user?.address,
      items: items,
      itemCount: apiOrder.items.reduce(
        (total: any, item: any) => total + item.quantity!,
        0
      ),
      total: apiOrder.total,
      savings: 0,
      deliveryDate: status === "completed" ? undefined : "TBD",
      trackOrder: status !== "completed",
      customerName: loggedInUser?.fullName || "User",
      customerEmail: loggedInUser?.email || "",
      phoneNumber: loggedInUser?.phone || "",
      userId: loggedInUser?.id,
    };
  };

  // Check if cache is stale
  const isCacheStale = (cacheTimestamp: number): boolean => {
    return Date.now() - cacheTimestamp > CACHE_CONFIG.TTL;
  };

  // Get validated cache data
  const getValidatedCache = (): { data: any[]; timestamp: number } | null => {
    try {
      const cachedData = localStorage.getItem(`${CACHE_CONFIG.KEY}_${loggedInUser?.id}_${CACHE_CONFIG.VERSION}`);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData);
      if (!parsedData || !parsedData.timestamp || !parsedData.data) return null;
      
      // Check if cache is still valid
      if (isCacheStale(parsedData.timestamp)) return null;
      
      return parsedData;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  // Set cache with timestamp
  const setCache = (data: any[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(
        `${CACHE_CONFIG.KEY}_${loggedInUser?.id}_${CACHE_CONFIG.VERSION}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  // Force refresh orders
  const forceRefreshOrders = useCallback(async () => {
    if (!loggedInUser?.id) return;
    
    try {
      setRefreshing(true);
      const response = await ORDER_API.GET_USER_ORDERS(loggedInUser.id);
      
      
      if (response && Array.isArray(response.data)) {
        setCache(response.data);
        const transformedOrders = response.data.map(transformOrder);
        setOrders(transformedOrders);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loggedInUser?.id]);

  // Main function to get user orders
  const getUserOrders = useCallback(async (forceRefresh = false) => {
    if (!loggedInUser?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if we have valid cache and don't need to force refresh
      if (!forceRefresh) {
        const cachedData = getValidatedCache();
        if (cachedData) {
          const transformedOrders = cachedData.data.map(transformOrder);
          setOrders(transformedOrders);
          setLastUpdated(cachedData.timestamp);
          setLoading(false);
          return;
        }
      }
      
      // If no valid cache or force refresh, fetch from API
      const response = await ORDER_API.GET_USER_ORDERS(loggedInUser.id);
      if (response && Array.isArray(response.data)) {
        setCache(response.data);
        const transformedOrders = response.data.map(transformOrder);
        setOrders(transformedOrders);
        setLastUpdated(Date.now());
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      
      // Fallback to cache even if stale when API fails
      const cachedData = localStorage.getItem(`${CACHE_CONFIG.KEY}_${loggedInUser?.id}_${CACHE_CONFIG.VERSION}`);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
            const transformedOrders = parsedData.data.map(transformOrder);
            setOrders(transformedOrders);
          }
        } catch (e) {
          console.error("Error using fallback cache:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loggedInUser?.id]);

  // Set up periodic refresh
  useEffect(() => {
    getUserOrders();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(() => {
      getUserOrders(true);
    }, CACHE_CONFIG.TTL);
    
    return () => clearInterval(intervalId);
  }, [getUserOrders]);

  // Set up real-time update checks
  useEffect(() => {
    // Check for updates every 30 seconds
    const updateCheckInterval = setInterval(() => {
      const cachedData = getValidatedCache();
      if (!cachedData || isCacheStale(cachedData.timestamp)) {
        getUserOrders(true);
      }
    }, 30000);
    
    return () => clearInterval(updateCheckInterval);
  }, [getUserOrders]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    getUserOrders(true);
  };

  // Create a wrapper function for the error retry button
  const handleRetry = () => {
    getUserOrders(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = order.status === activeStatus;
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "shipped":
        return "Shipped";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const statusCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="max-w-full px-4 mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155670]"></div>
          <span className="ml-4 text-lg text-gray-600">
            Loading your orders...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full px-4 mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry} 
            className="px-4 py-2 bg-[#155670] text-white rounded-lg hover:bg-[#0d3d47] transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4 mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155670] focus:border-transparent"
            />
          </div>

          <div className="flex items-center flex-wrap-reverse  gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="flex  items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-600">
                  {statusCounts.pending} Pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">
                  {statusCounts.shipped} Shipped
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">
                  {statusCounts.completed} Completed
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex justify-between  flex-col sm:flex-row">
            {(
              ["pending", "shipped", "completed", "cancelled"] as OrderStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                  activeStatus === status
                    ? "text-[#155670] bg-[#155670]/5 sm:border-b-2 border-[#155670] sm:border-l-0 border-l-4"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span>{getStatusLabel(status)}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeStatus === status
                      ? "bg-[#155670] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {getStatusLabel(activeStatus).toLowerCase()} orders found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : `You don't have any ${getStatusLabel(
                      activeStatus
                    ).toLowerCase()} orders yet`}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-[#155670]/30 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#155670] rounded-lg">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Order Placed
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Ship To
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {order.shipTo}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {order.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600 rounded-lg">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Order #
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {order.id}
                            </p>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span>{getStatusLabel(order.status)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-start sm:justify-end">
                          <motion.button
                            onClick={() => onViewOrder(order)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="flex -space-x-3">
                            {order.items.slice(0, 4).map((item, idx) => (
                              <div
                                key={idx}
                                className="w-12 h-12 bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden relative"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                                {item.isBranded && (
                                  <div className="absolute top-0 right-0 bg-[#155670] text-white text-xs px-1 rounded-bl-md">
                                    B
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  +{order.items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 sm:flex-none">
                            <p className="text-sm font-semibold text-gray-900">
                              Item Total
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.itemCount} Items
                            </p>
                            
                          </div>
                        </div>

                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Amount
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            R {order.total.toFixed(2)}
                          </p>
                          
                          
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 overflow-x-auto no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 hover:text-[#155670] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-gradient-to-r from-[#155670] to-[#0d3d47] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#155670]"
              }`}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 hover:text-[#155670] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
};