"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

// Icon Components
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12,19 5,12 12,5"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="M21 21l-4.35-4.35"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const ShirtIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
  </svg>
);

const ComputerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const PaletteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"></circle>
    <circle cx="17.5" cy="10.5" r=".5"></circle>
    <circle cx="8.5" cy="7.5" r=".5"></circle>
    <circle cx="6.5" cy="12.5" r=".5"></circle>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
  </svg>
);

const Error404Page: React.FC = () => {
  const quickLinks = [
    {
      title: "Stationery & Office Supplies",
      description: "Complete range of office essentials",
      icon: PackageIcon,
      color: "from-blue-500 to-blue-600",
      link: "/client/shop/stationery"
    },
    {
      title: "Furniture and Home Supplies",
      description: "Complete range of home essentials",
      icon: ShirtIcon,
      color: "from-green-500 to-green-600",
      link: "/client/shop/furniture"
    },
    {
      title: "Technology Solutions",
      description: "Hardware and software services",
      icon: ComputerIcon,
      color: "from-purple-500 to-purple-600",
      link: "/client/services/software-development"
    },
    {
      title: "Branding & Design",
      description: "Creative and marketing solutions",
      icon: PaletteIcon,
      color: "from-orange-500 to-orange-600",
      link: "/client/shop/branding"

    }
  ];

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Error Section */}
      <div className="bg-gradient-to-br from-[#155874] via-[#1a6b8a] to-[#2d5a87] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl md:text-[12rem] font-bold text-white/20 leading-none">404</h1>
              <div className="-mt-8 md:-mt-16">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 text-yellow-300">
                  Page Not Found
                </h2>
              </div>
            </div>

            {/* Error Message */}
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-xl md:text-2xl font-medium mb-6 text-blue-100">
                Oops! The page you're looking for seems to have gone missing.
              </p>
              <p className="text-lg leading-relaxed text-blue-50">
                Don't worry though – we're still here to give you <span className="font-semibold">more than just solutions</span>.
                Let's get you back on track with UGETMO Group's comprehensive business services.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => router.replace('/')}
                className="bg-white text-[#155874] px-8  cursor-pointer py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                <HomeIcon />
                <span>Back to Home</span>
              </button>
              <button
                onClick={() => router.back()}
                className="border-2 border-white  cursor-pointer text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#155874] transition-colors flex items-center justify-center space-x-2">
                <ArrowLeftIcon />
                <span>Go Back</span>
              </button>
            </div>

       
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="-mt-32 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Services
            </h3>
            <p className="text-xl text-gray-600">
              Find what you need from our comprehensive business solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link href={link.link} key={index} passHref className='block'>
                  <div key={index} className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer group">
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${link.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#155874] transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
              <p className="text-xl text-gray-600">Our team is here to assist you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Support */}
              <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-[#155874]/5 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#155874] to-[#1a6b8a] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <PhoneIcon />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Call Support</h4>
                <p className="text-gray-600 mb-3">Speak with our team directly</p>
                <p className="font-semibold text-[#155874]">011-749-3322</p>
                <p className="font-semibold text-[#155874]">076-431-7431</p>
              </div>

              {/* Email Support */}
              <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-[#155874]/5 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <MailIcon />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Email Us</h4>
                <p className="text-gray-600 mb-3">Send us a detailed message</p>
                <p className="font-semibold text-[#155874]">sales@ugetmoregroup.com</p>
              </div>

              {/* Visit Office */}
              <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-[#155874]/5 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <HomeIcon />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Visit Our Office</h4>
                <p className="text-gray-600 mb-3">Come see us in person</p>
                <p className="text-sm text-gray-500">377 Rivonia Boulevard<br />Rivonia, Johannesburg</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <div className="inline-flex items-center justify-center space-x-2 bg-yellow-50 text-yellow-800 px-6 py-3 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">B-BBEE Level 1 Contributor</span>
                <span className="text-yellow-600">•</span>
                <span>135% procurement recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-[#155874] to-[#1a6b8a] py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold text-white mb-6">
            Let's Get You Back on Track
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Discover why over 1000+ businesses trust UGETMO Group for their comprehensive solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
             onClick={() => router.replace('/')}
            className="bg-white text-[#155874]  cursor-pointer px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Explore Our Services
            </button>
            <button
              onClick={() => router.replace('/client/contact')}
              className="border-2 border-white text-white cursor-pointer px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#155874] transition-colors">
              Contact Us Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;