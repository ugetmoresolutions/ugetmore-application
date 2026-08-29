"use client";

import React, { useState, useEffect } from "react";
import AddProductModal from "./StationeryProductModal";
import { ActionButton } from "./ProductsList";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Package,
} from "lucide-react";
import { PRODUCT_API } from "@/endpoints/rest-api/product";
import { IProduct } from "@/interfaces/product/newProduct";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Product Card Component
interface ProductCardProps {
  product: IProduct;
  onEdit: (product: IProduct) => void;
  onDelete: (productId: number) => void;
  onView: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const allImages = [
    ...product.mainImages,
    ...product.colorImages.flatMap((color) => color.images),
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  const price = product?.price || Math.floor(Math.random() * 500) + 50; // Fallback price if not available

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300">
      {/* Image Gallery */}
      <div className="relative h-56 overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <Image
              src={allImages[currentImageIndex].url}
              alt={product.title}
              fill
              className="object-cover"
            />

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-900/70 text-white p-1 rounded-full hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-900/70 text-white p-1 rounded-full hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex
                        ? "bg-slate-900"
                        : "bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400">No image</span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
            product.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {product.status}
        </div>

        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-sm"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(product);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 truncate">
          {product.title}
        </h3>
        <p className="text-slate-500 text-sm mt-1 line-clamp-2 h-10">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-slate-900">
              R {price.toFixed(2)}
            </span>
          </div>

          <div className="text-sm text-slate-600">
            Stock: <span className="font-medium">{product.stockQuantity}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {product.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
            >
              {category}
            </span>
          ))}
          {product.categories.length > 2 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              +{product.categories.length - 2}
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-slate-500">SKU: {product.sku}</span>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Products Component
export default function Products() {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<IProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const route = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await PRODUCT_API.GET_ALL_PRODUCTS();
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: IProduct) => {
    setEditingProduct(product);
    setViewingProduct(null); // Clear viewing product when editing
    setShowAddProductModal(true);
  };

  const handleViewProduct = (product: IProduct) => {
    setViewingProduct(product);
    setEditingProduct(product); // Clear editing product when viewing
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (deleteConfirm === productId) {
      try {
        await PRODUCT_API.DELETE_PRODUCT(productId);
        setProducts(products.filter((p) => p.id !== productId));
        setDeleteConfirm(null);
      } catch (err) {
        setError("Failed to delete product. Please try again.");
        console.error("Error deleting product:", err);
      }
    } else {
      setDeleteConfirm(productId);
      // Reset delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleProductCreated = () => {
    fetchProducts();
    setEditingProduct(null);
    setViewingProduct(null);
    setShowAddProductModal(false);
  };

  const handleModalClose = () => {
    setShowAddProductModal(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage your product inventory ({products.length} products)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            onClick={fetchProducts}
            variant="secondary"
            className="text-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </ActionButton>
          <ActionButton
            onClick={() => route.push("/admin/products/branding/create")}
            variant="primary"
            className="text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Branding Product
          </ActionButton>
          <ActionButton
            onClick={() => setShowAddProductModal(true)}
            variant="primary"
            className="text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </ActionButton>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-rose-800 hover:text-rose-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
            >
              <div className="h-56 bg-slate-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
                <div className="flex justify-between mt-4">
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No products yet
          </h3>
          <p className="text-slate-600 mt-1 mb-4">
            Get started by adding your first product
          </p>
          <ActionButton
            onClick={() => setShowAddProductModal(true)}
            variant="primary"
            className="text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </ActionButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleViewProduct}
              />
            ))}
          </div>

          {/* Delete Confirmation Overlay */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirm)}
                    className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={handleModalClose}
        onProductCreated={handleProductCreated}
        editingProduct={editingProduct || viewingProduct}
        mode={viewingProduct ? "view" : editingProduct ? "edit" : "create"}
      />
    </div>
  );
}
