"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Clock,
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Facebook,
  Instagram,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MaintenancePage: React.FC = () => {
  const pathname = usePathname();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Set maintenance end time (20 days from now)
  const maintenanceEndTime = new Date();
  maintenanceEndTime.setDate(maintenanceEndTime.getDate() + 20);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = maintenanceEndTime.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [maintenanceEndTime]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const iconVariants = {
    hidden: { rotate: 0 },
    visible: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // TikTok SVG icon component
  const TikTokIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-4xl w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Brand Area */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#155874] to-[#1e40af] rounded-full mb-4">
            <motion.div
              variants={iconVariants as any}
              initial="hidden"
              animate="visible"
            >
              <Settings className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            UGETMO{" "}
            {pathname.includes("stationery")
              ? "Stationery"
              : pathname.includes("software-development")
              ? "Software Development"
              : pathname.includes("branding")
              ? "Branding"
              : pathname.includes("electronics")
              ? "Electronics"
              : pathname.includes("furniture")
              ? "Furniture"
              : pathname.includes("janitorial")
              ? "Janitorial"
              : ""}
          </h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8"
          variants={itemVariants}
        >
          {/* Status Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6"
            variants={itemVariants}
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="font-medium">Scheduled Maintenance</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            variants={itemVariants}
          >
            We'll Be Back Soon!
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            We're currently performing scheduled maintenance to improve our
            services and bring you better technology solutions. Thank you for
            your patience.
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            variants={itemVariants}
          >
            {[
              { label: "Days", value: timeRemaining.days },
              { label: "Hours", value: timeRemaining.hours },
              { label: "Minutes", value: timeRemaining.minutes },
              { label: "Seconds", value: timeRemaining.seconds },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-gradient-to-br from-[#155874] to-[#1e40af] text-white p-6 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-sm opacity-90">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* What's Being Updated */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={itemVariants}
          >
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "System Upgrades",
                description:
                  "Enhancing our infrastructure for better performance",
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Security Updates",
                description:
                  "Implementing the latest security patches and protocols",
              },
              {
                icon: <Settings className="w-6 h-6" />,
                title: "New Features",
                description:
                  "Adding exciting new functionality to serve you better",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-[#155874] mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Email Notification Signup */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl mb-8"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Notified When We're Back
            </h3>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll notify you as soon as we're
              back online.
            </p>

            {isSubscribed ? (
              <motion.div
                className="flex items-center justify-center space-x-2 text-green-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">
                  Thanks! We'll notify you when we're back online.
                </span>
              </motion.div>
            ) : (
              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155874] focus:border-transparent"
                  required
                />
                <motion.button
                  type="submit"
                  className="bg-[#155874] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#134a60] transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Notify Me</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Need Immediate Assistance?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-[#155874] p-2 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p className="text-gray-600">sales@ugetmoregroup.com</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-[#155874] p-2 rounded-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Emergency Hotline</p>
                <p className="text-gray-600">+27 (11) 749-3322</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Stay connected with us:</p>
            <div className="flex justify-center space-x-4">
              {[
                {
                  icon: <Facebook className="w-5 h-5" />,
                  href: "https://web.facebook.com/ugetmoza",
                  label: "Facebook",
                },
                {
                  icon: <Instagram className="w-5 h-5" />,
                  href: "https://www.instagram.com/ugetmoza",
                  label: "Instagram",
                },
                {
                  icon: <TikTokIcon />,
                  href: "https://www.tiktok.com/@ugetmo.group?lang=en-GB",
                  label: "TikTok",
                },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="bg-gray-100 p-3 rounded-lg hover:bg-[#155874] hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-gray-500"
          variants={itemVariants}
        >
          <p>&copy; 2024 Ugetmo Technologies. All rights reserved.</p>
          <p className="mt-2">
            We appreciate your patience during this maintenance window.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
