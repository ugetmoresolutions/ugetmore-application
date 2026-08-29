"use client";
import { Order, OrderItem, IBrandedArtwork } from "@/interfaces/order/order";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share,
  Star,
  Palette,
  MessageSquare,
  Loader2,
  XCircle,
} from "lucide-react";
import BrandingPreviewModal from "../shop/branding/BrandingPreviewModal";
import { BrandingSetup } from "@/interfaces/branding/branding";
import CustomerCommunicationModal from "./CustomerCommunicationModal";
import CustomerBrandingDesignSection from "./CustomerBrandingDesign";
import { ORDER_API } from "@/endpoints/rest-api/order";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";

export const OrderDetail: React.FC<{
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onBack?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({
  order,
  onCancelOrder,
  onBack,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [showBrandingPreview, setShowBrandingPreview] = useState(false);
  const [selectedBrandingConfig, setSelectedBrandingConfig] =
    useState<BrandingSetup>();
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [designHistories, setDesignHistories] = useState<
    Record<string, IBrandedArtwork[]>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});
  const [communications, setCommunications] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(
    null
  );
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID from token
  useEffect(() => {
    const decodedToken = decodeAccessToken();
    if (decodedToken?.id) {
      setUserId(decodedToken.id);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Clock className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleViewBranding = (brandingConfig: any) => {
    setSelectedBrandingConfig(brandingConfig);
    setShowBrandingPreview(true);
  };

  const getBrandingSetup = () => {
    return selectedBrandingConfig;
  };

  // Fetch design histories for branded products
  useEffect(() => {
    const fetchDesignHistories = async () => {
      const brandedProducts = order.items.filter((item) => item.isBranded);

      for (const product of brandedProducts) {
        try {
          setLoadingStates((prev) => ({ ...prev, [product.id]: true }));
          setErrorStates((prev) => ({ ...prev, [product.id]: "" }));

          const response = await ORDER_API.GET_DESIGN_HISTORY(
            parseInt(order.id),
            product.id
          );

          if (response.error === false && response.data) {
            setDesignHistories((prev) => ({
              ...prev,
              [product.id]: response.data,
            }));
          } else {
            setErrorStates((prev) => ({
              ...prev,
              [product.id]:
                response.message || "Failed to fetch design history",
            }));
          }
        } catch (error) {
          setErrorStates((prev) => ({
            ...prev,
            [product.id]: "An error occurred while fetching design history",
          }));
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

  const handleSendMessage = async (message: string, files: File[]) => {
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    console.log("Sending message:", message, files);

    const newMessage = {
      id: Date.now().toString(),
      productId: selectedProduct?.id,
      type: "customer_message",
      message,
      sender: {
        id: userId,
        name: order.customerName || "Customer",
        role: "customer",
      },
      attachments: files.map((file, index) => ({
        id: `attachment-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
      })),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setCommunications((prev) => [...prev, newMessage]);
  };

  const handleApproveMockup = async (artworkId: string, productId: string) => {
    if (!userId) return;

    try {
      const response = await ORDER_API.UPDATE_BRANDING_STATUS(
        parseInt(order.id),
        {
          itemId: productId,
          isApproved: true,
          notes: "Customer approved the design",
          userId,
          isAdmin: false,
        }
      );

      if (response.error === false) {
        // Refresh communications to get the latest approval message
        const commsResponse = await ORDER_API.GET_DESIGN_COMMUNICATIONS(
          parseInt(order.id),
          productId
        );

        if (commsResponse.error === false && commsResponse.data) {
          setCommunications(commsResponse.data);
        }

        // Optimistic UI update for artworks
        setDesignHistories((prev) => ({
          ...prev,
          [productId]:
            prev[productId]?.map((artwork) =>
              artwork.id === artworkId
                ? {
                    ...artwork,
                    isApproved: true,
                    updatedAt: new Date().toISOString(),
                  }
                : artwork
            ) || [],
        }));
      }
    } catch (error) {
      console.error("Error approving design:", error);
    }
  };

  const handleRequestRevision = async (
    artworkId: string,
    productId: string,
    feedback: string
  ) => {
    if (!userId) return;

    try {
      const response = await ORDER_API.UPDATE_BRANDING_STATUS(
        parseInt(order.id),
        {
          itemId: productId,
          isApproved: false,
          notes: feedback,
          userId,
          isAdmin: false,
        }
      );

      if (response.error === false) {
        // Refresh communications to get the latest revision request
        const commsResponse = await ORDER_API.GET_DESIGN_COMMUNICATIONS(
          parseInt(order.id),
          productId
        );

        if (commsResponse.error === false && commsResponse.data) {
          setCommunications(commsResponse.data);
        }

        setDesignHistories((prev) => ({
          ...prev,
          [productId]:
            prev[productId]?.map((artwork) =>
              artwork.id === artworkId
                ? {
                    ...artwork,
                    isApproved: false,
                    notes: feedback,
                    updatedAt: new Date().toISOString(),
                  }
                : artwork
            ) || [],
        }));
      }
    } catch (error) {
      console.error("Error requesting revision:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-2 xs:px-3 sm:px-4 lg:px-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#155670] to-[#0d3d47] px-3 xs:px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  Order Details
                </h1>
                <p className="text-xs sm:text-sm text-white/80">
                  Complete information about your order
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Share</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Download</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <div className="p-2 sm:p-3 bg-[#155670] rounded-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Order Number
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                      #{order.id}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="hidden xs:inline">
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Order Date
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900">
                      {order.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-lg flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                      Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Ship To:
                        </p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                          {order.shipTo}
                        </p>
                        {/* ADD THIS SECTION FOR SHIPPING METHOD */}
                      <div className="mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Shipping Method:
                        </p>
                        <p className="font-semibold text-[#155670] text-sm sm:text-base">
                          {order.total > 2000
                            ? "Free Delivery"
                            : "Standard Delivery"}
                        </p>
                      </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Address:
                        </p>
                        <p className="text-gray-800 text-sm sm:text-base break-words">
                          {order.address}
                        </p>
                      </div>

                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Order Summary
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">
                      Items ({order.itemCount})
                    </span>
                    <span className="font-semibold">
                      ZAR {order.total.toFixed(2)}
                    </span>
                  </div>
                  {order.savings && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>You Saved</span>
                      <span className="font-semibold">
                        -ZAR {order.savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 sm:pt-3">
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-[#155670]">
                        ZAR {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-3 xs:px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Order Items
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            All items in this order
          </p>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            {order.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="space-y-4">
                {/* Item Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-[#155670]/30 hover:shadow-md transition-all duration-200 gap-3 sm:gap-4 lg:gap-6"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 sm:p-3"
                      />
                      {item.isBranded && (
                        <div className="absolute top-0 right-0 bg-[#155670] text-white text-xs px-1 rounded-bl-lg">
                          Branded
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-1 sm:mb-2 break-words">
                        {item.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Price</p>
                          <p className="text-gray-900 font-semibold">
                            ZAR {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Quantity</p>
                          <p className="text-gray-900 font-semibold">
                            {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Category</p>
                          <p className="text-gray-900 break-words">
                            {item.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Brand</p>
                          <p className="text-gray-900 break-words">
                            {item.brand}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
                      Item Total
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[#155670]">
                      ZAR {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex flex-row sm:flex-col gap-2 mt-2">
                      {item.isBranded && item.brandingConfig && (
                        <>
                          <motion.button
                            onClick={() =>
                              handleViewBranding(item.brandingConfig)
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-[#155670] hover:bg-[#155670]/10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start"
                          >
                            <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              View Branding
                            </span>
                          </motion.button>
                          
                        </>
                      )}
                      {order.status === "completed" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1 text-[#155670] hover:bg-[#155670]/10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start"
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Review</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Branding Design Section - Placed below the item card */}
                {item.isBranded && item.brandingConfig && (
                  <CustomerBrandingDesignSection
                    key={`design-${item.id}`}
                    order={order}
                    product={item}
                    brandedArtworks={designHistories[item.id] || []}
                    loading={loadingStates[item.id] || false}
                    error={errorStates[item.id]}
                    onSendMessage={handleSendMessage}
                    onApproveMockup={(artworkId) =>
                      handleApproveMockup(artworkId, item.id)
                    }
                    onRequestRevision={(artworkId, feedback) =>
                      handleRequestRevision(artworkId, item.id, feedback)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BrandingPreviewModal
        showPreview={showBrandingPreview}
        setShowPreview={setShowBrandingPreview}
        brandingSetup={getBrandingSetup()!}
        onConfirm={() => setShowBrandingPreview(false)}
      />

      <CustomerCommunicationModal
        isOpen={showCommunicationModal}
        onClose={() => {
          setShowCommunicationModal(false);
          setSelectedProduct(null);
        }}
        communications={communications.filter((comm) =>
          selectedProduct ? comm.productId === selectedProduct.id : true
        )}
        onSendMessage={handleSendMessage}
        orderId={order.id}
        productName={selectedProduct?.name || "Order"}
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-[#155670] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-gradient-to-r from-[#155670] to-[#0d3d47] text-white shadow-md"
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
            className="p-1.5 sm:p-2 text-gray-600 hover:text-[#155670] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
};
