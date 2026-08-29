import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Palette,
  Receipt as ReceiptIcon,
  X,
  Scissors,
  Upload,
  MessageSquare,
  Building,
  Briefcase,
  Layers,
} from "lucide-react";
import { CartItemDisplay } from "@/interfaces/cart/cart";

interface ReceiptProps {
  orderId: string;
  orderDate: Date;
  cartItems: CartItemDisplay[];
  itemTotal: number;
  discount: number;
  shippingCost: number;
  vatAmount: number;
  grandTotal: number;
  appliedCoupon?: string;
  shippingMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    businessName?: string;
    role?: string;
    vatNumber?: number;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber: string;
    registrationNumber: string;
  };
  onClose?: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({
  orderId,
  orderDate,
  cartItems,
  itemTotal,
  discount,
  shippingCost,
  vatAmount,
  grandTotal,
  appliedCoupon,
  shippingMethod,
  customerInfo,
  companyInfo,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const brandedItems = cartItems.filter((item) => item.isBranded);
  const regularItems = cartItems.filter((item) => !item.isBranded);
  const subtotalBeforeVAT = itemTotal - discount;
  
  const isFreeShipping =
    itemTotal >= 2000 ||
    shippingMethod === "pickup" ||
    shippingMethod === "free_shipping";

  // Helper function to get branding configuration for an item
  const getBrandingConfig = (item: CartItemDisplay) => {
    return item.brandingConfigs || null;
  };

  // Helper function to format branding method details
  const formatBrandingMethod = (method: any) => {
    if (!method) return "Not specified";
    
    return `${method.brandingName} (${method.brandingDepartment}) - Max Size: ${method.maxPrintingSizeWidth}mm x ${method.maxPrintingSizeHeight}mm`;
  };

  // Helper function to format artwork color type
  const formatArtworkColorType = (type: string) => {
    const types: { [key: string]: string } = {
      pantone: "Pantone Colors",
      cmyk: "CMYK Colors",
      rgb: "RGB Colors",
      spot: "Spot Colors"
    };
    return types[type] || type;
  };

  const downloadReceipt = () => {
    if (receiptRef.current) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${orderId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white; 
              color: black;
              line-height: 1.4;
            }
            .receipt-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white; 
              border: 1px solid #ddd; 
              padding: 30px; 
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #155670; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #155670; 
              margin-bottom: 5px; 
            }
            .receipt-title { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            .info-section h3 { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #155670; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
            }
            .info-section p { 
              margin: 5px 0; 
              font-size: 14px; 
            }
            .items-section { 
              margin: 30px 0; 
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #155670; 
              margin: 25px 0 15px 0; 
              padding: 10px; 
              background: #f8f9fa; 
              border-left: 4px solid #155670; 
            }
            .item-row { 
              display: grid; 
              grid-template-columns: 2fr 1fr 1fr 1fr; 
              gap: 15px; 
              padding: 12px 0; 
              border-bottom: 1px solid #eee; 
              align-items: center; 
            }
            .item-header { 
              font-weight: bold; 
              background: #f8f9fa; 
              padding: 12px 0; 
              border-bottom: 2px solid #ddd; 
            }
            .branded-item { 
              background: #f0f8ff; 
              padding: 10px; 
              border-left: 3px solid #4169e1; 
              margin: 5px 0; 
            }
            .branding-details { 
              font-size: 12px; 
              color: #666; 
              margin-top: 5px; 
            }
            .totals-section { 
              margin-top: 30px; 
              border-top: 2px solid #ddd; 
              padding-top: 20px; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              font-size: 14px; 
            }
            .grand-total { 
              font-size: 18px; 
              font-weight: bold; 
              border-top: 2px solid #155670; 
              padding-top: 15px; 
              margin-top: 15px; 
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              border-top: 1px solid #ddd; 
              padding-top: 20px; 
            }
            .branding-section {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 15px;
              margin: 10px 0;
            }
            .branding-detail-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 14px;
            }
            .branding-label {
              font-weight: 600;
              color: #495057;
            }
            .branding-value {
              color: #155670;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt-container { border: none; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
        </html>
      `;

      const blob = new Blob([receiptHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#155670] to-blue-600 text-white p-3 sm:p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <ReceiptIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-lg font-semibold truncate">
              <span className="hidden sm:inline">Order Receipt - Document</span>
              <span className="sm:hidden">Order Receipt</span>
            </span>
          </div>
          <button
            className="text-blue-100 hover:text-white transition-colors p-1"
            onClick={onClose}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Document Content */}
        <div className="bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(95vh-100px)] md:max-h-[calc(95vh-80px)]">
          {/* PDF Paper Effect */}
          <div
            className="bg-white shadow-lg mx-auto"
            style={{ minHeight: "297mm", width: "100%", maxWidth: "210mm" }}
          >
            <div ref={receiptRef} className="p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Document Header */}
              <div className="border-b-2 border-[#155670] pb-4 sm:pb-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#155670] mb-2">
                      <span className="hidden sm:inline">ORDER RECEIPT</span>
                      <span className="sm:hidden">RECEIPT</span>
                    </h1>
                    <div className="text-center sm:text-left">
                      <div className="text-lg sm:text-xl font-bold text-[#155670] mb-1">
                        {companyInfo.name}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {companyInfo.address}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Tel: {companyInfo.phone} | Email: sales@ugtmogroup.com
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        VAT No: 4820318535
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        Level 1 B-BBEE Contributor
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                          Date: {orderDate.toLocaleDateString("en-ZA")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Order: {orderId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="bg-gray-100 px-3 sm:px-4 py-2 rounded">
                      <p className="text-xs text-gray-500 mb-1">Order ID</p>
                      <p className="font-mono text-xs sm:text-sm font-bold">
                        {orderId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b border-gray-300 pb-2">
                  ORDER SUMMARY
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Total Items:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        {cartItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Regular Items:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        {regularItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Branded Items:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        {brandedItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Shipping Method:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        {shippingMethod === "pickup"
                          ? "Store Pickup"
                          : shippingMethod === "free_shipping" || isFreeShipping
                          ? "Free Shipping"
                          : "Standard Shipping"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Subtotal:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        ZAR{" "}
                        {itemTotal.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        Discount:
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-green-600">
                        -ZAR{" "}
                        {discount.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm sm:text-base text-gray-600">
                        VAT (15%):
                      </span>
                      <span className="text-sm sm:text-base font-semibold">
                        ZAR{" "}
                        {vatAmount.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-[#155670] font-bold text-base sm:text-lg">
                      <span>TOTAL:</span>
                      <span>
                        ZAR{" "}
                        {grandTotal.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer and Order Info */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-4 sm:h-6 bg-blue-600 rounded"></div>
                  <span className="text-sm sm:text-base">
                    CUSTOMER & ORDER DETAILS
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Customer Information
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        <span className="break-words">{customerInfo.name}</span>
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        <span className="break-words">
                          {customerInfo.email}
                        </span>
                      </p>
                      {customerInfo.phone && (
                        <p>
                          <strong>Phone:</strong> {customerInfo.phone}
                        </p>
                      )}
                      {customerInfo.address &&
                        customerInfo.address.trim().length > 0 && (
                          <div>
                            <strong>Address:</strong>
                            <div className="break-words ml-2">
                              {customerInfo.address}
                            </div>
                          </div>
                        )}

                      {customerInfo.businessName &&
                        customerInfo.businessName.trim().length > 0 && (
                          <div className="flex">
                            <strong>Business :</strong>
                            <div className="break-words ml-2">
                              {customerInfo.businessName}
                            </div>
                          </div>
                        )}

                      {customerInfo.vatNumber && (
                        <div className="flex">
                          <strong>Vat Number :</strong>
                          <div className="break-words ml-2">
                            {customerInfo.vatNumber}
                          </div>
                        </div>
                      )}

                      {customerInfo.role &&
                        customerInfo.role.trim().length > 0 && (
                          <div className="flex">
                            <strong>Account :</strong>
                            <div className="break-words ml-2">
                              {customerInfo.role}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      Order Information
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p>
                        <strong>Order ID:</strong> {orderId}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {orderDate.toLocaleDateString("en-ZA")}
                      </p>
                      <p>
                        <strong>Time:</strong> {orderDate.toLocaleTimeString()}
                      </p>
                      <p>
                        <strong>Shipping Method:</strong>{" "}
                        <span className="text-sm sm:text-base font-semibold">
                          {shippingMethod === "pickup"
                            ? "Store Pickup"
                            : shippingMethod === "free_shipping" ||
                              isFreeShipping
                            ? "Free Shipping"
                            : "Standard Shipping"}
                        </span>
                      </p>
                      {appliedCoupon && (
                        <p>
                          <strong>Coupon:</strong> {appliedCoupon}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Items */}
              {regularItems.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-4 sm:h-6 bg-green-600 rounded"></div>
                    <span className="text-sm sm:text-base">
                      REGULAR ITEMS ({regularItems.length})
                    </span>
                  </h3>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile view - stacked cards */}
                    <div className="block lg:hidden">
                      {regularItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-3 sm:p-4 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } border-b border-gray-200 last:border-b-0`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {item.brand} • {item.category}
                              </p>
                              <p className="text-xs text-gray-500">
                                SKU: {item.sku}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Qty:</span>
                              <span className="ml-1 font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Unit:</span>
                              <span className="ml-1 font-medium">
                                ZAR{" "}
                                {item.price.toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <span className="ml-1 font-semibold">
                                ZAR{" "}
                                {(item.price * item.quantity).toLocaleString(
                                  "en-ZA",
                                  { minimumFractionDigits: 2 }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop view - table */}
                    <table className="w-full hidden lg:table">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product Details
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {regularItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {item.brand} • {item.category}
                              </div>
                              <div className="text-xs text-gray-500">
                                SKU: {item.sku}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                              ZAR{" "}
                              {item.price.toLocaleString("en-ZA", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                              ZAR{" "}
                              {(item.price * item.quantity).toLocaleString(
                                "en-ZA",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Branded Items with Detailed Branding Information */}
              {brandedItems.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-4 sm:h-6 bg-purple-600 rounded"></div>
                    <span className="text-sm sm:text-base">
                      CUSTOM BRANDED ITEMS ({brandedItems.length})
                    </span>
                  </h3>

                  <div className="space-y-6">
                    {brandedItems.map((item) => {
                      const brandingConfig = getBrandingConfig(item);
                      
                      return (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm"
                        >
                          {/* Product Header */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                                <Palette className="w-5 h-5" />
                                <span>{item.name}</span>
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.category} • {item.brand}
                              </p>
                              <p className="text-xs text-gray-500">
                                SKU: {item.sku}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="font-bold text-xl text-gray-900">
                                ZAR{" "}
                                {item.price.toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                Total: ZAR{" "}
                                {(item.price * item.quantity).toLocaleString(
                                  "en-ZA",
                                  { minimumFractionDigits: 2 }
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Branding Cost Breakdown */}
                          {brandingConfig?.totalCost && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Branding Cost Breakdown
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Base Price:</span>
                                  <div className="font-semibold">
                                    ZAR {brandingConfig.totalCost.basePrice?.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) || "0.00"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Branding Cost:</span>
                                  <div className="font-semibold">
                                    ZAR {brandingConfig.totalCost.brandingCost?.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) || "0.00"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Setup Fees:</span>
                                  <div className="font-semibold">
                                    ZAR {brandingConfig.totalCost.setupFees?.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) || "0.00"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Design Fees:</span>
                                  <div className="font-semibold">
                                    ZAR {brandingConfig.totalCost.designFees?.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) || "0.00"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Selected Colors */}
                          {brandingConfig?.selectedColors && brandingConfig.selectedColors.length > 0 && (
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                Selected Colors & Quantities
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {brandingConfig.selectedColors.map((color, index) => (
                                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium text-sm">{color.colorName}</span>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {color.colorCode}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Quantity: {color.quantity}
                                    </div>
                                    <div className="text-sm font-medium">
                                      Unit Price: ZAR {color.unitPrice?.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) || "0.00"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Branding Positions and Methods */}
                          {brandingConfig?.selectedPositions && brandingConfig.selectedPositions.length > 0 && (
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Scissors className="w-4 h-4" />
                                Branding Positions & Methods
                              </h5>
                              <div className="space-y-4">
                                {brandingConfig.selectedPositions.map((position, index) => (
                                  <div key={index} className="border rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h6 className="font-semibold text-gray-800">{position.name}</h6>
                                        <p className="text-sm text-gray-600">Position Code: {position.code}</p>
                                      </div>
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                        Applied to {position.appliedToColors?.length || 0} color(s)
                                      </span>
                                    </div>
                                    
                                    {position.selectedMethod && (
                                      <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="font-medium text-blue-800 text-sm">
                                          Selected Method: {position.selectedMethod.brandingName}
                                        </p>
                                        <p className="text-xs text-blue-700">
                                          Department: {position.selectedMethod.brandingDepartment} • 
                                          Max Size: {position.selectedMethod.maxPrintingSizeWidth}mm x {position.selectedMethod.maxPrintingSizeHeight}mm
                                        </p>
                                      </div>
                                    )}

                                    {position.appliedToColors && position.appliedToColors.length > 0 && (
                                      <div className="text-sm text-gray-600">
                                        Applied to colors: {position.appliedToColors.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Branding Configurations */}
                          {brandingConfig?.configurations && brandingConfig.configurations.length > 0 && (
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Branding Specifications
                              </h5>
                              <div className="space-y-4">
                                {brandingConfig.configurations.map((config, index) => (
                                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p><strong>Artwork Option:</strong> {config.artworkOption || "Not specified"}</p>
                                        <p><strong>Color Type:</strong> {formatArtworkColorType(config.artworkColorType)}</p>
                                        {config.companyName && (
                                          <p><strong>Company:</strong> {config.companyName}</p>
                                        )}
                                        {config.industry && (
                                          <p><strong>Industry:</strong> {config.industry}</p>
                                        )}
                                      </div>
                                      <div>
                                        {config.designBrief && (
                                          <p><strong>Design Brief:</strong> {config.designBrief}</p>
                                        )}
                                        {config.instructions && (
                                          <p><strong>Instructions:</strong> {config.instructions}</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Pantone Colors */}
                                    {config.pantoneColors && config.pantoneColors.length > 0 && (
                                      <div className="mt-3">
                                        <p className="font-medium text-sm mb-2">Pantone Colors:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {config.pantoneColors.map((pantone, pantoneIndex) => (
                                            <div key={pantoneIndex} className="bg-white px-3 py-1 rounded border text-xs">
                                              {pantone.pantoneCode || "Not specified"}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Artwork Files */}
                          {brandingConfig?.artworkFiles && brandingConfig.artworkFiles.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Artwork Files ({brandingConfig.artworkFiles.length})
                              </h5>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                  {brandingConfig.artworkFiles.length} artwork file(s) uploaded for processing.
                                  Files will be reviewed by our design team.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Final Totals */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-4 sm:h-6 bg-[#155670] rounded"></div>
                  <span className="text-sm sm:text-base">PAYMENT SUMMARY</span>
                </h3>
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                      <span>
                        Subtotal ({cartItems.length} item
                        {cartItems.length > 1 ? "s" : ""})
                      </span>
                      <span>
                        ZAR{" "}
                        {itemTotal.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between py-2 text-sm text-green-600 border-b border-gray-100">
                        <span>
                          Discount{appliedCoupon ? ` (${appliedCoupon})` : ""}
                        </span>
                        <span>
                          -ZAR{" "}
                          {discount.toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                      <span>Subtotal (before VAT)</span>
                      <span>
                        ZAR{" "}
                        {subtotalBeforeVAT.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                      <span>VAT (15%)</span>
                      <span>
                        ZAR{" "}
                        {vatAmount.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                      <span>
                        Shipping (
                        {shippingMethod === "pickup" ? "Pickup" : "Standard"})
                      </span>
                      <span className={isFreeShipping ? "text-green-600" : ""}>
                        {isFreeShipping
                          ? "FREE"
                          : `ZAR ${shippingCost.toLocaleString("en-ZA", {
                              minimumFractionDigits: 2,
                            })}`}
                      </span>
                    </div>

                    <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-[#155670] mt-4">
                      <span>TOTAL</span>
                      <span>
                        ZAR{" "}
                        {grandTotal.toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 text-center mt-2">
                      (Inclusive of all taxes and fees)
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Footer */}
              <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t-2 border-gray-800">
                <div className="text-center text-xs sm:text-sm text-gray-600 space-y-2">
                  <p>Thank you for your business!</p>
                  <p>
                    For support, contact us at {companyInfo.email} or{" "}
                    {companyInfo.phone}
                  </p>
                  <p className="text-xs">
                    © UGETMO Group - Giving You More Than Just Solutions.
                  </p>
                  {brandedItems.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <strong>Important:</strong> Custom branded items require
                      additional processing time. We will contact you within few
                      days to confirm artwork and production details.
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-600 mt-4 pt-4 border-t border-gray-300">
                  <div>
                    <p>Generated on: {new Date().toLocaleString("en-ZA")}</p>
                    <p>System: Order Management System</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p>Page 1 of 1</p>
                    <p className="text-xs">Confidential Document</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="block sm:inline">
                  Receipt for {cartItems.length} item
                  {cartItems.length > 1 ? "s" : ""}
                </span>
                <span className="block sm:inline sm:ml-1">
                  • Total: ZAR{" "}
                  {grandTotal.toLocaleString("en-ZA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Close Receipt
                  </button>
                )}
                <button
                  onClick={downloadReceipt}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#155670] to-blue-500 hover:from-[#0d3d47] hover:to-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Receipt</span>
                  <span className="sm:hidden">Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
      </motion.div>
    </div>
  );
};

export default Receipt;