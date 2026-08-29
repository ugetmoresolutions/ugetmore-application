"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/public/yougetmore assets/uu 1-2.svg";
import PhoneIcon from "@/public/yougetmore assets/Fill-1.svg";
import LocationIcon from "@/public/yougetmore assets/Combined-Shape.svg";
import EmailIcon from "@/public/yougetmore assets/Iconly/Light-Outline/Message.svg";
import BBBEE from "@/public/yougetmore assets/pictures/BBBEE.png";
import ROSA from "@/public/yougetmore assets/rosa.png";
import Link from "next/link";
import { NEWSLETTER_API } from "@/endpoints/rest-api/newsletter";
import { AnimatePresence, motion } from "framer-motion";

// Add this SuccessModal component
const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white  shadow-2xl max-w-md w-full mx-auto overflow-hidden"
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-10 h-10 bg-[#155670] rounded-full flex items-center justify-center"
                >
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">Success!</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-[#155670] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-2xl font-bold text-[#155670] mb-3">
                  Welcome to UGetMo! 🎉
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Thank you for subscribing to our newsletter! You'll be the first to know about 
                  exclusive deals, new arrivals, and special offers.
                </p>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-br from-[#155670] to-[#1b6a84] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-gradient-to-r from-[#155670] to-[#1b6a84] origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await NEWSLETTER_API.SUBSCRIBE({ 
        email, 
        source: 'website-footer' 
      });
      
      if (!response.error) {
        setShowSuccessModal(true);
        setEmail("");
      } else {
        console.error("Subscription failed:", response.message);
      }
    } catch (error: any) {
      console.error("Subscription error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add the SuccessModal component */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />

      <footer className="bg-[#F4F9FB] pt-4 sm:pt-6 md:pt-7 px-2 sm:px-3 md:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Logo and Newsletter Section */}
            <div className="lg:col-span-1">
              <div className="mb-6 sm:mb-8">
                <Image
                  src={Logo}
                  alt="UGETMO Group"
                  width={140}
                  height={48}
                  className="sm:w-[160px] sm:h-[54px] md:w-[180px] md:h-[60px]"
                />
              </div>
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-3 sm:mb-4">
                  Subscribe Now
                </h3>
                <p className="text-[#155670] text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                  Learn about new offers and get more deals by joining our
                  newsletter
                </p>
                <form onSubmit={handleSubscribe} className="flex mb-4 sm:mb-6">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#155670] focus:border-transparent text-xs sm:text-sm bg-white text-black"
                    required
                    disabled={loading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="bg-[#155670] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-r-md hover:bg-[#1b6a84] transition-colors font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Subscribe"
                    )}
                  </motion.button>
                </form>
              </div>

              {/* B-BBEE Sticker */}
              <div className="mb-6 flex flex-row gap-2">
                <Image
                  src={BBBEE}
                  alt="B-BBEE Level 1 Contributor Certificate"
                  width={80}
                  height={80}
                  className="sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] object-contain"
                />
                <Image
                  src={ROSA}
                  alt="ROSE sticker"
                  width={80}
                  height={80}
                  className="sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] object-contain"
                />
              </div>
            </div>

            {/* Reach us Section */}
            <div className="lg:col-span-1 ">
              <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-4 sm:mb-6">
                Reach us
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Image
                    src={PhoneIcon}
                    alt="Phone"
                    width={16}
                    height={16}
                    className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] mt-1"
                  />
                  <div className="flex flex-col space-y-1">
                    <span className="text-[#155670] text-xs sm:text-sm">
                      011-749-3322
                    </span>
                    <span className="text-[#155670] text-xs sm:text-sm">
                      076-431-7431
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Image
                    src={EmailIcon}
                    alt="Email"
                    width={16}
                    height={16}
                    className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] mt-1"
                  />
                  <span className="text-[#155670] text-xs sm:text-sm break-all sm:break-normal">
                    sales@ugetmogroup.com
                  </span>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Image
                    src={LocationIcon}
                    alt="Location"
                    width={16}
                    height={16}
                    className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] mt-1"
                  />
                  <span className="text-[#155670] text-xs sm:text-sm">
                    377 Rivonia Boulevard, Rivonia, Johannesburg, 2128
                  </span>
                </div>
              </div>

              {/* Helpdesk Section */}
              <div className="lg:col-span-1 pt-8">
                <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-4 sm:mb-6">
                  Helpdesk
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  <li>
                    <a
                      href="/client/contact"
                      className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/client/about"
                      className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/terms-and-conditions"
                      className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                    >
                      Terms and Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Categories Section */}
            <div className="lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-4 sm:mb-6">
                Categories
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <a
                    href="/client/shop/branding"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Branding
                  </a>
                </li>
                <li>
                  <a
                    href="/client/shop/furniture"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Furniture
                  </a>
                </li>
                <li>
                  <a
                    href="/client/shop/janitorial"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Janitorial
                  </a>
                </li>
                <li>
                  <a
                    href="/client/shop/schools"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    School Stationery
                  </a>
                </li>
                <li>
                  <a
                    href="/client/shop/electronics"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Electronics
                  </a>
                </li>
                <li>
                  <a
                    href="/client/shop/stationery"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Office Stationery
                  </a>
                </li>
                <li>
                  <a
                    href="/client/services/software-development"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Software Development
                  </a>
                </li>
              </ul>
            </div>

            {/* Terms & Conditions Section */}
            {/* Terms & Conditions Section */}
            <div className="">
              <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-4 sm:mb-6">
                Terms & Conditions
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <Link
                    href="/terms-and-conditions?section=terms-of-service"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=privacy-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=payment-terms"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Payment Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=delivery-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=return-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=refund-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=business-accounts"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Business Accounts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=quotation-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Quotation Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=sustainability-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Sustainability Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions?section=warranty-policy"
                    className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm"
                  >
                    Warranty Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Terms & Conditions Links Section */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-[#155670] mb-4 text-center">
              Terms & Conditions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              <Link
                href="/terms-and-conditions#terms-of-service"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Terms of Service
              </Link>
              <Link
                href="/terms-and-conditions#privacy-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions#payment-terms"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Payment Terms
              </Link>
              <Link
                href="/terms-and-conditions#delivery-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Delivery Policy
              </Link>
              <Link
                href="/terms-and-conditions#return-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Return Policy
              </Link>
              <Link
                href="/terms-and-conditions#refund-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Refund Policy
              </Link>
              <Link
                href="/terms-and-conditions#business-accounts"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Business Accounts
              </Link>
              <Link
                href="/terms-and-conditions#quotation-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Quotation Policy
              </Link>
              <Link
                href="/terms-and-conditions#sustainability-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Sustainability Policy
              </Link>
              <Link
                href="/terms-and-conditions#warranty-policy"
                className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm text-center py-2 px-1 hover:bg-blue-50 rounded"
              >
                Warranty Policy
              </Link>
            </div>
          </div> */}

          {/* Website and Social Media Row */}
          <div className="mt-4 sm:mt-6 pt-1 pb-6 sm:pb-8 md:pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 sm:mb-6 md:mb-0">
                <h4 className="text-[#155670] font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                  Visit Our Website:
                </h4>
                <a
                  href="https://www.ugetmogroup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#155670] hover:text-teal-700 transition-colors text-xs sm:text-sm font-medium underline break-all sm:break-normal"
                >
                  www.ugetmogroup.com
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
                <div className="text-[#155670] text-xs sm:text-sm font-medium">
                  Follow us:
                </div>
                <div className="flex items-center space-x-4 sm:space-x-6">
                  {/* Facebook */}
                  <a
                    href="https://web.facebook.com/ugetmoza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-700 transition-colors"
                    title="Follow us on Facebook"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#155670]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/ugetmoza/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-700 transition-colors"
                    title="Follow us on Instagram"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#155670]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.148 3.228-1.668 4.772-4.92 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.26-.148-4.77-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.669-4.77 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.359.201-6.78 2.62-6.981 6.981-.058 1.28-.072 1.689-.072 4.947s.014 3.668.072 4.948c.201 4.359 2.62 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.201 6.782-2.62 6.981-6.981.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.196-4.363-2.618-6.78-6.98-6.981-1.29-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@ugetmo.group?lang=en-GB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-700 transition-colors"
                    title="Follow us on TikTok"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#155670]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                  {/* Social Media Handle */}
                  <div className="flex items-center space-x-1 text-[#155670] text-xs sm:text-sm">
                    <span>@ugetmoza</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
      </footer>
      <div className="bg-[#155670] py-4 sm:py-5 md:py-6 px-2 sm:px-3 md:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-white">
          <div className="text-xs sm:text-sm mb-3 sm:mb-4 md:mb-0 text-center md:text-left">
            © UGETMO Group - Giving You More Than Just Solutions.
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span className="text-xs sm:text-sm text-gray-300">
              Level 1 B-BBEE
            </span>
            <span className="text-gray-300">•</span>
            <Link
              href="/terms-and-conditions"
              className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors underline"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
