"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const images = [
   
    {
        src: "https://amrcdn.amrod.co.za/amrodprod-blob/ProductImages/GF-AV-1002-B/DEFAULT_1024X1024.jpg",
        alt: "Alex Varga Aramis Wireless Charger Desk Organiser",
        title: "Check out our",
        subtitle: "New Electronics Collections",
        shopLink: "/client/shop/electronics"
    },
    {
        src: "https://amrcdn.amrod.co.za/amrodprod-blob/ProductImages/GF-AL-1265-B/GF-AL-1265-B-BL-03_1024X1024.jpg",
        alt: "Altitude Merritt Notebook & Pen Set",
        title: "Check out our",
        subtitle: "Stationery Collection",
        shopLink: "/client/shop/stationery"
    },
     {
        src: "/back-to-school/b2s1.png",
        alt: "Back to School Essentials",
        title: "Back to School",
        subtitle: "Get Ready for School",
        shopLink: "/client/shop/schools"
    },
    {
        src: "https://amrcdn.amrod.co.za/amrodprod-blob/ProductImages/GP-OK-101-B/GP-OK-101-B-NT_LIFESTYLE_1024X1024.jpg",
        alt: "Okiyo Kosuke Wood & Paper LED Lamp",
        title: "Check out our",
        subtitle: "New Furniture Collections",
        shopLink: "/client/shop/furniture"
    },
    {
        src: "/yougetmore assets/pictures/branding/B4.jpg",
        alt: "Branding Products",
        title: "Check out our",
        subtitle: "New Branding Collections",
        shopLink: "/client/shop/branding"
    },
    {
        src: "/yougetmore assets/pictures/janitorial/j1.jpg",
        alt: "Janitorial Supplies",
        title: "Check out our",
        subtitle: "Janitorial Collections",
        shopLink: "/client/shop/janitorial"
    },
    {
        src: "/yougetmore assets/pictures/Group 25.png",
        alt: "Software Development Services",
        title: "Check out our",
        subtitle: "Software Development Services",
        shopLink: "/client/shop/software-development"
    }
];

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Clickable image wrapper */}
                    <Link href={image.shopLink} className="block w-full h-full cursor-pointer">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            priority={index === 0}
                            className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </Link>
                    
                    {/* Content overlay with responsive positioning and padding */}
                    <div className="absolute inset-0 flex items-center justify-start 
                          p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 pointer-events-none">
                        <div className="text-white text-left max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl z-10 bg-black/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg pointer-events-auto">
                            {/* Responsive typography */}
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl 
                                 font-bold leading-tight">
                                {image.title}
                            </h2>
                            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl 
                                 font-bold mt-1 sm:mt-2 leading-tight">
                                {image.subtitle}
                            </h3>

                            {/* Responsive button container */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
                                <Link 
                                    href={image.shopLink}
                                    className="border-2 cursor-pointer border-white text-white 
                                             py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 
                                             text-sm sm:text-base
                                             hover:bg-white hover:text-black 
                                             transition-colors duration-300
                                             w-full sm:w-auto text-center block"
                                >
                                    Shop Now →
                                </Link>
                                <Link 
                                    href="/client/contact"
                                    className="border-2 cursor-pointer border-white text-white 
                                             py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 
                                             text-sm sm:text-base
                                             hover:bg-white hover:text-black 
                                             transition-colors duration-300
                                             w-full sm:w-auto text-center block"
                                >
                                    Contact Us →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Responsive navigation dots */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 
                  flex gap-1.5 sm:gap-2 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`rounded-full bg-white transition-all duration-300 
                          ${index === currentSlide
                                ? 'w-6 sm:w-7 md:w-8 h-2.5 sm:h-3 opacity-100'
                                : 'w-2.5 sm:w-3 h-2.5 sm:h-3 opacity-50'
                            }
                          hover:opacity-75 cursor-pointer`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;