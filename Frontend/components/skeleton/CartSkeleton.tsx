import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const CartSkeleton = () => {
  const skeletonVariants = {
    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const SkeletonBox = ({ className }: { className: string }) => (
    <motion.div
      variants={skeletonVariants as any}
      animate="pulse"
      className={`bg-gray-200 rounded ${className}`}
    />
  );

  const CartItemSkeleton = () => (
    <div className="p-4 md:p-6 border-b border-gray-100">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="flex gap-4">
          <SkeletonBox className="w-20 h-20 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-3 w-1/3" />
            <SkeletonBox className="h-3 w-2/5" />
          </div>
          <SkeletonBox className="w-8 h-8 rounded" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-4 w-8" />
            <SkeletonBox className="h-10 w-24 rounded-lg" />
          </div>
          <div className="text-right space-y-1">
            <SkeletonBox className="h-5 w-20" />
            <SkeletonBox className="h-4 w-16" />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6 flex items-center gap-4">
          <SkeletonBox className="w-20 h-20 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-3 w-1/3" />
            <SkeletonBox className="h-3 w-2/5" />
          </div>
        </div>

        <div className="col-span-2 flex justify-center">
          <SkeletonBox className="h-10 w-24 rounded-lg" />
        </div>

        <div className="col-span-3 text-center space-y-1">
          <SkeletonBox className="h-5 w-20 mx-auto" />
          <SkeletonBox className="h-4 w-16 mx-auto" />
        </div>

        <div className="col-span-1 flex justify-center">
          <SkeletonBox className="w-8 h-8 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 text-gray-300">
                <ArrowLeft className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <SkeletonBox className="h-6 w-40" />
                <SkeletonBox className="h-4 w-32" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-300">
              <ShoppingCart className="h-4 w-4" />
              <SkeletonBox className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid xl:grid-cols-3 lg:grid-cols-3 gap-8">
          {/* Cart Items Section Skeleton */}
          <div className="xl:col-span-2 lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Desktop Header Row Skeleton */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                <div className="col-span-6">
                  <SkeletonBox className="h-4 w-16" />
                </div>
                <div className="col-span-2 text-center">
                  <SkeletonBox className="h-4 w-16 mx-auto" />
                </div>
                <div className="col-span-3 text-center">
                  <SkeletonBox className="h-4 w-12 mx-auto" />
                </div>
                <div className="col-span-1 text-center">
                  <SkeletonBox className="h-4 w-14 mx-auto" />
                </div>
              </div>

              {/* Cart Items Skeleton */}
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, index) => (
                  <CartItemSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section Skeleton */}
          <div className="xl:col-span-1 lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <SkeletonBox className="w-5 h-5 rounded" />
                <SkeletonBox className="h-5 w-32" />
              </div>

              {/* Free Shipping Notice Skeleton */}
              <div className="p-4 bg-gray-50 rounded-xl mb-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-5 h-5 rounded-full" />
                  <SkeletonBox className="h-4 w-48" />
                </div>
              </div>

              {/* Price Breakdown Skeleton */}
              <div className="space-y-4 mb-6">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <SkeletonBox className="h-4 w-32" />
                    <SkeletonBox className="h-4 w-20" />
                  </div>
                ))}

                {/* Shipping Options Skeleton */}
                <div className="space-y-3 pt-2">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <SkeletonBox className="w-4 h-4 rounded-full" />
                      <div className="flex items-center gap-2 flex-1">
                        <SkeletonBox className="w-4 h-4 rounded" />
                        <SkeletonBox className="h-4 w-24" />
                      </div>
                      <SkeletonBox className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Code Skeleton */}
              <div className="mb-6">
                <SkeletonBox className="h-4 w-32 mb-3" />
                <div className="flex gap-2">
                  <SkeletonBox className="flex-1 h-12 rounded-xl" />
                  <SkeletonBox className="w-16 h-12 rounded-xl" />
                </div>
              </div>

              {/* Grand Total Skeleton */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <SkeletonBox className="h-5 w-16" />
                  <SkeletonBox className="h-6 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonBox className="h-3 w-32" />
                  <SkeletonBox className="h-3 w-20" />
                </div>
              </div>

              {/* Checkout Button Skeleton */}
              <SkeletonBox className="w-full h-14 rounded-xl mb-4" />

              {/* Security Notice Skeleton */}
              <div className="text-center space-y-2">
                <SkeletonBox className="h-3 w-40 mx-auto" />
                <SkeletonBox className="h-3 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CartSkeleton;