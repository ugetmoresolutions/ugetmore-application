"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { COUPON_API } from "@/endpoints/rest-api/coupon";
import { ICoupon } from "@/interfaces/coupon/coupon";

// Vibrant Temu-style background images
const BACKGROUND_IMAGES = {
  product: [
    "/yougetmore assets/pictures/branding/B1.jpg",
    "/yougetmore assets/pictures/electronics/T1.jpg",
  ],
  category: [
    "/yougetmore assets/pictures/branding/B1.jpg",
    "/yougetmore assets/pictures/electronics/T1.jpg",
  ],
  general: [
    "/yougetmore assets/pictures/branding/B1.jpg",
    "/yougetmore assets/pictures/electronics/T1.jpg",
  ]
};

const FALLBACK_IMAGES = [
  "/yougetmore assets/pictures/branding/B1.jpg",
  "/yougetmore assets/pictures/electronics/T1.jpg",
];

const getBackgroundImage = (couponType: string, index: number) => {
  const typeImages = BACKGROUND_IMAGES[couponType as keyof typeof BACKGROUND_IMAGES];
  if (typeImages && typeImages[index % typeImages.length]) {
    return typeImages[index % typeImages.length];
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
};

// Temu-style vibrant gradients
const getGradientOverlay = (type: string) => {
  switch (type) {
    case "product": return "from-orange-500/90 via-red-500/80 to-pink-600/90";
    case "category": return "from-purple-600/90 via-pink-500/80 to-rose-600/90";
    case "general": return "from-blue-600/90 via-cyan-500/80 to-teal-600/90";
    default: return "from-orange-500/90 to-red-600/90";
  }
};

const getCouponIcon = (type: string) => {
  switch (type) {
    case "product": return "🔥";
    case "category": return "🎯";
    case "general": return "🎁";
    default: return "✨";
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // You can add a toast notification here
};

export const ProductCouponBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await COUPON_API.GET_ACTIVE_COUPONS();
        
        if (response.data && Array.isArray(response.data)) {
          const filteredCoupons = response.data
            .filter((coupon: ICoupon) => {
              const isCorrectType = ["product", "category", "general"].includes(coupon.couponType);
              const isActive = coupon.isActive;
              const isValidDate = new Date() >= new Date(coupon.validFrom) && 
                                new Date() <= new Date(coupon.validTo);
              const hasUsageLeft = !coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;
              
              return isCorrectType && isActive && isValidDate && hasUsageLeft;
            })
            .map((coupon: ICoupon, index: number) => ({
              id: coupon.id,
              code: coupon.code,
              type: coupon.couponType,
              discount: coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}% OFF` 
                : `R${coupon.discountValue} OFF`,
              description: coupon.description || `Limited time ${coupon.couponType} offer! 🎉`,
              minimumCartAmount: coupon.minimumCartAmount,
              validTo: coupon.validTo,
              usageLimit: coupon.usageLimit,
              usedCount: coupon.usedCount || 0
            }));

          setCoupons(filteredCoupons);
        }
      } catch (error) {
        console.error("Failed to load coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, []);

  // Auto-rotate coupons with pause on hover
  useEffect(() => {
    if (coupons.length > 1 && !isHovering) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % coupons.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [coupons.length, isHovering]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl shadow-2xl overflow-hidden mb-6">
        <div className="h-24 md:h-20 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return null;
  }

  return (
    <div 
      className="w-full max-w-7xl mx-auto rounded-2xl shadow-2xl overflow-hidden mb-6 cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative h-24 md:h-20">
        <AnimatePresence mode="wait">
          {coupons.map((coupon, index) => (
            index === currentIndex && (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Background Image with Gradient */}
                <div className="absolute inset-0">
                  <Image
                    src={getBackgroundImage(coupon.type, index)}
                    alt="Coupon Background"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${getGradientOverlay(coupon.type)}`} />
                  
                  {/* Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>

                {/* Content Container */}
                <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 text-white">
                  
                  {/* Left Section - Discount & Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <span className="text-3xl md:text-2xl filter drop-shadow-lg flex-shrink-0">
                      {getCouponIcon(coupon.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <motion.h3 
                        className="text-2xl md:text-3xl font-black drop-shadow-lg leading-tight"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {coupon.discount}
                      </motion.h3>
                      <p className="text-sm md:text-base font-medium drop-shadow-sm opacity-95 truncate">
                        {coupon.description}
                      </p>
                      {coupon.minimumCartAmount && (
                        <p className="text-xs opacity-80 mt-1">
                          Min. spend: R{coupon.minimumCartAmount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center Section - Coupon Code */}
                  <div className="flex items-center space-x-3 my-2 md:my-0">
                    <motion.div 
                      className="relative bg-white/20 backdrop-blur-lg rounded-xl px-4 py-3 border-2 border-white/40 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-mono font-black text-lg md:text-xl tracking-widest text-white drop-shadow-lg">
                        {coupon.code}
                      </span>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-xl" />
                    </motion.div>
                    
                    {/* Copy Button */}
                    <motion.button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>COPY</span>
                      <span>📋</span>
                    </motion.button>
                  </div>

                  {/* Right Section - CTA & Info */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    {/* Usage Progress */}
                    {coupon.usageLimit && (
                      <div className="hidden md:block text-xs text-white/80">
                        <div className="font-medium">
                          {coupon.usageLimit - coupon.usedCount} left
                        </div>
                        <div className="w-20 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${((coupon.usageLimit - coupon.usedCount) / coupon.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <motion.button
                      className="bg-white text-red-600 px-6 py-3 rounded-xl font-black text-sm shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center space-x-2 group"
                      whileHover={{ scale: 1.05, backgroundColor: "#fff5f5" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>SHOP NOW</span>
                      <span className="group-hover:translate-x-1 transition-transform">➔</span>
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                {coupons.length > 1 && !isHovering && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white/60"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                  />
                )}
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Navigation Dots */}
        {coupons.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {coupons.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-white scale-125" 
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`View offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};