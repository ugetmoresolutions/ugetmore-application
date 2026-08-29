"use client"
import React, { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, User } from 'lucide-react';
import Sidebar from '@/components/profile/Sidebar';

type ViewType = any;

interface AccountLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout?: () => void;
}

const AccountLayout = ({
  children,
  currentView,
  onLogout
}: any) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMobileToggle}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Account</h1>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex min-h-screen lg:h-auto">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onLogout={onLogout}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={handleMobileToggle}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <motion.main
            className="flex-1 p-4 lg:p-8 overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="max-w-6xl mx-auto">
              {/* Loading Spinner */}
              <Suspense fallback={
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="ml-3 text-gray-600 font-medium">Loading...</span>
                </motion.div>
              }>
                {children}
              </Suspense>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;