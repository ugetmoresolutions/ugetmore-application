// components/schools/SchoolsPage.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, GraduationCap, MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ISchool } from "@/interfaces/school/school";
import Pagination from "@/components/common/Pagination";
import { ProductGridSkeleton } from "@/components/skeleton/ProductSkeleton";
import { SCHOOL_API } from "@/endpoints/rest-api/school";
import BackToSchoolStationeryBanner from "./back-to-school";
import { SchoolCouponCarousel } from "./AdvertisementCarousel";


const SCHOOLS_PER_PAGE = 12;



// export const AdvertisementCarousel = () => {
//   const [currentAd, setCurrentAd] = useState(0);

//   const advertisements = [
//     {
//       id: 1,
//       image: "/back-to-school/b2s1.png",
//       title: "Back-to-School Starter Pack 🎒",
//       description:
//         "Get all your stationery essentials ready for the new term! Use the code below to claim your special discount.",
//       code: "B2S2025",
//       color: "from-yellow-400 to-orange-600",
//     },
//     {
//       id: 2,
//       image: "/back-to-school/b2s2.png",
//       title: "Smart Savings for Students ✏️",
//       description:
//         "Save 25% on notebooks, pens & calculators — your school year essentials are just a click away!",
//       code: "STUDENT25",
//       color: "from-blue-500 to-indigo-700",
//     },
//     {
//       id: 3,
//       image: "/back-to-school/b2s3.png",
//       title: "School Ready, Wallet Happy 📚",
//       description:
//         "Get 15% OFF any stationery combo for your little one. Let’s make this term bright and productive!",
//       code: "SCHOOLREADY15",
//       color: "from-green-500 to-emerald-700",
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentAd((prev) => (prev + 1) % advertisements.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [advertisements.length]);

//   return (
//     <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
//       {/* Give a fixed but flexible height that adjusts well */}
//       <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[500px]">
//         {advertisements.map((ad, index) => (
//           <div
//             key={ad.id}
//             className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
//               index === currentAd ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             {/* Background Image */}
//             <Image
//               src={ad.image}
//               alt={ad.title}
//               fill
//               className="object-cover object-center"
//               priority={index === 0}
//               quality={80}
//             />

//             {/* Gradient Overlay */}
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${ad.color} opacity-65`}
//             />

//             {/* Centered Content */}
//             <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6  ">
//               <div className="max-w-xl space-y-4 sm:space-y-5">
//                 <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg leading-snug">
//                   {ad.title}
//                 </h3>
//                 <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md">
//                   {ad.description}
//                 </p>

//                 {/* Coupon Section */}
//                 <div className="pt-2">
//                   <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-md tracking-wide inline-block mb-1">
//                     {ad.code}
//                   </span>
//                   <p className="text-white/80 text-xs sm:text-sm italic">
//                     Use this code at checkout
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Ad Indicators */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
//           {advertisements.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentAd(index)}
//               className={`h-2 rounded-full transition-all duration-300 ${
//                 index === currentAd ? "bg-white w-8" : "bg-white/50 w-2"
//               }`}
//               aria-label={`Go to ad ${index + 1}`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };



const SchoolsPage: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch schools data
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const response = await SCHOOL_API.GET_ACTIVE_SCHOOLS();
        if (response.data) {
          setSchools(response.data);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase();
    return schools.filter(school =>
      school.name.toLowerCase().includes(query) ||
      school.code.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  // Paginate schools
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * SCHOOLS_PER_PAGE;
    return filteredSchools.slice(startIndex, startIndex + SCHOOLS_PER_PAGE);
  }, [filteredSchools, currentPage]);

  const totalPages = Math.ceil(filteredSchools.length / SCHOOLS_PER_PAGE);

  // Handle school click
  const handleSchoolClick = (id: number) => {
    router.push(`/client/shop/schools/${id}`);
  };

  return (
    <>
      <BackToSchoolStationeryBanner />

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 ">
        

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Advertisement Sidebar - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 xl:col-span-3"
            >
              <div className="sticky top-4">
                <SchoolCouponCarousel />
              </div>
            </motion.div>

            {/* Schools Section - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-8 xl:col-span-9"
            >
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search schools by name or code..."
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Results Count */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={searchQuery + filteredSchools.length}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">
                      {filteredSchools.length}
                    </span>
                    {filteredSchools.length === 1 ? "school" : "schools"} available
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Schools Grid */}
              {loading ? (
                <ProductGridSkeleton />
              ) : filteredSchools.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded shadow-sm p-12 text-center"
                >
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No schools found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? `No schools match "${searchQuery}". Try a different search term.`
                      : "No schools are currently available."}
                  </p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={currentPage + searchQuery}
                  >
                    {paginatedSchools.map((school, index) => (
                      <motion.div
                        key={school.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="group bg-white rounded shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200"
                        onClick={() => handleSchoolClick(school.id)}
                      >
                        {/* School Image */}
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          <Image
                            src={school.imageUrl || "/back.jpg"}
                            alt={school.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            quality={75}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-[#155670]/0 group-hover:bg-[#155670]/10 transition-colors duration-300" />
                          
                          {/* School Code Badge */}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold text-gray-700">
                              {school.code}
                            </span>
                          </div>
                        </div>

                        {/* School Info */}
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-[#155670] transition-colors">
                            {school.name}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              View Grades
                            </span>
                            <ChevronRight className="w-5 h-5 text-[#155670] group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      className="mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolsPage;