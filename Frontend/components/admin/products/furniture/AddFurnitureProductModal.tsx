"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Plus,
  Trash2,
  ImageIcon,
  CheckCircle,
  Eye,
  Edit,
  Save,
  Barcode,
  Sparkles,
  Package,
  Box,
  Palette,
  Warehouse,
  Truck,
  Tag,
  FileText,
  Hash,
  Minus,
  Maximize,
  XCircle,
  Pencil,
  Sofa,
  RulerIcon,
  Scale,
  Wrench,
  Crown,
} from "lucide-react";
import {
  IColorImage,
  IImageUrl,
  IFurnitureProduct,
  FurnitureProductStatus,
} from "@/interfaces/furniture/furniture";
import { FURNITURE_API } from "@/endpoints/rest-api/furniture";
import { CATEGORY_API, ICategory } from "@/endpoints/rest-api/categories";
import { SUPPLIER_API, ISupplier } from "@/endpoints/rest-api/supplier";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";

interface AddFurnitureProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  editingProduct?: IFurnitureProduct | null;
  mode?: "create" | "edit" | "view";
}

// SKU Configuration for furniture
const skuConfig = {
  colors: [
    { code: "BK", name: "Black" },
    { code: "BU", name: "Blue" },
    { code: "RD", name: "Red" },
    { code: "GN", name: "Green" },
    { code: "YL", name: "Yellow" },
    { code: "OR", name: "Orange" },
    { code: "PR", name: "Purple" },
    { code: "WT", name: "White" },
    { code: "GY", name: "Gray" },
    { code: "BR", name: "Brown" },
    { code: "BE", name: "Beige" },
  ],
};

const furnitureSizes = ["One Size", "Small", "Medium", "Large", "Extra Large"];

// Generate SKU function
const generateSku = (
  categoryCode: string,
  subCategoryCode: string,
  productName: string,
  color?: string
): string => {
  // Get product code (first 3 letters)
  const productCode = productName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  // Generate sequential number
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  // Build SKU
  const parts = [categoryCode, subCategoryCode, productCode, randomNum];

  // Add color if provided
  if (color) {
    const colorObj = skuConfig.colors.find((c) => c.name === color);
    if (colorObj) {
      parts.push(colorObj.code);
    }
  }

  return parts.join("-");
};

// Status Modal Component
const StatusModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "update";
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        );
      case "update":
        return <Pencil className="w-12 h-12 text-blue-500 mx-auto mb-3" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-slate-200 mx-4"
            >
              <div className="text-center">
                {getIcon()}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-slate-600 mb-6 text-sm">{message}</p>
                <button
                  onClick={onClose}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Component
const AddFurnitureProductModal: React.FC<AddFurnitureProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
  editingProduct = null,
  mode = "create",
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    minQuantity: "1",
    maxQuantity: "100",
    stockQuantity: "0",
    sku: "",
    category: "",
    subCategory: "",
    supplierName: "",
    supplierAccount: "",
    status: "Active",
    material: "",
    weight: "",
    weightUnit: "kg",
    assemblyRequired: "false",
  });

  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
    unit: "cm",
  });

  const [mainImages, setMainImages] = useState<IImageUrl[]>([]);
  const [colorImages, setColorImages] = useState<IColorImage[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isViewMode, setIsViewMode] = useState(mode === "view");
  const [skuSuggestions, setSkuSuggestions] = useState<string[]>([]);
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);
  const skuBoxRef = useRef<HTMLDivElement | null>(null);

  // API data states - Only using CATEGORY_API for furniture
  const [apiCategories, setApiCategories] = useState<ICategory[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "update">(
    "success"
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorFileInputRefs = useRef<Record<number, HTMLInputElement>>({});

  // Load initial data from APIs
  useEffect(() => {
    const loadInitialData = async () => {
      if (isOpen) {
        try {
          // Load furniture categories from API (only for FURNITURE main category)
          const apiResponse = await CATEGORY_API.GET_CATEGORIES_BY_MAIN_CATEGORY(
            "FURNITURE"
          );
          if (apiResponse.data) {
            setApiCategories(apiResponse.data);
          }

          // Load suppliers
          const suppliersResponse = await SUPPLIER_API.GET_ALL_SUPPLIERS();
          if (suppliersResponse.data) {
            setSuppliers(suppliersResponse.data);
          }
        } catch (error) {
          console.error("Failed to load initial data:", error);
        }
      }
    };

    loadInitialData();
  }, [isOpen]);

  // Set form data when editing product
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title || "",
        description: editingProduct.description || "",
        price: editingProduct.price?.toString() || "",
        brand: editingProduct.brand || "",
        minQuantity: editingProduct.minQuantity?.toString() || "1",
        maxQuantity: editingProduct.maxQuantity?.toString() || "100",
        stockQuantity: editingProduct.stockQuantity?.toString() || "0",
        sku: editingProduct.sku || "",
        category: editingProduct.categories?.[0] || "",
        subCategory: editingProduct.subCategories?.[0] || "",
        supplierName: editingProduct.supplierName || "",
        supplierAccount: editingProduct.supplierAccount || "",
        status: editingProduct.status || "Active",
        material: editingProduct.material || "",
        weight: editingProduct.weight?.toString() || "",
        weightUnit: editingProduct.weightUnit || "kg",
        assemblyRequired: editingProduct.assemblyRequired?.toString() || "false",
      });

      setDimensions(
        editingProduct.dimensions || {
          length: "",
          width: "",
          height: "",
          unit: "cm",
        }
      );

      setMainImages(editingProduct.mainImages || []);
      setColorImages(editingProduct.colorImages || []);
      setSelectedSizes(editingProduct.sizes || []);
      setHasColors(
        !!editingProduct.colorImages && editingProduct.colorImages.length > 0
      );
      setHasSizes(!!editingProduct.sizes && editingProduct.sizes.length > 0);
    } else {
      resetForm();
    }

    setIsViewMode(mode === "view");
  }, [editingProduct, mode]);

  // Generate SKU suggestions
  const generateNewSkuSuggestions = () => {
    if (formData.category && formData.subCategory && formData.title) {
      const category = apiCategories.find(
        (cat) => cat.name === formData.category
      );
      let categoryCode = "";
      let subCategoryCode = "";

      if (category) {
        categoryCode = category.code;
        const subCat = category.subCategories?.find(
          (sub: any) => sub.name === formData.subCategory
        );
        subCategoryCode = subCat?.code || formData.subCategory.substring(0, 3).toUpperCase();
      }

      if (!categoryCode) categoryCode = formData.category.substring(0, 3).toUpperCase();
      if (!subCategoryCode) subCategoryCode = formData.subCategory.substring(0, 3).toUpperCase();

      const suggestions: string[] = [];

      // Generate base SKU (no color)
      suggestions.push(
        generateSku(categoryCode, subCategoryCode, formData.title)
      );

      // Generate SKUs with different colors
      const popularColors = skuConfig.colors.slice(0, 3);
      popularColors.forEach((color) => {
        suggestions.push(
          generateSku(categoryCode, subCategoryCode, formData.title, color.name)
        );
      });

      setSkuSuggestions(suggestions);
      setShowSkuSuggestions(true);
    }
  };

  // Close SKU suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        skuBoxRef.current &&
        !skuBoxRef.current.contains(event.target as Node)
      ) {
        setShowSkuSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSkuSuggestions]);

  // Get current categories
  const getCurrentCategories = () => {
    return apiCategories.map((cat) => cat.name);
  };

  // Get current subcategories based on selected category
  const getCurrentSubCategories = () => {
    const category = apiCategories.find((cat) => cat.name === formData.category);
    return category?.subCategories?.map((sub: any) => sub.name) || [];
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Product title is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subCategory)
      newErrors.subCategory = "Sub category is required";
    if (!formData.supplierName) newErrors.supplierName = "Supplier is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (mainImages.length === 0)
      newErrors.mainImages = "At least one main image is required";

    const minQty = parseInt(formData.minQuantity);
    const maxQty = parseInt(formData.maxQuantity);
    const stockQty = parseInt(formData.stockQuantity);

    if (minQty > maxQty)
      newErrors.minQuantity =
        "Min quantity cannot be greater than max quantity";
    if (stockQty < 0)
      newErrors.stockQuantity = "Stock quantity cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    try {
      setIsLoading(true);
      const response = await FURNITURE_API.UPLOAD_FURNITURE_IMAGES(
        Array.from(files)
      );

      if (response.data) {
        const uploadedImages: IImageUrl[] = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setMainImages((prev) => [...prev, ...uploadedImages]);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors({ mainImages: "Failed to upload images" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle color image upload
  const handleColorImageUpload = async (
    files: FileList,
    colorIndex: number
  ) => {
    try {
      setIsLoading(true);
      const response = await FURNITURE_API.UPLOAD_FURNITURE_IMAGES(
        Array.from(files)
      );

      if (response.data) {
        const uploadedImages: IImageUrl[] = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setColorImages((prev) => {
          const updated = [...prev];
          updated[colorIndex] = {
            ...updated[colorIndex],
            images: [...updated[colorIndex].images, ...uploadedImages],
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Color image upload failed:", error);
      setErrors({ colorImages: "Failed to upload color images" });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove main image
  const removeMainImage = (index: number) => {
    setMainImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove color image
  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    setColorImages((prev) => {
      const updated = [...prev];
      updated[colorIndex] = {
        ...updated[colorIndex],
        images: updated[colorIndex].images.filter((_, i) => i !== imageIndex),
      };
      return updated;
    });
  };

  // Add color variant
  const addColorVariant = () => {
    setColorImages([...colorImages, { name: "", code: "", images: [] }]);
  };

  // Remove color variant
  const removeColorVariant = (index: number) => {
    setColorImages(colorImages.filter((_, i) => i !== index));
  };

  // Update color variant
  const updateColorVariant = (
    index: number,
    field: keyof IColorImage,
    value: string
  ) => {
    const updated = [...colorImages];
    updated[index] = { ...updated[index], [field]: value };
    setColorImages(updated);
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Handle supplier change
  const handleSupplierChange = (supplierName: string) => {
    const supplier = suppliers.find((s) => s.name === supplierName);
    setFormData({
      ...formData,
      supplierName,
      supplierAccount: supplier?.account || "",
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        brand: formData.brand,
        mainImages,
        minQuantity: parseInt(formData.minQuantity),
        maxQuantity: parseInt(formData.maxQuantity),
        stockQuantity: parseInt(formData.stockQuantity),
        categories: [formData.category],
        subCategories: [formData.subCategory],
        supplierName: formData.supplierName,
        supplierAccount: formData.supplierAccount,
        status: formData.status as FurnitureProductStatus,
        ...(hasColors && colorImages.length > 0 && { colorImages }),
        ...(hasSizes && selectedSizes.length > 0 && { sizes: selectedSizes }),
        // Furniture specific fields
        ...(dimensions.length &&
          dimensions.width &&
          dimensions.height && {
            dimensions: {
              length: dimensions.length,
              width: dimensions.width,
              height: dimensions.height,
              unit: dimensions.unit,
            },
          }),
        ...(formData.material && { material: formData.material }),
        ...(formData.weight && {
          weight: parseFloat(formData.weight),
          weightUnit: formData.weightUnit,
        }),
        assemblyRequired: formData.assemblyRequired === "true",
      };

      let response;
      const isUpdate = Boolean(editingProduct);

      if (isUpdate) {
        response = await FURNITURE_API.UPDATE_FURNITURE_PRODUCT(
          editingProduct?.id as number,
          productData 
        );
      } else {
        response = await FURNITURE_API.CREATE_FURNITURE_PRODUCT(productData);
      }

      if (response.data && !response.error) {
        setModalType(isUpdate ? "update" : "success");
        setModalTitle(
          isUpdate ? "Furniture Product Updated!" : "Furniture Product Created!"
        );
        setModalMessage(
          `The furniture product "${formData.title}" was successfully ${
            isUpdate ? "updated" : "created"
          }.`
        );
        setShowStatusModal(true);
        onProductCreated();
      } else {
        throw new Error(response.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Furniture product operation failed:", error);
      setErrors({ submit: error.message });
      setModalType("error");
      setModalTitle("Operation Failed");
      setModalMessage(
        error.message || "An error occurred while saving the furniture product."
      );
      setShowStatusModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      brand: "",
      minQuantity: "1",
      maxQuantity: "100",
      stockQuantity: "0",
      sku: "",
      category: "",
      subCategory: "",
      supplierName: "",
      supplierAccount: "",
      status: "Active",
      material: "",
      weight: "",
      weightUnit: "kg",
      assemblyRequired: "false",
    });
    setDimensions({
      length: "",
      width: "",
      height: "",
      unit: "cm",
    });
    setMainImages([]);
    setColorImages([]);
    setSelectedSizes([]);
    setHasColors(false);
    setHasSizes(false);
    setErrors({});
    setSkuSuggestions([]);
    setShowSkuSuggestions(false);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setIsViewMode(!isViewMode);
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    if (isViewMode) return "View Furniture Product";
    if (editingProduct) return "Edit Furniture Product";
    return "Add New Furniture Product";
  };

  // Render input field
  const renderInputField = (
    label: string,
    name: keyof typeof formData,
    type: string = "text",
    placeholder: string = "",
    required: boolean = false,
    icon?: React.ReactNode
  ) => (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        {icon && <span className="inline-block mr-2">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        disabled={isViewMode}
        required={required}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <>
      <Modal
        show={isOpen}
        onClose={handleClose}
        size="7xl"
      >
        <ModalHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-3 flex-1">
              <Sofa className="h-6 w-6" />
              <div>
                <h3 className="text-xl text-white font-bold">
                  {getModalTitle()}
                </h3>
                <p className="text-white text-sm">
                  {isViewMode
                    ? "View furniture product details"
                    : editingProduct
                    ? "Edit your furniture product information"
                    : "Create a new furniture product"}
                </p>
              </div>
            </div>
            {editingProduct && (
              <button
                onClick={toggleViewMode}
                className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                title={isViewMode ? "Edit Mode" : "View Mode"}
              >
                {isViewMode ? <Edit size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <FileText size={18} />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Enter furniture product title"
                    disabled={isViewMode}
                    required
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Enter brand name"
                    disabled={isViewMode}
                    required
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Price (R) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={isViewMode}
                    required
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Detailed furniture product description..."
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Furniture Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Sofa size={18} />
                Furniture Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) =>
                      setFormData({ ...formData, material: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="e.g., Wood, Metal, Fabric"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isViewMode}
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) =>
                        setFormData({ ...formData, weightUnit: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      disabled={isViewMode}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Assembly Required
                  </label>
                  <select
                    value={formData.assemblyRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assemblyRequired: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={isViewMode}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Length"
                      value={dimensions.length}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, length: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      disabled={isViewMode}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Width"
                      value={dimensions.width}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, width: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      disabled={isViewMode}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Height"
                      value={dimensions.height}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, height: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      disabled={isViewMode}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <select
                      value={dimensions.unit}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, unit: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      disabled={isViewMode}
                    >
                      <option value="cm">cm</option>
                      <option value="inches">inches</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories & SKU Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Package size={18} />
                Categories & SKU
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        subCategory: "",
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={isViewMode}
                  >
                    <option value="">Select a category</option>
                    {getCurrentCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Sub Category Select */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subCategory: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={!formData.category || isViewMode}
                  >
                    <option value="">Select a sub category</option>
                    {getCurrentSubCategories().map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subCategory}
                    </p>
                  )}
                </div>

                {/* SKU Field */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="e.g., FN-CH-001"
                      disabled={isViewMode}
                      required
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={generateNewSkuSuggestions}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Generate SKU"
                      >
                        <Sparkles size={16} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                  )}

                  {/* SKU Suggestions */}
                  {showSkuSuggestions && skuSuggestions.length > 0 && (
                    <div
                      ref={skuBoxRef}
                      className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                    >
                      <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                        Suggested SKUs:
                      </div>
                      {skuSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion}-${index}`}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, sku: suggestion });
                            setShowSkuSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                        >
                          <Barcode size={12} className="text-gray-400" />
                          <span className="font-mono">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Images Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <ImageIcon size={18} />
                Product Images
              </h3>

              {/* Uploaded Images */}
              {mainImages.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Uploaded Images
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mainImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Main image ${index + 1}`}
                          className="w-full h-32 object-contain rounded-lg border"
                        />
                        {!isViewMode && (
                          <button
                            onClick={() => removeMainImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              {!isViewMode && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Upload furniture product images
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    <Upload className="inline mr-2" size={16} />
                    Select Images
                  </button>
                </div>
              )}
              {errors.mainImages && (
                <p className="text-red-500 text-xs mt-1">{errors.mainImages}</p>
              )}
            </div>

            {/* Product Variants Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Palette size={18} />
                Product Variants
              </h3>

              {/* Colors Toggle */}
              {!isViewMode && (
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="hasColors"
                    checked={hasColors}
                    onChange={(e) => setHasColors(e.target.checked)}
                    className="w-4 h-4 text-gray-900 rounded focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                  <label
                    htmlFor="hasColors"
                    className="text-sm font-medium text-gray-900"
                  >
                    This furniture product has different colors
                  </label>
                </div>
              )}

              {hasColors && (
                <div className="space-y-4">
                  {colorImages.map((color, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 text-sm">
                          Color Variant {index + 1}
                        </h4>
                        {!isViewMode && (
                          <button
                            onClick={() => removeColorVariant(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {!isViewMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-gray-700">
                              Color Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Black"
                              value={color.name}
                              onChange={(e) =>
                                updateColorVariant(index, "name", e.target.value)
                              }
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                              disabled={isViewMode}
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-gray-700">
                              Color Code
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., BK"
                              value={color.code}
                              onChange={(e) =>
                                updateColorVariant(index, "code", e.target.value)
                              }
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      )}

                      {/* Color Images Preview */}
                      {color.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                          {color.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={image.url}
                                alt={`${color.name} image ${imgIndex + 1}`}
                                className="w-full h-16 object-cover rounded-lg"
                              />
                              {!isViewMode && (
                                <button
                                  onClick={() =>
                                    removeColorImage(index, imgIndex)
                                  }
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!isViewMode && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-600">
                            Upload images for {color.name || "this color"}
                          </p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files &&
                              handleColorImageUpload(e.target.files, index)
                            }
                            className="hidden"
                            ref={(el) => {
                              if (el) {
                                colorFileInputRefs.current[index] = el;
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              colorFileInputRefs.current[index]?.click()
                            }
                            disabled={isLoading}
                            className="mt-2 text-gray-900 hover:text-blue-800 text-xs"
                          >
                            Browse Files
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {!isViewMode && (
                    <button
                      onClick={addColorVariant}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Add Color Variant
                    </button>
                  )}
                </div>
              )}

              {/* Sizes Toggle */}
              {!isViewMode && (
                <div className="flex items-center gap-3 mt-6 mb-4">
                  <input
                    type="checkbox"
                    id="hasSizes"
                    checked={hasSizes}
                    onChange={(e) => setHasSizes(e.target.checked)}
                    className="w-4 h-4 text-gray-900 rounded focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                  <label
                    htmlFor="hasSizes"
                    className="text-sm font-medium text-gray-900"
                  >
                    This furniture product has different sizes
                  </label>
                </div>
              )}

              {hasSizes && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {furnitureSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => !isViewMode && toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
                          selectedSizes.includes(size)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        } ${isViewMode ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inventory & Supplier Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Warehouse size={18} />
                Inventory & Supplier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    min="0"
                    disabled={isViewMode}
                    required
                  />
                  {errors.stockQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stockQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minQuantity: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    min="1"
                    disabled={isViewMode}
                  />
                  {errors.minQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.minQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxQuantity: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    min="1"
                    disabled={isViewMode}
                  />
                  {errors.maxQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.maxQuantity}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.supplierName}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={isViewMode}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.supplierName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Supplier Account
                  </label>
                  <input
                    type="text"
                    value={formData.supplierAccount}
                    readOnly
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  disabled={isViewMode}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-200">
          <div className="flex justify-between w-full">
            <button
              onClick={handleClose}
              className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            {!isViewMode && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingProduct ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingProduct ? <Save size={16} /> : <Plus size={16} />}
                    {editingProduct ? "Update Product" : "Create Product"}
                  </>
                )}
              </button>
            )}
          </div>
        </ModalFooter>
      </Modal>

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          handleClose();
        }}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
    </>
  );
};

export default AddFurnitureProductModal;