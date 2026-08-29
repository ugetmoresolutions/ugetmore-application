// components/admin/AdminOrders.tsx
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrdersList } from "./OrdersList";
import { OrderDetail } from "./OrderDetail";
import { Order, OrderStatus } from "@/interfaces/order/order";
import { ORDER_API } from "@/endpoints/rest-api/order";

function AdminOrders() {
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = 1;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedOrder(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Corrected status change flow:
   * 1. Update backend
   * 2. Clear the exact cache key used by OrdersList: "admin_orders_cache_v1"
   * 3. Remove any service worker/cache entries that include "admin_orders_cache"
   * 4. Dispatch a custom event (optional) so other components can react immediately
   * 5. Go back to the list view so OrdersList remounts and fetches fresh data
   */
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => {
    setIsLoading(true);

    try {
      // Convert orderId to number (backend expects number)
      const numericOrderId = parseInt(orderId);

      // Call the API to update status
      const response = await ORDER_API.UPDATE_ORDER_STATUS(
        numericOrderId,
        newStatus
      );

      if (response.error) {
        throw new Error(response.message || "Failed to update order status");
      }

      // Update local selected order state (nice UX while we refresh)
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // --------- CLEAR CACHED ORDERS (use your exact cache key) ----------
      try {
        // Exact localStorage key used by OrdersList
        const cacheKey = "admin_orders_cache_v1";
        localStorage.removeItem(cacheKey);

        // Clear only caches whose names include the cache prefix
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          const adminCaches = cacheNames.filter((n) =>
            n.includes("admin_orders_cache")
          );
          await Promise.all(adminCaches.map((name) => caches.delete(name)));
        }

        // Dispatch an event so any mounted OrdersList can react immediately
        // (optional — OrdersList currently doesn't listen but this is forward-compatible)
        window.dispatchEvent(
          new CustomEvent("admin_orders_cache_cleared", {
            detail: { orderId, newStatus },
          })
        );
      } catch (cacheErr) {
        console.warn("Failed to clear admin orders cache:", cacheErr);
      }

      // Small delay to ensure cache cleared before remount (not strictly necessary)
      setTimeout(() => {
        handleBackToList();
      }, 150);

    } catch (error) {
      console.error("❌ Status update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#155670] border-t-transparent" />
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 mb-1">
                    Processing Request
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please wait while we update your order...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto ">
        <AnimatePresence mode="wait">
          {currentView === "list" && (
            <motion.div
              key="ordersList"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OrdersList
                onViewOrder={handleViewOrder}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}

          {currentView === "detail" && selectedOrder && (
            <motion.div
              key="orderDetail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <OrderDetail
                order={selectedOrder}
                onBack={handleBackToList}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>🔒 All order data is securely encrypted and stored</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminOrders;
