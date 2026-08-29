"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share,
  Star,
  User,
  Settings,
  X,
  Save,
  RotateCcw,
  Truck,
  MessageSquare,
  EyeOff,
  Eye,
  Layers, // Added for bulk orders
  Users, // Added for student info
  BookOpen,
  Building2, // Added for grade info
} from "lucide-react";
import {
  DesignCommunication,
  DesignRevision,
  IBrandedArtwork,
  Order,
  OrderItem,
} from "@/interfaces/order/order";
import BrandingDetailsModal from "./BrandingDetailsModal";
import BrandingDesignSection from "./BrandingDesignSection";
import CommunicationModal, { Communication } from "./CommunicationModal";
import { ORDER_API } from "@/endpoints/rest-api/order";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";

// Types

interface OrderDetailProps {
  order: Order;
  onStatusChange?: (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => void;
  onBack?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STATUS_CONFIGS = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    bgColor: "bg-amber-500",
    description: "Order has been placed and is awaiting processing",
  },
  shipped: {
    label: "Shipped",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
    bgColor: "bg-blue-500",
    description: "Order has been shipped and is on its way",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    bgColor: "bg-emerald-500",
    description: "Order has been successfully delivered and completed",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
    bgColor: "bg-rose-500",
    description: "Order has been cancelled and will not be processed",
  },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIGS;

// Helper function to safely render values
const safeRender = (value: any, fallback: string = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "Yes" : "No";

  // If it's an object, try to get a meaningful string representation
  if (typeof value === "object") {
    // Try common object properties that might contain display values
    if (value.name) return safeRender(value.name, fallback);
    if (value.productName) return safeRender(value.productName, fallback);
    if (value.title) return safeRender(value.title, fallback);
    if (value.label) return safeRender(value.label, fallback);

    // If it's an array, join with commas
    if (Array.isArray(value)) {
      return (
        value
          .map((item) => safeRender(item, ""))
          .filter(Boolean)
          .join(", ") || fallback
      );
    }

    // Last resort: stringify the object (but be careful with circular references)
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

// Helper function to get product image URL safely
const getProductImage = (product: any): string => {
  if (!product) return "/logo.png";

  // Try different possible image paths
  if (product.image) return product.image;
  if (product.product?.images?.[0]?.urls?.[0]?.url)
    return product.product.images[0].urls[0].url;
  if (product.images?.[0]?.urls?.[0]?.url) return product.images[0].urls[0].url;
  if (product.productImage) return product.productImage;

  return "/logo.png";
};

// Helper function to get product name safely
const getProductName = (product: any): string => {
  if (!product) return "Unknown Product";

  // Try different possible name properties
  if (product.name) return safeRender(product.name);
  if (product.productName) return safeRender(product.productName);
  if (product.product?.productName)
    return safeRender(product.product.productName);
  if (product.product?.name) return safeRender(product.product.name);

  return "Unknown Product";
};

// Bulk Products Modal Component
const BulkProductsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  bulkProducts: any[];
  collectionName?: string;
  studentInfo?: any;
}> = ({ isOpen, onClose, bulkProducts, collectionName, studentInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Bulk Stationery Collection
                </h3>
                <p className="text-sm text-slate-600">
                  {safeRender(collectionName, "Complete Stationery Set")}
                </p>
                {studentInfo && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {safeRender(studentInfo.studentName)}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {safeRender(studentInfo.grade)}
                    </div>
                    {studentInfo.studentNumber && (
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        {safeRender(studentInfo.studentNumber)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulkProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-3">
                    <img
                      src={getProductImage(product)}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-2">
                      {getProductName(product)}
                    </h4>

                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Quantity: {safeRender(product.quantity, "1")}</span>
                      {product.price && (
                        <span className="font-semibold text-slate-900">
                          ZAR{" "}
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : "0.00"}
                        </span>
                      )}
                    </div>

                    {product.category && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>Category:</span>
                        <span className="font-medium">
                          {safeRender(product.category)}
                        </span>
                      </div>
                    )}

                    {product.brand && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>Brand:</span>
                        <span className="font-medium">
                          {safeRender(product.brand)}
                        </span>
                      </div>
                    )}

                    {/* Additional product information */}
                    {(product.code || product.fullCode) && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>Code:</span>
                        <span className="font-medium">
                          {safeRender(product.code || product.fullCode)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {bulkProducts.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-medium text-slate-900 mb-2">
                  No products found
                </h4>
                <p className="text-slate-600 text-sm">
                  There are no products in this bulk collection.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              Total: {bulkProducts.length} items in collection
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Status Change Modal Component (unchanged, keeping it for completeness)
const StatusChangeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentStatus: OrderStatus;
  orderId: string;
  onStatusChange: (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => void;
}> = ({ isOpen, onClose, currentStatus, orderId, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedStatus === currentStatus && !notes.trim()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      onStatusChange(orderId, selectedStatus, notes.trim() || undefined);
      onClose();
      setNotes("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Update Order Status
              </h3>
              <p className="text-sm text-slate-600">Order #{orderId}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Current Status
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${STATUS_CONFIGS[currentStatus].bgColor}`}
                ></div>
                <span className="font-medium text-slate-900">
                  {STATUS_CONFIGS[currentStatus].label}
                </span>
              </div>
            </div>

            {/* Status Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Change Status To
              </p>
              {Object.entries(STATUS_CONFIGS).map(([status, config]) => {
                const statusKey = status as OrderStatus;
                const Icon = config.icon;
                const isSelected = selectedStatus === statusKey;
                const isCurrent = currentStatus === statusKey;

                return (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedStatus(statusKey)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    } ${isCurrent ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 ${
                          config.color.split(" ")[0]
                        } rounded-lg`}
                      >
                        <Icon
                          className={`w-4 h-4 ${config.color.split(" ")[1]}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">
                            {config.label}
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {config.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Status
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Utility Components
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  );
};

const ActionButton: React.FC<{
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

const InfoCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  iconBg?: string;
}> = ({ icon: Icon, title, subtitle, children, iconBg = "bg-slate-100" }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
    <div className={`p-2.5 ${iconBg} rounded-lg`}>
      <Icon className="w-5 h-5 text-slate-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
        {title}
      </p>
      <div className="text-slate-900">{children}</div>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ItemCard: React.FC<{
  item: Order["items"][0];
  index: number;
  order: Order;
  designHistories: Record<string, any[]>;
  loadingStates: Record<string, boolean>;
  onDiscussDesign: (item: OrderItem) => void;
  onMockupUpload: (
    files: File[],
    notes: string,
    product: OrderItem
  ) => Promise<void>;
  onViewBulkProducts?: (item: OrderItem) => void;
}> = ({
  item,
  index,
  order,
  designHistories,
  loadingStates,
  onDiscussDesign,
  onMockupUpload,
  onViewBulkProducts,
}) => {
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showDesignSection, setShowDesignSection] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden"
      >
        {/* Mobile & Tablet Layout (< lg) */}
        <div className="lg:hidden">
          <div className="p-4 sm:p-5">
            {/* Header: Image + Title + Badge */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              {/* Product Image */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/image.png";
                    }}
                  />
                </div>
                {item.isBranded && (
                  <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                    Custom
                  </div>
                )}
                {item.isBulk && (
                  <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                    Bulk
                  </div>
                )}
              </div>

              {/* Title + Student Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-2 line-clamp-2">
                  {safeRender(item.name)}
                </h3>
                {item.isBulk && item.studentInfo && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[100px]">
                      {safeRender(item.studentInfo.studentName)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span>{safeRender(item.studentInfo.grade)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                  Price
                </p>
                <p className="text-sm sm:text-base text-slate-900 font-semibold">
                  ZAR{" "}
                  {typeof item.price === "number"
                    ? item.price.toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                  Quantity
                </p>
                <p className="text-sm sm:text-base text-slate-900 font-semibold">
                  {safeRender(item.quantity)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                  Category
                </p>
                <p className="text-xs sm:text-sm text-slate-700 truncate">
                  {safeRender(item.category)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                  Type
                </p>
                <p className="text-xs sm:text-sm text-slate-700 truncate">
                  {item.isBulk
                    ? "Bulk"
                    : item.isBranded
                    ? "Custom"
                    : "Regular"}
                </p>
              </div>
            </div>

            {/* Subtotal */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Subtotal
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  ZAR{" "}
                  {typeof item.price === "number" &&
                  typeof item.quantity === "number"
                    ? (item.price * item.quantity).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              {item.isBulk && item.bulkTotalPrice && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">Collection Total</p>
                  <p className="text-xs font-semibold text-blue-600">
                    ZAR{" "}
                    {typeof item.bulkTotalPrice === "number"
                      ? item.bulkTotalPrice.toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Bulk Products Button */}
              {item.isBulk && item.bulkProducts && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onViewBulkProducts?.(item)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  View Collection ({item.bulkProducts.length} items)
                </motion.button>
              )}

              {/* Branding Actions */}
              {item.isBranded && item.brandingConfig && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowBrandingModal(true)}
                    className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                  >
                    Branding Details
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowDesignSection(!showDesignSection)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                  >
                    {showDesignSection ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="hidden sm:inline">Hide Design</span>
                        <span className="sm:hidden">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Show Design</span>
                        <span className="sm:hidden">Show</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout (>= lg) */}
        <div className="hidden lg:flex items-center gap-6 p-6">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/image.png";
                }}
              />
            </div>
            {item.isBranded && (
              <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                Custom
              </div>
            )}
            {item.isBulk && (
              <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                Bulk
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-base line-clamp-2 max-w-md">
                {safeRender(item.name)}
              </h3>
              {item.isBulk && item.studentInfo && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                  <Users className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">
                    {safeRender(item.studentInfo.studentName)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <BookOpen className="w-3.5 h-3.5" />
                  {safeRender(item.studentInfo.grade)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-500 font-medium mb-1">Price</p>
                <p className="text-slate-900 font-semibold">
                  ZAR{" "}
                  {typeof item.price === "number"
                    ? item.price.toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Quantity</p>
                <p className="text-slate-900 font-semibold">
                  {safeRender(item.quantity)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Category</p>
                <p className="text-slate-700 truncate">
                  {safeRender(item.category)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Type</p>
                <p className="text-slate-700 truncate">
                  {item.isBulk
                    ? "Bulk Collection"
                    : item.isBranded
                    ? "Custom Branded"
                    : "Regular"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {/* Bulk Products Button */}
              {item.isBulk && item.bulkProducts && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewBulkProducts?.(item)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  View Collection ({item.bulkProducts.length} items)
                </motion.button>
              )}

              {/* Branding Actions */}
              {item.isBranded && item.brandingConfig && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBrandingModal(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                  >
                    Branding Details
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDesignSection(!showDesignSection)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                  >
                    {showDesignSection ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Design
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Design
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="text-right flex-shrink-0 min-w-[140px]">
            <p className="text-sm text-slate-500 font-medium mb-1">Subtotal</p>
            <p className="text-xl font-bold text-slate-900">
              ZAR{" "}
              {typeof item.price === "number" &&
              typeof item.quantity === "number"
                ? (item.price * item.quantity).toFixed(2)
                : "0.00"}
            </p>
            {item.isBulk && item.bulkTotalPrice && (
              <p className="text-xs text-blue-600 font-medium mt-1.5">
                Collection Total: ZAR{" "}
                {typeof item.bulkTotalPrice === "number"
                  ? item.bulkTotalPrice.toFixed(2)
                  : "0.00"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Branding Design Section */}
      {item.isBranded && item.brandingConfig && showDesignSection && (
        <div className="mt-2">
          <BrandingDesignSection
            order={order}
            product={item}
            brandedArtworks={designHistories[item.id] || []}
            loading={loadingStates[item.id] || false}
            onMockupUpload={onMockupUpload}
            onStatusChange={(status, notes) => {
              console.log(
                `Status changed to ${status} for product:`,
                item.name,
                notes
              );
            }}
          />
        </div>
      )}

      {/* Branding Details Modal */}
      {item.isBranded && item.brandingConfig && (
        <BrandingDetailsModal
          isOpen={showBrandingModal}
          onClose={() => setShowBrandingModal(false)}
          brandingSetup={item.brandingConfig}
          productName={item.name}
          productImages={item.product?.images || []}
        />
      )}
    </>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1">
      <ActionButton
        variant="ghost"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2"
      >
        <ChevronLeft className="w-4 h-4" />
      </ActionButton>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <ActionButton
          key={page}
          variant={currentPage === page ? "primary" : "ghost"}
          onClick={() => onPageChange(page)}
          className="w-10 h-10 p-0 justify-center"
        >
          {page}
        </ActionButton>
      ))}

      <ActionButton
        variant="ghost"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2"
      >
        <ChevronRight className="w-4 h-4" />
      </ActionButton>
    </div>
  );
};

// Main Component
export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onStatusChange,
  onBack,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showBulkProductsModal, setShowBulkProductsModal] = useState(false);
  const [selectedBulkItem, setSelectedBulkItem] = useState<OrderItem | null>(
    null
  );
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(
    null
  );
  const [designHistories, setDesignHistories] = useState<
    Record<string, IBrandedArtwork[]>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Check if this is a bulk order
  const isBulkOrder =
    order.isBulkOrder || order.items.some((item) => item.isBulk);

  // Fetch design histories for branded products
  useEffect(() => {
    const fetchDesignHistories = async () => {
      const brandedProducts = order.items.filter((item) => item.isBranded);

      for (const product of brandedProducts) {
        try {
          setLoadingStates((prev) => ({ ...prev, [product.id]: true }));

          const response = await ORDER_API.GET_DESIGN_HISTORY(
            parseInt(order.id),
            product.id
          );

          if (response.error === false && response.data) {
            setDesignHistories((prev) => ({
              ...prev,
              [product.id]: response.data,
            }));
          }
        } catch (error) {
          console.error(
            `Failed to fetch design history for product ${product.id}:`,
            error
          );
        } finally {
          setLoadingStates((prev) => ({ ...prev, [product.id]: false }));
        }
      }
    };

    if (order.items.some((item) => item.isBranded)) {
      fetchDesignHistories();
    }
  }, [order.id, order.items]);

  const handleDiscussDesign = (item: OrderItem) => {
    setSelectedProduct(item);
    setShowCommunicationModal(true);
  };

  const handleViewBulkProducts = (item: OrderItem) => {
    setSelectedBulkItem(item);
    setShowBulkProductsModal(true);
  };

  const handleMockupUpload = async (
    files: File[],
    notes: string,
    product: OrderItem
  ) => {
    try {
      const decodedToken = decodeAccessToken();
      const adminId = decodedToken?.id;

      if (!adminId) {
        throw new Error("Admin ID not found in token");
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResponse = await ORDER_API.UPLOAD_FILE(formData);

      if (uploadResponse.error === true) {
        throw new Error(uploadResponse.message || "Failed to upload files");
      }

      let uploadedUrl: string;

      if (typeof uploadResponse.data === "string") {
        uploadedUrl = uploadResponse.data;
      } else if (uploadResponse.data?.url) {
        uploadedUrl = uploadResponse.data.url;
      } else if (
        uploadResponse.data?.urls &&
        Array.isArray(uploadResponse.data.urls) &&
        uploadResponse.data.urls.length > 0
      ) {
        uploadedUrl = uploadResponse.data.urls[0];
      } else {
        throw new Error("Invalid response format from file upload");
      }

      const mockupData = {
        itemId: product.id,
        url: uploadedUrl,
        notes: notes,
        adminId: adminId,
      };

      console.log("Adding mockup:", mockupData);

      const addMockupResponse = await ORDER_API.ADD_MOCKUP_TO_ORDER(
        parseInt(order.id),
        mockupData
      );

      console.log("Mockup response:", addMockupResponse);

      if (addMockupResponse.error) {
        console.error("Failed to add mockup:", addMockupResponse.message);
        throw new Error(addMockupResponse.message);
      }

      try {
        const historyResponse = await ORDER_API.GET_DESIGN_HISTORY(
          parseInt(order.id),
          product.id
        );

        if (historyResponse.error === false && historyResponse.data) {
          setDesignHistories((prev) => ({
            ...prev,
            [product.id]: historyResponse.data,
          }));
        }
      } catch (error) {
        console.error("Failed to refresh design history:", error);
      }

      console.log("Mockup uploaded successfully");
    } catch (error) {
      console.error("Failed to upload mockup:", error);
      alert(
        "Failed to upload mockup: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleStatusChange = (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => {
    if (onStatusChange) {
      onStatusChange(orderId, newStatus, notes);
    }
  };

  // Find all branded products in this order
  const brandedProducts = order.items.filter(
    (item) => item.isBranded && item.brandingConfig
  );

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                {onBack && (
                  <ActionButton
                    onClick={onBack}
                    variant="ghost"
                    className="p-2 text-white bg-white/10 border-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </ActionButton>
                )}
                <div className="flex items-center gap-3">
                  {isBulkOrder && (
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-semibold">Order #{order.id}</h1>
                    <p className="text-slate-300 text-sm">
                      {isBulkOrder
                        ? "Bulk Stationery Order Management"
                        : "Admin order management"}
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <ActionButton
                  variant="ghost"
                  className="text-white bg-white/10 border-0"
                >
                  <Share className="w-4 h-4" />
                  Share
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  className="text-white bg-white/10 border-0"
                >
                  <Download className="w-4 h-4" />
                  Export
                </ActionButton>
              </div> */}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={Package}
                    title="Order Status"
                    iconBg="bg-slate-100"
                  >
                    <div className="flex  gap-3 flex-col">
                      {/* <p className="font-semibold text-lg">#{order.id}</p> */}
                      <StatusBadge status={order.status as OrderStatus} />
                      {isBulkOrder && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <Layers className="w-3 h-3" />
                          Bulk Order
                        </span>
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={Calendar}
                    title="Order Date"
                    subtitle={
                      order.deliveryDate
                        ? `Expected: ${order.deliveryDate}`
                        : undefined
                    }
                    iconBg="bg-blue-100"
                  >
                    <p className="font-semibold text-lg">{order.date}</p>
                  </InfoCard>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  {/* Business Information - Only show if user has business details */}
                  {order.businessName && (
                    <div className="p-4 sm:p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">
                            Business Information
                          </h3>
                          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                                Business Name
                              </p>
                              <p className="font-medium text-blue-900 text-sm sm:text-base break-words">
                                {safeRender(order.businessName)}
                              </p>
                            </div>
                            {order.businessType && (
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                                  Business Type
                                </p>
                                <p className="text-blue-800 text-sm sm:text-base">
                                  {safeRender(order.businessType)}
                                </p>
                              </div>
                            )}
                            {order.vatNumber && (
                              <div className="sm:col-span-2">
                                <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                                  VAT Number
                                </p>
                                <p className="text-blue-800 text-sm sm:text-base break-all">
                                  {safeRender(order.vatNumber)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="p-4 sm:p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-slate-100 rounded-lg shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-3 text-sm sm:text-base">
                          Customer Information
                        </h3>
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                              Customer Name
                            </p>
                            <p className="font-medium text-slate-900 text-sm sm:text-base break-words">
                              {safeRender(order.shipTo)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                              Shipping Method
                            </p>
                            <p
                              className={`font-semibold text-sm sm:text-base ${
                                order.total > 2000
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {order.total > 2000
                                ? "Free Delivery"
                                : "Standard Delivery"}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                              Shipping Address
                            </p>
                            <p className="text-slate-700 text-sm sm:text-base break-words">
                              {safeRender(order.address)}
                            </p>
                          </div>
                        </div>

                        {/* Student Information for Bulk Orders */}
                        {isBulkOrder && order.items[0]?.studentInfo && (
                          <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-3 text-xs sm:text-sm">
                              Student Information
                            </h4>
                            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                              <div>
                                <p className="text-blue-700 font-medium mb-1">
                                  Student Name
                                </p>
                                <p className="text-blue-900 break-words">
                                  {safeRender(
                                    order.items[0].studentInfo.studentName
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-700 font-medium mb-1">
                                  Grade
                                </p>
                                <p className="text-blue-900">
                                  {safeRender(order.items[0].studentInfo.grade)}
                                </p>
                              </div>
                              {order.items[0].studentInfo.studentNumber && (
                                <div className="sm:col-span-2">
                                  <p className="text-blue-700 font-medium mb-1">
                                    Student Number
                                  </p>
                                  <p className="text-blue-900 break-all">
                                    {safeRender(
                                      order.items[0].studentInfo.studentNumber
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 sticky top-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Order Management
                  </h3>

                  {/* Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {isBulkOrder ? "Collections" : "Items"} (
                        {order.itemCount})
                      </span>
                      <span className="font-medium">
                        ZAR{" "}
                        {typeof order.total === "number"
                          ? order.total.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    {isBulkOrder && order.items[0]?.bulkTotalItems && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Total Items in Collection</span>
                        <span className="font-medium">
                          {safeRender(order.items[0].bulkTotalItems)}
                        </span>
                      </div>
                    )}
                    {order.savings! > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Savings</span>
                        <span className="font-medium">
                          -ZAR{" "}
                          {typeof order.savings === "number"
                            ? order.savings.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          ZAR{" "}
                          {typeof order.total === "number"
                            ? order.total.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <ActionButton
                      variant="primary"
                      className="w-full justify-center"
                      onClick={() => setShowStatusModal(true)}
                    >
                      <Settings className="w-4 h-4" />
                      Update Status
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {isBulkOrder ? "Stationery Collections" : "Order Items"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {order.items.length} {isBulkOrder ? "collection" : "item"}
                  {order.items.length !== 1 ? "s" : ""} in this order
                  {isBulkOrder && order.items[0]?.bulkTotalItems && (
                    <span className="text-blue-600 font-medium ml-2">
                      • {safeRender(order.items[0].bulkTotalItems)} total items
                    </span>
                  )}
                </p>
              </div>
              {isBulkOrder && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Layers className="w-4 h-4" />
                  Bulk Stationery Order
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <ItemCard
                  key={`${item.id}-${index}`}
                  item={item}
                  index={index}
                  order={order}
                  designHistories={designHistories}
                  loadingStates={loadingStates}
                  onDiscussDesign={handleDiscussDesign}
                  onMockupUpload={handleMockupUpload}
                  onViewBulkProducts={handleViewBulkProducts}
                />
              ))}
            </div>
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

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <StatusChangeModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            currentStatus={order.status as OrderStatus}
            orderId={order.id}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Bulk Products Modal */}
      <AnimatePresence>
        {showBulkProductsModal && selectedBulkItem && (
          <BulkProductsModal
            isOpen={showBulkProductsModal}
            onClose={() => setShowBulkProductsModal(false)}
            bulkProducts={selectedBulkItem.bulkProducts || []}
            collectionName={selectedBulkItem.collectionName}
            studentInfo={selectedBulkItem.studentInfo}
          />
        )}
      </AnimatePresence>
    </>
  );
};
