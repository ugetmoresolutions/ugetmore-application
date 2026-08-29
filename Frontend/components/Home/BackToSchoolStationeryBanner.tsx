// components/Home/BackToSchoolStationeryBanner.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const BackToSchoolStationeryBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/back-to-school/b2s1.png",
      alt: "Back to School Collection 1",
    },
    {
      id: 2,
      image: "/back-to-school/b2s2.png",
      alt: "Back to School Collection 2",
    },
    {
      id: 3,
      image: "/back-to-school/b2s3.png",
      alt: "Back to School Collection 3",
    },
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative mx-auto w-full h-[300px] max-w-7xl sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden bg-gray-900">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-5" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl lg:max-w-2xl">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              School Stationery Made Easy
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg  mb-6 sm:mb-8 leading-relaxed">
              Start by selecting your child's school and grade to see their
              <br className="hidden md:block" />
              exact stationery requirements. No more guessing —
              get precisely what they need!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                href="/client/shop/schools"
                className="inline-block bg-[#155670] text-white px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-4 md:py-5 lg:py-5 rounded-md font-semibold text-base sm:text-lg md:text-xl hover:bg-[#0f3f4f] duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-center"
              >
                Select School & Grade →
              </Link>
              
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8 sm:w-10"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BackToSchoolStationeryBanner;
