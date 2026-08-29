"use client";
import React, { useState, useEffect } from 'react';
import softwareImage from "@/public/yougetmore assets/pictures/Group 25.png";
import Link from "next/link";
import Image from "next/image";

interface Category {
  name: string;
  imageSrc: any;
  gridClass: string;
  heightClass: string;
  href: string;
  buttonText?: string; // Added optional buttonText property
}

const categories: Category[] = [
  {
    name: 'Branding & Promotional Items',
    imageSrc: [
      "/yougetmore assets/pictures/branding/B1.jpg",
      "/yougetmore assets/pictures/branding/B2.jpg",
      "/yougetmore assets/pictures/branding/B3.jpg",
      "/yougetmore assets/pictures/branding/B4.jpg",
      "/yougetmore assets/pictures/branding/B5.jpg",
    ],
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-3',
    heightClass: 'h-48 sm:h-64 md:h-80 lg:h-96',
    href: '/client/shop/branding'
  },
  {
    name: 'Office Stationary',
    imageSrc: [
      "/yougetmore assets/pictures/stationery/S1.jpg",
      "/yougetmore assets/pictures/stationery/S2.jpg",
      "/yougetmore assets/pictures/stationery/S5.png",
    ],
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2',
    heightClass: 'h-48 sm:h-64 md:h-80 lg:h-96',
    href: '/client/shop/stationery'
  },
  {
    name: 'Janitorial & Office Groceries',
    imageSrc: [
      "/yougetmore assets/pictures/janitorial/j1.jpg",
      "/yougetmore assets/pictures/janitorial/j2.jpg",
      "/yougetmore assets/pictures/janitorial/j3.jpg",
    ],
    gridClass: 'col-span-1 sm:col-span-2 lg:col-span-2',
    heightClass: 'h-48 sm:h-64 md:h-80 lg:h-96',
    href: '/client/shop/janitorial'
  },
  {
    name: 'Electronics',
    imageSrc: [
      "/yougetmore assets/pictures/electronics/T1.png",
      "/yougetmore assets/pictures/electronics/T2.jpeg",
      "/yougetmore assets/pictures/electronics/T3.png",
      "/yougetmore assets/pictures/electronics/T4.png",
      "/yougetmore assets/pictures/electronics/T5.png",
      "/yougetmore assets/pictures/electronics/T6.png",
    
    ],
    gridClass: 'col-span-1 sm:col-span-1 lg:col-span-2',
    heightClass: 'h-48 sm:h-56 md:h-64 lg:h-72',
    href: '/client/shop/electronics'
  },
  
  
  {
    name: 'Furniture',
    imageSrc: [
      "/yougetmore assets/pictures/furniture/F1.jpg",
      "/yougetmore assets/pictures/furniture/F2.jpg",
      "/yougetmore assets/pictures/furniture/F4.jpg",
      "/yougetmore assets/pictures/furniture/F5.jpg",
      "/yougetmore assets/pictures/furniture/F6.jpg"
    ],
    gridClass: 'col-span-1 sm:col-span-3 ',
    heightClass: 'h-48 sm:h-56 md:h-64  lg:h-72',
    
    href: '/client/shop/furniture'
  },

  {
    name: 'Software Development',
    imageSrc: softwareImage,
    gridClass: 'col-span-1 sm:col-span-1 lg:col-span-2',
    heightClass: 'h-48 sm:h-56 md:h-64 lg:h-72',
    href: '/client/services/software-development',
    buttonText: 'Send Inquiry' // Changed only this button text
  },
];

// Carousel Component for individual categories
const ImageCarousel: React.FC<{ images: string[]; categoryName: string; isHovered: boolean }> = ({ 
  images, 
  categoryName, 
  isHovered 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`${categoryName} - Image ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
      ))}
      
      {/* Carousel Indicators - Responsive positioning */}
      {isHovered && images.length > 1 && (
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-3 sm:left-4 md:left-6 flex space-x-1.5 sm:space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ShopByCategory = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="bg-white py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        {/* Section Header - Responsive typography */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Shop by category
          </h2>
          <p className="mt-2 sm:mt-3 md:mt-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto 
                     text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
            Pick the category you are looking for and start shopping now!
          </p>
        </div>

        {/* Categories Grid - Responsive grid system */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className={`group relative rounded-lg sm:rounded-xl overflow-hidden 
                         ${category.gridClass} ${category.heightClass}
                         transform transition-all duration-300 hover:shadow-xl hover:shadow-black/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Background Image or Carousel */}
              {Array.isArray(category.imageSrc) ? (
                <ImageCarousel 
                  images={category.imageSrc} 
                  categoryName={category.name}
                  isHovered={hoveredCategory === category.name}
                />
              ) : (
                <Image
                  src={category.imageSrc}
                  alt={`Shop for ${category.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              )}

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent 
                           group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300"></div>

              {/* Content positioned at the bottom-left - Responsive positioning and sizing */}
              <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-5 lg:p-6 z-10 w-full">
                <h3 className="text-white font-extrabold leading-tight mb-2 sm:mb-3 md:mb-4
                             text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl">
                  {category.name}
                </h3>
                
                <div className="inline-flex items-center justify-center text-white font-medium 
                             border border-white rounded-md transition-all duration-300 
                             group-hover:bg-white group-hover:text-black group-hover:shadow-lg
                             text-xs sm:text-sm md:text-sm
                             py-1.5 px-3 sm:py-2 sm:px-4 md:py-2 md:px-5 lg:py-2 lg:px-5">
                  <span>{category.buttonText || 'Shop Now'}</span>
                  <span aria-hidden="true" className="ml-1 sm:ml-1.5"> &rarr;</span>
                </div>
           
              </div>

              {/* Mobile touch indicator */}
              <div className="sm:hidden absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full 
                           flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xs">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA section */}
        <div className="sm:hidden mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Tap any category above to start shopping
          </p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((dot) => (
              <div key={dot} className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;