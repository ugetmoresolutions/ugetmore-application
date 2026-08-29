"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const CatalogueSection = () => {
  const [activeTab, setActiveTab] = useState<'promotional' | 'apparel'>('promotional');

  const catalogues = {
    promotional: {
      title: "Promotional Items",
      subtitle: "Brand Your Business",
      description: "Discover thousands of promotional products to elevate your brand presence",
      iframeSrc: "https://www.zoomcats.com/catalog/ugetmo-group-1",
      thumbnailLink: "https://www.zoomcats.com/catalog/ugetmo-group-1",
      thumbnailSrc: "https://www.zoomcats.com/catalog/ugetmo-group-1/thumbnail/1",
      features: ["Custom Logos", "Bulk Discounts", "Fast Delivery"],
      bgColor: "from-blue-500 to-blue-600"
    },
    apparel: {
      title: "Corporate Apparel",
      subtitle: "Professional Wear",
      description: "Quality branded clothing and uniforms for your team",
      iframeSrc: "https://www.zoomcats.com/catalog/ugetmo-group-2",
      thumbnailLink: "https://www.zoomcats.com/catalog/ugetmo-group-2", 
      thumbnailSrc: "https://www.zoomcats.com/catalog/ugetmo-group-2/thumbnail/1",
      features: ["Custom Embroidery", "Size Ranges", "Premium Fabrics"],
      bgColor: "from-green-500 to-green-600"
    }
  };

  // Helper for image fallback
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.style.display = 'flex';
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Browse Our Catalogues
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Explore our comprehensive range of promotional products and corporate apparel. 
            Find everything you need to represent your brand professionally.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-full max-w-md sm:w-auto">
            <div className="flex flex-col sm:flex-row">
              {Object.entries(catalogues).map(([key, catalogue]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as 'promotional' | 'apparel')}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium text-sm transition-all ${
                    activeTab === key
                      ? 'bg-[#155874] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#155874] hover:bg-gray-50'
                  } ${key === 'promotional' ? 'mb-1 sm:mb-0 sm:mr-1' : ''}`}
                  type="button"
                >
                  <span className="block sm:hidden">{catalogue.title}</span>
                  <span className="hidden sm:block">{catalogue.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Info Panel */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 h-full">
              {/* Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${catalogues[activeTab].bgColor} mb-4`}>
                {catalogues[activeTab].subtitle}
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {catalogues[activeTab].title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                {catalogues[activeTab].description}
              </p>

              {/* Features */}
              <div className="mb-6 sm:mb-8">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Features</h4>
                <div className="space-y-2">
                  {catalogues[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 flex-shrink-0">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Preview */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Quick Preview</h4>
                <a 
                  href={catalogues[activeTab].thumbnailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-lg overflow-hidden hover:border-[#155874] transition-colors group"
                >
                  <img 
                    src={catalogues[activeTab].thumbnailSrc}
                    alt={`${catalogues[activeTab].title} Preview`}
                    className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImgError}
                  />
                  <div className="hidden h-24 sm:h-32 bg-gray-100 items-center justify-center">
                    <span className="text-gray-500 text-xs sm:text-sm">Preview Available Online</span>
                  </div>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a 
                  href={catalogues[activeTab].thumbnailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#155874] text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-[#133d4f] transition-colors text-center block text-sm sm:text-base"
                >
                  View Full Catalogue
                </a>
                <Link 
                  href="/client/contact"
                  className="w-full border border-[#155874] text-[#155874] px-4 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-[#155874] hover:text-white transition-colors text-center block text-sm sm:text-base"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Catalogue */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Interactive Catalogue</h4>
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    <span>Browse products</span>
                  </div>
                </div>
              </div>
              
              {/* Iframe Container */}
              <div className="relative">
                <iframe 
                  src={catalogues[activeTab].iframeSrc}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '400px',
                    border: 'none',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                  className="sm:h-[450px] lg:h-[500px] bg-white"
                  frameBorder={0}
                  marginHeight={0}
                  marginWidth={0}
                  width="100%"
                  scrolling="auto"
                  title={catalogues[activeTab].title}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <div className="bg-[#155874] text-white rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Need Custom Solutions?</h3>
            <p className="text-blue-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2 sm:px-0">
              Our team can help you find the perfect products for your brand and create custom solutions tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link 
                href="/client/contact"
                className="bg-white text-[#155874] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Get Custom Quote
              </Link>
              <Link 
                href="/client/shop/branding"
                className="border-2 border-white text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-[#155874] transition-colors text-sm sm:text-base"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogueSection;