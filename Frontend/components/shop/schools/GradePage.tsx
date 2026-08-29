// app/client/schools/[id]/grades/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  ChevronRight,
  School,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IGrade } from "@/interfaces/grade/grade";
import Pagination from "@/components/common/Pagination";
import { ProductGridSkeleton } from "@/components/skeleton/ProductSkeleton";
import { GRADE_API } from "@/endpoints/rest-api/grade";
import { SCHOOL_API } from "@/endpoints/rest-api/school";
import { SchoolCouponCarousel } from "./AdvertisementCarousel";

const GRADES_PER_PAGE = 12;

// Hero Carousel Component
export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    {
      src: "/back-to-school/b2s1.png",
      alt: "Students learning in classroom",
    },
    {
      src: "/back-to-school/b2s2.png",
      alt: "School supplies and stationery",
    },
    {
      src: "/back-to-school/b2s3.png",
      alt: "Modern classroom environment",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative w-full min-h-48 sm:min-h-64 md:min-h-80 lg:min-h-96 ">
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Advertisement Carousel Component
export const AdvertisementCarousel = () => {
  const [currentAd, setCurrentAd] = useState(0);

  const advertisements = [
    {
      id: 1,
      image: "/ads/ads1.jpg",
      title: "Premium Notebooks",
      description: "Get 20% off on all premium notebooks",
      color: "from-blue-500 to-blue-700",
    },
    {
      id: 2,
      image: "/ads/ads2.jpg",
      title: "Art Supplies Sale",
      description: "Creative essentials for every student",
      color: "from-purple-500 to-purple-700",
    },
    {
      id: 3,
      image: "/ads/ads2.jpg",
      title: "Backpack Collection",
      description: "Durable and stylish for the new term",
      color: "from-green-500 to-green-700",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % advertisements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [advertisements.length]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
      <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <Image
              src={advertisements[currentAd].image}
              alt={advertisements[currentAd].title}
              fill
              className="object-cover"
              quality={50}
              priority={currentAd === 0}
            />

            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${advertisements[currentAd].color} opacity-50`}
            />

            {/* Advertisement Content */}
            <div className="relative h-full p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Special Offer
                </span>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  {advertisements[currentAd].title}
                </h3>
                <p className="text-white text-lg mb-6 drop-shadow-md">
                  {advertisements[currentAd].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Ad Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAd(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentAd ? "bg-white w-8" : "bg-white/50 w-2"
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Random educational images for grade cards
const gradeCardImages = [
  "/yougetmore assets/pictures/grades/grade1.jpg",
  "/yougetmore assets/pictures/grades/grade2.jpg",
  "/yougetmore assets/pictures/grades/grade3.jpg",
  "/yougetmore assets/pictures/grades/grade4.jpg",
  "/yougetmore assets/pictures/grades/grade5.jpg",
  "/yougetmore assets/pictures/grades/grade6.jpg",
  "/yougetmore assets/pictures/grades/grade4.jpg",
  "/yougetmore assets/pictures/grades/grade3.jpg",
];

const getRandomGradeImage = (gradeId: number) => {
  const index = gradeId % gradeCardImages.length;
  return gradeCardImages[index];
};

const GradesPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.id as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  

  // Fetch grades and school data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const numericSchoolId = parseInt(schoolId);
        const gradesResponse = await GRADE_API.GET_GRADES_BY_SCHOOL(
          numericSchoolId
        );
        if (gradesResponse.data) {
          setGrades(gradesResponse.data.filter((grade) => grade.isActive));
        }

        const schoolResponse = await SCHOOL_API.GET_SCHOOL_BY_ID(
          numericSchoolId
        );
        if (schoolResponse.data) {
          setSchoolData(schoolResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  // Filter grades based on search
  const filteredGrades = useMemo(() => {
    if (!searchQuery.trim()) return grades;

    const query = searchQuery.toLowerCase();
    return grades.filter(
      (grade) =>
        grade.gradeName.toLowerCase().includes(query) ||
        grade.description?.toLowerCase().includes(query) ||
        `grade ${grade.gradeLevel}`.includes(query)
    );
  }, [grades, searchQuery]);

  // Paginate grades
  const paginatedGrades = useMemo(() => {
    const startIndex = (currentPage - 1) * GRADES_PER_PAGE;
    return filteredGrades.slice(startIndex, startIndex + GRADES_PER_PAGE);
  }, [filteredGrades, currentPage]);

  const totalPages = Math.ceil(filteredGrades.length / GRADES_PER_PAGE);

  const handleGradeClick = (gradeId: number) => {
    router.push(`/client/shop/schools/${schoolId}/grades/${gradeId}`);
  };

  const handleBackToSchools = () => {
    router.push("/client/shop/schools");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section with Carousel */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          <HeroCarousel />
          <div className="absolute inset-0 bg-black/40" />{" "}
          {/* Adds subtle dark overlay for contrast */}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Back Button */}
            <motion.button
              onClick={handleBackToSchools}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Schools</span>
            </motion.button>

            {/* School Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-6"
            >
              {/* School Details */}
              <div className="flex items-center w-full sm:w-auto gap-4 sm:gap-6 text-center sm:text-left">
                {/* School Icon / Logo */}
                {schoolData?.imageUrl ? (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-white/30 shadow-lg bg-white/10">
                    <Image
                      src={schoolData.imageUrl}
                      alt={schoolData.name}
                      fill
                      className="object-cover  bg-white/10"
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full flex-shrink-0">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                )}

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">
                    {schoolData?.name || "Loading..."}
                  </h1>
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    Select your child&apos;s grade to view supplies
                  </p>
                </div>
              </div>
            </motion.div>

            {/* School Details Pills */}
            {schoolData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3 text-sm"
              >
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="font-medium">{schoolData.type}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span>{schoolData.province}</span>
                </div>
                {schoolData.code && (
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span>Code: {schoolData.code}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Advertisement Sidebar - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 xl:col-span-3"
          >
            <div className="sticky top-4">
              <SchoolCouponCarousel schoolId={schoolData?.id} />
            </div>
          </motion.div>

          {/* Grades Content - Right Side */}
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
                  placeholder="Search by grade name or level..."
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
                key={searchQuery + filteredGrades.length}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    <span className="font-semibold text-gray-900">
                      {filteredGrades.length}
                    </span>{" "}
                    {filteredGrades.length === 1 ? "grade" : "grades"} available
                    {searchQuery && ` for "${searchQuery}"`}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Grades Grid */}
            {loading ? (
              <ProductGridSkeleton />
            ) : filteredGrades.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm p-12 text-center"
              >
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No grades found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? `No grades match "${searchQuery}". Try a different search term.`
                    : "No grades are available for this school."}
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  key={currentPage + searchQuery}
                >
                  {paginatedGrades.map((grade, index) => (
                    <motion.div
                      key={grade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200"
                      onClick={() => handleGradeClick(grade.id)}
                    >
                      {/* Grade Image Header */}
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={getRandomGradeImage(grade.id)}
                          alt={`Grade ${grade.gradeName}`}
                          fill
                          quality={50}
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      {/* Grade Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[#155670] transition-colors">
                          {grade.gradeName}
                        </h3>

                        {grade.description && (
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                            {grade.description}
                          </p>
                        )}

                        {/* View Supplies Link */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            View Supplies
                          </span>
                          <ChevronRight className="w-5 h-5 text-[#155670] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-[#155670]/0 group-hover:bg-[#155670]/5 transition-colors pointer-events-none" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
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

      {/* Info Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Grade-Specific Supplies
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each grade has a tailored list of stationery and supplies.
                Select your child&apos;s grade to view the complete list of
                items they&apos;ll need for the school year.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GradesPage;
