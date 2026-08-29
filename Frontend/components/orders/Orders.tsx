"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrdersList } from './OrdersList';
import { OrderDetail } from './OrderDetail';
import { Order } from '@/interfaces/order/order';

function Orders() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = 1;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
   
    const confirmed = window.confirm(`Are you sure you want to cancel order #${orderId}?`);
    if (!confirmed) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
            if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
    } catch (error) {
      console.error('❌ Cancel failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-xs sm:max-w-sm mx-4">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-2 sm:border-3 lg:border-4 border-[#155670] border-t-transparent"></div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1">Processing Request</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Please wait while we update your order...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
            {currentView === 'list' && (
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

            {currentView === 'detail' && selectedOrder && (
              <motion.div
                key="orderDetail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <OrderDetail
                  order={selectedOrder}
                  onCancelOrder={handleCancelOrder}
                  onBack={handleBackToList}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 text-center text-xs sm:text-sm text-gray-500 px-2 sm:px-0"
          >
            <p className="text-xs sm:text-sm">🔒 All order data is securely encrypted and stored</p>
            <p className="mt-1 text-xs sm:text-sm">Last updated: {new Date().toLocaleString()}</p>
          </motion.div>
        </div>
    </div>
  );
}

export default Orders;