"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ArrowLeft,
  Users,
  ShoppingCart,
  ChevronRight,
  Package,
  GraduationCap,
  Check,
  Minus,
  Zap,
  Plus,
  User,
  BookOpen,
  School,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Banner from "@/components/common/Banner";
import ProductGrid from "@/components/shop/ProductGrid";
import { Sidebar } from "@/components/shop/Sidebar";
import Pagination from "@/components/common/Pagination";
import { Brand, IProduct } from "@/interfaces/product/product";
import { IGrade, IGradeWithSchool } from "@/interfaces/grade/grade";
import { GRADE_API } from "@/endpoints/rest-api/grade";
import { GRADE_STATIONERY_API } from "@/endpoints/rest-api/gradeStationery";
import { STATIONERY_API } from "@/endpoints/rest-api/stationery";
import {
  ProductGridSkeleton,
  SidebarSkeleton,
  Skeleton,
} from "@/components/skeleton/ProductSkeleton";
import { useSmartAlert } from "@/components/common/SmartAlert";
import { CART_API } from "@/endpoints/rest-api/cart";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { IAddCartItem, ICartItem } from "@/interfaces/cart/cart";
import { v4 as uuidv4 } from "uuid";
import { HeroCarousel } from "./GradePage";
import { useCart } from "@/hooks/cart";
import { IAggregatedProduct } from "@/interfaces/aggregated-product/aggregated-product";

const PRODUCTS_PER_PAGE = 12;

interface SidebarCategory {
  name: string;
  subCategories: string[] | null;
}

// Updated interfaces for collections
interface IProductCollection {
  id: string;
  name: string;
  description: string;
  products: IProductWithQuantity[];
  totalPrice: number;
  imageUrl?: string;
}

// Interface for product with quantity (extended from IAggregatedProduct)
interface IProductWithQuantity extends IAggregatedProduct {
  quantity: number;
  isInStock: boolean;
  minQuantity?: number;
}

// Interface for bulk cart item with school info
interface IBulkCartItem extends ICartItem {
  isBulk: true;
  collectionName: string;
  collectionId: string;
  bulkProducts: any[];
  bulkTotalPrice: number;
  bulkTotalItems: number;
  studentInfo?: StudentInfo;
  schoolInfo?: SchoolInfo;
}

// Interface for school information
interface SchoolInfo {
  schoolId: number;
  schoolName: string;
  schoolCode: string;
}

// Interface for student information
interface StudentInfo {
  studentNumber: string;
  studentName: string;
  grade: string;
}

// Interface for the new API response
interface IStationeryWithProductsResponse {
  stationery: {
    id: number;
    gradeId: number;
    stationeryItems: Array<{
      productCode: string;
      minQuantity: number;
    }>;
    fileUrl: string | null;
    totalItems: number;
    createdAt: string;
    updatedAt: string;
  };
  products: IAggregatedProduct[];
  gradeInfo: {
    gradeId: number;
    gradeName: string;
    schoolName: string;
  };
}

// NEW: Student Info Modal Component with School Info
const StudentInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (studentInfo: StudentInfo) => void;
  collection: IProductCollection | null;
  gradeName: string;
  schoolName: string;
}> = ({ isOpen, onClose, onConfirm, collection, gradeName, schoolName }) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [errors, setErrors] = useState<{
    studentNumber?: string;
    studentName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { studentNumber?: string; studentName?: string } = {};

    if (!studentNumber.trim()) {
      newErrors.studentNumber = "Student number is required";
    } else if (!/^\d+$/.test(studentNumber)) {
      newErrors.studentNumber = "Student number must contain only numbers";
    }

    if (!studentName.trim()) {
      newErrors.studentName = "Student name is required";
    } else if (studentName.trim().length < 2) {
      newErrors.studentName = "Student name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onConfirm({
        studentNumber: studentNumber.trim(),
        studentName: studentName.trim(),
        grade: gradeName,
      });
      // Reset form
      setStudentNumber("");
      setStudentName("");
      setErrors({});
    }
  };

  const handleClose = () => {
    setStudentNumber("");
    setStudentName("");
    setErrors({});
    onClose();
  };

  if (!collection) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#155874] to-[#3A4A9E] p-6 text-white rounded-t-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <User className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold">Student Information</h2>
                    </div>
                    <p className="text-blue-100 text-sm">
                      Please provide the student details for this stationery
                      pack
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-4 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#155874]" />
                  <div>
                    <h3 className="font-semibold text-[#155874] text-sm">
                      {collection.name}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {collection.products.length} items • ZAR{" "}
                      {collection.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Student Number */}
                  <div>
                    <label
                      htmlFor="studentNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student Number *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        id="studentNumber"
                        type="text"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        placeholder="Enter student number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors ${
                          errors.studentNumber
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.studentNumber && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.studentNumber}
                      </p>
                    )}
                  </div>

                  {/* Student Name */}
                  <div>
                    <label
                      htmlFor="studentName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        id="studentName"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter student's full name"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors ${
                          errors.studentName
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.studentName && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.studentName}
                      </p>
                    )}
                  </div>

                  {/* School and Grade Display */}
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">School:</span>
                        <span className="font-semibold text-[#155874]">
                          {schoolName}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Grade:</span>
                        <span className="font-semibold text-[#155874]">
                          {gradeName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#155874] text-white rounded-lg hover:bg-[#3A4A9E] transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Cache for grade stationery data
const gradeStationeryCache = new Map();

// Beautiful Collection Card Component
const CollectionCard: React.FC<{
  collection: IProductCollection;
  onAddToCart: (
    collection: IProductCollection,
    selectedProducts?: IProductWithQuantity[]
  ) => void;
  onViewDetails: (collection: IProductCollection) => void;
}> = ({ collection, onAddToCart, onViewDetails }) => {
  const getProductImage = (product: IProductWithQuantity): string => {
    const defaultImage =
      product.images.find((img) => img.isDefault) || product.images[0];
    return (
      defaultImage?.urls.find((url) => url.width >= 300)?.url ||
      defaultImage?.urls[0]?.url ||
      "/placeholder-product.png"
    );
  };

  const displayedProducts = collection.products.slice(0, 4);
  const remainingCount = collection.products.length - 4;

  return (
    <motion.div
      className="bg-white rounded-2xl min-w-xs shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Collection Header with Gradient */}
      <div className="bg-gradient-to-br from-[#155874] via-[#3A4A9E] to-[#4B5BC0] p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-xl leading-tight mb-2">
                {collection.name}
              </h3>
              
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30">
                {collection.products.length} items
              </span>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full border border-white/30">
                <Package className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-bold">PACK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Image Collage */}
      <div className="p-5">
        <div className="relative mb-4">
          <div className="grid grid-cols-4 gap-2 h-24 rounded-xl overflow-hidden">
            {displayedProducts.map((product, index) => (
              <div
                key={product.fullCode}
                className={`relative rounded-lg overflow-hidden ${
                  index === 0 ? "col-span-2 row-span-2" : ""
                } ${index === 1 ? "col-span-1 row-span-1" : ""} ${
                  index === 2 ? "col-span-1 row-span-1" : ""
                }`}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.productName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {remainingCount > 0 && index === 3 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      +{remainingCount} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ZAR {collection.totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Complete stationery pack
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(collection);
              }}
              className="flex-1 px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-2 group/btn"
            >
              <svg
                className="w-4 h-4 text-gray-600 group-hover/btn:text-[#155874] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                />
              </svg>
              Customize
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(collection);
              }}
              className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-[#155874] to-[#3A4A9E] text-white rounded-xl hover:from-[#3A4A9E] hover:to-[#4B5BC0] transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <Package className="w-4 h-4" />
              Add Pack
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Quantity Selector Component
const QuantitySelector: React.FC<{
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxStock: number;
  productName: string;
}> = ({ quantity, onQuantityChange, maxStock, productName }) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < maxStock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div
      className="flex items-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-sm text-gray-600 font-medium">Qty:</span>
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-1">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
            quantity <= 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          aria-label={`Decrease quantity for ${productName}`}
        >
          <Minus className="w-3 h-3" />
        </button>

        <span className="w-8 text-center text-sm font-bold text-gray-800">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantity >= maxStock}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
            quantity >= maxStock
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          aria-label={`Increase quantity for ${productName}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {maxStock > 0 && (
        <span className="text-xs text-gray-500">Max: {maxStock}</span>
      )}
    </div>
  );
};

// Collection Details Modal
const CollectionDetailsModal: React.FC<{
  collection: IProductCollection | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    collection: IProductCollection,
    selectedProducts?: IProductWithQuantity[]
  ) => void;
}> = ({ collection, isOpen, onClose, onAddToCart }) => {
  const [selectedProducts, setSelectedProducts] = useState<
    IProductWithQuantity[]
  >([]);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (collection) {
      const initialProducts: IProductWithQuantity[] = collection.products
        .filter((product) => (product.stockInfo?.stock || 0) > 0)
        .map((product) => ({
          ...product,
          quantity: product.minQuantity || 1,
          isInStock: (product.stockInfo?.stock || 0) > 0,
        }));

      setSelectedProducts(initialProducts);
      setSelectAll(initialProducts.length > 0);
    }
  }, [collection]);

  if (!collection) return null;

  const getProductImage = (product: IProductWithQuantity): string => {
    const defaultImage =
      product.images.find((img) => img.isDefault) || product.images[0];
    return (
      defaultImage?.urls.find((url) => url.width >= 300)?.url ||
      defaultImage?.urls[0]?.url ||
      "/placeholder-product.png"
    );
  };

  const toggleProductSelection = (product: IProductWithQuantity) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.fullCode === product.fullCode);
      if (isSelected) {
        const updated = prev.filter((p) => p.fullCode !== product.fullCode);
        if (updated.length === 0) setSelectAll(false);
        return updated;
      } else {
        const updated = [...prev, product];
        if (
          updated.length ===
          collection.products.filter((p) => (p.stockInfo?.stock || 0) > 0)
            .length
        )
          setSelectAll(true);
        return updated;
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      const allInStockProducts: IProductWithQuantity[] = collection.products
        .filter((product) => (product.stockInfo?.stock || 0) > 0)
        .map((product) => ({
          ...product,
          quantity: product.minQuantity || 1,
          isInStock: true,
        }));
      setSelectedProducts(allInStockProducts);
      setSelectAll(true);
    }
  };

  const updateProductQuantity = (productCode: string, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.fullCode === productCode
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  const selectedTotalPrice = selectedProducts.reduce(
    (sum, product) => sum + (product.price || 0) * product.quantity,
    0
  );

  const totalItemsCount = selectedProducts.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const handleAddSelectedToCart = () => {
    if (selectedProducts.length === 0) return;

    const selectedCollection: IProductCollection = {
      ...collection,
      products: selectedProducts,
      totalPrice: selectedTotalPrice,
    };

    onAddToCart(selectedCollection, selectedProducts);
    onClose();
  };

  const inStockProducts = collection.products.filter(
    (product) => (product.stockInfo?.stock || 0) > 0
  );
  const outOfStockProducts = collection.products.filter(
    (product) => (product.stockInfo?.stock || 0) <= 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#155874] to-[#3A4A9E] p-6 text-white flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">
                      {collection.name}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {collection.description}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-4 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {selectedProducts.length}/{inStockProducts.length}{" "}
                      Selected
                    </div>
                    <div className="text-blue-100 text-sm">
                      {totalItemsCount} total items
                    </div>
                  </div>
                  <button
                    onClick={toggleSelectAll}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectAll
                        ? "bg-white text-[#155874] hover:bg-blue-100"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {selectAll ? "Deselect All" : "Select All"}
                  </button>
                </div>
              </div>

              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Items ({inStockProducts.length})
                  </h3>
                  {inStockProducts.map((product) => {
                    const imageUrl = getProductImage(product);
                    const selectedProduct = selectedProducts.find(
                      (p) => p.fullCode === product.fullCode
                    );
                    const isSelected = !!selectedProduct;
                    const currentQuantity =
                      selectedProduct?.quantity || product.minQuantity || 1;
                    const maxStock = product.stockInfo?.stock || 0;

                    return (
                      <motion.div
                        key={product.fullCode}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50 border-[#155874]"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div
                          className="flex items-center justify-center flex-shrink-0 cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              toggleProductSelection({
                                ...product,
                                quantity: currentQuantity,
                                isInStock: true,
                              });
                            } else {
                              toggleProductSelection({
                                ...product,
                                quantity: product.minQuantity || 1,
                                isInStock: true,
                              });
                            }
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#155874] border-[#155874] text-white"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        </div>

                        <div
                          className="flex-shrink-0 cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              toggleProductSelection({
                                ...product,
                                quantity: currentQuantity,
                                isInStock: true,
                              });
                            } else {
                              toggleProductSelection({
                                ...product,
                                quantity: product.minQuantity || 1,
                                isInStock: true,
                              });
                            }
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={product.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                if (isSelected) {
                                  toggleProductSelection({
                                    ...product,
                                    quantity: currentQuantity,
                                    isInStock: true,
                                  });
                                } else {
                                  toggleProductSelection({
                                    ...product,
                                    quantity: product.minQuantity || 1,
                                    isInStock: true,
                                  });
                                }
                              }}
                            >
                              <h4 className="font-semibold text-gray-900 text-base mb-1">
                                {product.productName}
                              </h4>
                              <p className="text-gray-600 text-sm mb-2">
                                {product.brand?.name}
                              </p>
                              {product.minQuantity &&
                                product.minQuantity > 1 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Minimum required: {product.minQuantity}
                                  </div>
                                )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-green-600 text-lg">
                                ZAR {(product.price || 0).toFixed(2)}
                              </div>
                              <div className="text-green-600 text-sm font-medium mt-1">
                                In Stock ({maxStock})
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div
                              className="mt-3 pt-3 border-t border-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <QuantitySelector
                                quantity={currentQuantity}
                                onQuantityChange={(newQuantity) =>
                                  updateProductQuantity(
                                    product.fullCode,
                                    newQuantity
                                  )
                                }
                                maxStock={maxStock}
                                productName={product.productName}
                              />
                              <div className="text-sm text-gray-600 mt-2">
                                Subtotal: ZAR{" "}
                                {(
                                  (product.price || 0) * currentQuantity
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {outOfStockProducts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-3 text-red-600">
                      Out of Stock ({outOfStockProducts.length})
                    </h3>
                    {outOfStockProducts.map((product) => {
                      const imageUrl = getProductImage(product);

                      return (
                        <motion.div
                          key={product.fullCode}
                          className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
                        >
                          <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-6 h-6 rounded border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                              <X className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={product.productName}
                              className="w-16 h-16 object-cover rounded-lg grayscale"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-500 text-base mb-1">
                                  {product.productName}
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">
                                  {product.brand?.name}
                                </p>
                                {product.minQuantity &&
                                  product.minQuantity > 1 && (
                                    <div className="text-xs text-blue-400 font-medium">
                                      Minimum required: {product.minQuantity}
                                    </div>
                                  )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-gray-400 text-lg">
                                  ZAR {(product.price || 0).toFixed(2)}
                                </div>
                                <div className="text-red-600 text-sm font-medium mt-1">
                                  Out of Stock
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ZAR {selectedTotalPrice.toFixed(2)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {selectedProducts.length} selected items •{" "}
                      {totalItemsCount} total quantity
                    </div>
                    {outOfStockProducts.length > 0 && (
                      <div className="text-orange-600 text-sm mt-1">
                        {outOfStockProducts.length} items are out of stock and
                        cannot be added
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSelectedToCart}
                      disabled={selectedProducts.length === 0}
                      className={`px-8 py-3 rounded-lg transition-colors flex items-center gap-3 font-medium text-sm ${
                        selectedProducts.length === 0
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-[#155874] text-white hover:bg-[#3A4A9E]"
                      }`}
                    >
                      <Package className="w-5 h-5" />
                      Add {totalItemsCount} Items to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const GradeStationeryPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const schoolId = params.schoolId as string;
  const gradeId = params.gradeId as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<IProductWithQuantity[]>([]);
  const [allProducts, setAllProducts] = useState<IProductWithQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name-asc");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [gradeWithSchool, setGradeWithSchool] =
    useState<IGradeWithSchool | null>(null);
  const [stationeryProductCodes, setStationeryProductCodes] = useState<
    string[]
  >([]);

  // OPTIMIZED: Single collection instead of multiple collections
  const [collection, setCollection] = useState<IProductCollection | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<IProductCollection | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [showCollection, setShowCollection] = useState(true);

  // Student info modal state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [pendingCollection, setPendingCollection] =
    useState<IProductCollection | null>(null);
  const [pendingSelectedProducts, setPendingSelectedProducts] = useState<
    IProductWithQuantity[] | undefined
  >(undefined);

  const loggedInUser = decodeAccessToken();
  const userId = loggedInUser?.id;
  const { success, error, AlertComponent } = useSmartAlert();
  const { triggerCartUpdate } = useCart(userId);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // OPTIMIZED: Memoized container variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
        },
      },
    }),
    []
  );

  const GradeName = gradeWithSchool?.gradeName || "Loading...";
  const SchoolName = gradeWithSchool?.school?.name || "Loading...";

  // OPTIMIZED: Memoized utility functions
  const getCategoryName = useCallback((category: any): string => {
    if (typeof category === "string") return category;
    if (category && typeof category === "object" && "name" in category) {
      return category.name || "";
    }
    return "";
  }, []);

  const categoryIncludes = useCallback(
    (category: any, searchString: string): boolean => {
      const categoryName = getCategoryName(category);
      return categoryName.toLowerCase().includes(searchString.toLowerCase());
    },
    [getCategoryName]
  );

  const splitCategory = useCallback(
    (category: any, separator: string): string[] => {
      const categoryName = getCategoryName(category);
      return categoryName.split(separator).map((part) => part.trim());
    },
    [getCategoryName]
  );

  // OPTIMIZED: Generate SINGLE collection with NO duplicate product names
  const generateSingleCollection = useCallback(
    (products: IProductWithQuantity[]): IProductCollection | null => {
      if (products.length < 3) return null;

      // Remove duplicates by product name to ensure unique products only
      const uniqueProductsMap = new Map();
      products.forEach((product) => {
        if (!uniqueProductsMap.has(product.productName)) {
          uniqueProductsMap.set(product.productName, product);
        }
      });

      const uniqueProducts = Array.from(uniqueProductsMap.values());

      if (uniqueProducts.length < 3) return null;

      // Take up to 12 unique products for the collection
      const collectionProducts = uniqueProducts.slice(
        0,
        Math.min(uniqueProducts.length, 12)
      );

      // Calculate total price using minQuantity from backend
      const totalPrice = collectionProducts.reduce(
        (sum, product) =>
          sum + (product.price || 0) * (product.minQuantity || 1),
        0
      );

      return {
        id: `complete-stationery-pack-${Date.now()}`,
        name: `Complete ${
          gradeWithSchool?.gradeName || "Grade"
        } Stationery Pack`,
        description:
          "Everything your child needs for the school year - all essential items in one convenient pack with no duplicates",
        products: collectionProducts,
        totalPrice: totalPrice,
      };
    },
    [gradeWithSchool?.gradeName]
  );

  // OPTIMIZED: Load grade stationery - simplified and optimized
  const loadGradeStationery = async () => {
    if (!gradeId) return;

    try {
      setLoading(true);

      const cacheKey = `grade-${gradeId}-stationery-with-products`;

      // Check cache first
      if (gradeStationeryCache.has(cacheKey)) {
        const cachedData = gradeStationeryCache.get(cacheKey);
        setProducts(cachedData.products);
        setAllProducts(cachedData.products);
        setGradeWithSchool(cachedData.gradeWithSchool);

        // Generate single collection from cached products
        const singleCollection = generateSingleCollection(cachedData.products);
        setCollection(singleCollection);

        setLoading(false);
        return;
      }

      // Load grade with school information - THIS IS THE CORRECT SOURCE
      let gradeData: IGradeWithSchool | null = null;
      try {
        const gradeResponse = await GRADE_API.GET_GRADE_WITH_SCHOOL(
          parseInt(gradeId)
        );
        if (gradeResponse.data) {
          gradeData = gradeResponse.data;
          setGradeWithSchool(gradeData);
        }
      } catch (gradeError) {
        console.error("Failed to load grade with school info:", gradeError);
      }

      // Load stationery with products
      const response = await GRADE_STATIONERY_API.GET_STATIONERY_WITH_PRODUCTS(
        parseInt(gradeId)
      );

      if (response.data) {
        const stationeryData = response.data;
        const stationeryProducts = stationeryData.products;

        // Convert to products with quantities
        const productsWithQuantities: IProductWithQuantity[] =
          stationeryProducts.map((product) => ({
            ...product,
            quantity: product.minQuantity || 1,
            isInStock: (product.stockInfo?.stock || 0) > 0,
          }));

        setProducts(productsWithQuantities);
        setAllProducts(productsWithQuantities);

        // Generate SINGLE collection
        const singleCollection = generateSingleCollection(
          productsWithQuantities
        );
        setCollection(singleCollection);

        // ✅ FIXED: Cache the data WITHOUT the fallback to stationeryData.gradeInfo.schoolName
        gradeStationeryCache.set(cacheKey, {
          products: productsWithQuantities,
          gradeWithSchool: gradeData, // ← ONLY use the grade data from GRADE_API
        });
      } else {
        setProducts([]);
        setAllProducts([]);
        setCollection(null);
      }
    } catch (error: any) {
      console.error("Failed to load grade stationery:", error);
      setProducts([]);
      setAllProducts([]);
      setCollection(null);

      // Try cache fallback
      const cacheKey = `grade-${gradeId}-stationery-with-products`;
      if (gradeStationeryCache.has(cacheKey)) {
        const cachedData = gradeStationeryCache.get(cacheKey);
        setProducts(cachedData.products);
        setAllProducts(cachedData.products);

        const singleCollection = generateSingleCollection(cachedData.products);
        setCollection(singleCollection);
      }
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZED: Single useEffect for data loading
  useEffect(() => {
    loadGradeStationery();
  }, [gradeId]);

  // OPTIMIZED: Search with proper cleanup
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // OPTIMIZED: Category handlers
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setCurrentPage(1);
  }, []);

  const handleSubCategorySelect = useCallback((subCategory: string | null) => {
    setSelectedSubCategory(subCategory);
    setCurrentPage(1);
  }, []);

  // OPTIMIZED: Memoized sidebar categories
  const sidebarCategories = useMemo((): SidebarCategory[] => {
    if (!products.length) {
      return [{ name: "All", subCategories: null }];
    }

    const categories: SidebarCategory[] = [
      { name: "All", subCategories: null },
    ];
    const seenCategories = new Set<string>();

    products.forEach((product) => {
      product.categories?.forEach((category) => {
        const categoryName = getCategoryName(category);

        if (!seenCategories.has(categoryName)) {
          seenCategories.add(categoryName);

          if (categoryName.includes(">")) {
            const [mainCategory, subCategory] = splitCategory(category, ">");

            let mainCat = categories.find((cat) => cat.name === mainCategory);
            if (!mainCat) {
              mainCat = { name: mainCategory, subCategories: [] as string[] };
              categories.push(mainCat);
            }

            if (
              subCategory &&
              mainCat.subCategories &&
              !mainCat.subCategories.includes(subCategory)
            ) {
              mainCat.subCategories.push(subCategory);
            }
          } else {
            categories.push({
              name: categoryName,
              subCategories: null,
            });
          }
        }
      });
    });

    return categories
      .map((cat) => ({
        ...cat,
        subCategories: cat.subCategories ? cat.subCategories.sort() : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, getCategoryName, splitCategory]);

  // OPTIMIZED: Memoized filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.productName || "").toLowerCase().includes(query) ||
          (product.brand?.name || "").toLowerCase().includes(query) ||
          (product.fullCode || "").toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) =>
        product.categories?.some((cat) => {
          const categoryName = getCategoryName(cat);
          return (
            categoryIncludes(cat, selectedCategory) ||
            splitCategory(cat, ">")[0]?.trim() === selectedCategory
          );
        })
      );
    }

    if (selectedSubCategory) {
      filtered = filtered.filter((product) =>
        product.categories?.some((cat) => {
          const categoryName = getCategoryName(cat);
          return (
            categoryIncludes(cat, selectedSubCategory) ||
            splitCategory(cat, ">")[1]?.trim() === selectedSubCategory
          );
        })
      );
    }

    const sortedProducts = [...filtered];

    switch (sortBy) {
      case "name-asc":
        sortedProducts.sort((a, b) =>
          (a.productName || "").localeCompare(b.productName || "")
        );
        break;
      case "name-desc":
        sortedProducts.sort((a, b) =>
          (b.productName || "").localeCompare(a.productName || "")
        );
        break;
      case "brand":
        sortedProducts.sort((a, b) =>
          (a.brand?.name || "").localeCompare(b.brand?.name || "")
        );
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return sortedProducts;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    getCategoryName,
    categoryIncludes,
    splitCategory,
  ]);

  // OPTIMIZED: Memoized pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubCategory, sortBy]);

  // FIXED: Separate function to add bulk item to cart - NOW SAVES ALL DATA
  const addBulkToCart = async (bulkCartItem: IBulkCartItem) => {
    try {
      if (userId) {
        // ✅ FIXED: Send the COMPLETE bulk cart item with ALL properties
        const addCartData: IAddCartItem = {
          userId: userId,
          item: bulkCartItem, // Send the full bulk cart item with all properties
        };

        console.log("Sending COMPLETE bulk cart item to server:", bulkCartItem);

        const response = await CART_API.ADD_CART_ITEM(addCartData);

        if (response?.data) {
          const studentInfoText = bulkCartItem.studentInfo
            ? ` for ${bulkCartItem.studentInfo.studentName} (${bulkCartItem.studentInfo.studentNumber})`
            : "";
          const schoolInfoText = bulkCartItem.schoolInfo
            ? ` at ${bulkCartItem.schoolInfo.schoolName}`
            : "";

          success(
            "Pack Added to Cart! 🎉",
            `${bulkCartItem.collectionName} (${
              bulkCartItem.bulkTotalItems
            } items, ZAR ${bulkCartItem.bulkTotalPrice.toFixed(
              2
            )}) has been added to your cart${studentInfoText}${schoolInfoText}.`,
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
          throw new Error("Failed to add pack to cart");
        }
      } else {
        // For localStorage, we can use the full bulkCartItem
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

        const existingBulkItemIndex = existingCart.findIndex(
          (item: any) =>
            item.isBulk && item.collectionId === bulkCartItem.collectionId
        );

        const studentInfoText = bulkCartItem.studentInfo
          ? ` for ${bulkCartItem.studentInfo.studentName} (${bulkCartItem.studentInfo.studentNumber})`
          : "";
        const schoolInfoText = bulkCartItem.schoolInfo
          ? ` at ${bulkCartItem.schoolInfo.schoolName}`
          : "";

        if (existingBulkItemIndex > -1) {
          existingCart[existingBulkItemIndex].quantity += 1;
          success(
            "Pack Quantity Updated!",
            `${bulkCartItem.collectionName} quantity increased in your cart${studentInfoText}${schoolInfoText}.`,
            [
              {
                label: "View Cart",
                action: () => router.push("/client/cart"),
                variant: "primary",
              },
            ]
          );
        } else {
          existingCart.push(bulkCartItem);
          success(
            "Pack Added to Cart! 🎉",
            `${bulkCartItem.collectionName} (${
              bulkCartItem.bulkTotalItems
            } items, ZAR ${bulkCartItem.bulkTotalPrice.toFixed(
              2
            )}) has been added to your cart${studentInfoText}${schoolInfoText}.`,
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
      }
    } catch (e) {
      console.error("Error adding pack to cart:", e);
      error(
        "Failed to Add Pack",
        "Unable to add the pack to cart. Please try again.",
        [
          {
            label: "Retry",
            action: () => addBulkToCart(bulkCartItem),
            variant: "primary",
          },
        ]
      );
    }
  };

  // OPTIMIZED: Add to cart function
  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.fullCode === productId);

    if (product) {
      const productPrice = product.price || 0;

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: product as unknown as IProduct,
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
              `${product.productName} (ZAR ${productPrice.toFixed(
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
            triggerCartUpdate();
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
              `${product.productName} (ZAR ${productPrice.toFixed(
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

  // FIXED: Create bulk cart item with student info and school info
  const createBulkCartItem = (
    collection: IProductCollection,
    selectedProducts?: IProductWithQuantity[],
    studentInfo?: StudentInfo
  ): IBulkCartItem => {
    const productsToAdd =
      selectedProducts ||
      collection.products
        .filter((product) => (product.stockInfo?.stock || 0) > 0)
        .map((product) => ({
          ...product,
          quantity: product.minQuantity || 1,
          isInStock: true,
        }));

    const totalPrice = productsToAdd.reduce(
      (sum, product) => sum + (product.price || 0) * product.quantity,
      0
    );

    const totalItems = productsToAdd.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    const firstProduct = productsToAdd[0];
    const collectionImage = firstProduct
      ? firstProduct.images.find((img) => img.isDefault) ||
        firstProduct.images[0]
      : null;

    const imageUrl = collectionImage
      ? collectionImage.urls.find((url) => url.width >= 300)?.url ||
        collectionImage.urls[0]?.url ||
        "/placeholder-product.png"
      : "/placeholder-product.png";

    // FIXED: Create a properly typed mock product for the bulk item
    const bulkProduct: IProduct = {
      fullCode: `bulk-${collection.id}`,
      productName: collection.name,
      price: totalPrice,
      stock: 999,
      images: [
        {
          name: collection.name,
          isDefault: true,
          urls: [{ url: imageUrl, width: 300, height: 300 }],
          hasLogo: false,
          angle: null,
          type: "product",
        },
      ],
      categories: [],
      brand: {
        name: "Stationery Pack",
        brandWebsiteLogo: "",
        code: "stationery-pack",
      } as Brand,
      description: collection.description,
      actionType: 0,
      simpleCode: `bulk-${collection.id}`,
      categorisedAttribute: [],
      gender: null,
      material: "",
      fit: "",
      feature: "",
      companionCodes: [],
      relatedCodes: [],
      matchingCodes: [],
      groupingCodes: [],
      groupingCodeGiftsets: [],
      minimum: 1,
      maximum: 999,
      incrementedBy: 1,
      keywords: "",
      tags: "",
      inventoryType: "standard",
      behaviour: "normal",
      madeToOrder: "no",
      madeToOrderMessage: "",
      displayCountryOfOrigin: "",
      promotion: "",
      fullBrandingGuide: "",
      logo24BrandingGuide: null,
      colourImages: [],
      brandings: [],
      isLogo24: false,
      logo24Branding: null,
      inclusiveBranding: [],
      variants: [],
      requiredBrandingPositions: [],
      noCoBrandingPositions: [],
      brandingTemplates: [],
      decoupled: false,
      type: "product",
    };

    // Create school info from gradeWithSchool data
    const schoolInfo: SchoolInfo = {
      schoolId: gradeWithSchool?.school?.id || 0,
      schoolName: gradeWithSchool?.school?.name || "Unknown School",
      schoolCode: gradeWithSchool?.school?.code || "",
    };

    return {
      id: uuidv4(),
      product: bulkProduct,
      quantity: 1,
      price: totalPrice,
      addedAt: new Date().toISOString(),
      isBulk: true,
      collectionName: collection.name,
      collectionId: collection.id,
      bulkProducts: productsToAdd,
      bulkTotalPrice: totalPrice,
      bulkTotalItems: totalItems,
      studentInfo: studentInfo,
      schoolInfo: schoolInfo,
    };
  };

  // FIXED: Handle student info confirmation
  const handleStudentInfoConfirm = (studentInfo: StudentInfo) => {
    if (pendingCollection) {
      // Create bulk cart item with student info and school info
      const bulkCartItem = createBulkCartItem(
        pendingCollection,
        pendingSelectedProducts,
        studentInfo
      );

      addBulkToCart(bulkCartItem);
    }

    // Close student modal
    setIsStudentModalOpen(false);
    setPendingCollection(null);
    setPendingSelectedProducts(undefined);
  };

  // FIXED: Handle collection add to cart - now shows student modal first
  const handleAddCollectionToCart = async (
    collection: IProductCollection,
    selectedProducts?: IProductWithQuantity[]
  ) => {
    // Store the collection and selected products for later use
    setPendingCollection(collection);
    setPendingSelectedProducts(selectedProducts);

    // Show student info modal instead of directly adding to cart
    setIsStudentModalOpen(true);
  };

  const handleViewCollectionDetails = (collection: IProductCollection) => {
    setSelectedCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const transformedProducts = useMemo(() => {
    return paginatedProducts.map((product) => {
      const defaultImage =
        product.images.find((img) => img.isDefault) || product.images[0];
      const imageUrl =
        defaultImage?.urls.find((url) => url.width >= 300)?.url ||
        defaultImage?.urls[0]?.url ||
        "/placeholder-product.png";

      return {
        id: product.fullCode,
        imageSrc: imageUrl,
        productName: product.productName,
        price: product.price || 0,
        stockQuantity: product.stockInfo?.stock || 0,
        isInStock: (product.stockInfo?.stock || 0) > 0,
      };
    });
  }, [paginatedProducts]);

  return (
    <>
      {/* Hero section with School Name in Banner */}
      <div className="bg-gradient-to-br from-[#155874] to-[#3A4A9E] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <HeroCarousel />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <motion.button
              onClick={() => router.push("..")}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Grade</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* School Name Banner */}
              <div className="mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 max-w-max">
                  <School className="w-4 h-4 text-white/80" />
                  <span className="text-white/90 font-medium text-sm">
                    {SchoolName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    {GradeName}
                  </h1>
                  <p className="text-white/80 mt-1">
                    Select your child&apos;s Stationery
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white w-full max-w-none"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Mobile Filter Button */}
        <motion.div className="xl:hidden mb-4" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search stationery items..."
                className="w-full p-3 pl-10 text-sm text-black placeholder:text-gray-400 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={loading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#155874] text-white px-4 py-3 rounded-lg hover:bg-[#3A4A9E] transition-colors whitespace-nowrap shadow-md"
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
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <motion.div className="hidden xl:block w-1/4" variants={itemVariants}>
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search stationery items..."
                className="w-full p-3.5 pl-12 text-base text-black placeholder:text-gray-400 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

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
          </motion.div>

          {/* Mobile Sidebar Drawer */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileSidebarOpen(false)}
                />

                <motion.div
                  className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 xl:hidden"
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#155874] to-[#3A4A9E] text-white shadow-lg">
                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5" />
                        <div>
                          <h2 className="text-lg font-semibold">Categories</h2>
                          <p className="text-xs text-white/70">
                            Filter stationery items
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
                        {loading ? (
                          <SidebarSkeleton />
                        ) : (
                          <Sidebar
                            categories={sidebarCategories}
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
                          />
                        )}
                      </div>

                      <div className="p-4 bg-white border-t border-gray-200 mt-4">
                        <div className="text-center">
                          <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="w-full bg-[#155874] text-white py-2.5 rounded-lg font-medium hover:bg-[#3A4A9E] transition-colors"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <motion.main className="w-full xl:w-3/4" variants={itemVariants}>
            {loading ? (
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
                {/* SINGLE Collection Section */}
                {collection && (
                  <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        🎒 Complete Stationery Pack
                      </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <CollectionCard
                          collection={collection}
                          onAddToCart={handleAddCollectionToCart}
                          onViewDetails={handleViewCollectionDetails}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Individual Products Section */}
                <motion.div className="mb-6" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 bg-[#155874] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Individual Stationery Items
                    </h2>
                  </div>
                </motion.div>

                {/* Products or Empty State */}
                {filteredProducts.length === 0 ? (
                  <motion.div
                    className="text-center py-12 px-4 bg-gray-50 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-gray-500 text-xl font-semibold mb-3">
                      {products.length === 0
                        ? "No stationery items available for this grade"
                        : "No stationery items found matching your criteria"}
                    </div>
                    <div className="text-gray-400 text-base">
                      {searchQuery
                        ? `No items found for "${searchQuery}"`
                        : selectedCategory !== "All"
                        ? `No items found in "${selectedCategory}"${
                            selectedSubCategory
                              ? ` > "${selectedSubCategory}"`
                              : ""
                          }`
                        : "Try adjusting your search or filters"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <ProductGrid
                      products={transformedProducts}
                      onAddToCart={handleAddToCart}
                      allProducts={allProducts as unknown as IProduct[]}
                      productPrices={[]}
                      stockItems={[]}
                      sourceCategory={selectedCategory}
                      sourcePage="grade-stationery"
                    />
                    {totalPages > 1 && (
                      <motion.div className="mt-8" variants={itemVariants}>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </>
            )}
            <AlertComponent />
          </motion.main>
        </div>
      </motion.div>

      {/* Collection Details Modal */}
      <CollectionDetailsModal
        collection={selectedCollection}
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onAddToCart={handleAddCollectionToCart}
      />

      {/* Student Info Modal with School Info */}
      <StudentInfoModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setPendingCollection(null);
          setPendingSelectedProducts(undefined);
        }}
        onConfirm={handleStudentInfoConfirm}
        collection={pendingCollection}
        gradeName={GradeName}
        schoolName={SchoolName}
      />
    </>
  );
};

export default GradeStationeryPage;
