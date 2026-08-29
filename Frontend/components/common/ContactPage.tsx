"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { AUTH_API } from '@/endpoints/rest-api/email';
import { IEmailData } from '@/interfaces/email/email';

// Icon Components
const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
  </svg>
);

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      const emailData: IEmailData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      await AUTH_API.SEND_EMAIL(emailData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
      
    } catch (error: any) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setErrorMessage(error?.message || 'Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: "Address",
      details: [
        "377 Rivonia Boulevard",
        "Rivonia, Johannesburg",
        "2128, South Africa"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: PhoneIcon,
      title: "Phone Numbers",
      details: [
        "011-749-3322",
        "076-431-7431"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: MailIcon,
      title: "Email",
      details: [
        "sales@ugetmogroup.com"
      ],
      color: "from-red-500 to-red-600"
    },
    {
      icon: ClockIcon,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 5:00 PM",
        "Saturday: 9:00 AM - 1:00 PM",
        "Sunday: Closed"
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#155874] via-[#1a6b8a] to-[#2d5a87] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Get in <span className="text-yellow-300">Touch</span>
            </h1>
            <p className="text-2xl font-medium mb-4 text-blue-100">
              Ready to experience more than just solutions?
            </p>
            <p className="text-lg leading-relaxed text-blue-50 max-w-3xl mx-auto">
              We'd love to hear from you. Whether you have a question about our services, need a custom quote, or want to explore partnership opportunities, our team is here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-10">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                    <IconComponent />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h3>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm leading-relaxed">{detail}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#155874] focus:border-[#155874] transition-colors resize-vertical"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#155874] to-[#1a6b8a] text-white px-8 py-4 rounded-lg font-semibold hover:from-[#133d4f] hover:to-[#155874] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <SendIcon />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Message sent successfully!
                      </h3>
                      <div className="mt-1 text-sm text-green-700">
                        Thank you for your message! We'll get back to you within 24 hours.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Failed to send message
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-8">
            {/* Why Contact Us */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Contact Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#155874] rounded-full mt-2"></div>
                  <p className="text-gray-600">Get personalized solutions for your business needs</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#155874] rounded-full mt-2"></div>
                  <p className="text-gray-600">Request custom quotes and bulk pricing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#155874] rounded-full mt-2"></div>
                  <p className="text-gray-600">Explore partnership and collaboration opportunities</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#155874] rounded-full mt-2"></div>
                  <p className="text-gray-600">Get expert advice from our experienced team</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-[#155874] to-[#1a6b8a] rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Quick Connect</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <GlobeIcon />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://www.ugetmogroup.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                      www.ugetmogroup.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <LinkedinIcon />
                  <div>
                    <p className="font-semibold">LinkedIn</p>
                    <p className="text-blue-200">Connect with us professionally</p>
                  </div>
                </div>
                <div className="border-t border-blue-400 pt-4 mt-6">
                  <p className="text-blue-100 text-sm">
                    <strong>B-BBEE Level 1 Contributor</strong><br />
                    135% procurement recognition supporting transformation and supplier diversity.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-yellow-800 mb-2">Need Urgent Support?</h4>
              <p className="text-yellow-700 text-sm mb-3">For urgent technical support or emergency service requests:</p>
              <p className="font-semibold text-yellow-800">Emergency Line: 076-431-7431</p>
              <p className="text-yellow-600 text-xs mt-2">Available during business hours for immediate assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#155874] to-[#1a6b8a] p-6">
              <h3 className="text-2xl font-bold text-white text-center">Find Us Here</h3>
              <p className="text-blue-100 text-center mt-2">377 Rivonia Boulevard, Rivonia, Johannesburg</p>
            </div>
            <div className="h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.1982883394567!2d28.052589!3d-26.046943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9573b3b8b8b8b8%3A0x1234567890abcdef!2s377%20Rivonia%20Blvd%2C%20Rivonia%2C%20Sandton%2C%202128%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1234567890123!5m2!1sen!2sza"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="UGETMO Group Location - 377 Rivonia Boulevard, Rivonia"
                className="w-full h-full"
              />
            </div>
            <div className="bg-gray-50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <MapPinIcon />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">377 Rivonia Boulevard</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <PhoneIcon />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">011-749-3322</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <ClockIcon />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 8AM-5PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://www.google.com/maps/dir//377+Rivonia+Blvd,+Rivonia,+Sandton,+2128,+South+Africa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-[#155874] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#133d4f] transition-colors"
                >
                  <MapPinIcon />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#155874] to-[#1a6b8a] py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let's Build Something Great Together
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join over 1000+ businesses that trust UGETMO Group for comprehensive business solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <button 
              onClick={() => {
                const fileId = '1kVnKbsSl60_BbSkfwGkVfKNIk5ihcivc';
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'UGETMO-Group-Brochure.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="border-2 border-white cursor-pointer text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#155874] transition-colors"
            >
              Download Business Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;