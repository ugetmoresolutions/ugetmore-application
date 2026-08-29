// components/profile/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Bell,
  LogOut,
  ChevronRight,
  X,
  HelpCircle,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "universal-cookie";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";

type ViewType =
  | "overview"
  | "editProfile"
  | "orders"
  | "orderDetail"
  | "settings"
  | "billing"
  | "notifications";

interface SidebarProps {
  currentView: ViewType;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  link: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onLogout,
  isMobileOpen = false,
  onMobileToggle,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const cookies = new Cookies();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("customer");
  const [businessName, setBusinessName] = useState<string>("");

  // decode user role + business info
  useEffect(() => {
    const decodedUser = decodeAccessToken();
    if (decodedUser) {
      setUserRole(decodedUser.role || "customer");
      if (decodedUser.role === "business") {
        setBusinessName(decodedUser.businessName || "Business");
      }
    }
  }, []);

  const isBusiness = userRole === "business";
  const businessColor = "#0f172a"; // slate-900
  const customerColor = "#104758";

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Account Overview",
      icon: isBusiness ? Building2 : User,
      description: isBusiness
        ? "Manage your business profile and information"
        : "Manage your profile and personal information",
      link: "/client/profile",
    },
    {
      id: "orders",
      label: "Order History",
      icon: Package,
      description: "View and track your orders",
      link: "/client/profile/orders",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Manage your notification preferences",
      link: "/client/profile/notifications",
    },
  ];

  // auto close mobile sidebar on route change
  useEffect(() => {
    if (isMobileOpen && onMobileToggle) {
      onMobileToggle();
    }
  }, [pathname]);

  // disable scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      cookies.remove("userToken", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        localStorage.removeItem("userPreferences");
        window.dispatchEvent(new Event("cartUpdated"));
      }

      if (onLogout) await onLogout();

      router.push("/client/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const SidebarContent = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg`}
              style={{
                backgroundColor: isBusiness ? businessColor : customerColor,
              }}
            >
              {isBusiness ? (
                <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              ) : (
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                {isBusiness ? businessName : "Your"}
              </h2>
              <h2
                className="text-lg lg:text-xl font-bold"
                style={{ color: isBusiness ? businessColor : customerColor }}
              >
                Account
              </h2>
            </div>
          </div>
          {onMobileToggle && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMobileToggle}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
        <div
          className="h-px bg-gradient-to-r to-transparent"
          style={{ backgroundColor: isBusiness ? businessColor : customerColor }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 lg:px-6 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = currentView === item.id || pathname === item.link;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={item.link} className="block">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group cursor-pointer`}
                  style={{
                    backgroundColor: isActive
                      ? isBusiness
                        ? "#f8fafc"
                        : "#e6f0f4"
                      : undefined,
                    border: isActive
                      ? `1px solid ${isBusiness ? businessColor : customerColor}`
                      : undefined,
                    color: isActive
                      ? isBusiness
                        ? businessColor
                        : customerColor
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex-shrink-0 p-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: isActive
                          ? isBusiness
                            ? businessColor
                            : customerColor
                          : "#f3f4f6",
                        color: isActive ? "#fff" : "#6b7280",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block text-sm lg:text-base truncate">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-500 line-clamp-1">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`flex-shrink-0 w-4 h-4 ml-2 transition-transform duration-200`}
                    style={{
                      color: isActive
                        ? isBusiness
                          ? businessColor
                          : customerColor
                        : "#9ca3af",
                      transform: isActive ? "translateX(4px)" : undefined,
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        className={`flex-shrink-0 p-4 lg:p-6 border-t space-y-4`}
        style={{ borderColor: isBusiness ? businessColor : customerColor }}
      >
        {/* Help Section */}
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: isBusiness ? "#f8fafc" : "#e6f0f4",
            borderColor: isBusiness ? businessColor : customerColor,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 p-2 rounded-md"
              style={{ background: isBusiness ? businessColor : customerColor }}
            >
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-sm mb-1"
                style={{ color: isBusiness ? businessColor : customerColor }}
              >
                Need Help?
              </h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                Get support for your account and orders
              </p>
              <Link
                href="/client/contact"
                className="text-xs font-medium transition-colors duration-200 inline-flex items-center gap-1"
                style={{ color: isBusiness ? businessColor : customerColor }}
              >
                Contact Support
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group`}
          style={{
            color: isLoading
              ? isBusiness
                ? "#0f172a66"
                : "#10475866"
              : isBusiness
              ? businessColor
              : customerColor,
            backgroundColor: isLoading
              ? isBusiness
                ? "#f8fafc"
                : "#e6f0f4"
              : undefined,
          }}
        >
          <div
            className="flex-shrink-0 p-2 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: isLoading ? "#f3f4f6" : "#f3f4f6",
              color: isLoading ? "#9ca3af" : isBusiness ? businessColor : customerColor,
            }}
          >
            <LogOut className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <span className="font-medium block text-sm">
              {isLoading ? "Signing Out..." : "Sign Out"}
            </span>
            <span className="text-xs">End your current session</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 h-full shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileToggle}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
            />
            <motion.div
              variants={sidebarVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl border-r border-gray-200"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
