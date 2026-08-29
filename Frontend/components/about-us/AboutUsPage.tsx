"use client"
import { useRouter } from 'next/navigation';
import React from 'react';

// Icon Components
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
    <polyline points="17,6 23,6 23,12"></polyline>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
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

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const AboutUs: React.FC = () => {
  const values = [
    {
      letter: "E",
      title: "Excellence with Purpose",
      description: "We go beyond meeting standards, delivering work that creates meaningful impact through quality and consistency.",
      icon: StarIcon,
      color: "from-blue-500 to-blue-600"
    },
    {
      letter: "M",
      title: "More Together",
      description: "We grow by building strong relationships, adding value to businesses, teams, and communities.",
      icon: UsersIcon,
      color: "from-green-500 to-green-600"
    },
    {
      letter: "P",
      title: "People First",
      description: "Our clients, employees, and communities are at the center of everything we do.",
      icon: HeartIcon,
      color: "from-red-500 to-red-600"
    },
    {
      letter: "I",
      title: "Integrity in Action",
      description: "We earn trust through transparency, accountability, and doing what's right—even when it's not easy.",
      icon: ShieldIcon,
      color: "from-purple-500 to-purple-600"
    },
    {
      letter: "R",
      title: "Resilience in Growth",
      description: "We embrace challenges as opportunities, adapting and evolving to achieve lasting success.",
      icon: TrendingUpIcon,
      color: "from-orange-500 to-orange-600"
    },
    {
      letter: "E",
      title: "Empowerment through Innovation",
      description: "We deliver solutions that make life and work simpler, smarter, and better.",
      icon: ZapIcon,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const whyChooseUs = [
    "A comprehensive partner offering stationery, office furniture, branding, gifting, technology, and software under one umbrella.",
    "Level 1 B-BBEE contributor with 135% procurement recognition, supporting supplier diversity and transformation.",
    "Flexible and scalable services to support both small enterprises and large organizations.",
    "A strong commitment to delivering more value, reliability, and innovation with every engagement."
  ];

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#155874] via-[#1a6b8a] to-[#2d5a87] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              About <span className="text-yellow-300">UGETMO Group</span>
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl font-medium mb-4 text-blue-100">
                "Giving You More Than Just Solutions."
              </p>
              <p className="text-lg leading-relaxed text-blue-50">
                UGETMO Group is a multi-disciplinary supplier of business solutions, delivering a wide range of products and services designed to meet the needs of modern organizations. Our focus is on providing more than just solutions—we deliver value, reliability, and innovation across industries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                With expertise in stationery, office furniture, corporate clothing, branding and gifting, technology hardware, and software development, we enable businesses to operate smarter, faster, and more effectively. Whether you need everyday essentials, custom branding, or advanced IT solutions, UGETMO Group ensures seamless delivery with professionalism and purpose.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section - EMPIRE */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-xl text-gray-600">Building success with <span className="font-bold text-[#155874]">EMPIRE</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-full border border-gray-100 hover:border-[#155874]/20">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg`}>
                      {value.letter}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-[#155874]/10 transition-colors">
                      <IconComponent />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#155874] transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
              <p className="text-xl text-gray-600">Your trusted partner for comprehensive business solutions</p>
            </div>

            <div className="space-y-6">
              {whyChooseUs.map((reason, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg hover:bg-[#155874]/5 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#155874] to-[#1a6b8a] rounded-full flex items-center justify-center">
                      <CheckCircleIcon />
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#155874] to-[#1a6b8a] p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Get in Touch</h2>
            <p className="text-blue-100 text-center text-lg">Ready to discover how we can give you more than just solutions?</p>
          </div>
          
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Address */}
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="p-3 bg-[#155874] text-white rounded-lg">
                  <MapPinIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-600">377 Rivonia Boulevard<br />Rivonia, Johannesburg<br />2128</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="p-3 bg-[#155874] text-white rounded-lg">
                  <PhoneIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                  <p className="text-gray-600">011-749-3322<br />076-431-7431</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="p-3 bg-[#155874] text-white rounded-lg">
                  <MailIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                  <p className="text-gray-600">sales@ugetmoregroup.com</p>
                </div>
              </div>
            </div>

            {/* Website and Social Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#155874] text-white rounded-lg">
                    <GlobeIcon />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Website</h4>
                    <a href="https://www.ugetmogroup.com" target="_blank" rel="noopener noreferrer" className="text-[#155874] hover:text-[#133d4f] font-medium">
                      www.ugetmogroup.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-[#155874] transition-colors">
                    <LinkedinIcon />
                    <span>LinkedIn</span>
                  </a>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>@ugetmoza</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#155874] to-[#1a6b8a] py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience More Than Just Solutions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join over 1000+ businesses that trust UGETMO Group for their comprehensive business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
            onClick={() => router.push('/client/contact')}
            className="bg-white text-[#155874] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get in touch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;