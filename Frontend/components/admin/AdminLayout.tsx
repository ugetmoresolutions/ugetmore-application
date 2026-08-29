"use client";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  User,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
  ChevronRight,
  List,
  ClipboardList,
  MessageCircle,
  ClipboardEditIcon,
  HomeIcon,
  CookieIcon,
  Info,
  HelpCircle,
} from "lucide-react";
import Cookies from "universal-cookie";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import Image from "next/image";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubNavItem[];
}

interface SubNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserData {
  id?: number;
  fullName?: string;
  email?: string;
  role?: string;
  // Add other user properties as needed
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  
  { 
    name: "Products", 
    icon: Package,
    children: [
      { name: "Stationery Products", href: "/admin/products", icon: List },
      { name: "Branding Products", href: "/admin/products/branding", icon: List },
      { name: "Furniture Products", href: "/admin/products/furniture", icon: List },
      { name: "Manage Products", href: "/admin/products/manage", icon: ClipboardEditIcon },
      { name: "Stock ", href: "/admin/products/stock", icon: ClipboardEditIcon },
      // { name: "Products Analytics", href: "/admin/products/ordered", icon: ClipboardList },
    ]
  },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Coupons", href: "/admin/coupons", icon: CookieIcon },
  { name: "School Stationery", href: "/admin/school", icon: HomeIcon },
  { name: "Notifications", href: "/admin/notifications", icon: MessageCircle },
  { name: "Manage Profiles", href: "/admin/manage-user", icon: Users },
  { name: "Development Inquiry", href: "/admin/development-inquiry", icon: HelpCircle },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();

  const cookies = new Cookies();

  useEffect(() => {
    // Get user data from cookie
    const userToken = cookies.get("userToken");
    if (userToken) {
      try {
        const decodedUser = decodeAccessToken();
        setUserData(decodedUser);
      } catch (error) {
        console.error("Failed to decode user token:", error);
      }
    }

    // Auto-expand menu items if current path is a child
    navItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (isChildActive) {
          setExpandedItems(prev => new Set(prev).add(item.name));
        }
      }
    });
  }, [pathname]);

  // Fixed isActive function - only one item should be active at a time
  const isActive = (href: string, isChild: boolean = false) => {
    if (!href) return false;
    
    // For exact matches
    if (pathname === href) {
      return true;
    }
    
    // For parent items, only show active if exact match or no children are active
    if (!isChild) {
      const item = navItems.find(nav => nav.href === href);
      if (item?.children) {
        // Parent is active only if no specific child is active
        const hasActiveChild = item.children.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        return !hasActiveChild && pathname.startsWith(href);
      }
    }
    
    // For children and items without children
    return pathname.startsWith(href + '/');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const handleNavClick = (href: string) => {
    if (href) {
      router.push(href);
    }
  };

  const handleSignOut = () => {
    cookies.remove("userToken", {
      path: "/",
      secure: true,
      sameSite: "lax",
    });
    window.location.href = "/client/auth/login";
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    
    // For parent items, check if active (but don't show active if children are active)
    const active = item.href ? isActive(item.href, false) : false;

    return (
      <li key={item.name}>
        <div className="space-y-1">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.name);
              } else if (item.href) {
                handleNavClick(item.href);
                if (isMobile) setSidebarOpen(false);
              }
            }}
            className={`group flex items-center justify-between rounded-lg p-3 text-sm font-medium cursor-pointer transition-all duration-200 ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-x-3">
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.name}
            </div>
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            )}
            {active && !hasChildren && (
              <motion.div
                layoutId={isMobile ? "mobileActiveIndicator" : "activeIndicator"}
                className="ml-2 w-1.5 h-1.5 bg-white rounded-full"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
          </motion.div>

          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-8 space-y-1"
            >
              {item.children!.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isActive(child.href, true);

                return (
                  <motion.div
                    key={child.name}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      handleNavClick(child.href);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium cursor-pointer transition-all duration-200 ${
                      childActive
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <ChildIcon
                      className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                        childActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {child.name}
                    {childActive && (
                      <motion.div
                        layoutId={isMobile ? "mobileChildActiveIndicator" : "childActiveIndicator"}
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden hide-scrollbar lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-70 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto hide-scrollbar bg-white px-6 pb-4 shadow-sm border-r border-slate-200">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center justify-center">
            <div className="flex items-center justify-center space-x-3">
              <Image
                width={200}
                priority
                quality={100}
                className="object-cover"
                height={200}
                src={"/logo.png"}
                alt="logo"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => renderNavItem(item))}
            </ul>

            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-slate-200">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-600" />
                Logout
              </motion.button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.div
              variants={sidebarVariants as any}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white lg:hidden"
            >
              <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 shadow-sm">
                {/* Logo & Close Button */}
                <div className="flex h-20 shrink-0 items-center justify-between">
                  <div className="flex h-20 shrink-0 items-center justify-center">
                    <div className="flex items-center justify-center space-x-3">
                      <Image
                        width={200}
                        priority
                        quality={100}
                        className="object-cover"
                        height={200}
                        src={"/logo.png"}
                        alt="logo"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navItems.map((item) => renderNavItem(item, true))}
                  </ul>

                  {/* Logout Button */}
                  <div className="mt-auto pt-4 border-t border-slate-200">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-600" />
                      Logout
                    </motion.button>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-70">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Page Title */}
              {/* <h1 className="text-lg font-semibold text-slate-900">
                {navItems.find((item) => item.href && isActive(item.href))?.name ||
                  navItems.flatMap(item => 
                    item.children?.find(child => isActive(child.href, true))?.name || []
                  ).find(Boolean) ||
                  "Admin Dashboard"}
              </h1> */}
            </div>

            {/* Right side of top bar */}
            <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200"
                aria-hidden="true"
              />
              <div className="flex items-center gap-x-3">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                {userData && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {userData.role || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {userData.email || ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;