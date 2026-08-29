"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Added for bulk orders icon
  Building2 ,
  RefreshCw,
  Layers // Added for bulk orders icon
} from 'lucide-react';
import { ORDER_API } from '@/endpoints/rest-api/order';
import { Order, OrderItem } from '@/interfaces/order/order';
import { OrderStatus } from '@/interfaces/order/order';
import image from "@/public/yougetmore assets/bag_handle.svg";

// Cache configuration
const CACHE_CONFIG = {
  KEY: 'admin_orders_cache',
  VERSION: 'v1',
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  REFRESH_INTERVAL: 30 * 1000, // 30 seconds for update checks
};

interface OrdersListProps {
  onViewOrder: (order: Order) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refreshing: boolean;
}

// Constants - Updated to match backend status values
const STATUS_CONFIGS = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    description: 'Order has been placed and is awaiting processing'
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    description: 'Order has been shipped and is on its way'
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    description: 'Order has been successfully delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    description: 'Order has been cancelled'
  }
} as const;

// Utility functions
const transformApiOrder = (apiOrder: any): Order => {
  console.log('Transforming order:', apiOrder);
  
  // Check if this is a bulk order
  const isBulkOrder = apiOrder.items?.some((item: any) => item.isBulk) || 
                     apiOrder.items?.[0]?.bulkProducts?.length > 0;

  // Handle items - they should already be parsed by Sequelize getter
  const items: OrderItem[] = (apiOrder.items || []).map((item: any) => {
    // Handle bulk order items
    if (item.isBulk || item.bulkProducts?.length > 0) {
      return {
        id: item.id || `item-${Date.now()}`,
        name: item.product?.productName || 'Bulk Stationery Collection',
        price: item.price || 0,
        quantity: item.quantity || 1,
        category: 'Bulk Stationery',
        brand: 'Collection',
        image: item.product?.images?.[0]?.urls?.[0]?.url || image,
        isBranded: false,
        isBulk: true,
        bulkProducts: item.bulkProducts || [],
        bulkTotalItems: item.bulkTotalItems || 0,
        bulkTotalPrice: item.bulkTotalPrice || 0,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
        studentInfo: item.studentInfo,
        product: item.product
      };
    }
    
    // If it's a branded product with brandingConfigs
    if (item.brandingConfigs) {
      return {
        id: item.id || `item-${Date.now()}`,
        name: item.product?.productName || 'Custom Branded Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        category: item.product?.categories?.[0]?.name || 'Branded Product',
        brand: item.product?.brand?.name || 'Custom Branding',
        image: item.product?.images?.[0]?.urls?.[0]?.url || image,
        isBranded: true,
        brandingConfig: item.brandingConfigs,
        product: item.product
      };
    }
    
    // If it's a regular product with product information
    if (item.product) {
      return {
        id: item.id || `item-${Date.now()}`,
        name: item.product.productName || 'Unknown Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        category: item.product.categories?.[0]?.name || 'Uncategorized',
        brand: item.product.brand?.name || 'No Brand',
        image: item.product.images?.[0]?.urls?.[0]?.url || image,
        isBranded: false,
        product: item.product
      };
    }

    // Fallback for legacy items or items without product info
    return {
      id: item.id || `item-${Date.now()}`,
      name: item.name || 'Unknown Product',
      price: item.price || 0,
      quantity: item.quantity || 1,
      category: item.category || 'Unknown',
      brand: item.brand || 'Unknown',
      image: item.image || image,
      isBranded: false
    };
  });

  // Extract customer information from user field
  const user = apiOrder.user || {};
  
  // Extract address from the order
  let addressArray: string[] = [];
  if (Array.isArray(apiOrder.address)) {
    addressArray = apiOrder.address;
  } else if (typeof apiOrder.address === 'string') {
    addressArray = apiOrder.address ? [apiOrder.address] : [];
  }

  // Use user's address if order address is empty
  const displayAddress = addressArray.length > 0 
    ? addressArray 
    : (user.address ? [user.address] : []);

  // Map backend status directly - no transformation needed
  const status: OrderStatus = apiOrder.status || 'pending';

  return {
    id: apiOrder.id?.toString() || '',
    date: apiOrder.createdAt 
      ? new Date(apiOrder.createdAt).toLocaleDateString() 
      : new Date().toLocaleDateString(),
    status: status, // Use the status directly from backend
    shipTo: user.fullName || 'Unknown Customer',
    address: displayAddress.join(', '),
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    total: apiOrder.total || 0,
    savings: 0,
    deliveryDate: status === 'completed' ? undefined : '',
    trackOrder: status !== 'completed',
    customerName: user.fullName || 'Unknown Customer',
    customerEmail: user.email || '',
    phoneNumber: user.phone || '',
    userId: apiOrder.userId,
    isBulkOrder ,// Add flag to identify bulk orders
     // Add business information from user
    businessName: user.businessName,
    businessType: user.businessType,
    vatNumber: user.vatNumber,
    
  };
};

// Check if cache is stale
const isCacheStale = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_CONFIG.TTL;
};

// Update the OrdersList component with caching mechanism
export const OrdersList: React.FC<OrdersListProps> = ({ 
  onViewOrder, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordersState, setOrdersState] = useState<OrdersState>({
    orders: [],
    loading: true,
    error: null,
    lastUpdated: null,
    refreshing: false
  });

  // Get validated cache data
  const getValidatedCache = (): { data: any[]; timestamp: number } | null => {
    try {
      const cachedData = localStorage.getItem(`${CACHE_CONFIG.KEY}_${CACHE_CONFIG.VERSION}`);
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
        `${CACHE_CONFIG.KEY}_${CACHE_CONFIG.VERSION}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  // Force refresh orders
  const forceRefreshOrders = useCallback(async () => {
    try {
      setOrdersState(prev => ({ ...prev, refreshing: true }));
      const response = await ORDER_API.GET_ALL_ORDERS();

      console.log('All Orders:', response.data)
      
      if (response?.data && Array.isArray(response.data)) {
        setCache(response.data);
        const transformedOrders = response.data.map(transformApiOrder);
        setOrdersState(prev => ({
          ...prev,
          orders: transformedOrders,
          lastUpdated: Date.now(),
          error: null
        }));
      } else {
        setOrdersState(prev => ({
          ...prev,
          error: 'No orders found in response'
        }));
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      setOrdersState(prev => ({
        ...prev,
        error: 'Failed to load orders. Please try again.'
      }));
    } finally {
      setOrdersState(prev => ({ ...prev, refreshing: false }));
    }
  }, []);

  // Main function to get orders
  const getOrders = useCallback(async (forceRefresh = false) => {
    try {
      setOrdersState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if we have valid cache and don't need to force refresh
      if (!forceRefresh) {
        const cachedData = getValidatedCache();
        if (cachedData) {
          const transformedOrders = cachedData.data.map(transformApiOrder);
          setOrdersState(prev => ({
            ...prev,
            orders: transformedOrders,
            lastUpdated: cachedData.timestamp,
            loading: false
          }));
          return;
        }
      }
      
      // If no valid cache or force refresh, fetch from API
      await forceRefreshOrders();
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      // Fallback to cache even if stale when API fails
      const cachedData = localStorage.getItem(`${CACHE_CONFIG.KEY}_${CACHE_CONFIG.VERSION}`);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
            const transformedOrders = parsedData.data.map(transformApiOrder);
            setOrdersState(prev => ({
              ...prev,
              orders: transformedOrders,
              lastUpdated: parsedData.timestamp,
              error: 'Using cached data (connection issue)'
            }));
          }
        } catch (e) {
          console.error("Error using fallback cache:", e);
        }
      } else {
        setOrdersState(prev => ({
          ...prev,
          error: 'Failed to load orders. Please try again.'
        }));
      }
    } finally {
      setOrdersState(prev => ({ ...prev, loading: false }));
    }
  }, [forceRefreshOrders]);

  // Set up periodic refresh
  useEffect(() => {
    getOrders();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(() => {
      getOrders(true);
    }, CACHE_CONFIG.TTL);
    
    return () => clearInterval(intervalId);
  }, [getOrders]);

  // Set up real-time update checks
  useEffect(() => {
    // Check for updates every 30 seconds
    const updateCheckInterval = setInterval(() => {
      const cachedData = getValidatedCache();
      if (!cachedData || isCacheStale(cachedData.timestamp)) {
        getOrders(true);
      }
    }, CACHE_CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(updateCheckInterval);
  }, [getOrders]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    getOrders(true);
  };

  // Filter orders based on status and search
  const filteredOrders = ordersState.orders.filter(order => {
    const matchesStatus = order.status === activeStatus;
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status counts
  const statusCounts = Object.keys(STATUS_CONFIGS).reduce((acc, status) => {
    acc[status as OrderStatus] = ordersState.orders.filter(o => o.status === status).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  // Update EmptyState component to use OrderStatus
  const EmptyState: React.FC<{ activeStatus: OrderStatus; hasSearch: boolean }> = ({ activeStatus, hasSearch }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">
        No {STATUS_CONFIGS[activeStatus].label.toLowerCase()} orders
      </h3>
      <p className="text-slate-600 max-w-sm mx-auto">
        {hasSearch 
          ? 'Try adjusting your search criteria to find what you\'re looking for.' 
          : `You don't have any ${STATUS_CONFIGS[activeStatus].label.toLowerCase()} orders yet.`
        }
      </p>
    </motion.div>
  );

  if (ordersState.loading && ordersState.orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900"></div>
            <span className="ml-3 text-slate-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (ordersState.error && ordersState.orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Unable to load orders</h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">{ordersState.error}</p>
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with refresh button and last updated time */}
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
        <div className="flex items-center justify-between gap-4">
          {ordersState.lastUpdated && (
            <span className="text-sm text-slate-500">
              Last updated: {new Date(ordersState.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={ordersState.refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${ordersState.refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            {Object.entries(statusCounts).slice(0, 3).map(([status, count]) => {
              const config = STATUS_CONFIGS[status as OrderStatus];
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor}`}></div>
                  <span className="text-slate-600 font-medium">
                    {count} {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Status Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            {Object.entries(STATUS_CONFIGS).map(([status, config]) => {
              const statusKey = status as OrderStatus;
              const Icon = config.icon;
              const isActive = activeStatus === statusKey;
              
              return (
                <button 
                  key={status}
                  onClick={() => setActiveStatus(statusKey)}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-slate-900 bg-slate-50 border-b-2 border-slate-900' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {config.label}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {statusCounts[statusKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {ordersState.refreshing && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-slate-900"></div>
              <span className="ml-2 text-slate-600">Updating orders...</span>
            </div>
          )}
          
          {filteredOrders.length === 0 ? (
            <EmptyState activeStatus={activeStatus} hasSearch={!!searchQuery} />
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    onViewOrder={onViewOrder}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

// StatusBadge component
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = STATUS_CONFIGS[status];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

// OrderCard component
const OrderCard: React.FC<{ 
  order: Order; 
  index: number; 
  onViewOrder: (order: Order) => void;
}> = ({ order, index, onViewOrder }) => {
  // Check if this is a bulk order
  const isBulkOrder = order.isBulkOrder || order.items.some(item => item.isBulk);

   // Check if this is a business order
  const isBusinessOrder = (order as any).businessName; 
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 overflow-hidden"
    >
      {/* Order Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Order Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Order Placed</p>
              <p className="font-semibold text-slate-900">{order.date}</p>
            </div>
          </div>
          
          {/* Ship To */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Ship To</p>
              <p className="font-semibold text-slate-900 truncate">{order.shipTo}</p>
              <p className="text-sm text-slate-600 truncate">{order.address}</p>
            </div>
          </div>
          
          {/* Order ID & Status */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {isBulkOrder ? (
                <Layers className="w-4 h-4 text-purple-600" />
              ) : (
                <Package className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {isBulkOrder ? 'Bulk Order #' : 'Order #'}
              </p>
              <p className="font-semibold text-slate-900 truncate">{order.id}</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={order.status} />
                {isBulkOrder && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Layers className="w-3 h-3" />
                    Bulk
                  </span>
                )}
                 {/* ADD BUSINESS BADGE HERE */}
                {isBusinessOrder && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <Building2 className="w-3 h-3" />
                    Business
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-start justify-end">
            <button
              onClick={() => onViewOrder(order)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Product Images */}
            <div className="flex -space-x-1">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '../../../public/logo.png';
                    }}
                  />
                  {item.isBranded && (
                    <div className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-xs px-1 py-0.5 rounded-full font-medium">
                      C
                    </div>
                  )}
                  {item.isBulk && (
                    <div className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full font-medium">
                      B
                    </div>
                  )}
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-600">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>
            
            {/* Item Summary */}
            <div>
              <p className="font-medium text-slate-900 mb-1">
                {isBulkOrder ? (
                  <>
                    {order.items[0]?.bulkTotalItems || order.itemCount} items in collection
                    {order.items[0]?.studentInfo && (
                      <span className="text-sm text-slate-600 ml-2">
                        • {order.items[0].studentInfo.studentName} • {order.items[0].studentInfo.grade}
                      </span>
                    )}
                  </>
                ) : (
                  `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`
                )}
              </p>
              {order.deliveryDate && order.status === 'pending' && (
                <p className="text-sm text-slate-600">
                  Expected: {order.deliveryDate}
                </p>
              )}
              {isBulkOrder && order.items[0]?.collectionName && (
                <p className="text-sm text-blue-600 font-medium">
                  {order.items[0].collectionName}
                </p>
              )}
            </div>
          </div>
          
          {/* Price & Track */}
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 mb-1">
              ZAR {order.total.toFixed(2)}
            </p>
            {order.savings! > 0 && (
              <p className="text-sm text-emerald-600 font-medium mb-2">
                Saved ZAR {order.savings?.toFixed(2)}
              </p>
            )}
            {/* {order.trackOrder && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200 text-sm mt-2"
              >
                <Truck className="w-4 h-4" />
                Track
              </button>
            )} */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Pagination component
const Pagination: React.FC<{ 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 inline-flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let page;
        if (totalPages <= 7) {
          page = i + 1;
        } else if (currentPage <= 4) {
          page = i + 1;
        } else if (currentPage >= totalPages - 3) {
          page = totalPages - 6 + i;
        } else {
          page = currentPage - 3 + i;
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 p-0 justify-center inline-flex items-center rounded-lg font-medium transition-all duration-200 ${
              currentPage === page 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        );
      })}
      
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 inline-flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};