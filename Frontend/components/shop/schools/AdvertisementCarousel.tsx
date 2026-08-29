"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { COUPON_API } from "@/endpoints/rest-api/coupon";
import { SCHOOL_API } from "@/endpoints/rest-api/school";
import { ICoupon } from "@/interfaces/coupon/coupon";
import { ISchool } from "@/interfaces/school/school";

// Local storage keys
const SCHOOL_COUPONS_STORAGE_KEY = "school_coupons";
const SCHOOL_COUPONS_TIMESTAMP_KEY = "school_coupons_timestamp";
const SCHOOLS_DATA_STORAGE_KEY = "schools_data";
const SCHOOLS_DATA_TIMESTAMP_KEY = "schools_data_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper functions - moved outside the component
const getCouponImage = (index: number) => {
  const images = [
    "/back-to-school/b2s1.png",
    "/back-to-school/b2s2.png",
    "/back-to-school/b2s3.png",
    "/back-to-school/b2s1.png", // fallbacks
    "/back-to-school/b2s2.png",
  ];
  return images[index % images.length];
};

const getCouponTitle = (coupon: ICoupon, school?: ISchool) => {
  if (coupon.couponType === "school" && school) {
    return `${school.name} Exclusive Offer 🎒`;
  } else if (coupon.couponType === "general") {
    return "Special Discount for Students ✏️";
  }
  return "Amazing School Deal 📚";
};

interface SchoolCouponCarouselProps {
  schoolId?: number; // Optional school ID to filter coupons for specific school
}

export const SchoolCouponCarousel = ({ schoolId }: SchoolCouponCarouselProps) => {
  const [currentAd, setCurrentAd] = useState(0);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load schools data
  const loadSchools = async () => {
    try {
      // Check if we have cached schools data
      const cachedSchools = localStorage.getItem(SCHOOLS_DATA_STORAGE_KEY);
      const cachedTimestamp = localStorage.getItem(SCHOOLS_DATA_TIMESTAMP_KEY);
      
      if (cachedSchools && cachedTimestamp) {
        const now = Date.now();
        const cacheTime = parseInt(cachedTimestamp);
        
        // Use cache if it's still valid
        if (now - cacheTime < CACHE_DURATION) {
          setSchools(JSON.parse(cachedSchools));
          return;
        }
      }
      
      // Fetch fresh schools data from API
      const response = await SCHOOL_API.GET_ACTIVE_SCHOOLS();
      
      if (response.data && Array.isArray(response.data)) {
        setSchools(response.data);
        
        // Cache the schools data
        localStorage.setItem(SCHOOLS_DATA_STORAGE_KEY, JSON.stringify(response.data));
        localStorage.setItem(SCHOOLS_DATA_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (err) {
      console.error("Error loading schools:", err);
      // If schools fail to load, we'll still try to load coupons
    }
  };

  // Get school by ID
  const getSchoolById = (schoolId: number) => {
    return schools.find(school => school.id === schoolId);
  };

  // Filter and transform coupons for display
  const advertisementCoupons = useMemo(() => {
    return coupons
      .filter(coupon => {
        // Filter active coupons that are for schools or general
        const isActive = coupon.isActive;
        const isValidDate = new Date() >= new Date(coupon.validFrom) && new Date() <= new Date(coupon.validTo);
        const isSchoolOrGeneral = coupon.couponType === "school" || coupon.couponType === "general";
        const hasUsageLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        
        return isActive && isValidDate && isSchoolOrGeneral && hasUsageLeft;
      })
      .map((coupon, index) => {
        // Get school information for school-specific coupons
        const school = coupon.applicableSchoolId ? getSchoolById(coupon.applicableSchoolId) : undefined;

        // Determine background color based on coupon type
        const getColorClass = () => {
          switch (coupon.couponType) {
            case "school":
              return "from-blue-500 to-indigo-700";
            case "general":
              return "from-green-500 to-emerald-700";
            default:
              return "from-purple-500 to-pink-700";
          }
        };

        // Generate description based on coupon details
        const generateDescription = () => {
          const discountText = coupon.discountType === 'percentage' 
            ? `${coupon.discountValue}% OFF` 
            : `R${coupon.discountValue} OFF`;
          
          const minAmountText = coupon.minimumCartAmount 
            ? ` on orders over R${coupon.minimumCartAmount}` 
            : ' on any order';
          
          const schoolText = school ? ` for ${school.name} students` : ' for all students';
          
          return `Get ${discountText}${minAmountText}${schoolText}. ${coupon.description || 'Special school offer!'}`;
        };

        return {
          id: coupon.id,
          image: getCouponImage(index), // Fallback images
          title: getCouponTitle(coupon, school),
          description: generateDescription(),
          code: coupon.code,
          color: getColorClass(),
          couponData: coupon, // Keep original coupon data
          school: school, // Include school data
        };
      });
  }, [coupons, schools]);

  // Load coupons from localStorage or API
  const loadCoupons = async () => {
    try {
      setLoading(true);
      
      // Load schools first
      await loadSchools();
      
      // Check if we have cached data
      const cachedCoupons = localStorage.getItem(SCHOOL_COUPONS_STORAGE_KEY);
      const cachedTimestamp = localStorage.getItem(SCHOOL_COUPONS_TIMESTAMP_KEY);
      
      if (cachedCoupons && cachedTimestamp) {
        const now = Date.now();
        const cacheTime = parseInt(cachedTimestamp);
        
        // Use cache if it's still valid
        if (now - cacheTime < CACHE_DURATION) {
          setCoupons(JSON.parse(cachedCoupons));
          setLoading(false);
          return;
        }
      }
      
      // Fetch fresh data from API
      let response;
      if (schoolId) {
        response = await COUPON_API.GET_COUPONS_BY_SCHOOL(schoolId);
      } else {
        response = await COUPON_API.GET_ACTIVE_COUPONS();
      }
      
      if (response.data && Array.isArray(response.data)) {
        const schoolCoupons = response.data.filter(coupon => 
          coupon.couponType === "school" || coupon.couponType === "general"
        );
        
        setCoupons(schoolCoupons);
        
        // Cache the data
        localStorage.setItem(SCHOOL_COUPONS_STORAGE_KEY, JSON.stringify(schoolCoupons));
        localStorage.setItem(SCHOOL_COUPONS_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
      setError("Failed to load coupons. Please try again later.");
      
      // Try to use cached data even if expired as fallback
      const cachedCoupons = localStorage.getItem(SCHOOL_COUPONS_STORAGE_KEY);
      if (cachedCoupons) {
        setCoupons(JSON.parse(cachedCoupons));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [schoolId]);

  // Auto-rotate coupons
  useEffect(() => {
    if (advertisementCoupons.length > 1) {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % advertisementCoupons.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [advertisementCoupons.length]);

  // Clear cache function
  const clearCache = () => {
    localStorage.removeItem(SCHOOL_COUPONS_STORAGE_KEY);
    localStorage.removeItem(SCHOOL_COUPONS_TIMESTAMP_KEY);
    localStorage.removeItem(SCHOOLS_DATA_STORAGE_KEY);
    localStorage.removeItem(SCHOOLS_DATA_TIMESTAMP_KEY);
    loadCoupons(); // Reload fresh data
  };

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading school offers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && advertisementCoupons.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[500px] bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={clearCache}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (advertisementCoupons.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[500px] bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2">No Active Offers</h3>
            <p>Check back later for school discounts and promotions!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
      {/* Give a fixed but flexible height that adjusts well */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[600px]">
        <AnimatePresence mode="wait">
          {advertisementCoupons.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentAd ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 ${
                index === currentAd ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              {/* Background Image */}
              <Image
                src={ad.image}
                alt={ad.title}
                fill
                className="object-cover object-center"
                priority={index === 0}
                quality={80}
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${ad.color} opacity-65`}
              />

              {/* Centered Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6">
                <div className="max-w-xl space-y-4 sm:space-y-5">
                  
                  {/* School Logo and Name - Only show for school-specific coupons */}
                  {ad.school && (
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-10 h-10 relative rounded-full bg-white p-1 shadow-lg">
                        <Image
                          src={ad.school.imageUrl}
                          alt={ad.school.name}
                          fill
                          className="object-contain rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm font-semibold bg-black/30 px-3 py-1 rounded-full">
                        {ad.school.name}
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg leading-snug">
                    {ad.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md">
                    {ad.description}
                  </p>

                  {/* Coupon Section */}
                  <div className="pt-2">
                    <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-md tracking-wide inline-block mb-1">
                      {ad.code}
                    </span>
                    <p className="text-white/80 text-xs sm:text-sm italic">
                      Use this code at checkout
                    </p>
                  </div>

                  {/* Additional Coupon Details */}
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-white/80">
                    {ad.couponData.validTo && (
                      <span className="bg-black/30 px-2 py-1 rounded">
                        Valid until: {new Date(ad.couponData.validTo).toLocaleDateString()}
                      </span>
                    )}
                    {ad.couponData.usageLimit && (
                      <span className="bg-black/30 px-2 py-1 rounded">
                        {ad.couponData.usageLimit - (ad.couponData.usedCount || 0)} uses left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Ad Indicators */}
        {advertisementCoupons.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {advertisementCoupons.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAd(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentAd ? "bg-white w-8" : "bg-white/50 w-2"
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Cache refresh button */}
        <button
          onClick={clearCache}
          className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10"
          title="Refresh offers"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Usage example:
// <SchoolCouponCarousel schoolId={14} /> // For specific school
// <SchoolCouponCarousel /> // For all active school/general coupons